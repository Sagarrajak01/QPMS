import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { BookOpen, Database, FileText, CheckCircle } from 'lucide-react';

const FacultyDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/faculty/dashboard').then(res => setStats(res.data.data)).catch(console.error);
  }, []);

  if (!stats) return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          Faculty Overview
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Welcome back! Here is what's happening with your subjects.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Assigned Subjects */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-800 border-l-4 border-blue-500 rounded-xl shadow-sm p-6 flex items-center space-x-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
          <div className="p-4 rounded-full bg-blue-500 text-white shadow-inner"><BookOpen size={28} strokeWidth={1.5} /></div>
          <div>
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Assigned Subjects</p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.assignedSubjects}</p>
          </div>
        </div>
        
        {/* Card 2: Total Questions */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-800 border-l-4 border-amber-500 rounded-xl shadow-sm p-6 flex items-center space-x-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
          <div className="p-4 rounded-full bg-amber-500 text-white shadow-inner"><Database size={28} strokeWidth={1.5} /></div>
          <div>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Total Questions</p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.totalQuestions}</p>
          </div>
        </div>
        
        {/* Card 3: Draft Papers */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-800 border-l-4 border-purple-500 rounded-xl shadow-sm p-6 flex items-center space-x-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
          <div className="p-4 rounded-full bg-purple-500 text-white shadow-inner"><FileText size={28} strokeWidth={1.5} /></div>
          <div>
            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Draft Papers</p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.draftPapers}</p>
          </div>
        </div>
        
        {/* Card 4: Finalized Papers */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-gray-800 dark:to-gray-800 border-l-4 border-emerald-500 rounded-xl shadow-sm p-6 flex items-center space-x-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
          <div className="p-4 rounded-full bg-emerald-500 text-white shadow-inner"><CheckCircle size={28} strokeWidth={1.5} /></div>
          <div>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Finalized Papers</p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{stats.finalizedPapers}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboard;