import React, { useState, useEffect } from 'react';
import { UserProfile, JobType, Invoice, Status } from '../types';
import { User, MapPin, Plus, Trash2, Save, Upload, Briefcase, DollarSign, Database, RefreshCw } from 'lucide-react';
import { db } from '../services/mockData';

const SettingsView: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const defaultProfile: UserProfile = {
    companyName: '',
    companyAddress: '',
    avatar: '',
    showLogoOnInvoice: false,
    jobTypes: [
      { id: '1', name: 'Standard Clean', defaultRate: 45 },
      { id: '2', name: 'Deep Clean', defaultRate: 60 }
    ]
  };

  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
      try {
          // Try to get from DB first (synced source)
          const dbProfile = await db.getSettings();
          
          if (dbProfile) {
              setProfile(dbProfile);
              // Update local cache
              localStorage.setItem('cleanswift_user_profile', JSON.stringify(dbProfile));
          } else {
              // Fallback to local storage
              const savedProfile = localStorage.getItem('cleanswift_user_profile');
              if (savedProfile) {
                  setProfile(JSON.parse(savedProfile));
              }
          }
      } catch (e) {
          console.error("Error loading settings:", e);
           // Fallback to local storage on error
          const savedProfile = localStorage.getItem('cleanswift_user_profile');
          if (savedProfile) {
              setProfile(JSON.parse(savedProfile));
          }
      } finally {
          setIsLoading(false);
      }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Save to local cache
    localStorage.setItem('cleanswift_user_profile', JSON.stringify(profile));
    
    // Save to DB
    try {
        await db.saveSettings(profile);
        setMessage({ type: 'success', text: 'Settings saved and synced successfully!' });
    } catch (error) {
        console.error("Failed to sync settings:", error);
        setMessage({ type: 'error', text: 'Saved locally, but failed to sync to cloud.' });
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleBackfillInvoices = async () => {
      if (!confirm("This will generate invoices for all appointments that do not currently have one. Continue?")) return;
      
      setIsSyncing(true);
      try {
          const appointments = await db.getAppointments();
          const invoices = await db.getInvoices();
          const existingApptIds = new Set(invoices.map(i => i.appointmentId).filter(Boolean));

          const missing = appointments.filter(a => !existingApptIds.has(a.id));

          if (missing.length === 0) {
              setMessage({ type: 'success', text: 'All appointments already have invoices.' });
          } else {
              for (const appt of missing) {
                  const invoice: Invoice = {
                      id: Math.random().toString(36).substr(2, 9),
                      clientId: appt.clientId,
                      appointmentId: appt.id,
                      clientName: appt.clientName,
                      date: new Date().toISOString().split('T')[0], // Issue date = Today
                      dueDate: appt.date,
                      status: Status.Unpaid,
                      amount: appt.rate * appt.estimatedHours,
                      notes: `Auto-generated backup for Appointment (Job Status: ${appt.status})`,
                      items: [{
                          id: Math.random().toString(36).substr(2, 9),
                          description: `${appt.serviceType} (${appt.estimatedHours} hrs)`,
                          quantity: appt.estimatedHours,
                          unitPrice: appt.rate
                      }]
                  };
                  await db.addInvoice(invoice);
              }
              setMessage({ type: 'success', text: `Successfully generated ${missing.length} missing invoices.` });
          }
      } catch (error) {
          console.error("Backfill failed:", error);
          setMessage({ type: 'error', text: 'Failed to generate invoices. Check console.' });
      } finally {
          setIsSyncing(false);
          setTimeout(() => setMessage(null), 5000);
      }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addJobType = () => {
    const newJob: JobType = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      defaultRate: 0
    };
    setProfile(prev => ({ ...prev, jobTypes: [...prev.jobTypes, newJob] }));
  };

  const removeJobType = (id: string) => {
    setProfile(prev => ({ ...prev, jobTypes: prev.jobTypes.filter(j => j.id !== id) }));
  };

  const updateJobType = (id: string, field: keyof JobType, value: any) => {
    setProfile(prev => ({
      ...prev,
      jobTypes: prev.jobTypes.map(j => j.id === id ? { ...j, [field]: value } : j)
    }));
  };

  if (isLoading) return <div className="p-8 text-center">Loading Settings...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Profile & Settings</h2>
        <button 
          onClick={() => handleSave()}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Save size={20} /> Save Changes
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
           {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Company Info */}
        <div className="lg:col-span-1 space-y-6">
           {/* Avatar Card */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
              <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center mb-4">
                    {profile.avatar ? (
                        <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <User size={64} className="text-gray-300" />
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-medium text-sm">
                      <Upload size={20} className="mr-1" /> Change
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{profile.companyName || 'Your Company'}</h3>
              <p className="text-sm text-gray-500">{profile.companyAddress || 'No address set'}</p>
              
              <div className="mt-4 flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="showLogo"
                    checked={profile.showLogoOnInvoice || false}
                    onChange={e => setProfile({...profile, showLogoOnInvoice: e.target.checked})}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="showLogo" className="text-sm text-gray-600">Show Logo on Invoices</label>
              </div>
           </div>

           {/* Company Info Form */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Briefcase size={18} /> Company Details
              </h3>
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input 
                        type="text" 
                        value={profile.companyName}
                        onChange={e => setProfile({...profile, companyName: e.target.value})}
                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="e.g. CleanSwift Services"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute top-3 left-3 text-gray-400" />
                        <input 
                            type="text" 
                            value={profile.companyAddress}
                            onChange={e => setProfile({...profile, companyAddress: e.target.value})}
                            className="w-full rounded-md border border-gray-300 pl-9 p-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="123 Business Rd..."
                        />
                      </div>
                  </div>
              </div>
           </div>
           
           {/* Data Management Section */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                   <Database size={18} /> Data Management
               </h3>
               <div className="space-y-4">
                   <button
                       onClick={handleBackfillInvoices}
                       disabled={isSyncing}
                       className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${isSyncing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-primary-200 text-primary-700 hover:bg-primary-50'}`}
                   >
                       <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                       {isSyncing ? 'Processing...' : 'Backfill Missing Invoices'}
                   </button>
                   <p className="text-xs text-gray-500 text-center px-2">
                       Scans all appointments and creates invoices for any that are missing.
                   </p>
               </div>
           </div>
        </div>

        {/* Right Column: Job Types & Rates */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Briefcase size={18} /> Job Types & Rates
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Define your services and standard hourly rates.</p>
                    </div>
                    <button 
                        onClick={addJobType}
                        className="flex items-center gap-2 text-sm bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                        <Plus size={16} /> Add Service
                    </button>
                </div>

                <div className="space-y-3">
                    {profile.jobTypes.map((job) => (
                        <div key={job.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                            <div className="flex-grow">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Service Name</label>
                                <input 
                                    type="text" 
                                    value={job.name}
                                    onChange={e => updateJobType(job.id, 'name', e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="e.g. Move-out Clean"
                                />
                            </div>
                            <div className="w-32">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Rate ($/hr)</label>
                                <div className="relative">
                                    <DollarSign size={14} className="absolute top-2 left-2 text-gray-400" />
                                    <input 
                                        type="number" 
                                        value={job.defaultRate}
                                        onChange={e => updateJobType(job.id, 'defaultRate', Number(e.target.value))}
                                        className="w-full bg-white border border-gray-300 rounded pl-6 pr-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col justify-end h-full pt-5">
                                <button 
                                    onClick={() => removeJobType(job.id)}
                                    className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                                    title="Remove Service"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {profile.jobTypes.length === 0 && (
                        <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            No job types defined. Click "Add Service" to start.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;