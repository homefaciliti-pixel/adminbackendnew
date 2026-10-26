import React, { useState, useEffect } from 'react';
import AmcDashboard from './AmcDashboard';
import AmcActive from './AmcActive';
import AmcExpired from './AmcExpired';
import AmcOrders from './AmcOrders';
import AmcVisits from './AmcVisits';
import AmcPayments from './AmcPayments';
import AmcLedger from './AmcLedger.jsx';
import AmcReports from './AmcReports';

const AmcManagement = ({ activeTab }) => {
  // activeTab prop aapke sidebar se aayega ('amc-dashboard', 'amc-active', etc.)

  const renderContent = () => {
    switch (activeTab) {
      case 'amc-dashboard':
        return <AmcDashboard />;
      case 'amc-active':
        return <AmcActive />;
      case 'amc-expired':
        return <AmcExpired />;
      case 'amc-orders':
        return <AmcOrders />;
      case 'amc-visits':
        return <AmcVisits />;
      case 'amc-payments':
        return <AmcPayments />;
      case 'amc-ledger':
        return <AmcLedger />;
      case 'amc-reports':
        return <AmcReports />;
      default:
        return <AmcDashboard />;
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {renderContent()}
    </div>
  );
};

export default AmcManagement;