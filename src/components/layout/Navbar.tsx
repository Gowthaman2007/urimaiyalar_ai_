import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, Language } from '../../context/LanguageContext';
import { Mic, Bell, User as UserIcon, LogOut, Menu, Sparkles, Building2 } from 'lucide-react';
import { Alert } from '../../types';

interface NavbarProps {
  onOpenVoice: () => void;
  onToggleSidebar: () => void;
  alerts?: Alert[];
  onNavigateToAlerts?: () => void;
  onViewAlerts?: () => void;
  onOpenNewSale?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenVoice,
  onToggleSidebar,
  alerts = [],
  onNavigateToAlerts,
  onViewAlerts,
  onOpenNewSale,
}) => {
  const { user, business, logout } = useAuth();
  const { language, setLanguage, t, isEnglish, isTanglish } = useLanguage();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleAlertsClick = onNavigateToAlerts || onViewAlerts || (() => {});
  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
              <span className="text-lg font-serif">உ</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-slate-900 text-base lg:text-lg">
                  URIMAIYALAR<span className="text-emerald-600">.AI</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {isEnglish ? 'ENGLISH' : isTanglish ? 'TANGLISH' : 'தமிழ்'}
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium leading-none">
                {t('appTagline')}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Active Store / Business Badge */}
        {business && (
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-slate-800">{business.businessName}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{business.district || (isEnglish ? 'Tamil Nadu' : 'தமிழ்நாடு')}</span>
            {business.isDemo && (
              <span className="ml-1 px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[10px] font-semibold">
                DEMO
              </span>
            )}
          </div>
        )}

        {/* Right: Language toggle, Voice AI trigger, Alerts, Profile */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60">
            <button
              id="lang-switch-ta"
              onClick={() => setLanguage('ta')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                language === 'ta'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              தமிழ்
            </button>
            <button
              id="lang-switch-tanglish"
              onClick={() => setLanguage('tanglish')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                language === 'tanglish'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tanglish
            </button>
            <button
              id="lang-switch-en"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                language === 'en'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>

          {/* Voice Assistant Primary Trigger Button */}
          <button
            id="navbar-voice-assistant-btn"
            onClick={onOpenVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 transition-all active:scale-95"
            title="Open Voice Assistant"
          >
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline font-medium">
              {isEnglish ? 'Voice AI' : isTanglish ? 'Voice AI' : 'குரல் / Voice'}
            </span>
          </button>

          {/* Notifications / Alerts Bell */}
          <button
            id="navbar-alerts-btn"
            onClick={handleAlertsClick}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              id="navbar-user-menu-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden md:inline-block text-xs font-semibold text-slate-700">
                {user?.name || (isEnglish ? 'Owner' : 'உரிமையாளர்')}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                    <Sparkles className="w-3 h-3" />
                    <span>{business?.businessName || 'Business Enterprise'}</span>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    id="navbar-logout-btn"
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t('logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
