import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DashboardOverview from './components/dashboard/DashboardOverview';
import CategoryManagement from './components/categories/CategoryManagement';
import Subcategories from './components/subcategories/Subcategories';
import ApprovedPartners from './components/partners/ApprovedPartners';
import PendingPartners from './components/partners/PendingPartners';
import ActivePartners from './components/partners/ActivePartners';
import OrderManagement from './components/orders/OrderManagement';
import ServiceManagement from './components/services/ServiceManagment';
import UserManagement from './components/users/UserManagement';
import BookingEarnings from './components/earnings/BookingEarnings';
import SubscriptionEarnings from './components/earnings/SubscriptionEarnings';
import PageManagement from './components/pagessection/pagemanagment';
import SettingsManagement from './components/settings/SettingsManagement';
import AmcManagement from './components/amc/AmcManagement';
import ReportsManagement from './components/reports/ReportsManagment';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close the mobile navigation after a page is selected.
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [activeTab]);

  return (
    <div className="admin-shell min-h-screen bg-gray-50 flex">
      {/* Mobile backdrop */}
      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="admin-sidebar-backdrop lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Container */}
      <div className="admin-main flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar */}
        <Header onMenuClick={() => setIsMobileSidebarOpen((open) => !open)} />

        {/* Dynamic Page Content Area */}
        <main className="admin-content mt-16 p-8 flex-1 min-w-0">

          {/* 🔥 Render the live Dashboard Component here */}
          {activeTab === 'dashboard' && <DashboardOverview />}

          {/* Categories managment  */}
          {activeTab === 'categories' && <CategoryManagement />}

          {/* Subcategories Management */}
          {activeTab === 'subcategories' && <Subcategories />}

          {/* Approved Partners View */}
          {activeTab === 'partners-approved' && <ApprovedPartners />}

          {/* Pending Partners Approval View */}
          {activeTab === 'partners-pending' && <PendingPartners />}

          {/* Active Partners View */}
          {activeTab === 'partners-active' && <ActivePartners />}

          {/* All Partners View (fallback or mapped to Approved/All endpoint) */}
          {activeTab === 'partners-all' && <ApprovedPartners />}


          {activeTab === 'orders' && <OrderManagement />}

          {/* {activeTab === 'services' && <ServiceManagement />} */}

          {activeTab === 'services' && <ServiceManagement setActiveTab={setActiveTab} />}

          {activeTab === 'users' && <UserManagement />}

          {activeTab === 'earnings-bookings' && <BookingEarnings />}

          {activeTab === 'earnings-subscriptions' && <SubscriptionEarnings />}

          {activeTab === 'pages' && <PageManagement />}

          {activeTab.startsWith('settings-') && (
            <SettingsManagement currentSubTab={activeTab.replace('settings-', '')} />
          )}

          {/* AMC Management Sub-tabs handling */}
          {activeTab.startsWith('amc-') && (
            <AmcManagement activeTab={activeTab} />
          )}

          {/* System Reports Module Handling */}
          {activeTab === 'reports' && (
            <ReportsManagement />
          )}

          {/* Fallback for other tabs */}
          {
            ['earnings', 'amc', 'pages', 'settings'].includes(activeTab) && (
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-6 capitalize">{activeTab} Management</h1>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-600">Module under construction. Ready to be populated!</p>
                </div>
              </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default App;