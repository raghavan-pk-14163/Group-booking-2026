import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const path = window.location.pathname;
const isPublicPage = /\/slot-booking\//.test(path);

if (isPublicPage) {
  document.body.innerHTML = '<div id="root" class="zc-public-booking" style="min-height:100vh;"></div>';
  document.body.style.cssText = 'margin:0;padding:0;';
}

createRoot(document.getElementById('root')).render(<App />);
