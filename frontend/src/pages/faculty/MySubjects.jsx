import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen } from 'lucide-react';

const MySubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await api.get('/faculty/subjects');
        setSubjects(data.data);
      } catch (error) {
        console.error('Error fetching subjects', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  if (loading) return <div>Loading subjects...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Assigned Subjects</h1>
      
      {subjects.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-lg shadow-sm border border-gray-200">
          <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900">No Subjects Assigned</h3>
          <p className="text-gray-500 mt-2">You have not been assigned to any subjects yet. Please contact the Administrator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div key={subject._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded text-sm font-semibold">{subject.code}</span>
                <span className="text-sm text-gray-500">Semester {subject.semester}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{subject.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{subject.department} Department</p>
              {subject.description && (
                <p className="text-gray-500 text-sm italic">"{subject.description}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySubjects;