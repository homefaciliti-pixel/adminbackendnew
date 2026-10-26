import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderTree,
  Users,
  IndianRupee,
  ShieldCheck,
  UserCheck,
  ShoppingBag,
  FileText,
  Settings,
  BarChart3,
  Headphones,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPartnersOpen, setIsPartnersOpen] = useState(false);
  const [isEarningsOpen, setIsEarningsOpen] = useState(false);
  const [isAmcOpen, setIsAmcOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <aside className="w-64 bg-gradient-to-r from-[#1d3d71] via-[#124085] to-[#1878ac]  text-slate-100 flex flex-col h-screen fixed left-0 top-0 shadow-xl border-r border-slate-700/50 z-20">
      {/* Brand Logo Header */}
      <div className="p-5 flex items-center space-x-3 border-b border-slate-700/50 bg-slate-800/40">
        <div className="bg-teal-500 p-2 rounded-xl text-slate-950 font-black text-xl shadow-md">
          HF
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide text-white leading-tight">HOME FACILITI</h1>
          <p className="text-[11px] text-teal-300 font-medium">Admin Dashboard</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard'
            ? 'bg-teal-600 text-white font-semibold shadow-md'
            : 'hover:bg-slate-700/50 text-slate-200'
            }`}
        >
          <LayoutDashboard size={19} />
          <span className="text-sm">Dashboard</span>
        </button>

        {/* Categories Dropdown */}
        <div>
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-700/50 text-slate-200 transition-all"
          >
            <div className="flex items-center space-x-3">
              <FolderTree size={19} />
              <span className="text-sm">Category</span>
            </div>
            {isCategoryOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>

          {isCategoryOpen && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'categories' ? 'bg-teal-600 text-white font-medium' : 'text-slate-300 hover:text-white'}`}
              >
                All Categories
              </button>
              <button
                onClick={() => setActiveTab('subcategories')}
                className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'subcategories' ? 'bg-teal-600 text-white font-medium' : 'text-slate-300 hover:text-white'}`}
              >
                Subcategories
              </button>
            </div>
          )}
        </div>

        {/* Partners Dropdown */}
        <div>
          <button
            onClick={() => setIsPartnersOpen(!isPartnersOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-700/50 text-slate-200 transition-all"
          >
            <div className="flex items-center space-x-3">
              <Users size={19} />
              <span className="text-sm">Partners</span>
            </div>
            {isPartnersOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>

          {isPartnersOpen && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <button onClick={() => setActiveTab('partners-approved')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'partners-approved' ? 'bg-teal-600 text-white font-medium' : 'text-slate-300 hover:text-white'}`}>Approved Partners</button>
              <button onClick={() => setActiveTab('partners-pending')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'partners-pending' ? 'bg-teal-600 text-white font-medium' : 'text-slate-300 hover:text-white'}`}>Pending Approval</button>
              <button onClick={() => setActiveTab('partners-active')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'partners-active' ? 'bg-teal-600 text-white font-medium' : 'text-slate-300 hover:text-white'}`}>Active Partners</button>
            </div>
          )}
        </div>

        {/* Earnings Dropdown */}
        <div>
          <button
            onClick={() => setIsEarningsOpen(!isEarningsOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-700/50 text-slate-200 transition-all"
          >
            <div className="flex items-center space-x-3">
              <IndianRupee size={19} />
              <span className="text-sm">Earnings</span>
            </div>
            {isEarningsOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>

          {isEarningsOpen && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <button onClick={() => setActiveTab('earnings-bookings')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'earnings-bookings' ? 'bg-teal-600 text-white font-medium' : 'text-slate-300 hover:text-white'}`}>Bookings</button>
              <button onClick={() => setActiveTab('earnings-subscriptions')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'earnings-subscriptions' ? 'bg-teal-600 text-white font-medium' : 'text-slate-300 hover:text-white'}`}>Subscriptions</button>
            </div>
          )}
        </div>

        {/* AMC Management Dropdown */}
        <div>
          <button
            onClick={() => setIsAmcOpen(!isAmcOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-700/50 text-slate-200 transition-all"
          >
            <div className="flex items-center space-x-3">
              <ShieldCheck size={19} />
              <span className="text-sm">AMC Management</span>
            </div>
            {isAmcOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>

          {isAmcOpen && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <button onClick={() => setActiveTab('amc-dashboard')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'amc-dashboard' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'}`}>AMC Dashboard</button>
              <button onClick={() => setActiveTab('amc-active')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'amc-active' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'}`}>Active AMC</button>
              <button onClick={() => setActiveTab('amc-expired')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'amc-expired' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'}`}>Expired AMC</button>
              <button onClick={() => setActiveTab('amc-orders')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'amc-orders' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'}`}>AMC Orders</button>
              <button onClick={() => setActiveTab('amc-visits')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'amc-visits' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'}`}>Visit History</button>
              <button onClick={() => setActiveTab('amc-payments')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'amc-payments' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'}`}>Partner Payments</button>
              <button onClick={() => setActiveTab('amc-ledger')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'amc-ledger' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'}`}>AMC Ledger</button>
              <button onClick={() => setActiveTab('amc-reports')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'amc-reports' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'}`}>AMC Reports</button>
            </div>
          )}
        </div>

        {/* Users */}
        <button onClick={() => setActiveTab('users')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-teal-600 text-white font-semibold' : 'hover:bg-slate-700/50 text-slate-200'}`}>
          <UserCheck size={19} />
          <span className="text-sm">Users</span>
        </button>

        {/* Services */}
        <button onClick={() => setActiveTab('services')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'services' ? 'bg-teal-600 text-white font-semibold' : 'hover:bg-slate-700/50 text-slate-200'}`}>
          <ShoppingBag size={19} />
          <span className="text-sm">Services</span>
        </button>

        {/* Orders */}
        <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-teal-600 text-white font-semibold' : 'hover:bg-slate-700/50 text-slate-200'}`}>
          <ShoppingBag size={19} />
          <span className="text-sm">Orders</span>
        </button>

        {/* Pages */}
        <button onClick={() => setActiveTab('pages')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'pages' ? 'bg-teal-600 text-white font-semibold' : 'hover:bg-slate-700/50 text-slate-200'}`}>
          <FileText size={19} />
          <span className="text-sm">Pages</span>
        </button>

        {/* Settings Dropdown */}
        <div>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-700/50 text-slate-200 transition-all"
          >
            <div className="flex items-center space-x-3">
              <Settings size={19} />
              <span className="text-sm">Settings</span>
            </div>
            {isSettingsOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>

          {isSettingsOpen && (
            <div className="pl-11 pr-2 py-1 space-y-1">
              <button onClick={() => setActiveTab('settings-banner')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'settings-banner' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'}`}>Banner</button>
              <button onClick={() => setActiveTab('settings-state')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'settings-state' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'}`}>State</button>
              <button onClick={() => setActiveTab('settings-city')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'settings-city' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'}`}>City</button>
              <button onClick={() => setActiveTab('settings-locality')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'settings-locality' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'}`}>Locality</button>
              <button onClick={() => setActiveTab('settings-commission')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'settings-commission' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'}`}>Commission</button>
              <button onClick={() => setActiveTab('settings-reviews')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'settings-reviews' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'}`}>Reviews & Ratings</button>
              <button onClick={() => setActiveTab('settings-notifications')} className={`w-full text-left py-2 px-3 rounded-lg text-xs ${activeTab === 'settings-notifications' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'}`}>Notifications</button>
            </div>
          )}
        </div>

        {/* Reports */}
        <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-teal-600 text-white font-semibold' : 'hover:bg-slate-700/50 text-slate-200'}`}>
          <BarChart3 size={19} />
          <span className="text-sm">Reports</span>
        </button>

        {/* Support */}
        <button onClick={() => setActiveTab('support')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'support' ? 'bg-teal-600 text-white font-semibold' : 'hover:bg-slate-700/50 text-slate-200'}`}>
          <Headphones size={19} />
          <span className="text-sm">Support</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;