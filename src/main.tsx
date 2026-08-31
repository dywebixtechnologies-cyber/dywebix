import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { silenceUpstreamWarnings } from './lib/silenceUpstreamWarnings';
import App from './App.tsx';
import {AuthProvider} from './context/AuthContext';
import {Preloader} from './components/Preloader';
import './index.css';

silenceUpstreamWarnings();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Preloader />
      <App />
    </AuthProvider>
  </StrictMode>,
);
