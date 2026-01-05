"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  Plane, 
  Search, 
  Plus, 
  MessageSquare, 
  ShieldCheck, 
  User, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Weight, 
  Star,
  Award,
  LogOut,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Linkedin,
  Facebook,
  Instagram,
  Phone,
  X,
  Users,
  Heart,
  Settings,
  Shield,
  HelpCircle,
  Mail,
  Camera,
  Trash2,
  Lock,
  Clock,
  Circle,
  ExternalLink,
  ChevronDown,
  UserCircle
} from 'lucide-react';

// --- Types & Mock Data ---
const CATEGORIES = ["Documents", "Electronics", "Clothing", "Food", "Gifts", "Other"];

const getRelativeDate = (hoursToAdd) => {
  const d = new Date();
  d.setHours(d.getHours() + hoursToAdd);
  return d.toISOString();
};

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'travel', title: 'New Trip Match!', message: 'A traveller is going from New Delhi to London on your requested date.', time: '2 mins ago', unread: true },
  { id: 2, type: 'social', title: 'LinkedIn Verified', message: 'Your social profile has been successfully linked and verified.', time: '1 hour ago', unread: true }
];

const INITIAL_TRIPS = [
  { id: 1, user: { name: "Ketan Saxena", level: 4, rating: 4.8, tripsCompleted: 12, isVerified: true, socials: ['linkedin', 'instagram'] }, from: "New Delhi", to: "London", departureTime: getRelativeDate(2), capacity: 5, remaining: 3.5, categories: ["Documents", "Electronics"], isCompanion: true, flightNumber: "AI101" },
  { id: 2, user: { name: "Priyesha Yadav", level: 5, rating: 4.9, tripsCompleted: 24, isVerified: true, socials: ['linkedin', 'facebook', 'instagram'] }, from: "Mumbai", to: "New York", departureTime: getRelativeDate(10), capacity: 10, remaining: 8.0, categories: ["Clothing", "Gifts"], isCompanion: false, flightNumber: "EK202" },
  { id: 3, user: { name: "Rahul Mehta", level: 3, rating: 4.5, tripsCompleted: 5, isVerified: true, socials: ['facebook'] }, from: "Dubai", to: "Paris", departureTime: getRelativeDate(55), capacity: 15, remaining: 12.0, categories: ["Food", "Gifts"], isCompanion: false }
];

// --- Utilities ---
const getDepartureLabel = (isoDate) => {
  const now = new Date();
  const dep = new Date(isoDate);
  const diffMs = dep - now;
  if (diffMs < 0) return { text: "Departed", color: "text-gray-400" };
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHrs / 24);
  const remainingHrs = diffHrs % 24;
  let text = diffDays > 0 ? `Leaving in ${diffDays} day${diffDays > 1 ? 's' : ''}${remainingHrs > 0 ? `, ${remainingHrs} hours` : ''}` : `Leaving in ${diffHrs} hour${diffHrs !== 1 ? 's' : ''}`;
  if (diffHrs < 3) return { text, color: "text-red-800 font-bold" };
  if (diffHrs < 12) return { text, color: "text-red-500 font-bold" };
  return { text, color: "text-amber-600 font-bold" };
};

