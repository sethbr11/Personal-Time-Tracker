import React, { useContext, useState, useEffect } from 'react';
import { TimeContext } from '../../context/TimeContext';
import { format, differenceInMinutes } from 'date-fns';
import { formatDuration } from '../../utils';
import './History.css';

const History = () => {
  const { entries, loading } = useContext(TimeContext);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000); // Update every second for live timer
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="history-container">
      <h2>History</h2>
      <div className="history-list">
        {entries
          .slice()
          .reverse()
          .map((entry, index) => {
            const isRunningTimer = entry['Entry Type'] === 'Timer' && !entry['End Time'];
            return (
              <div key={index} className="history-item">
                <div className="history-item-header">
                  <strong>{entry['Entry Type']}</strong>
                  <span>{format(new Date(entry['Start Time']), 'MMM d, yyyy')}</span>
                </div>
                <div className="history-item-body">
                  <p>
                    <strong>Duration:</strong>
                    {isRunningTimer
                      ? (() => {
                          const totalMinutes = Math.ceil(
                            differenceInMinutes(now, new Date(entry['Start Time']))
                          );
                          const hours = Math.floor(totalMinutes / 60);
                          const minutes = totalMinutes % 60;
                          return ` ${hours}h ${minutes}m (running)`;
                        })()
                      : ` ${formatDuration(parseFloat(entry['Duration (Hours)']))}`}
                  </p>
                  {entry.Notes && (
                    <p>
                      <strong>Notes:</strong> {entry.Notes}
                    </p>
                  )}
                </div>
                <div className="history-item-footer">
                  <span>
                    {format(new Date(entry['Start Time']), 'p')} -{' '}
                    {entry['End Time'] ? format(new Date(entry['End Time']), 'p') : 'Now'}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default History;
