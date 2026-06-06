import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { TimeContext } from '../../context/TimeContext';
import { formatDuration } from '../../utils';
import './Sidebar.css';

const Sidebar = () => {
  const { totalHours, isClockedIn } = useContext(TimeContext);

  return (
    <div className="sidebar">
      <h1 className="sidebar-header">Time Tracker</h1>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
          Timer
        </NavLink>
        <NavLink to="/manual" className={({ isActive }) => (isActive ? 'active' : '')}>
          Manual Entry
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => (isActive ? 'active' : '')}>
          History
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="total-hours">
          <h2>Total Hours</h2>
          <p className={isClockedIn ? 'flashing-hours' : ''}>{formatDuration(totalHours)}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
