import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Initialize default language from localStorage or browser
const savedLang = localStorage.getItem('playTogetherLang');
if (savedLang) {
  const { setLanguage } = require('./i18n/translations');
  setLanguage(savedLang);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
