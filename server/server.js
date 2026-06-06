const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

const PORT = process.env.PORT || 3001;
const UI_PORT = 8501;

const { JWT } = require('google-auth-library');

async function getSheet() {
  const creds = require(`../${process.env.CREDS_FILE}`);
  const serviceAccountAuth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });

  const doc = new GoogleSpreadsheet(process.env.G_SHEET_ID, serviceAccountAuth);
  await doc.loadInfo(); // Ensures we have the latest sheet info
  let sheet = doc.sheetsByTitle[process.env.G_SHEET_NAME];
  if (!sheet) {
    sheet = await doc.addSheet({
      title: process.env.G_SHEET_NAME,
      headerValues: ['Entry Type', 'Start Time', 'End Time', 'Duration (Hours)', 'Notes'],
    });
  }
  return sheet;
}

// --- API Endpoints ---
// (API endpoints remain the same)
app.get('/api/data', async (req, res) => {
  try {
    const sheet = await getSheet();
    const rows = await sheet.getRows();
    const data = rows.map(row => {
      const rowData = {};
      sheet.headerValues.forEach(header => {
        rowData[header] = row.get(header);
      });
      return rowData;
    });
    res.json(data);
  } catch (error) {
    console.error('Error getting data:', error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

app.post('/api/clock-in', async (req, res) => {
  try {
    const sheet = await getSheet();
    const { startTime } = req.body;
    await sheet.addRow({ 'Entry Type': 'Timer', 'Start Time': startTime });
    res.status(201).json({ message: 'Clocked in successfully' });
  } catch (error) {
    console.error('Error clocking in:', error);
    res.status(500).json({ error: 'Failed to clock in' });
  }
});

app.post('/api/clock-out', async (req, res) => {
  try {
    const sheet = await getSheet();
    const { endTime, duration, notes } = req.body;
    const rows = await sheet.getRows();
    const lastRow = rows[rows.length - 1];
    if (lastRow && lastRow.get('Entry Type') === 'Timer' && !lastRow.get('End Time')) {
      lastRow.set('End Time', endTime);
      lastRow.set('Duration (Hours)', duration);
      lastRow.set('Notes', notes);
      await lastRow.save();
      res.status(200).json({ message: 'Clocked out successfully' });
    } else {
      res.status(400).json({ error: 'No active clock-in found' });
    }
  } catch (error) {
    console.error('Error clocking out:', error);
    res.status(500).json({ error: 'Failed to clock out' });
  }
});

app.post('/api/manual-entry', async (req, res) => {
  try {
    const sheet = await getSheet();
    const { startTime, endTime, duration, notes } = req.body;
    const rows = await sheet.getRows();

    const newRowData = {
      'Entry Type': 'Manual',
      'Start Time': startTime,
      'End Time': endTime,
      'Duration (Hours)': duration,
      Notes: notes,
    };

    const activeIndex = rows.findIndex(
      row => row.get('Entry Type') === 'Timer' && !row.get('End Time')
    );
    if (activeIndex !== -1) {
      // Insert before the active timer. In google-spreadsheet, addRow appends,
      // so we insert manually or append new row and move the active timer to the end.
      const activeRow = rows[activeIndex];
      const activeTimerData = {
        'Entry Type': activeRow.get('Entry Type'),
        'Start Time': activeRow.get('Start Time'),
        'End Time': activeRow.get('End Time') || '',
        'Duration (Hours)': activeRow.get('Duration (Hours)') || '',
        Notes: activeRow.get('Notes') || '',
      };

      // Overwrite the active row with our new manual entry
      activeRow.set('Entry Type', newRowData['Entry Type']);
      activeRow.set('Start Time', newRowData['Start Time']);
      activeRow.set('End Time', newRowData['End Time']);
      activeRow.set('Duration (Hours)', newRowData['Duration (Hours)']);
      activeRow.set('Notes', newRowData['Notes']);
      await activeRow.save();

      // Append the active timer as the new latest row
      await sheet.addRow(activeTimerData);
    } else {
      await sheet.addRow(newRowData);
    }
    res.status(201).json({ message: 'Manual entry added' });
  } catch (error) {
    console.error('Error adding manual entry:', error);
    res.status(500).json({ error: 'Failed to add manual entry' });
  }
});

app.post('/api/legacy-hours', async (req, res) => {
  try {
    const sheet = await getSheet();
    const { date, hours, notes } = req.body;
    const rows = await sheet.getRows();

    const newRowData = {
      'Entry Type': 'Manual (Bulk)',
      'Start Time': date,
      'End Time': date,
      'Duration (Hours)': hours,
      Notes: notes,
    };

    const activeIndex = rows.findIndex(
      row => row.get('Entry Type') === 'Timer' && !row.get('End Time')
    );
    if (activeIndex !== -1) {
      const activeRow = rows[activeIndex];
      const activeTimerData = {
        'Entry Type': activeRow.get('Entry Type'),
        'Start Time': activeRow.get('Start Time'),
        'End Time': activeRow.get('End Time') || '',
        'Duration (Hours)': activeRow.get('Duration (Hours)') || '',
        Notes: activeRow.get('Notes') || '',
      };

      // Overwrite active row with bulk entry
      activeRow.set('Entry Type', newRowData['Entry Type']);
      activeRow.set('Start Time', newRowData['Start Time']);
      activeRow.set('End Time', newRowData['End Time']);
      activeRow.set('Duration (Hours)', newRowData['Duration (Hours)']);
      activeRow.set('Notes', newRowData['Notes']);
      await activeRow.save();

      // Re-append active timer to end
      await sheet.addRow(activeTimerData);
    } else {
      await sheet.addRow(newRowData);
    }
    res.status(201).json({ message: 'Legacy hours added' });
  } catch (error) {
    console.error('Error adding legacy hours:', error);
    res.status(500).json({ error: 'Failed to add legacy hours' });
  }
});

app.post('/api/logs', (req, res) => {
  const { level, message, details } = req.body;
  const logMsg = `[FRONTEND][${level?.toUpperCase() || 'INFO'}] ${message} ${details ? JSON.stringify(details) : ''}`;
  if (level === 'error') {
    console.error(logMsg);
  } else if (level === 'warn') {
    console.warn(logMsg);
  } else {
    console.log(logMsg);
  }
  res.sendStatus(204);
});

// --- Serve React App ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
