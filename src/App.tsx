/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { VoiceModal } from './components/common/VoiceModal';

// Views
import { AuthView } from './components/views/AuthView';
import { DashboardView } from './components/views/DashboardView';
import { AssistantView } from './components/views/AssistantView';
import { SalesView } from './components/views/SalesView';
import { PurchasesView } from './components/views/PurchasesView';
import { InventoryView } from './components/views/InventoryView';
import { CustomersView } from './components/views/CustomersView';
import { SuppliersView } from './components/views/SuppliersView';
import { CreditView } from './components/views/CreditView';
import { ExpensesView } from './components/views/ExpensesView';
import { FinancialView } from './components/views/FinancialView';
import { MemoryView } from './components/views/MemoryView';
import { SchemesView } from './components/views/SchemesView';
import { MarketView } from './components/views/MarketView';
import { AlertsView } from './components/views/AlertsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [assistantPrefillQuery, setAssistantPrefillQuery] = useState<string>('');

  // Global Action Modals
  const [isNewSaleOpen, setIsNewSaleOpen] = useState<boolean>(false);
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState<boolean>(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState<boolean>(false);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        setIsVoiceOpen((prev) => !prev);
      }
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setIsNewSaleOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl animate-pulse shadow-md">
            உ
          </div>
          <p className="text-xs font-bold text-slate-600">உரிமையாளர் AI ஏற்றப்படுகிறது...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  const handleVoiceQueryProcessed = (recognizedText: string) => {
    setIsVoiceOpen(false);
    setAssistantPrefillQuery(recognizedText);
    setActiveTab('ASSISTANT');
  };

  const handleAskAIAboutScheme = (schemeName: string) => {
    setAssistantPrefillQuery(`${schemeName} திட்டத்தின் தகுதிகள், மானிய தொகை மற்றும் விண்ணப்பிக்கும் முறையை விளக்கு`);
    setActiveTab('ASSISTANT');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex overflow-hidden font-sans text-slate-800 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenVoice={() => setIsVoiceOpen(true)}
          onOpenNewSale={() => setIsNewSaleOpen(true)}
          onViewAlerts={() => setActiveTab('ALERTS')}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
          <div className="max-w-7xl mx-auto pb-10">
            {activeTab === 'DASHBOARD' && (
            <DashboardView
  onNavigate={(tab) => setActiveTab(tab)}
  onOpenVoice={() => setIsVoiceOpen(true)}
  onOpenNewSale={() => {
    setActiveTab('SALES');
    setIsNewSaleOpen(true);
  }}
  onOpenNewPurchase={() => {
    setActiveTab('PURCHASES');
    setIsNewPurchaseOpen(true);
  }}
  onOpenNewExpense={() => {
    setActiveTab('EXPENSES');
    setIsExpenseOpen(true);
  }}
  onOpenCreditModal={() => {
    setActiveTab('CREDIT');
    setIsPaymentOpen(true);
  }}
/>
            )}

            {activeTab === 'ASSISTANT' && (
              <AssistantView
                onOpenVoice={() => setIsVoiceOpen(true)}
                initialQuery={assistantPrefillQuery}
              />
            )}

            {activeTab === 'SALES' && (
              <SalesView
                isNewSaleModalOpen={isNewSaleOpen}
                onOpenNewSaleModal={() => setIsNewSaleOpen(true)}
                onCloseNewSaleModal={() => setIsNewSaleOpen(false)}
              />
            )}

            {activeTab === 'PURCHASES' && (
              <PurchasesView
                isModalOpen={isNewPurchaseOpen}
                onOpenModal={() => setIsNewPurchaseOpen(true)}
                onCloseModal={() => setIsNewPurchaseOpen(false)}
              />
            )}

            {activeTab === 'INVENTORY' && <InventoryView />}

            {activeTab === 'CUSTOMERS' && <CustomersView />}

            {activeTab === 'SUPPLIERS' && <SuppliersView />}

            {activeTab === 'CREDIT' && (
              <CreditView
                isPaymentModalOpen={isPaymentOpen}
                onOpenPaymentModal={() => setIsPaymentOpen(true)}
                onClosePaymentModal={() => setIsPaymentOpen(false)}
              />
            )}

            {activeTab === 'EXPENSES' && (
              <ExpensesView
                isModalOpen={isExpenseOpen}
                onOpenModal={() => setIsExpenseOpen(true)}
                onCloseModal={() => setIsExpenseOpen(false)}
              />
            )}

            {activeTab === 'FINANCIAL' && <FinancialView />}

            {activeTab === 'MEMORY' && <MemoryView />}

            {activeTab === 'SCHEMES' && (
              <SchemesView onAskAIAboutScheme={handleAskAIAboutScheme} />
            )}

            {activeTab === 'MARKET' && <MarketView />}

            {activeTab === 'ALERTS' && <AlertsView />}

            {activeTab === 'REPORTS' && <ReportsView />}

            {activeTab === 'SETTINGS' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Global Voice Intelligence Modal */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onQueryProcessed={handleVoiceQueryProcessed}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
