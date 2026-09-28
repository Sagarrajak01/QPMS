import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, BookOpen, FileQuestion, Files } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalFaculty: 0, totalSubjects: 0, totalQuestions: 0, totalQuestionPapers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(res => setStats(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: 'Total Faculty', value: stats.totalFaculty, icon: Users, color: 'bg-blue-500' },
    { title: 'Total Subjects', value: stats.totalSubjects, icon: BookOpen, color: 'bg-emerald-500' },
    { title: 'Total Questions', value: stats.totalQuestions, icon: FileQuestion, color: 'bg-amber-500' },
    { title: 'Question Papers', value: stats.totalQuestionPapers, icon: Files, color: 'bg-purple-500' },
  ];

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            /* FIX: Added dark:bg-gray-800 and dark:border-gray-700 */
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center space-x-4 transition-colors">
              <div className={`p-4 rounded-full text-white ${card.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;