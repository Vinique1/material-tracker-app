import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy, where, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import LogForm from '../components/LogForm';
import LogTable from '../components/LogTable';
import Pagination from '../components/Pagination';
import { Download, Upload, FileDown, Plus, Search, X } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const LogPage = ({ type }) => {
  const { currentUser, appMetadata, ADMIN_UID } = useAuth();
  const [allLogs, setAllLogs] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]); // NEW: State for all materials
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  
  const [uniqueDates, setUniqueDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const config = useMemo(() => ({
    delivery: { title: "Delivery Log", collectionName: "delivery_logs", icon: <Download className="h-8 w-8 text-blue-600" /> },
    issuance: { title: "Issuance Log", collectionName: "issuance_logs", icon: <Upload className="h-8 w-8 text-red-600" /> }
  }), []);
  
  const currentConfig = config[type];

  // NEW: Effect to fetch master list of all materials
  useEffect(() => {
    const materialsRef = collection(db, `materials/${ADMIN_UID}/items`);
    const unsubscribe = onSnapshot(materialsRef, (snapshot) => {
      const materialsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllMaterials(materialsList);
    });
    return () => unsubscribe();
  }, [ADMIN_UID]);

  useEffect(() => {
    const logCollectionRef = collection(db, currentConfig.collectionName);
    getDocs(query(logCollectionRef)).then(snapshot => {
        setUniqueDates(Array.from(new Set(snapshot.docs.map(doc => doc.data().date))).sort((a,b) => new Date(b) - new Date(a)));
    });
  }, [currentConfig.collectionName]);

  useEffect(() => {
    if (!currentUser) return;
    const logCollectionRef = collection(db, currentConfig.collectionName);
    
    let q = query(logCollectionRef, orderBy('date', 'desc'));

    if (selectedCategory !== 'all') { q = query(q, where('category', '==', selectedCategory)); }
    if (selectedDate === 'custom' && startDate && endDate) { q = query(q, where('date', '>=', startDate), where('date', '<=', endDate)); } 
    else if (selectedDate !== 'all' && selectedDate !== 'custom') { q = query(q, where('date', '==', selectedDate)); }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCurrentPage(1);
    }, (error) => toast.error(`Failed to fetch ${type} logs.`));

    return () => unsubscribe();
  }, [currentUser, currentConfig.collectionName, type, selectedDate, startDate, endDate, selectedCategory]);

  const searchedLogs = useMemo(() => {
    return allLogs.filter(log => log.materialDescription.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allLogs, searchTerm]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return searchedLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [searchedLogs, currentPage]);

  const totalPages = Math.ceil(searchedLogs.length / ITEMS_PER_PAGE);

  const handleOpenForm = (log = null) => { setEditingLog(log); setIsFormOpen(true); };
  const handleCloseForm = () => { setEditingLog(null); setIsFormOpen(false); };
  
  const handleExport = (format) => { /* ... unchanged ... */ };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4"><div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow">{currentConfig.icon}</div><h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{currentConfig.title}</h1></div>
        {!currentUser.isViewer && (<button onClick={() => handleOpenForm()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"><Plus size={16}/><span>Add New {type}</span></button>)}
      </div>
      
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Category</label>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full h-10 px-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="all">All Categories</option>
                    {appMetadata.categories?.sort().map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Date</label>
                <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full h-10 px-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="all">All Dates</option>
                    <option value="custom">Custom Range</option>
                    {uniqueDates.map(date => <option key={date} value={date}>{date}</option>)}
                </select>
            </div>
            {selectedDate === 'custom' && (<><div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full h-10 px-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600"/></div><div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full h-10 px-2 mt-1 border rounded-md dark:bg-gray-700 dark:border-gray-600"/></div></>)}
            <div className="lg:col-start-4"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search Material</label><div className="relative mt-1"><input type="text" value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} placeholder="Search descriptions..." className="pl-10 pr-10 w-full h-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" /><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>{searchTerm && <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"><X className="h-5 w-5"/></button>}</div></div>
        </div>
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Export:</span>
            <button onClick={() => handleExport('csv')} disabled={searchedLogs.length === 0} className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50" title="Export current view to CSV"><FileDown size={16}/> CSV</button>
            <button onClick={() => handleExport('pdf')} disabled={searchedLogs.length === 0} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50" title="Export current view to PDF"><FileDown size={16}/> PDF</button>
        </div>
      </div>

      <LogTable logs={paginatedLogs} type={type} onEdit={handleOpenForm} currentPage={currentPage} itemsPerPage={ITEMS_PER_PAGE} allMaterials={allMaterials} />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      {isFormOpen && <LogForm type={type} log={editingLog} onClose={handleCloseForm} allMaterials={allMaterials} />}
    </div>
  );
};

export default LogPage;
