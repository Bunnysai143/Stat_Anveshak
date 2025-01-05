import React from 'react';
import ReactDOM from 'react-dom/client';  // Use the `createRoot` method from 'react-dom/client'
import App from './App';

// Get the root DOM element
const rootElement = document.getElementById('root');

// Create a root and render the App component
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
