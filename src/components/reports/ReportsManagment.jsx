import React, { useState } from 'react';
import { Users, UserCheck, DollarSign, CreditCard } from 'lucide-react';
import UsersReport from './UsersReport';
import PartnersReport from './PartnersReport';
import EarningsReport from './EarningsReport';
import SubscriptionEarnings from '../earnings/SubscriptionEarnings';

const ReportsManagement = () => {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'Users Report', icon: Users, component: UsersReport },
    { id: 'partners', label: 'Partners Report', icon: UserCheck, component: PartnersReport },
    { id: 'earnings', label: 'Earnings Report', icon: DollarSign, component: EarningsReport },
    { id: 'subscriptions', label: 'Subscriptions Report', icon: CreditCard, component: SubscriptionEarnings },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || UsersReport;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header & Sub-Tab Navigation */}
      <div className="flex-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl font-bold text-slate-800">System Reports & Datasets</h1>
          <p className="text-xs text-slate-500 mt-0.5">Filter, analyze, and export platform analytics and operational records</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label.replace(' Report', '')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tab Component Render */}
      <div className="flex-1 min-h-0 flex flex-col">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default ReportsManagement;