// --- Shared UI Components ---
const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    purple: "bg-purple-100 text-purple-700",
    rose: "bg-rose-100 text-rose-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[color]}`}>{children}</span>;
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 ${className}`}>{children}</div>
);

// --- Modals & Overlays ---

const ContactSupportModal = ({ isOpen, onClose }) => {
  const [sent, setSent] = useState(false);
  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Contact Support</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
        </div>
        {sent ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 size={32}/></div>
            <p className="font-bold text-gray-900">Request Sent!</p>
            <p className="text-sm text-gray-500">We'll get back to you at support@getmystuff.co</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <input required placeholder="Request Title" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500" />
            <input placeholder="Trip ID (Optional)" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500" />
            <textarea required placeholder="Description of your issue..." rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all">Send Support Request</button>
          </form>
        )}
      </div>
    </div>
  );
};

const UserSidebar = ({ isOpen, onClose, userProfile, setUserProfile, onOpenSupport }) => {
  const [editMode, setEditMode] = useState(false);
  if (!isOpen) return null;

  const toggleSocial = (key) => {
    setUserProfile(prev => ({
      ...prev,
      socials: { ...prev.socials, [key]: !prev.socials[key] }
    }));
  };

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">My Account</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
        </div>

        <div className="p-6 space-y-8">
          {/* Group 1: Profile */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profile Details</h3>
              <button onClick={() => setEditMode(!editMode)} className="text-xs font-bold text-indigo-600 hover:underline">{editMode ? 'Save' : 'Edit'}</button>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl overflow-hidden">
                  {userProfile.firstName[0]}{userProfile.lastName[0]}
                </div>
                <button className="absolute -bottom-1 -right-1 p-1.5 bg-white border border-gray-100 shadow-md rounded-lg text-gray-600 hover:text-indigo-600"><Camera size={14}/></button>
              </div>
              <div className="flex-1">
                {editMode ? (
                  <div className="space-y-2">
                    <input className="w-full text-sm p-1 border-b outline-none focus:border-indigo-500" value={userProfile.firstName} onChange={e => setUserProfile({...userProfile, firstName: e.target.value})} />
                    <input className="w-full text-sm p-1 border-b outline-none focus:border-indigo-500" value={userProfile.lastName} onChange={e => setUserProfile({...userProfile, lastName: e.target.value})} />
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-lg">{userProfile.firstName} {userProfile.lastName}</p>
                    <p className="text-xs text-gray-500">Member since Dec 2025</p>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin size={16} className="text-gray-400" />
                <span>Current: <strong>Dubai, UAE</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Plane size={16} className="text-gray-400" />
                <span>Frequent: <strong>London, Delhi, NYC</strong></span>
              </div>
            </div>
          </section>

          {/* Group 2: Socials */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">My Socials</h3>
            <div className="space-y-2">
              {[
                { id: 'linkedin', icon: <Linkedin size={18}/>, label: 'LinkedIn', color: 'text-blue-600' },
                { id: 'facebook', icon: <Facebook size={18}/>, label: 'Facebook', color: 'text-blue-800' },
                { id: 'instagram', icon: <Instagram size={18}/>, label: 'Instagram', color: 'text-pink-600' }
              ].map(social => (
                <div key={social.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className={`flex items-center gap-3 font-medium ${social.color}`}>
                    {social.icon}
                    <span className="text-sm text-gray-700">{social.label}</span>
                  </div>
                  <button 
                    onClick={() => toggleSocial(social.id)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${userProfile.socials[social.id] ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${userProfile.socials[social.id] ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Group 3: Account Mgmt */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Management</h3>
            <div className="grid grid-cols-1 gap-2">
              <button className="flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3"><Mail size={16} className="text-gray-400"/> Update Email</div>
                <ChevronRight size={14}/>
              </button>
              <button className="flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3"><Lock size={16} className="text-gray-400"/> Update Password</div>
                <ChevronRight size={14}/>
              </button>
              <button className="flex items-center justify-between p-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3"><Trash2 size={16}/> Deactivate Account</div>
              </button>
            </div>
          </section>

          {/* Group 4: Support */}
          <section className="space-y-4 pb-10">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Support</h3>
            <div className="grid grid-cols-1 gap-2">
              <a href="#" className="flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3"><HelpCircle size={16} className="text-gray-400"/> FAQ & Blog</div>
                <ExternalLink size={14} className="text-gray-300"/>
              </a>
              <button 
                onClick={onOpenSupport}
                className="flex items-center justify-between p-3 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3"><MessageSquare size={16}/> Contact Support</div>
                <ChevronRight size={14}/>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const AddTripModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ from: '', to: '', date: '', time: '12:00', capacity: '', categories: [], isCompanion: false, flightNumber: '' });
  const [error, setError] = useState("");
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.flightNumber && !/^[A-Z]{2,3}\d{1,4}$/.test(formData.flightNumber.toUpperCase())) {
      setError("Please enter a valid flight number (e.g., EK202)");
      return;
    }
    const departureTime = new Date(`${formData.date}T${formData.time}`).toISOString();
    onAdd({ ...formData, departureTime, id: Date.now(), remaining: formData.capacity, user: { name: "Ketan Saxena", level: 4, rating: 5.0, tripsCompleted: 12, isVerified: true, socials: ['linkedin', 'instagram'] } });
    setFormData({ from: '', to: '', date: '', time: '12:00', capacity: '', categories: [], isCompanion: false, flightNumber: '' });
    setError(""); onClose();
  };
  const toggleCategory = (cat) => { setFormData(prev => ({ ...prev, categories: prev.categories.includes(cat) ? prev.categories.filter(c => c !== cat) : [...prev.categories, cat] })); };
  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center"><h2 className="text-xl font-bold text-gray-900">Post a Trip</h2><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={20}/></button></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">From City</label><input required value={formData.from} onChange={e => setFormData({...formData, from: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none" placeholder="e.g. Dubai" /></div>
            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">To City</label><input required value={formData.to} onChange={e => setFormData({...formData, to: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none" placeholder="e.g. Paris" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Flight Date</label><input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none" /></div>
            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Flight Time</label><input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Flight Number (Opt.)</label><input value={formData.flightNumber} onChange={e => {setFormData({...formData, flightNumber: e.target.value}); setError("");}} className={`w-full bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-200'} rounded-xl p-3 outline-none`} placeholder="e.g. EK202" /></div>
            <div className="space-y-1"><label className="text-xs font-bold text-gray-500 uppercase">Space (kg)</label><input required type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none" placeholder="0" /></div>
          </div>
          {error && <p className="text-red-500 text-[10px] font-bold uppercase">{error}</p>}
          <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Categories I Can Carry</label><div className="flex flex-wrap gap-2">{CATEGORIES.map(cat => (<button key={cat} type="button" onClick={() => toggleCategory(cat)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${formData.categories.includes(cat) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>{cat}</button>))}</div></div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all">Post This Trip</button>
        </form>
      </div>
    </div>
  );
};

