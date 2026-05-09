import React, { useState } from 'react';
import { Shield, Layout, Loader2, CheckCircle, Database, Calendar, Users, ArrowRight, Zap, Lock } from 'lucide-react';

// TODO: PASTE YOUR GOOGLE CLIENT ID HERE
const GOOGLE_CLIENT_ID = "339121394936-rguue4bt22dau41ldkj0kipt9fodggm3.apps.googleusercontent.com";

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

  const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-6">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary-600 p-1.5 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">CleanSwift</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={onDemoMode}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Try Demo
              </button>
              <button 
                onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-primary-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <Zap size={14} className="fill-current" />
            <span>Built for Modern Service Professionals</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
            Your Business, <span className="text-primary-600">Powered by Data.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            CleanSwift transforms your Google Sheets into a professional management suite. No black-box databases. Just your data, your way.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Get Started for Free <ArrowRight size={20} />
            </button>
            <button 
              onClick={onDemoMode}
              className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-2xl font-bold text-lg hover:border-primary-600 hover:text-primary-600 transition-all flex items-center justify-center gap-2"
            >
              Explore Demo <Layout size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof/Trust Section */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2 font-bold text-xl"><Database size={24} /> Google Sheets</div>
          <div className="flex items-center gap-2 font-bold text-xl"><Shield size={24} /> Privacy First</div>
          <div className="flex items-center gap-2 font-bold text-xl"><Zap size={24} /> Direct Sync</div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Scale</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Focus on your craft, we'll handle the logistics with a suite designed for reliability and speed.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Users}
            title="Intelligent CRM"
            description="Track clients, locations, and specialized notes for children and pets. Keep every detail of your service personalized."
          />
          <FeatureCard 
            icon={Calendar}
            title="Smart Scheduling"
            description="One-off or recurring appointments with conflict checking. View your upcoming week with clarity."
          />
          <FeatureCard 
            icon={CheckCircle}
            title="Interactive Checklists"
            description="Ensure quality control with per-job checklists. Your high standards, documented every time."
          />
          <FeatureCard 
            icon={Shield}
            title="Professional Invoicing"
            description="Generate branded invoices instantly based on job rates and hours. Track payment status with zero effort."
          />
          <FeatureCard 
            icon={Database}
            title="Inventory Management"
            description="Monitor supplies and get low-stock alerts. Never run out of essentials in the middle of a job."
          />
          <FeatureCard 
            icon={Lock}
            title="Data Sovereignty"
            description="Your data lives in your Google Drive. We don't lock your business records behind a proprietary server."
          />
        </div>
      </section>

      {/* Login Section */}
      <section id="login-section" className="py-24 px-4 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-md mx-auto relative z-10">
          <div className="bg-white rounded-3xl p-8 text-gray-900 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Ready to Start?</h3>
              <p className="text-gray-500 text-sm">Sign in with Google to sync your management suite.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full group relative flex justify-center items-center gap-3 py-4 px-4 border border-gray-200 rounded-2xl bg-white text-gray-700 font-bold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-sm active:scale-[0.98]"
            >
               {isLoading ? (
                 <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
               ) : (
                 <>
                   <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                   <span>Sign in with Google</span>
                 </>
               )}
            </button>

            <div className="mt-6 flex flex-col gap-4">
              <p className="text-[11px] text-gray-400 text-center px-4">
                By signing in, you agree to our 
                <a href="/terms.html" className="text-primary-600 hover:underline mx-1">Terms</a> 
                and 
                <a href="/privacy.html" className="text-primary-600 hover:underline mx-1">Privacy Policy</a>.
              </p>
              <div className="h-px bg-gray-100 w-full"></div>
              <button 
                onClick={onDemoMode}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Layout size={14} /> Try the Demo Environment
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <span className="font-bold text-gray-900">CleanSwift</span>
          </div>
          <div className="flex gap-8">
            <a href="/privacy.html" className="text-sm text-gray-500 hover:text-primary-600">Privacy</a>
            <a href="/terms.html" className="text-sm text-gray-500 hover:text-primary-600">Terms</a>
            <a href="mailto:daniel@sociomagicka.com" className="text-sm text-gray-500 hover:text-primary-600">Support</a>
          </div>
          <p className="text-sm text-gray-400">&copy; 2026 CleanSwift. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default WelcomeScreen;