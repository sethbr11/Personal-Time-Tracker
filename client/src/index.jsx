import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Global error forwarding to Docker server logs
window.onerror = function (message, source, lineno, colno, error) {
  fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      level: 'error',
      message: message,
      details: { source, lineno, colno, stack: error?.stack },
    }),
  }).catch(() => {});
};

window.onunhandledrejection = function (event) {
  fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      level: 'error',
      message: 'Unhandled Promise Rejection: ' + event.reason?.message,
      details: { stack: event.reason?.stack },
    }),
  }).catch(() => {});
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
