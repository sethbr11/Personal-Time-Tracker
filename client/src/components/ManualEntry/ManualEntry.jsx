import React, { useState, useContext } from 'react';
import { TimeContext } from '../../context/TimeContext';
import { differenceInSeconds } from 'date-fns';
import { roundDuration } from '../../utils'; // Import the new utility
import './ManualEntry.css';

import { useToast } from '../../context/ToastContext';

const getLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};

const ManualEntry = () => {
  const { addManualEntry } = useContext(TimeContext);
  const { showToast } = useToast();
  const [date, setDate] = useState(getLocalDate());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');

  const handleSubmit = e => {
    e.preventDefault();

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    const now = new Date();

    if (startDateTime > now || endDateTime > now) {
      showToast('Cannot log times in the future!', 'error');
      return;
    }

    const totalSeconds = differenceInSeconds(endDateTime, startDateTime);
    const duration = roundDuration(totalSeconds);

    if (duration <= 0) {
      showToast('End time must be after start time.', 'error');
      return;
    }

    addManualEntry({
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration: duration.toFixed(2), // Still format for display/storage
      notes,
    });

    // Reset form
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('09:00');
    setEndTime('17:00');
    setNotes('');
  };

  return (
    <div className="manual-entry-container">
      <h2>Add Past Entry</h2>
      <form onSubmit={handleSubmit} className="manual-form">
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Description"
          />
        </div>
        <button type="submit" className="btn secondary">
          Submit Entry
        </button>
      </form>
    </div>
  );
};

export default ManualEntry;
