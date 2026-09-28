import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, BookOpen, Database, FileText, LogOut, Menu, X, Sun, Moon } from 'lucide-react';

const FacultyLayout = () => {
  const { user, logout } = useAuth(); 
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation(); 
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  
  const navItems = [
    { name: 'Dashboard', path: '/faculty', icon: LayoutDashboard }, 
    { name: 'My Subjects', path: '/faculty/subjects', icon: BookOpen }, 
    { name: 'Question Bank', path: '/faculty/questions', icon: Database }, 
    { name: 'Question Papers', path: '/faculty/papers', icon: FileText }
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      
      {/* Mobile Top Bar - Changed to Blue */}
      <div className="md:hidden fixed top-0 w-full bg-blue-900 dark:bg-gray-950 text-white p-4 flex justify-between items-center z-20 shadow-md">
        <h2 className="text-xl font-bold tracking-wider">QPMS Faculty</h2>
        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="p-1 rounded-full hover:bg-white/20 transition">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)}><Menu size={24} /></button>
        </div>
      </div>

      {/* Sidebar - Changed from bg-slate-800 to bg-blue-900 */}
      <aside className={`${menuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 w-64 h-full bg-blue-900 dark:bg-gray-950 text-white flex flex-col transition-transform duration-300 shadow-xl`}>
        
        {menuOpen && <button className="md:hidden absolute top-4 right-4 text-white" onClick={() => setMenuOpen(false)}><X size={24}/></button>}
        
        <div className="p-6 text-center border-b border-blue-800 dark:border-gray-800 hidden md:flex justify-between items-center">
          <div className="text-left">
            <h2 className="text-2xl font-extrabold tracking-wider text-white">QPMS</h2>
            <p className="text-xs text-blue-300 font-medium tracking-widest uppercase mt-1">Faculty Portal</p>
          </div>
          <button onClick={toggleTheme} className="p-2 hover:bg-blue-800 dark:hover:bg-gray-800 rounded-full transition-colors duration-200">
            {isDark ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} className="text-blue-200" />}
          </button>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 mt-12 md:mt-0 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (location.pathname === '/faculty/' && item.path === '/faculty');
            return (
              <Link key={item.name} to={item.path} onClick={() => setMenuOpen(false)} 
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-800 dark:bg-gray-800 text-white font-semibold shadow-inner' 
                    : 'text-blue-100 hover:bg-blue-800/50 dark:hover:bg-gray-800/50 hover:translate-x-1'
                }`}>
                <Icon size={20} className={isActive ? 'text-blue-200' : 'text-blue-300'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile Section */}
        <div className="p-4 border-t border-blue-800 dark:border-gray-800 bg-blue-950/30 dark:bg-black/20">
          <div className="mb-4 px-2">
            <p className="text-sm font-bold truncate text-white">{user?.name}</p>
            <p className="text-xs text-blue-300 truncate">{user?.department}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 py-2 bg-red-500/10 hover:bg-red-500 text-red-200 hover:text-white rounded-lg transition-all duration-200">
            <LogOut size={18} />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto mt-14 md:mt-0 p-4 md:p-8 dark:text-white">
        <Outlet />
      </main>
      
      {/* Mobile Overlay */}
      {menuOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden" onClick={() => setMenuOpen(false)}></div>}
    </div>
  );
};

export default FacultyLayout;