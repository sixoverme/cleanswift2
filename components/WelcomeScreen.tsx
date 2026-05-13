import React, { useState } from 'react';
import { X, Check, Users, Calendar, ClipboardList, Receipt, Clock, Package, Shield, Loader2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = "339121394936-rguue4bt22dau41ldkj0kipt9fodggm3.apps.googleusercontent.com";
const STRIPE_LINK = "https://buy.stripe.com/dRmbJ17vQ3uxakg0slgbm00";

declare global {
  interface Window {
    google: any;
  }
}

interface WelcomeScreenProps {
  onLoginSuccess: (token: string) => void;
  onDemoMode: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLoginSuccess, onDemoMode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = () => {
    setError('');
    setIsLoading(true);

    if (!window.google || !window.google.accounts) {
      setError("Google Sign-In script not loaded. Please check your internet connection.");
      setIsLoading(false);
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response: any) => {
          if (response.access_token) {
            onLoginSuccess(response.access_token);
          } else {
            setIsLoading(false);
            if (response.error) {
              setError(`Login error: ${response.error}`);
            }
          }
        },
      });
      client.requestAccessToken();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setError('Configuration Error: Please ensure GOOGLE_CLIENT_ID is set in the code.');
    }
  };

  const badColStyle: React.CSSProperties = { padding: '20px', borderRadius: '12px', background: '#ffffff', border: '1px solid #e5e7eb' };
  const badLabelStyle: React.CSSProperties = { fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px', color: '#94a3b8' };
  const listStyle: React.CSSProperties = { listStyle: 'none', padding: 0, margin: 0 };
  const badItemStyle: React.CSSProperties = { fontSize: '13px', lineHeight: 1.5, padding: '6px 0', display: 'flex', gap: '10px', alignItems: 'flex-start', color: '#475569' };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: '#ffffff' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', background: '#ffffff', borderBottom: '0.5px solid #f3f4f6' }}>
        <svg width="180" height="36" viewBox="0 0 240 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="CleanSwift">
          <path d="M24 44s16-8 16-20V10l-16-6-16 6v14c0 12 16 20 16 20z" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="#0284c7" fillOpacity="0.1"/>
          <text x="56" y="34" fill="#0f172a" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontWeight: 800, fontSize: '28px', letterSpacing: '-0.025em' }}>CleanSwift</text>
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button onClick={onDemoMode} style={{ fontSize: '13px', fontWeight: 500, color: '#4b5563', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: '999px' }}>
            Try demo
          </button>
          <button onClick={() => window.open(STRIPE_LINK, '_blank')} style={{ fontSize: '13px', fontWeight: 600, background: '#0284c7', color: '#fff', border: 'none', borderRadius: '999px', padding: '9px 18px', cursor: 'pointer' }}>
            Subscribe
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ padding: '52px 32px 44px', background: '#ffffff' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#0369a1', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 600, background: '#e0f2fe', padding: '5px 12px', borderRadius: '999px' }}>
            Built by cleaners · for cleaners
          </p>
          <h1 style={{ fontSize: '40px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.025em' }}>
            Finally, an app that{' '}
            <span style={{ background: 'linear-gradient(180deg, transparent 62%, #bae6fd 62%)', padding: '0 3px' }}>actually gets</span>
            {' '}how a cleaning business runs.
          </h1>
          <p style={{ fontSize: '16px', color: '#475569', margin: '0 0 24px', lineHeight: 1.55, maxWidth: '560px' }}>
            Not a marketplace skimming your jobs. Not a calendar pretending to be a business tool. Just the full workflow — built by people who've actually done the work.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => window.open(STRIPE_LINK, '_blank')} style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 22px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Subscribe — $19.92/mo
            </button>
            <button onClick={onDemoMode} style={{ background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '13px 22px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Try the demo
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '14px' }}>Cancel anytime.</p>
        </div>
      </div>

      {/* Comparison */}
      <div style={{ padding: '48px 32px', background: '#f8fafc', borderTop: '0.5px solid #e5e7eb', borderBottom: '0.5px solid #e5e7eb' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0f172a', margin: '0 0 24px', lineHeight: 1.3, letterSpacing: '-0.015em' }}>
            Every other "cleaner app" is one of two things:
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={badColStyle}>
              <p style={badLabelStyle}>The marketplace</p>
              <ul style={listStyle}>
                {['Takes a cut of every job', 'Owns the customer relationship', 'Sets your prices for you', "You're the middleman in your own business"].map(text => (
                  <li key={text} style={badItemStyle}>
                    <X size={15} style={{ color: '#cbd5e1', marginTop: '1px', flexShrink: 0 }} />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={badColStyle}>
              <p style={badLabelStyle}>The "simple" app</p>
              <ul style={listStyle}>
                {['A calendar with a name', 'No real invoicing', 'No supply tracking, no checklists', "Built by people who've never cleaned"].map(text => (
                  <li key={text} style={badItemStyle}>
                    <X size={15} style={{ color: '#cbd5e1', marginTop: '1px', flexShrink: 0 }} />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ padding: '20px', borderRadius: '12px', background: '#0c4a6e', color: '#fff', marginTop: '12px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '12px', color: '#7dd3fc' }}>CleanSwift</p>
            <ul style={listStyle}>
              {[
                'Your customers. Your pricing. Your relationship.',
                'The whole workflow: clients, scheduling, invoicing, checklists, inventory, time tracking',
                'Built by people who run cleaning businesses',
                'One flat price. No commissions, ever.',
              ].map(text => (
                <li key={text} style={{ fontSize: '13px', lineHeight: 1.5, padding: '6px 0', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Check size={15} style={{ color: '#38bdf8', marginTop: '1px', flexShrink: 0 }} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '56px 32px', background: '#ffffff' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', color: '#0369a1', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px', fontWeight: 600 }}>
            The actual stuff you'll use
          </p>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0f172a', margin: '0 0 28px', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
            Every little thing a cleaning day throws at you — handled.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { Icon: Users,         title: 'Client details that actually matter',   desc: "Gate codes, alarm codes, where the dog hides, what the kids are allergic to, which rooms to skip. All your notes and everything in your head, finally in one place." },
              { Icon: Calendar,      title: "Recurring schedules that don't break",  desc: "Weekly, biweekly, every-third-Tuesday — set it once. The app keeps the week organized so you don't have to." },
              { Icon: ClipboardList, title: 'Per-client checklists',                 desc: "Every house is different. Save the exact list for each client so the job's the same whether you remember every detail or not." },
              { Icon: Receipt,       title: 'Invoices that send themselves',         desc: "Finish a job, hit a button, invoice goes out. Branded with your name, calculated from your rate, paid faster." },
              { Icon: Clock,         title: 'Real time tracking',                    desc: "How long jobs actually take vs. what you charged. Find out which clients pay you fairly — and which ones don't." },
              { Icon: Package,       title: 'Supply tracking with low-stock alerts', desc: `Know what's in the van before you leave the driveway. No more "I thought I had another bottle of that."` },
            ].map(({ Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', flexShrink: 0 }}>
                  <Icon size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px' }}>{title}</h3>
                  <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.55 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ padding: '56px 32px', background: '#0f172a', color: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 600, margin: '0 0 12px', lineHeight: 1.25, letterSpacing: '-0.02em', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
          We built this for ourselves. Now it's yours too.
        </h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 22px' }}>
          $19.92 a month. Cancel anytime. Nothing between you and your customers.
        </p>
        <button onClick={() => window.open(STRIPE_LINK, '_blank')} style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '999px', padding: '14px 28px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          Subscribe now
        </button>
        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '22px' }}>
          <button onClick={onDemoMode} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', padding: 0 }}>
            Or try the demo — no signup needed.
          </button>
        </p>
      </div>

      {/* Sign in */}
      <div style={{ padding: '24px', textAlign: 'center', background: '#ffffff', borderTop: '0.5px solid #f3f4f6' }}>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px' }}>Already a subscriber?</p>
        {error && (
          <p style={{ fontSize: '12px', color: '#dc2626', margin: '0 0 10px' }}>{error}</p>
        )}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', color: '#0f172a', fontSize: '13px', fontWeight: 500, cursor: isLoading ? 'default' : 'pointer' }}
        >
          {isLoading
            ? <Loader2 size={14} className="animate-spin" />
            : <img src="https://www.google.com/favicon.ico" width="14" height="14" alt="" />
          }
          Sign in with Google
        </button>
        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px' }}>
          By signing in, you agree to our{' '}
          <a href="/terms.html" style={{ color: '#0284c7' }}>Terms</a>
          {' '}and{' '}
          <a href="/privacy.html" style={{ color: '#0284c7' }}>Privacy Policy</a>.
        </p>
      </div>

      {/* Footer */}
      <footer style={{ background: '#ffffff', borderTop: '0.5px solid #f3f4f6', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
          <Shield size={18} style={{ color: '#0284c7' }} />
          CleanSwift
        </div>
        <div style={{ display: 'flex', gap: '28px' }}>
          <a href="/privacy.html" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}>Privacy</a>
          <a href="/terms.html" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}>Terms</a>
          <a href="mailto:daniel@sociomagicka.com" style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}>Support</a>
        </div>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>© 2026 CleanSwift. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default WelcomeScreen;
