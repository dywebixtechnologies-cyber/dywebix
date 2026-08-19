/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { PageLoader } from './components/Loader';
import { countUnread } from './lib/inquiries';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { Portfolio } from './components/Portfolio';
import { ContactForm } from './components/ContactForm';
import { Showcase } from './components/Showcase';
import { AdminGate } from './components/AdminGate';
import { LoginPage } from './components/LoginPage';
import { UserDashboard } from './components/UserDashboard';
import { useAuth } from './context/AuthContext';

// Lazy-loaded so the heavy 3D libraries (three/R3F/drei/rapier) only download
// when a visitor actually opens the About page — keeps the rest of the site fast.
const AboutUs = lazy(() => import('./components/AboutUs').then((m) => ({ default: m.AboutUs })));
import { Clock, Monitor, ShieldCheck, Heart } from 'lucide-react';
import { Logo } from './components/Logo';

export default function App() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('hero');
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedServicePreset, setSelectedServicePreset] = useState('');
  // Simple hash routing: the admin dashboard lives at the secret URL "#admin".
  const [route, setRoute] = useState(typeof window !== 'undefined' ? window.location.hash : '');

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Count unread inquiries to feed the nav indicator badge reactive data
  const calculateUnreadCount = () => {
    countUnread()
      .then(setUnreadCount)
      .catch((err) => console.error('Error counting unread state', err));
  };

  useEffect(() => {
    calculateUnreadCount();
  }, []);

  // Smooth scroll handler for pristine navigation
  const handleSectionChange = (sectionId: string) => {
    // The enquiry / "start project" flow requires login first.
    if (sectionId === 'contact' && !user) {
      window.location.hash = '#login';
      return;
    }

    setActiveSection(sectionId);

    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(`${sectionId}-section`);
    if (element) {
      // Offset for sticky navigation bar
      const offset = 80; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handler when clicking "Configure Quote" on service elements
  const handleServiceSelect = (serviceTitle: string) => {
    if (!user) {
      window.location.hash = '#login';
      return;
    }
    setSelectedServicePreset(serviceTitle);
    handleSectionChange('contact');
  };

  // Determine the top-level view from the hash route (crossfaded between each other).
  let view: React.ReactNode;
  let viewKey: string;

  if (route === '#login' || route === '#signup') {
    // Already signed in? Send them to the right dashboard instead.
    if (user) {
      view = user.role === 'admin'
        ? <AdminGate unreadCount={unreadCount} onInquiryCountChange={calculateUnreadCount} />
        : <UserDashboard />;
      viewKey = user.role === 'admin' ? 'admin' : 'dashboard';
    } else {
      view = <LoginPage />;
      viewKey = 'login';
    }
  } else if (route === '#dashboard') {
    // Logged-in user's personal dashboard.
    view = user ? <UserDashboard /> : <LoginPage />;
    viewKey = user ? 'dashboard' : 'login';
  } else if (route === '#admin') {
    // Admin dashboard — gated by auth role inside AdminGate (admins only).
    view = <AdminGate unreadCount={unreadCount} onInquiryCountChange={calculateUnreadCount} />;
    viewKey = 'admin';
  } else if (route === '#about') {
    // About Us page — lazy-loaded.
    view = (
      <Suspense fallback={<PageLoader />}>
        <AboutUs />
      </Suspense>
    );
    viewKey = 'about';
  } else {
    viewKey = 'home';
    view = (
    <div className="bg-[#F8F9FA] text-slate-900 min-h-screen selection:bg-black selection:text-white font-sans antialiased">

      {/* Dynamic Header Navbar */}
      <Navigation
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Main Sections Stack */}
      <main>
        
        {/* HERO SECTION */}
        <div id="hero-section">
          <Hero onSectionChange={handleSectionChange} />
        </div>

        {/* SERVICES SECTION */}
        <div id="services-section">
          <Services onSelectService={handleServiceSelect} />
        </div>

        {/* WHY US / CARD SWAP SHOWCASE SECTION */}
        <div id="showcase-section">
          <Showcase />
        </div>

        {/* PORTFOLIO SHOWCASE GALLERY SECTION */}
        <div id="portfolio-section">
          <Portfolio />
        </div>

        {/* CONTACT INQUIRY PLANNER SECTION */}
        <div id="contact-section">
          <ContactForm 
            selectedPresetService={selectedServicePreset} 
            onInquirySubmitted={calculateUnreadCount} 
          />
        </div>

      </main>

      {/* FOOTER SECTION: Minimalist Design-Forward Panel */}
      <footer className="bg-stone-950 text-stone-400 border-t border-stone-900 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-stone-900 pb-12">
          
          {/* Logo Brand Descriptor (Columns 1-4) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2 text-stone-100">
              <div className="w-8 h-8 flex items-center justify-center bg-white rounded-sm">
                <Logo size={30} />
              </div>
              <span className="font-sans font-bold text-lg tracking-tight">dywebixtech</span>
            </div>
            <p className="font-sans text-xs text-stone-500 leading-relaxed font-light max-w-sm">
              An engineering-forward studio dedicated to building high-performance, minimalist web interfaces. Handcrafted logic, clean frameworks, maximum conversions.
            </p>
          </div>

          {/* Quick Sitemap Links (Columns 5-8) */}
          <div className="md:col-span-4 grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-stone-600 font-bold block">NAVIGATION</span>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button onClick={() => handleSectionChange('services')} className="hover:text-stone-200 transition-colors cursor-pointer">
                    Services Offerd
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSectionChange('portfolio')} className="hover:text-stone-200 transition-colors cursor-pointer">
                    Portfolio Gallery
                  </button>
                </li>
                <li>
                  <button onClick={() => { window.location.hash = '#about'; }} className="hover:text-stone-200 transition-colors cursor-pointer">
                    About Us
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSectionChange('contact')} className="hover:text-stone-200 transition-colors cursor-pointer">
                    Start Estmator
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <span className="font-mono text-[9px] uppercase tracking-widest text-stone-600 font-bold block">CAPABILITIES</span>
              <ul className="space-y-2 text-xs font-light text-stone-500">
                <li>Dynamic React Hooks</li>
                <li>Tailwind Utility Art</li>
                <li>Lighthouse 100 Speed</li>
                <li>Type-Safe Bundles</li>
              </ul>
            </div>
          </div>

          {/* Business Hours / Technical Meta (Columns 9-12) */}
          <div className="md:col-span-4 space-y-4">
            <span className="font-mono text-[9px] uppercase tracking-widest text-stone-600 font-bold block">STUDIO DETAILS</span>
            <div className="space-y-3 font-mono text-[10.5px]">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-stone-600" />
                <span>Response Time: &lt; 3 Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-stone-600" />
                <span>Hosting: High-velocity CDN</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
                <span>Licensed: Apache-2.0 Secure</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright Panel */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
          <p>© {new Date().getFullYear()} dywebixtech. All rights reserved.</p>
          <div className="flex items-center gap-1.5 font-light">
            <span>Made with precision by a</span>
            <Heart className="w-3.5 h-3.5 text-stone-500 hover:text-stone-200 transition-colors duration-200 scale-100 hover:scale-110 cursor-pointer" />
            <span>Developer</span>
          </div>
        </div>

      </footer>

    </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {view}
      </motion.div>
    </AnimatePresence>
  );
}
