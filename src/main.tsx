import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import LegacyApp from './LegacyApp.tsx';
import './index.css';

const ua = window.navigator.userAgent;
const isLegacyIOS = /OS 10_|OS 9_|OS 8_/.test(ua) && /iPad|iPhone|iPod/.test(ua);
const RootApp = isLegacyIOS ? LegacyApp : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);
