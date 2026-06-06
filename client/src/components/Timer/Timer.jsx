import React, { useState, useContext, useEffect } from 'react';
import { TimeContext } from '../../context/TimeContext';
import { differenceInSeconds } from 'date-fns';
import './Timer.css';

const Timer = () => {
  const { isClockedIn, clockIn, clockOut, loading } = useContext(TimeContext);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const handleClockIn = () => {
    clockIn();
  };

  const handleClockOut = () => {
    setShowNotes(true);
  };

  const handleSaveSession = () => {
    clockOut(notes);
    setShowNotes(false);
    setNotes('');
  };

  const handleCancel = () => {
    setShowNotes(false);
    setNotes('');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="timer-container">
      {isClockedIn ? (
        showNotes ? (
          <div className="notes-form">
            <h3>Session Notes</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What did you work on?"
            />
            <div className="form-buttons">
              <button onClick={handleSaveSession} className="btn secondary">
                Save Session
              </button>
              <button onClick={handleCancel} className="btn default">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={handleClockOut} className="btn primary giant glow">
            STOP
          </button>
        )
      ) : (
        <button onClick={handleClockIn} className="btn secondary giant glow">
          START
        </button>
      )}
    </div>
  );
};

export default Timer;
