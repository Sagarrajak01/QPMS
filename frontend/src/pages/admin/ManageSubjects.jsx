import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ code: '', name: '', department: '', semester: 1, description: '', assignedFaculty: [] });

  const fetchData = async () => {
    try {
      const [sRes, fRes] = await Promise.all([api.get('/admin/subjects'), api.get('/admin/faculty')]);
      setSubjects(sRes.data.data);
      setFaculty(fRes.data.data);
    } catch (error) { console.error(error); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/subjects', formData);
      setShowForm(false);
      setFormData({ code: '', name: '', department: '', semester: 1, description: '', assignedFaculty: [] });
      fetchData();
    } catch (error) { alert(error.response?.data?.message || 'Error adding subject'); }
  };

  const deleteSubject = async (id) => {
    if (!window.confirm('Delete this subject permanently?')) return;
    try { await api.delete(`/admin/subjects/${id}`); fetchData(); }
    catch (error) { alert('Error deleting subject'); }
  };

  return (
    <div className="dark:text-white transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Manage Subjects</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-institutionalBlue dark:bg-blue-600 text-white px-4 py-2 rounded-md">
          {showForm ? 'Cancel' : '+ Add Subject'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 mb-6 transition-colors">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required type="text" placeholder="Subject Code (e.g., CS101)" className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
            <input required type="text" placeholder="Subject Name" className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input required type="text" placeholder="Department" className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
            <input required type="number" placeholder="Semester" min="1" max="8" className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} />
            <textarea placeholder="Description" className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded md:col-span-2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Assign Faculty (Hold Ctrl/Cmd to select multiple)</label>
              <select multiple className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded h-32" value={formData.assignedFaculty} onChange={e => setFormData({...formData, assignedFaculty: Array.from(e.target.selectedOptions, option => option.value)})}>
                {faculty.map(f => <option key={f._id} value={f._id}>{f.name} ({f.department})</option>)}
              </select>
            </div>
            <button type="submit" className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded mt-2 transition-colors">Save Subject</button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-x-auto transition-colors">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Code & Name</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Dept & Sem</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Assigned Faculty</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(sub => (
              <tr key={sub._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="p-4"><p className="font-bold text-gray-800 dark:text-gray-100">{sub.code}</p><p className="text-sm text-gray-500 dark:text-gray-400">{sub.name}</p></td>
                <td className="p-4"><p>{sub.department}</p><p className="text-sm text-gray-500 dark:text-gray-400">Semester {sub.semester}</p></td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {sub.assignedFaculty.map(f => (
                      <span key={f._id} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded">{f.name}</span>
                    ))}
                    {sub.assignedFaculty.length === 0 && <span className="text-gray-400 text-xs italic">Unassigned</span>}
                  </div>
                </td>
                <td className="p-4"><button onClick={() => deleteSubject(sub._id)} className="text-sm text-red-600 hover:underline">Delete</button></td>
              </tr>
            ))}
            {subjects.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-gray-500 dark:text-gray-400">No subjects found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageSubjects;