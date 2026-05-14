import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import ClientsView from './views/ClientsView';
import AppointmentsView from './views/AppointmentsView';
import InvoicesView from './views/InvoicesView';
import InventoryView from './views/InventoryView';
import SettingsView from './views/SettingsView';
import WelcomeScreen from './components/WelcomeScreen';
import { db } from './services/mockData';
import { ViewState } from './types';
import { Menu, Loader2, Shield } from 'lucide-react';

const STRIPE_LINK = "https://buy.stripe.com/dRmbJ17vQ3uxakg0slgbm00";
const GOOGLE_CLIENT_ID = "339121394936-rguue4bt22dau41ldkj0kipt9fodggm3.apps.googleusercontent.com";
const LOGIN_HINT_KEY = 'cleanswift_login_hint';

type AppState = 'SILENT_AUTH' | 'WELCOME' | 'CHECKING_SUB' | 'INITIALIZING' | 'SUBSCRIPTION_REQUIRED' | 'AUTHENTICATED';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('SILENT_AUTH');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [targetAppointmentId, setTargetAppointmentId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const hint = localStorage.getItem(LOGIN_HINT_KEY);
    if (!hint) {
      setAppState('WELCOME');
      return;
    }

    let cancelled = false;

    const attempt = () => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file email profile',
        hint,
        callback: (response: any) => {
          if (cancelled) return;
          if (response.access_token) {
            handleLoginSuccess(response.access_token);
          } else {
            setAppState('WELCOME');
          }
        },
        error_callback: () => {
          if (!cancelled) setAppState('WELCOME');
        },
      });
      client.requestAccessToken({ prompt: '' });
    };

    if (window.google?.accounts) {
      attempt();
      return;
    }

    const poll = setInterval(() => {
      if (window.google?.accounts) {
        clearInterval(poll);
        clearTimeout(giveUp);
        if (!cancelled) attempt();
      }
    }, 50);

    const giveUp = setTimeout(() => {
      clearInterval(poll);
      if (!cancelled) setAppState('WELCOME');
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(poll);
      clearTimeout(giveUp);
    };
  }, []);

  const handleLoginSuccess = async (token: string) => {
    setAppState('CHECKING_SUB');
    try {
      const res = await fetch('/.netlify/functions/check-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token }),
      });
      const data = await res.json();

      if (!data.isSubscribed) {
        setUserEmail(data.email ?? null);
        setAppState('SUBSCRIPTION_REQUIRED');
        return;
      }

      if (data.email) {
        localStorage.setItem(LOGIN_HINT_KEY, data.email);
      }
    } catch (err) {
      console.error('Subscription check failed:', err);
      setAppState('SUBSCRIPTION_REQUIRED');
      return;
    }

    setAppState('INITIALIZING');
    try {
      await db.initGoogleMode(token);
      setAppState('AUTHENTICATED');
    } catch (error) {
      console.error("Failed to initialize DB:", error);
      alert("Failed to connect to Google Sheets. Please try again.");
      setAppState('WELCOME');
    }
  };

  const handleDemoMode = () => {
    db.setMockMode();
    setAppState('AUTHENTICATED');
  };

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD': return (
        <DashboardView
          onNavigateToAppointment={(id) => {
            setTargetAppointmentId(id);
            setCurrentView('APPOINTMENTS');
          }}
        />
      );
      case 'CLIENTS': return <ClientsView />;
      case 'APPOINTMENTS': return (
        <AppointmentsView
          initialAppointmentId={targetAppointmentId}
          onClearInitialAppointment={() => setTargetAppointmentId(null)}
        />
      );
      case 'INVOICES': return <InvoicesView />;
      case 'INVENTORY': return <InventoryView />;
      case 'SETTINGS': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  if (appState === 'SILENT_AUTH') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (appState === 'CHECKING_SUB') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-primary-600 gap-4">
        <Loader2 className="w-12 h-12 animate-spin" />
        <p className="text-gray-600 font-medium">Checking subscription...</p>
      </div>
    );
  }

  if (appState === 'INITIALIZING') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-primary-600 gap-4">
        <Loader2 className="w-12 h-12 animate-spin" />
        <p className="text-gray-600 font-medium">Connecting to Google Sheets...</p>
        <p className="text-xs text-gray-400">Setting up your CleanSwift dashboard.</p>
      </div>
    );
  }

  if (appState === 'SUBSCRIPTION_REQUIRED') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '0.5px solid #e5e7eb', padding: '48px 40px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
            <Shield size={20} style={{ color: '#0284c7' }} />
            <span style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>CleanSwift</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.25 }}>
            Subscription required
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 32px', lineHeight: 1.6 }}>
            CleanSwift is $19.92/month — one flat price, no commissions, cancel anytime.
          </p>
          <a
            href={userEmail ? `${STRIPE_LINK}?prefilled_email=${encodeURIComponent(userEmail)}` : STRIPE_LINK}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'block', background: '#0284c7', color: '#fff', borderRadius: '999px', padding: '13px 24px', fontSize: '14px', fontWeight: 600, textDecoration: 'none', marginBottom: '16px' }}
          >
            Subscribe now
          </a>
          <button
            onClick={() => setAppState('WELCOME')}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', padding: 0 }}
          >
            Already subscribed? Sign in again
          </button>
        </div>
      </div>
    );
  }

  if (appState === 'WELCOME') {
    return <WelcomeScreen onLoginSuccess={handleLoginSuccess} onDemoMode={handleDemoMode} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        currentView={currentView}
        onChangeView={setCurrentView}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 lg:hidden flex items-center p-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-4 text-lg font-semibold text-gray-800">CleanSwift Manager</h1>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-scroll">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;
