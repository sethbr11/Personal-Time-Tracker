import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import { differenceInSeconds } from 'date-fns';
import { roundDuration } from '../utils'; // Import the new utility

export const TimeContext = createContext();

import { useToast } from './ToastContext';

export const TimeProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchData = useCallback(
    async (isManualReload = false) => {
      try {
        const data = await api.getData();
        setEntries(data);

        if (data.length > 0) {
          const lastEntry = data[data.length - 1];
          if (lastEntry['Entry Type'] === 'Timer' && !lastEntry['End Time']) {
            setIsClockedIn(true);
            setStartTime(new Date(lastEntry['Start Time']));
          } else {
            setIsClockedIn(false);
            setStartTime(null);
          }
        }
        calculateTotalHours(data);
        if (isManualReload) {
          showToast('Data reloaded successfully!', 'info');
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
        if (isManualReload) {
          showToast('Failed to reload data.', 'error');
        }
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateTotalHours = data => {
    const total = data.reduce((acc, entry) => {
      const hours = parseFloat(entry['Duration (Hours)']);
      return isNaN(hours) ? acc : acc + hours;
    }, 0);
    setTotalHours(total);
  };

  const clockIn = async () => {
    try {
      const now = new Date();
      await api.clockIn(now.toISOString());
      setStartTime(now);
      setIsClockedIn(true);
      showToast('Successfully clocked in!', 'success');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to clock in', error);
      showToast('Failed to clock in. Please try again.', 'error');
    }
  };

  const clockOut = async notes => {
    try {
      const now = new Date();
      const totalSeconds = startTime ? differenceInSeconds(now, startTime) : 0;
      const duration = roundDuration(totalSeconds);
      await api.clockOut(now.toISOString(), duration.toFixed(2), notes);
      setIsClockedIn(false);
      setStartTime(null);
      showToast('Successfully clocked out!', 'success');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to clock out', error);
      showToast('Failed to clock out. Please try again.', 'error');
    }
  };

  const addManualEntry = async entry => {
    try {
      await api.addManualEntry(entry);
      showToast('Manual time entry successfully added!', 'success');
      fetchData();
    } catch (error) {
      console.error('Failed to add manual entry', error);
      showToast('Failed to add manual entry.', 'error');
    }
  };

  const addLegacyHours = async legacyHours => {
    try {
      await api.addLegacyHours(legacyHours);
      showToast('Bulk legacy hours successfully added!', 'success');
      fetchData();
    } catch (error) {
      console.error('Failed to add legacy hours', error);
      showToast('Failed to add legacy hours.', 'error');
    }
  };

  return (
    <TimeContext.Provider
      value={{
        entries,
        isClockedIn,
        startTime,
        totalHours,
        loading,
        clockIn,
        clockOut,
        addManualEntry,
        addLegacyHours,
        fetchData,
      }}
    >
      {children}
    </TimeContext.Provider>
  );
};
