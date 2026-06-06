import React, { useContext } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import { TimeContext } from '../../context/TimeContext';

const Layout = ({ children }) => {
  const { fetchData } = useContext(TimeContext);

  return (
    <>
      <Sidebar />
      <main className="main-content">
        <button
          onClick={() => fetchData(true)}
          className="refresh-btn"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 1000,
          }}
        >
          ↻
        </button>
        {children}
      </main>
    </>
  );
};

export default Layout;
