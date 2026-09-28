import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';

const ManageFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', employeeId: '', department: '', phone: '' });
  const fileInputRef = useRef(null);

  const fetchFaculty = async () => { const { data } = await api.get('/admin/faculty'); setFacultyList(data.data); };
  useEffect(() => { fetchFaculty(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/admin/faculty', formData); setShowForm(false); setFormData({ name: '', email: '', password: '', employeeId: '', department: '', phone: '' }); fetchFaculty(); } 
    catch (error) { alert(error.response?.data?.message || 'Error adding faculty'); }
  };

  const deleteFaculty = async (id) => {
    if (!window.confirm('Delete permanently?')) return;
    try { await api.delete(`/admin/faculty/${id}`); fetchFaculty(); } catch (error) { alert('Failed to delete'); }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await api.post('/admin/faculty/bulk', { facultyList: results.data });
          alert(res.data.message); fetchFaculty();
        } catch (error) { alert('Error. Ensure headers are: name, email, password, employeeId, department, phone'); }
      }
    });
    e.target.value = null; 
  };

  return (
    <div className="dark:text-white transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Manage Faculty</h1>
        <div className="flex space-x-3 w-full md:w-auto">
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleCSVUpload} />
          <button onClick={() => fileInputRef.current.click()} className="flex-1 md:flex-none flex justify-center items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
            <Upload size={18} /><span>Upload CSV</span>
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex-1 md:flex-none bg-institutionalBlue dark:bg-blue-600 text-white px-4 py-2 rounded-md">
            {showForm ? 'Cancel' : '+ Add Faculty'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 mb-6 transition-colors">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required type="text" placeholder="Full Name" className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input required type="email" placeholder="Email" className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input required type="password" placeholder="Temporary Password" className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            <input required type="text" placeholder="Employee ID" className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded" value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} />
            <input required type="text" placeholder="Department" className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 rounded" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
            <button type="submit" className="col-span-1 md:col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors">Save Faculty</button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-x-auto transition-colors">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">ID</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Name</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Department</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {facultyList.map(f => (
              <tr key={f._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="p-4 text-gray-800 dark:text-gray-200">{f.employeeId}</td>
                <td className="p-4"><p className="font-medium text-gray-800 dark:text-gray-100">{f.name}</p><p className="text-sm text-gray-500 dark:text-gray-400">{f.email}</p></td>
                <td className="p-4 text-gray-800 dark:text-gray-200">{f.department}</td>
                <td className="p-4"><button onClick={() => deleteFaculty(f._id)} className="text-sm text-red-600 hover:underline">Delete</button></td>
              </tr>
            ))}
            {facultyList.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-gray-500 dark:text-gray-400">No faculty found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ManageFaculty;