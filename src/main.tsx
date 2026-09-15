import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Analytics} from '@vercel/analytics/react';
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
      {/* Vercel Web Analytics. Renders nothing; it only reports pageviews.
          Hash routes are reported as one path, since the fragment never
          reaches the server. */}
      <Analytics />
    </AuthProvider>
  </StrictMode>,
);
