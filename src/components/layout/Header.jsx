import React from 'react';
import { Search, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 bg-gradient-to-r from-[#1d3d71] via-[#124085] to-[#1878ac] text-slate-100 flex items-center px-6 fixed top-0 right-0 left-64 z-10 shadow-md border-b border-slate-700/50">
      {/* Left side spacer */}
      <div className="w-32"></div>

      {/* Centered Admin Panel Title */}
      <div className="flex-1 text-center font-bold text-lg tracking-wider text-white">
        Home Faciliti
      </div>

      {/* Right side: Search Bar & Profile */}
      <div className="flex items-center space-x-6 w-auto justify-end">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-slate-900/40 text-white placeholder-slate-300 border border-slate-600 pl-10 pr-4 py-1.5 rounded-full text-sm focus:outline-none focus:border-teal-400 w-64 shadow-inner"
          />
        </div>

        {/* Admin Profile */}
        <div className="flex items-center space-x-3 bg-slate-800/60 border border-slate-600 px-3 py-1.5    rounded-full shadow-sm">
          <div className="bg-teal-500 text-slate-950 p-1.5 rounded-full font-bold">
            <User size={15} />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-none text-white">HF Admin</p>
            <p className="text-[10px] text-teal-300 font-medium">HF Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;