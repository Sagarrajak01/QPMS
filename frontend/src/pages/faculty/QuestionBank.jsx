import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef(null);
  
  // Form State
  const [type, setType] = useState('MCQ');
  const [formData, setFormData] = useState({
    subjectId: '', questionText: '', marks: 1, difficulty: 'EASY', unit: 1,
    options: [{label: 'A', text: ''}, {label: 'B', text: ''}, {label: 'C', text: ''}, {label: 'D', text: ''}],
    correctAnswer: 'A', acceptedAnswers: ''
  });

  // Filters State (also used to determine subjectId for CSV upload)
  const [filters, setFilters] = useState({ subjectId: '', unit: '', type: '', difficulty: '', search: '' });

  const fetchData = async () => {
    try {
      const [qRes, sRes] = await Promise.all([
        api.get('/questions', { params: filters }),
        api.get('/faculty/subjects')
      ]);
      setQuestions(qRes.data.data);
      setSubjects(sRes.data.data);
      
      // Auto-select first subject for form and filters if not set
      if (sRes.data.data.length > 0) {
        if (!formData.subjectId) {
          setFormData(prev => ({ ...prev, subjectId: sRes.data.data[0]._id }));
        }
        if (!filters.subjectId && filters.subjectId !== 'ALL') {
             // Let filter default to ALL (empty string), but we need a subjectId for CSV.
             // We'll enforce CSV subject selection in the handleCSVUpload function.
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchData(); }, [filters]); // Refetch when filters change

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, type };
      await api.post('/questions', payload);
      setShowForm(false);
      setFormData({...formData, questionText: '', acceptedAnswers: ''}); // Reset some fields
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving question');
    }
  };

  const deleteQuestion = async (id) => {
    if(!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      fetchData();
    } catch (error) {
      alert('Error deleting question');
    }
  };

  // --- CSV UPLOAD LOGIC ---
  const handleCSVUpload = (e) => {
    // We must know which subject these questions belong to.
    if (!filters.subjectId) {
      alert("Please select a specific subject from the filter dropdown below before uploading a CSV.");
      e.target.value = null;
      return;
    }
    
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const payload = { subjectId: filters.subjectId, questions: results.data };
          const res = await api.post('/questions/bulk', payload);
          alert(res.data.message);
          fetchData();
        } catch (error) {
          alert('Error uploading CSV. Check your headers (type, questionText, marks, difficulty, unit, optionA, optionB, optionC, optionD, correctAnswer, acceptedAnswers).');
        }
      }
    });
    e.target.value = null; // reset file input
  };

  return (
    <div className="dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Question Bank</h1>
        <div className="flex space-x-3 w-full md:w-auto">
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleCSVUpload} />
          <button onClick={() => fileInputRef.current.click()} className="flex-1 md:flex-none flex justify-center items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700">
            <Upload size={18} /><span>Upload CSV</span>
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex-1 md:flex-none bg-slate-800 dark:bg-slate-700 text-white px-4 py-2 rounded-md">
            {showForm ? 'Cancel' : '+ Add Question'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border dark:border-gray-700 mb-6 transition-colors">
          <div className="flex space-x-4 mb-4 border-b dark:border-gray-700 pb-4">
            {['MCQ', 'ONE_WORD', 'SUBJECTIVE'].map(t => (
              <button key={t} type="button" onClick={() => setType(t)} className={`px-4 py-2 rounded ${type === t ? 'bg-slate-800 dark:bg-slate-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <select className="border dark:border-gray-600 dark:bg-gray-700 p-2 rounded" required value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.code} - {s.name}</option>)}
            </select>
            <div className="flex space-x-2">
              <input type="number" placeholder="Unit (1-5)" min="1" max="5" required className="border dark:border-gray-600 dark:bg-gray-700 p-2 rounded w-1/3" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
              <input type="number" placeholder="Marks" min="1" required className="border dark:border-gray-600 dark:bg-gray-700 p-2 rounded w-1/3" value={formData.marks} onChange={e => setFormData({...formData, marks: e.target.value})} />
              <select className="border dark:border-gray-600 dark:bg-gray-700 p-2 rounded w-1/3" value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
              </select>
            </div>
            
            <textarea placeholder="Enter Question Text..." required className="border dark:border-gray-600 dark:bg-gray-700 p-2 rounded col-span-2 h-24" value={formData.questionText} onChange={e => setFormData({...formData, questionText: e.target.value})}></textarea>

            {type === 'MCQ' && (
              <>
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  {formData.options.map((opt, idx) => (
                    <input key={opt.label} placeholder={`Option ${opt.label}`} required className="border dark:border-gray-600 dark:bg-gray-700 p-2 rounded" value={opt.text} 
                      onChange={e => {
                        const newOps = [...formData.options];
                        newOps[idx].text = e.target.value;
                        setFormData({...formData, options: newOps});
                      }} />
                  ))}
                </div>
                <div className="col-span-2">
                  <label className="mr-2 font-medium text-gray-700 dark:text-gray-300">Correct Answer:</label>
                  <select className="border dark:border-gray-600 dark:bg-gray-700 p-2 rounded" value={formData.correctAnswer} onChange={e => setFormData({...formData, correctAnswer: e.target.value})}>
                    {['A', 'B', 'C', 'D'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </>
            )}

            {type === 'ONE_WORD' && (
              <input type="text" placeholder="Accepted Answers (comma separated)" required className="border dark:border-gray-600 dark:bg-gray-700 p-2 rounded col-span-2" value={formData.acceptedAnswers} onChange={e => setFormData({...formData, acceptedAnswers: e.target.value})} />
            )}

            <button type="submit" className="col-span-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded mt-2 transition-colors">Save Question</button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700 mb-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 transition-colors">
        <input type="text" placeholder="Search questions..." className="border dark:border-gray-600 dark:bg-gray-700 p-2 rounded flex-1" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
        <select className="border dark:border-gray-600 dark:bg-gray-700 p-2 rounded" value={filters.subjectId} onChange={e => setFilters({...filters, subjectId: e.target.value})}>
          <option value="">All Subjects (Select to CSV Upload)</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <select className="border dark:border-gray-600 dark:bg-gray-700 p-2 rounded" value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
          <option value="">All Types</option><option value="MCQ">MCQ</option><option value="ONE_WORD">One Word</option><option value="SUBJECTIVE">Subjective</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-x-auto transition-colors">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Question</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Unit</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Type</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Marks</th>
              <th className="p-4 font-medium text-gray-600 dark:text-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {questions.map(q => (
              <tr key={q._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="p-4 max-w-xs md:max-w-md truncate" title={q.questionText}>{q.questionText}</td>
                <td className="p-4">Unit {q.unit}</td>
                <td className="p-4"><span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded">{q.type}</span></td>
                <td className="p-4">{q.marks}</td>
                <td className="p-4"><button onClick={() => deleteQuestion(q._id)} className="text-red-600 text-sm hover:underline">Delete</button></td>
              </tr>
            ))}
            {questions.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No questions found. Add some or upload CSV!</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuestionBank;