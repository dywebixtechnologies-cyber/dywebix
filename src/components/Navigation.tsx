/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Menu, X, ArrowRight, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, isAdmin, logout } = useAuth();
  const firstName = user?.name.split(' ')[0] ?? '';

  const goTo = (hash: string) => {
    window.location.hash = hash;
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const navItems: { id: string; label: string; badge?: number }[] = [
    { id: 'services', label: 'Services' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Start Project' },
  ];

  const handleNavClick = (id: string) => {
    // "About" is its own page (hash route); everything else scrolls the home page.
    if (id === 'about') {
      window.location.hash = '#about';
      setIsOpen(false);
      return;
    }
    onSectionChange(id);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#EEF4FC]/90 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('hero')}
          className="flex items-center gap-2 group text-[#0b3566] focus:outline-none"
          id="nav-logo"
        >
          <Logo
            variant="full"
            size={34}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isSelected = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-1 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors duration-200 focus:outline-none cursor-pointer ${
                  isSelected ? 'text-[#072750] font-semibold' : 'text-slate-500 hover:text-[#0c6fc2]'
                }`}
                id={`nav-link-${item.id}`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {item.label}
                  {item.badge !== undefined && (
                    <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#0c6fc2] text-[9px] text-white font-sans font-bold leading-none ring-1 ring-[#0c6fc2]">
                      {item.badge}
                    </span>
                  )}
                </span>
                {isSelected && (
                  <motion.div
                    layoutId="activeNavLine"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0c6fc2]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}

          {/* Estimate Project CTA */}
          <button
            onClick={() => handleNavClick('contact')}
            className="flex items-center gap-2 rounded-full bg-[#0c6fc2] h-10 px-5 text-white hover:bg-[#072750] font-mono text-[10px] tracking-widest uppercase transition-all hover:gap-3 cursor-pointer"
            id="nav-cta"
          >
            Estimate Project <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Auth controls — placed after the Estimate Project button */}
          {user ? (
            <div className="flex items-center gap-4 pl-3 border-l border-[#cbdff5]">
              <button
                onClick={() => goTo(isAdmin ? '#admin' : '#dashboard')}
                className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-[#0c6fc2] transition-colors cursor-pointer"
                id="nav-dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </button>
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-800 font-semibold">Hi, {firstName}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-[#0c6fc2] transition-colors cursor-pointer"
                id="nav-logout"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => goTo('#login')}
              className="flex items-center gap-1.5 pl-3 border-l border-[#cbdff5] font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-[#0c6fc2] transition-colors cursor-pointer"
              id="nav-login"
            >
              <LogIn className="w-3.5 h-3.5" /> Login
            </button>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden -mr-2 w-11 h-11 flex items-center justify-center text-slate-700 hover:text-[#0c6fc2] focus:outline-none"
          aria-label="Toggle Menu"
          id="nav-mobile-toggle"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden absolute top-20 left-0 right-0 bg-[#EEF4FC] border-b border-[#cbdff5] shadow-lg z-30"
          id="nav-mobile-dropdown"
        >
          <div className="px-6 py-8 flex flex-col gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left py-2 border-b border-[#dfeaf8] flex items-center justify-between font-mono text-xs tracking-widest uppercase ${
                  activeSection === item.id ? 'text-[#072750] font-semibold' : 'text-slate-500'
                }`}
                id={`nav-mobile-link-${item.id}`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0c6fc2] text-[10px] text-white">
                    {item.badge}
                  </span>
                ) : (
                  <ArrowRight className="w-4 h-4 opacity-30" />
                )}
              </button>
            ))}

            <button
              onClick={() => handleNavClick('contact')}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-full bg-[#0c6fc2] h-12 text-white text-[11px] font-mono tracking-widest uppercase font-semibold hover:bg-[#072750] transition-all"
              id="nav-mobile-cta"
            >
              Estimate Project <ArrowRight className="w-4 h-4" />
            </button>

            {/* Mobile auth controls */}
            {user ? (
              <div className="flex flex-col gap-4 border-t border-[#dfeaf8] pt-6 mt-2">
                <span className="font-mono text-xs uppercase tracking-widest text-slate-800 font-semibold">Signed in as {firstName}</span>
                <button
                  onClick={() => goTo(isAdmin ? '#admin' : '#dashboard')}
                  className="w-full text-left flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-slate-600"
                  id="nav-mobile-dashboard"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-slate-600"
                  id="nav-mobile-logout"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => goTo('#login')}
                className="w-full flex items-center justify-center gap-2 border border-[#cbdff5] rounded-full h-12 text-slate-800 text-[11px] font-mono tracking-widest uppercase font-semibold hover:bg-[#eef4fc] transition-all"
                id="nav-mobile-login"
              >
                <LogIn className="w-4 h-4" /> Login
              </button>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