// --- View Components ---

const SenderView = ({ trips }) => (
  <div className="max-w-5xl mx-auto p-6 space-y-8">
    <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
      <h2 className="text-3xl font-bold mb-2 tracking-tight">Find a Traveller</h2>
      <p className="text-indigo-100 mb-8 max-w-lg">Connect with verified community members headed your way to deliver your items safely.</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
        <div className="relative"><MapPin className="absolute left-3 top-3 text-white/60" size={18} /><input placeholder="From City" className="w-full bg-white/20 border-none rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/60 outline-none focus:bg-white/30 transition-all" /></div>
        <div className="relative"><Plane className="absolute left-3 top-3 text-white/60" size={18} /><input placeholder="To City" className="w-full bg-white/20 border-none rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/60 outline-none focus:bg-white/30 transition-all" /></div>
        <div className="relative"><Package className="absolute left-3 top-3 text-white/60" size={18} /><select className="w-full bg-white/20 border-none rounded-xl py-2.5 pl-10 pr-4 text-white outline-none appearance-none cursor-pointer focus:bg-white/30 transition-all"><option className="text-gray-900">All Categories</option>{CATEGORIES.map(c => <option key={c} className="text-gray-900">{c}</option>)}</select></div>
        <button className="bg-white text-indigo-600 font-bold rounded-xl py-2.5 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10"><Search size={18} /> Search</button>
      </div>
    </section>

    <div className="grid gap-4">
      {trips.map(trip => {
        const departure = getDepartureLabel(trip.departureTime);
        return (
          <Card key={trip.id} className="flex flex-col md:flex-row gap-6 items-center group">
            <div className="flex gap-4 min-w-[220px]">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 overflow-hidden flex items-center justify-center font-bold text-indigo-400 text-xl border border-indigo-100 shadow-inner">
                {trip.user.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                  {trip.user.name}
                  {trip.user.isVerified && <ShieldCheck size={14} className="text-blue-500 fill-blue-50" />}
                </h4>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-1.5">
                  <Star size={12} fill="currentColor" />{trip.user.rating} 
                  <span className="text-gray-400 font-normal">({trip.user.tripsCompleted} trips)</span>
                </div>
                
                <div className="space-y-1.5">
                  <Badge color="purple">Level {trip.user.level}</Badge>
                  {/* Social Verification Indicators */}
                  <div className="flex items-center gap-1.5 px-0.5">
                    {trip.user.socials?.includes('linkedin') && (
                      <div className="bg-blue-50 text-blue-600 p-1 rounded border border-blue-100" title="LinkedIn Verified">
                        <Linkedin size={10} fill="currentColor" />
                      </div>
                    )}
                    {trip.user.socials?.includes('facebook') && (
                      <div className="bg-blue-50 text-blue-800 p-1 rounded border border-blue-100" title="Facebook Verified">
                        <Facebook size={10} fill="currentColor" />
                      </div>
                    )}
                    {trip.user.socials?.includes('instagram') && (
                      <div className="bg-pink-50 text-pink-600 p-1 rounded border border-pink-100" title="Instagram Verified">
                        <Instagram size={10} fill="currentColor" />
                      </div>
                    )}
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter ml-0.5">Verified</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 px-6 border-l border-r border-gray-100">
              <div className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${departure.color}`}>
                <Clock size={12} /> {departure.text}
              </div>
              <div className="text-xl font-bold flex items-center gap-3">
                <span className="text-gray-900">{trip.from}</span> 
                <div className="flex flex-col items-center">
                  <Plane size={14} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  <div className="w-8 h-[2px] bg-indigo-100 rounded-full"></div>
                </div>
                <span className="text-gray-900">{trip.to}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex gap-1">
                  {trip.categories.map(c => <span key={c} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md font-bold border border-gray-100">{c}</span>)}
                </div>
                {trip.flightNumber && (
                  <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    <Plane size={10} /> {trip.flightNumber}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center min-w-[120px] p-2">
              <div className="text-xs font-bold text-gray-400 uppercase mb-1">Available Space</div>
              <div className="text-3xl font-black text-indigo-600 tracking-tighter">{trip.remaining}kg</div>
              <button className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl mt-3 w-full hover:bg-indigo-700 hover:scale-[1.02] transition-all shadow-md shadow-indigo-100">Contact</button>
            </div>
          </Card>
        );
      })}
    </div>
  </div>
);

// --- Navbar & Notification Center ---

const NotificationCenter = ({ notifications, onMarkRead, onClearAll }) => {
  const unreadCount = notifications.filter(n => n.unread).length;
  return (
    <div className="absolute top-12 right-0 w-[350px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">Notifications {unreadCount > 0 && <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount} New</span>}</h3>
        <button onClick={onClearAll} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Mark all read</button>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length > 0 ? notifications.map(n => (
          <div key={n.id} onClick={() => onMarkRead(n.id)} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer relative ${n.unread ? 'bg-indigo-50/30' : ''}`}>
            {n.unread && <Circle size={8} className="absolute right-4 top-4 fill-indigo-600 text-indigo-600" />}
            <div className="flex gap-3">
              <div className={`p-2 rounded-xl h-fit ${n.type === 'travel' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}><Plane size={16} /></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 leading-tight mb-0.5">{n.title}</p>
                <p className="text-xs text-gray-500 leading-normal">{n.message}</p>
                <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-gray-400 uppercase tracking-wider"><Clock size={10} /> {n.time}</div>
              </div>
            </div>
          </div>
        )) : <div className="p-10 text-center"><Bell size={32} className="mx-auto text-gray-200 mb-3" /><p className="text-sm text-gray-400 font-medium">All caught up!</p></div>}
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [activeMode, setActiveMode] = useState('sender'); 
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [userProfile, setUserProfile] = useState({ 
    firstName: "Ketan", 
    lastName: "Saxena",
    socials: { linkedin: true, facebook: false, instagram: true }
  });

  const bellRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      <AddTripModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={(t) => setTrips([t, ...trips])} />
      <UserSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        userProfile={userProfile} 
        setUserProfile={setUserProfile} 
        onOpenSupport={() => { setIsSidebarOpen(false); setIsSupportModalOpen(true); }}
      />
      <ContactSupportModal isOpen={isSupportModalOpen} onClose={() => setIsSupportModalOpen(false)} />

      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200"><Package size={24} /></div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">GetMyStuff</h1>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
          <button onClick={() => setActiveMode('sender')} className={`px-5 py-1.5 rounded-xl text-sm font-bold transition-all ${activeMode === 'sender' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-gray-100' : 'text-gray-500 hover:text-gray-700'}`}>Send Stuff</button>
          <button onClick={() => setActiveMode('travel')} className={`px-5 py-1.5 rounded-xl text-sm font-bold transition-all ${activeMode === 'travel' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-gray-100' : 'text-gray-500 hover:text-gray-700'}`}>Travel</button>
        </div>

        <div className="flex items-center gap-4 relative">
          <div className="relative" ref={bellRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2.5 rounded-full relative transition-colors ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:bg-gray-50'}`}>
              <Bell size={20} />
              {notifications.some(n => n.unread) && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
            </button>
            {showNotifications && (
              <NotificationCenter 
                notifications={notifications} 
                onMarkRead={(id) => setNotifications(notifications.map(n => n.id === id ? {...n, unread: false} : n))} 
                onClearAll={() => setNotifications(notifications.map(n => ({...n, unread: false})))} 
              />
            )}
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm border-2 border-indigo-100 hover:ring-4 hover:ring-indigo-100 hover:scale-105 transition-all shadow-lg shadow-indigo-100"
          >
            {userProfile.firstName[0]}{userProfile.lastName[0]}
          </button>
        </div>
      </nav>
      
      <main className="animate-in fade-in slide-in-from-bottom-2 duration-700">
        {activeMode === 'sender' ? (
          <SenderView trips={trips} />
        ) : (
          <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Community Dashboard</h2>
                <p className="text-gray-500 font-medium">Earn credit by helping others while you travel.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 text-white font-bold px-7 py-3.5 rounded-2xl flex items-center gap-2 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-200"><Plus size={20} strokeWidth={3} /> Post a Trip</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 relative overflow-hidden group">
                <Award size={80} className="absolute -right-4 -bottom-4 text-indigo-200/50 group-hover:scale-110 transition-transform" />
                <div className="relative z-10">
                  <Award size={24} className="text-indigo-600 mb-2"/>
                  <div className="text-2xl font-black text-gray-900">Level 4</div>
                  <p className="text-sm text-indigo-700 font-bold uppercase tracking-wider mt-1 opacity-70">Gold Contributor</p>
                </div>
              </Card>
              <Card className="hover:border-amber-200 transition-colors">
                <Heart size={24} className="text-amber-500 mb-2"/>
                <div className="text-2xl font-black text-gray-900">8 People Helped</div>
                <p className="text-sm text-gray-400 font-medium mt-1">Saves community members ~$240 in shipping</p>
              </Card>
              <Card className="hover:border-green-200 transition-colors">
                <Users size={24} className="text-green-500 mb-2"/>
                <div className="text-2xl font-black text-gray-900">42 Connections</div>
                <p className="text-sm text-gray-400 font-medium mt-1">Linked network reach: 4.2k people</p>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Your Active Itinerary</h3>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Refresh Status</span>
              </div>
              {trips.filter(t => t.user.name.includes("Ketan")).length > 0 ? (
                trips.filter(t => t.user.name.includes("Ketan")).map(trip => (
                  <Card key={trip.id} className="border-l-4 border-l-indigo-600 flex justify-between items-center group">
                    <div>
                      <div className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        {trip.from} <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-400 transition-colors" /> {trip.to}
                      </div>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar size={12} /> {new Date(trip.departureTime).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-indigo-600 font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Weight size={12} /> {trip.remaining}kg Remaining
                        </div>
                      </div>
                    </div>
                    <Badge color="green">Accepting Requests</Badge>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300"><Plane size={32} /></div>
                  <p className="text-gray-400 font-bold">No active trips posted.</p>
                  <button onClick={() => setIsAddModalOpen(true)} className="text-indigo-600 font-bold mt-2 text-sm hover:underline">Start your first journey</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}