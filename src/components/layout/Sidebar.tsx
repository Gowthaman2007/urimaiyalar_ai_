import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Brain,
  ShoppingCart,
  PackagePlus,
  Boxes,
  Users,
  Truck,
  BookOpenCheck,
  Receipt,
  TrendingUp,
  Landmark,
  BadgePercent,
  Bell,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export type NavTab =
  | 'dashboard'
  | 'assistant'
  | 'memory'
  | 'sales'
  | 'purchases'
  | 'inventory'
  | 'customers'
  | 'suppliers'
  | 'credit'
  | 'expenses'
  | 'financial'
  | 'market'
  | 'schemes'
  | 'alerts'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab?: NavTab | string;
  activeTab?: NavTab | string;
  onSelectTab?: (tab: NavTab) => void;
  setActiveTab?: (tab: any) => void;
  isOpenMobile?: boolean;
  isOpen?: boolean;
  onCloseMobile?: () => void;
  onClose?: () => void;
  lowStockCount?: number;
  unreadAlertsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  activeTab,
  onSelectTab,
  setActiveTab,
  isOpenMobile,
  isOpen,
  onCloseMobile,
  onClose,
  lowStockCount = 0,
  unreadAlertsCount = 0,
}) => {
  const { language, t, isEnglish, isTanglish } = useLanguage();
  const effectiveCurrentTab = (currentTab || activeTab || 'dashboard').toString().toLowerCase();
  const isMobileOpen = isOpenMobile ?? isOpen ?? false;

  const handleClose = () => {
    if (onCloseMobile) onCloseMobile();
    if (onClose) onClose();
  };

  const handleSelect = (tab: NavTab) => {
    if (onSelectTab) onSelectTab(tab);
    if (setActiveTab) setActiveTab(tab.toUpperCase());
    handleClose();
  };

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      labelTa: 'முகப்பு (Dashboard)',
      labelEn: 'Dashboard',
      labelTanglish: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'assistant' as NavTab,
      labelTa: 'AI உதவியாளர் (AI Brain)',
      labelEn: 'AI Assistant',
      labelTanglish: 'AI Assistant',
      icon: Bot,
      highlight: true,
      badge: 'PRO',
    },
    {
      id: 'memory' as NavTab,
      labelTa: 'வணிக நினைவகம் (Memory)',
      labelEn: 'Business Memory',
      labelTanglish: 'Business Memory',
      icon: Brain,
      badge: null,
    },
    {
      id: 'sales' as NavTab,
      labelTa: 'விற்பனை (Sales)',
      labelEn: 'Sales Ledger',
      labelTanglish: 'Sales Kanakku',
      icon: ShoppingCart,
      badge: null,
    },
    {
      id: 'purchases' as NavTab,
      labelTa: 'கொள்முதல் (Purchases)',
      labelEn: 'Purchases',
      labelTanglish: 'Purchases',
      icon: PackagePlus,
      badge: null,
    },
    {
      id: 'inventory' as NavTab,
      labelTa: 'சரக்கு இருப்பு (Inventory)',
      labelEn: 'Inventory Stock',
      labelTanglish: 'Stock & Inventory',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeType: lowStockCount > 0 ? 'warning' : 'neutral',
    },
    {
      id: 'customers' as NavTab,
      labelTa: 'வாடிக்கையாளர்கள் (Customers)',
      labelEn: 'Customers',
      labelTanglish: 'Customers',
      icon: Users,
      badge: null,
    },
    {
      id: 'suppliers' as NavTab,
      labelTa: 'சப்ளையர்கள் (Suppliers)',
      labelEn: 'Suppliers',
      labelTanglish: 'Suppliers',
      icon: Truck,
      badge: null,
    },
    {
      id: 'credit' as NavTab,
      labelTa: 'கடன் ஏடு (Credit Ledger)',
      labelEn: 'Credit Ledger',
      labelTanglish: 'Kadan Kanakku',
      icon: BookOpenCheck,
      badge: null,
    },
    {
      id: 'expenses' as NavTab,
      labelTa: 'செலவுகள் (Expenses)',
      labelEn: 'Expenses',
      labelTanglish: 'Selavugal',
      icon: Receipt,
      badge: null,
    },
    {
      id: 'financial' as NavTab,
      labelTa: 'நிதி நுண்ணறிவு (Financial)',
      labelEn: 'Financial Intel',
      labelTanglish: 'Financial Intel',
      icon: TrendingUp,
      badge: null,
    },
    {
      id: 'market' as NavTab,
      labelTa: 'சந்தை நிலவரம் (Market)',
      labelEn: 'Market Intel',
      labelTanglish: 'Market Nilavaram',
      icon: Landmark,
      badge: null,
    },
    {
      id: 'schemes' as NavTab,
      labelTa: 'அரசு திட்டங்கள் (Govt Schemes)',
      labelEn: 'Govt Schemes',
      labelTanglish: 'Govt Schemes',
      icon: BadgePercent,
      badge: isEnglish ? 'Govt' : 'தமிழ்நாடு',
      badgeType: 'emerald',
    },
    {
      id: 'alerts' as NavTab,
      labelTa: 'எச்சரிக்கைகள் (Alerts)',
      labelEn: 'Alerts',
      labelTanglish: 'Alerts',
      icon: Bell,
      badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : null,
      badgeType: 'danger',
    },
    {
      id: 'reports' as NavTab,
      labelTa: 'அறிக்கைகள் (Reports)',
      labelEn: 'Reports & Export',
      labelTanglish: 'Reports & Export',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'settings' as NavTab,
      labelTa: 'அமைப்புகள் (Settings)',
      labelEn: 'Settings & Profile',
      labelTanglish: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation items list */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1 scrollbar-thin">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {t('mainMenu')}
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = effectiveCurrentTab === item.id;
            const label = isEnglish
              ? item.labelEn
              : isTanglish
              ? item.labelTanglish || item.labelEn
              : item.labelTa;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-emerald-600'
                        : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="truncate">{label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`shrink-0 ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeType === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : item.badgeType === 'danger'
                        ? 'bg-rose-100 text-rose-800'
                        : item.badgeType === 'emerald'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="px-2 py-2 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700">
                {isEnglish ? 'Urimaiyalar AI' : isTanglish ? 'Urimaiyalar AI' : 'தமிழ் வணிகம்'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {isEnglish
                ? 'Intelligent Retail AI Engine active'
                : isTanglish
                ? 'Smart Business Brain Active'
                : 'Tamil-first Business AI Engine active'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
