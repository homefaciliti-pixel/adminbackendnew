import React, { useState, useEffect } from 'react';
import { Search, Calendar, Download, RefreshCw, DollarSign } from 'lucide-react';
import API from '../../services/api';

const EarningsReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');

  const fetchReportData = async (exportType = '') => {
    try {
      setLoading(true);
      const params = {
        startDate,
        endDate,
        query: searchQuery,
        export: exportType,
      };

      const response = await API.get('/api/reports/earnings', { params });

      if (exportType) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `earnings_report_${Date.now()}.${exportType}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }

      const rawData = response.data?.data || response.data?.earnings || response.data;
      setData(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      console.error('Failed to fetch earnings report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
      {/* Filter Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search earnings report query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchReportData()}
              className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 w-60"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1 rounded-xl text-xs text-slate-600">
            <Calendar size={14} className="text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="focus:outline-none bg-transparent"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="focus:outline-none bg-transparent"
            />
          </div>

          <button
            onClick={() => fetchReportData()}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Apply</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchReportData('csv')}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1 shadow-sm cursor-pointer"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Data View */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm text-slate-400 uppercase font-bold tracking-wider">
            <tr className="border-b border-slate-100">
              <th className="py-3 px-4">Booking / Order ID</th>
              <th className="py-3 px-4">Partner Name</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Company Share</th>
              <th className="py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400">Loading earnings report dataset...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-slate-400">No earning records found for the selected range.</td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row.id || row._id || idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">#{row.bookingId || row.id || idx + 1}</td>
                  <td className="py-3 px-4">{row.partnerName || row.partner?.name || 'N/A'}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    <span className="inline-flex items-center text-slate-900">
                      <DollarSign size={12} className="text-slate-400 mr-0.5" />
                      {row.totalAmount || row.amount || '0.00'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">
                    <span className="inline-flex items-center">
                      <DollarSign size={12} className="text-emerald-500 mr-0.5" />
                      {row.payToCompany || row.companyShare || '0.00'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {row.createdAt || row.date ? new Date(row.createdAt || row.date).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EarningsReport;