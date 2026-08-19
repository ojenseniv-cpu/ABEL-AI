import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe handling for third-party browser extensions & Web3 wallet rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || event.reason || '';
    if (
      typeof reason === 'string' &&
      (reason.includes('MetaMask') ||
        reason.includes('User rejected') ||
        reason.includes('wallet') ||
        reason.includes('ethereum') ||
        reason.includes('chrome-extension'))
    ) {
      event.preventDefault();
      console.warn('[Abel AI] Handled external browser extension event:', reason);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register service worker for Windows Desktop PWA installation
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('[Abel AI] Service Worker registration failed:', err);
    });
  });
}
