import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import LogForm from '../components/LogForm';
import LogTable from '../components/LogTable';
import { Download, Upload, FileDown, Plus } from 'lucide-react';

const LogPage = ({ type }) => {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  
  // NEW: State for date filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const config = {
    delivery: {
      title: "Delivery Log",
      collectionName: "delivery_logs",
      icon: <Download className="h-8 w-8 text-blue-600" />,
      formButtonText: "Add New Delivery"
    },
    issuance: {
      title: "Issuance Log",
      collectionName: "issuance_logs",
      icon: <Upload className="h-8 w-8 text-red-600" />,
      formButtonText: "Add New Issuance"
    }
  };
  const currentConfig = config[type];

  useEffect(() => {
    if (!currentUser) return;
    
    const logCollectionRef = collection(db, currentConfig.collectionName);
    
    // NEW: Dynamic query based on date filters
    let q = query(logCollectionRef, orderBy('date', 'desc'));
    if (startDate) {
        q = query(q, where('date', '>=', startDate));
    }
    if (endDate) {
        q = query(q, where('date', '<=', endDate));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsData);
    }, (error) => {
      console.error(`Error fetching ${type} logs: `, error);
      toast.error(`Failed to fetch ${type} logs.`);
    });

    return () => unsubscribe();
  }, [currentUser, currentConfig.collectionName, type, startDate, endDate]); // Re-run query on date change

  const handleOpenForm = (log = null) => {
    setEditingLog(log);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingLog(null);
    setIsFormOpen(false);
  };
  
  // NEW: Export to CSV function
  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error("No logs to export.");
      return;
    }
    const dataToExport = logs.map(log => ({
      Date: log.date,
      Material: log.materialDescription,
      Grade: log.materialGrade,
      'Bore 1': log.boreSize1,
      'Bore 2': log.boreSize2,
      Quantity: log.quantity,
      Remarks: log.remarks,
    }));
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${type}_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // NEW: Export to PDF function
  const handleExportPDF = () => {
    if (logs.length === 0) {
      toast.error("No logs to export.");
      return;
    }
    const doc = new jsPDF();
    doc.text(`${currentConfig.title} Report`, 14, 16);
    doc.setFontSize(10);
    doc.text(`Date Range: ${startDate || 'Start'} to ${endDate || 'Today'}`, 14, 22);

    const tableColumn = ["Date", "Material", "Grade", "Bore 1", "Bore 2", "Qty", "Remarks"];
    const tableRows = [];

    logs.forEach(log => {
      const logData = [
        log.date,
        log.materialDescription,
        log.materialGrade,
        log.boreSize1,
        log.boreSize2 || 'N/A',
        log.quantity,
        log.remarks || 'N/A',
      ];
      tableRows.push(logData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] },
        columnStyles: { 1: { cellWidth: 50 }, 6: { cellWidth: 50 } }
    });
    doc.save(`${type}_log_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white rounded-lg shadow">{currentConfig.icon}</div>
          <h1 className="text-3xl font-bold text-gray-800">{currentConfig.title}</h1>
        </div>
        {!currentUser.isViewer && (
            <button onClick={() => handleOpenForm()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Plus size={16}/><span>{currentConfig.formButtonText}</span>
            </button>
        )}
      </div>
      
      {/* NEW: Date Filters and Export Controls */}
      <div className="p-4 bg-white rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
            <div>
                <label htmlFor="startDate" className="text-sm font-medium text-gray-700 mr-2">From:</label>
                <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-10 px-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
                <label htmlFor="endDate" className="text-sm font-medium text-gray-700 mr-2">To:</label>
                <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-10 px-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={handleExportCSV} disabled={logs.length === 0} className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed">
                <FileDown size={16}/> Export CSV
            </button>
            <button onClick={handleExportPDF} disabled={logs.length === 0} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed">
                <FileDown size={16}/> Export PDF
            </button>
        </div>
      </div>

      <LogTable logs={logs} type={type} onEdit={handleOpenForm}/>
      {isFormOpen && <LogForm type={type} log={editingLog} onClose={handleCloseForm}/>}
    </div>
  );
};

export default LogPage;
