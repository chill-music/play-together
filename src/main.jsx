import React from 'react';
import ReactDOM from 'react-dom/client';
import { setLanguage } from './i18n/translations';
import './index.css';
import App from './App';

// Initialize default language from localStorage
const savedLang = localStorage.getItem('playTogetherLang');
if (savedLang) {
  setLanguage(savedLang);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
