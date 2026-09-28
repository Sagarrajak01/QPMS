import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, Plus, Printer, CheckCircle, Trash2 } from 'lucide-react';

const PaperManagement = () => {
  const [papers, setPapers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [view, setView] = useState('LIST'); // 'LIST', 'CREATE', 'PREVIEW'
  const [activePaper, setActivePaper] = useState(null);

  // Builder State
  const [paperDetails, setPaperDetails] = useState({
    title: 'Mid Semester Examination', subjectId: '', examType: 'Mid Term', semester: 1,
    academicYear: '2026-27', durationMinutes: 90, instructions: '1. Answer all questions.\n2. Figures in brackets indicate marks.', isMultipleSets: false
  });
  
  const [blueprint, setBlueprint] = useState([
    { name: 'SECTION A', type: 'MCQ', count: 10, marksPerQuestion: 1 }
  ]);

  const fetchData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([api.get('/papers'), api.get('/faculty/subjects')]);
      setPapers(pRes.data.data);
      setSubjects(sRes.data.data);
      if (sRes.data.data.length > 0) setPaperDetails(prev => ({...prev, subjectId: sRes.data.data[0]._id}));
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchData(); }, []);

  // Calculate total marks based on blueprint dynamically
  const calculatedTotalMarks = blueprint.reduce((acc, sec) => acc + (parseInt(sec.count || 0) * parseInt(sec.marksPerQuestion || 0)), 0);

  const handleAddSection = () => {
    setBlueprint([...blueprint, { name: `SECTION ${String.fromCharCode(65 + blueprint.length)}`, type: 'SUBJECTIVE', count: 5, marksPerQuestion: 5 }]);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...paperDetails, totalMarks: calculatedTotalMarks, blueprint };
      const { data } = await api.post('/papers', payload);
      alert('Paper Generated Successfully!');
      await fetchData();
      viewPaper(data.data._id);
    } catch (error) {
      alert(error.response?.data?.message || 'Error generating paper');
    }
  };

  const viewPaper = async (id) => {
    try {
      const { data } = await api.get(`/papers/${id}`);
      setActivePaper(data.data);
      setView('PREVIEW');
    } catch (error) { alert('Error loading paper'); }
  };

  const finalizePaper = async () => {
    if (!window.confirm('Are you sure? Once finalized, the draft cannot be edited.')) return;
    try {
      await api.patch(`/papers/${activePaper._id}/finalize`);
      await viewPaper(activePaper._id); // reload
      fetchData(); // refresh list
    } catch (error) { alert('Error finalizing paper'); }
  };

  const deletePaper = async (id) => {
    if (!window.confirm('Delete this paper permanently?')) return;
    try {
      await api.delete(`/papers/${id}`);
      fetchData();
    } catch (error) { alert('Error deleting paper'); }
  };

  const handlePrint = () => {
    window.print();
  };

  // --- RENDERS ---

  if (view === 'PREVIEW' && activePaper) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded shadow-sm border print:hidden">
          <button onClick={() => setView('LIST')} className="text-gray-600 hover:underline">← Back to List</button>
          <div className="flex space-x-4">
            {activePaper.status === 'DRAFT' && (
              <button onClick={finalizePaper} className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                <CheckCircle size={18} /><span>Finalize Paper</span>
              </button>
            )}
            <button onClick={handlePrint} className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-900">
              <Printer size={18} /><span>Export PDF / Print</span>
            </button>
          </div>
        </div>

        {/* The Printable Area */}
        <div id="printable-paper" className="bg-white p-8 md:p-16 shadow-lg border rounded-lg mx-auto" style={{maxWidth: '210mm', minHeight: '297mm'}}>
          {activePaper.sets.map((setObj, setIdx) => (
            <div key={setIdx} className={setIdx < activePaper.sets.length - 1 ? 'set-page-break' : ''}>
              
              {/* Header */}
              <div className="text-center border-b-2 border-black pb-6 mb-6">
                <h1 className="text-2xl font-bold uppercase tracking-widest mb-1">NATIONAL INSTITUTE OF TECHNOLOGY, TIRUCHIRAPALLI</h1>
                <h2 className="text-lg font-semibold uppercase mb-4">DEPARTMENT OF {activePaper.subjectId?.department || 'COMPUTER SCIENCE'}</h2>
                
                <h3 className="text-xl font-bold uppercase mb-1">{activePaper.subjectId?.name} ({activePaper.subjectId?.code})</h3>
                <h4 className="text-lg font-medium uppercase mb-4">{activePaper.title}</h4>
                
                <div className="flex justify-between text-md font-semibold">
                  <div className="text-left">
                    <p>Semester: {activePaper.semester}</p>
                    <p>Academic Year: {activePaper.academicYear}</p>
                  </div>
                  <div className="text-right">
                    <p>Duration: {activePaper.durationMinutes} Minutes</p>
                    <p>Max Marks: {activePaper.totalMarks}</p>
                  </div>
                </div>
                {activePaper.isMultipleSets && (
                  <div className="mt-4 inline-block px-4 py-1 border-2 border-black font-bold text-lg">
                    {setObj.setName}
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mb-8">
                <h4 className="font-bold underline mb-2">Instructions:</h4>
                <pre className="font-sans whitespace-pre-wrap">{activePaper.instructions}</pre>
              </div>

              {/* Sections & Questions */}
              {setObj.sections.map((section, secIdx) => (
                <div key={secIdx} className="mb-8">
                  <h3 className="text-center font-bold text-lg underline mb-6">{section.name}</h3>
                  
                  {section.questions.map((q, qIdx) => (
                    <div key={qIdx} className="mb-6 flex justify-between">
                      <div className="flex-1 pr-4">
                        <div className="flex">
                          <span className="font-bold mr-2">{qIdx + 1}.</span>
                          <span className="text-justify">{q.questionText}</span>
                        </div>
                        {q.type === 'MCQ' && (
                          <div className="ml-6 mt-3 grid grid-cols-2 gap-2">
                            {q.options.map(opt => (
                              <div key={opt.label}>{opt.label}. {opt.text}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="font-bold whitespace-nowrap">
                        [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === 'CREATE') {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setView('LIST')} className="mb-4 text-gray-600 hover:underline">← Cancel</button>
        <div className="bg-white p-8 shadow-sm border rounded-lg">
          <h2 className="text-2xl font-bold mb-6 border-b pb-2">Paper Generator Wizard</h2>
          
          <form onSubmit={handleGenerate}>
            {/* Step 1: Details */}
            <h3 className="text-lg font-bold mb-4 text-slate-700">1. Paper Details</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div><label className="block text-sm font-medium mb-1">Paper Title</label><input required className="w-full border p-2 rounded" value={paperDetails.title} onChange={e => setPaperDetails({...paperDetails, title: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Subject</label>
                <select required className="w-full border p-2 rounded" value={paperDetails.subjectId} onChange={e => setPaperDetails({...paperDetails, subjectId: e.target.value})}>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium mb-1">Academic Year</label><input required className="w-full border p-2 rounded" value={paperDetails.academicYear} onChange={e => setPaperDetails({...paperDetails, academicYear: e.target.value})} /></div>
              <div><label className="block text-sm font-medium mb-1">Duration (Minutes)</label><input type="number" required className="w-full border p-2 rounded" value={paperDetails.durationMinutes} onChange={e => setPaperDetails({...paperDetails, durationMinutes: e.target.value})} /></div>
              <div className="col-span-2"><label className="block text-sm font-medium mb-1">Instructions</label><textarea rows="3" className="w-full border p-2 rounded" value={paperDetails.instructions} onChange={e => setPaperDetails({...paperDetails, instructions: e.target.value})}></textarea></div>
              
              <div className="col-span-2 flex items-center mt-2 p-4 bg-blue-50 border border-blue-200 rounded">
                <input type="checkbox" id="multipleSets" className="w-5 h-5 mr-3" checked={paperDetails.isMultipleSets} onChange={e => setPaperDetails({...paperDetails, isMultipleSets: e.target.checked})} />
                <label htmlFor="multipleSets" className="font-bold text-blue-900 cursor-pointer">Generate Multiple Sets (Set A, B, C)</label>
                <p className="ml-4 text-sm text-blue-700">The system will shuffle and use different questions from the bank for each set based on your blueprint.</p>
              </div>
            </div>

            {/* Step 2: Blueprint */}
            <h3 className="text-lg font-bold mb-4 text-slate-700">2. Paper Blueprint</h3>
            <div className="space-y-4 mb-6">
              {blueprint.map((sec, idx) => (
                <div key={idx} className="flex space-x-4 items-end bg-slate-50 p-4 rounded border">
                  <div className="flex-1"><label className="block text-xs font-medium mb-1">Section Name</label><input required className="w-full border p-2 rounded" value={sec.name} onChange={e => {const b = [...blueprint]; b[idx].name = e.target.value; setBlueprint(b);}} /></div>
                  <div className="flex-1"><label className="block text-xs font-medium mb-1">Question Type</label>
                    <select className="w-full border p-2 rounded" value={sec.type} onChange={e => {const b = [...blueprint]; b[idx].type = e.target.value; setBlueprint(b);}}>
                      <option value="MCQ">MCQ</option><option value="ONE_WORD">One Word</option><option value="SUBJECTIVE">Subjective</option>
                    </select>
                  </div>
                  <div className="w-24"><label className="block text-xs font-medium mb-1">No. of Qs</label><input type="number" min="1" required className="w-full border p-2 rounded" value={sec.count} onChange={e => {const b = [...blueprint]; b[idx].count = e.target.value; setBlueprint(b);}} /></div>
                  <div className="w-24"><label className="block text-xs font-medium mb-1">Marks/Q</label><input type="number" min="1" required className="w-full border p-2 rounded" value={sec.marksPerQuestion} onChange={e => {const b = [...blueprint]; b[idx].marksPerQuestion = e.target.value; setBlueprint(b);}} /></div>
                  {blueprint.length > 1 && (
                    <button type="button" onClick={() => {const b = blueprint.filter((_, i) => i !== idx); setBlueprint(b);}} className="text-red-500 hover:text-red-700 p-2 font-bold">X</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddSection} className="text-sm font-bold text-blue-600 hover:underline">+ Add Section</button>
            </div>

            <div className="border-t pt-4 flex justify-between items-center">
              <div className="text-lg font-bold">Total Marks: <span className="text-green-600">{calculatedTotalMarks}</span></div>
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-green-700">Generate Paper</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: LIST
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Question Papers</h1>
        <button onClick={() => setView('CREATE')} className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-900">
          <Plus size={18} /><span>Create New Paper</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-gray-600">Title & Subject</th>
              <th className="p-4 font-medium text-gray-600">Marks</th>
              <th className="p-4 font-medium text-gray-600">Sets</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {papers.map(p => (
              <tr key={p._id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-bold text-gray-800">{p.title}</p>
                  <p className="text-sm text-gray-500">{p.subjectId?.name} ({p.subjectId?.code})</p>
                </td>
                <td className="p-4">{p.totalMarks}</td>
                <td className="p-4">{p.isMultipleSets ? 'A, B, C' : 'Single'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'FINALIZED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-4 flex space-x-4 items-center">
                  <button onClick={() => viewPaper(p._id)} className="text-blue-600 hover:underline">View & Export</button>
                  {p.status !== 'FINALIZED' && (
                    <button onClick={() => deletePaper(p._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                  )}
                </td>
              </tr>
            ))}
            {papers.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No question papers created yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaperManagement;