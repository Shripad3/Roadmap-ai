/**
 * React Entry Point
 * 
 * This file initializes React and mounts the App component to the DOM.
 * This is the first JavaScript file that runs when the app loads.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Get the root DOM element from index.html
// React will render everything inside this element
const rootElement = document.getElementById('root');

// Create a React root and render the App component
// StrictMode helps catch common bugs during development
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
