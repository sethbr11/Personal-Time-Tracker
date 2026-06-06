import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Timer from './components/Timer/Timer';
import ManualEntry from './components/ManualEntry/ManualEntry';
import History from './components/History/History';
import { TimeProvider } from './context/TimeContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <TimeProvider>
        <Router>
          <div className="App">
            <Layout>
              <Routes>
                <Route path="/" element={<Timer />} />
                <Route path="/manual" element={<ManualEntry />} />
                <Route path="/history" element={<History />} />
              </Routes>
            </Layout>
          </div>
        </Router>
      </TimeProvider>
    </ToastProvider>
  );
}

export default App;
