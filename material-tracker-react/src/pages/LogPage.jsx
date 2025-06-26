// src/pages/LogPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/authContext';
import { db } from '../firebase';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import LogForm from '../components/LogForm';
import LogTable from '../components/LogTable';
import Pagination from '../components/Pagination';
import {
  Download,
  Upload,
  FileDown,
  Plus,
  Search,
  X,
  Printer,
} from 'lucide-react';
import { exportToMir } from '../utils/exportToMir';
import DatePickerModal from '../components/DatePickerModal'; // NEW: Import the modal

const ITEMS_PER_PAGE = 10;

const LogPage = ({ type }) => {
  const { currentUser, appMetadata, ADMIN_UID } = useAuth();
  const [allLogs, setAllLogs] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  const [uniqueDates, setUniqueDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // NEW: State to control the date picker modal
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const config = useMemo(
    () => ({
      delivery: {
        title: 'Delivery Log',
        collectionName: 'delivery_logs',
        icon: <Download className="h-8 w-8 text-blue-600" />,
      },
      issuance: {
        title: 'Issuance Log',
        collectionName: 'issuance_logs',
        icon: <Upload className="h-8 w-8 text-red-600" />,
      },
    }),
    [],
  );

  const currentConfig = config[type];

  useEffect(() => {
    const materialsRef = collection(db, `materials/${ADMIN_UID}/items`);
    const unsubscribe = onSnapshot(materialsRef, (snapshot) => {
      const materialsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllMaterials(materialsList);
    });
    return () => unsubscribe();
  }, [ADMIN_UID]);

  useEffect(() => {
    // This effect now fetches all logs and also populates the unique dates for the new modal
    if (!currentUser) return;
    const logCollectionRef = collection(db, currentConfig.collectionName);
    const q = query(logCollectionRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllLogs(logs);

        // Also extract unique dates from all logs for the picker
        const dates = logs.map((log) => {
          if (log.date?.toDate) {
            return log.date.toDate().toISOString().split('T')[0];
          }
          return null;
        });
        setUniqueDates(
          [...new Set(dates.filter(Boolean))].sort(
            (a, b) => new Date(b) - new Date(a),
          ),
        );
      },
      (error) => {
        console.error('Firestore Query Error:', error);
        toast.error(`Failed to fetch ${type} logs. Check console for details.`);
      },
    );

    return () => unsubscribe();
  }, [currentUser, currentConfig.collectionName, type]);

  const filteredLogs = useMemo(() => {
    let logsToFilter = [...allLogs];

    // Apply date range filters
    if (selectedDate === 'custom' && startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate + 'T23:59:59').getTime();
      logsToFilter = logsToFilter.filter((log) => {
        const logTime = log.date?.toDate().getTime();
        return logTime >= start && logTime <= end;
      });
    } else if (selectedDate !== 'all' && selectedDate !== 'custom') {
      logsToFilter = logsToFilter.filter((log) => {
        const logDateStr = log.date?.toDate().toISOString().split('T')[0];
        return logDateStr === selectedDate;
      });
    }

    // Apply category and supplier filters
    logsToFilter = logsToFilter.filter((log) => {
      const categoryMatch =
        selectedCategory === 'all' ||
        (log.category || '').toLowerCase().trim() ===
          selectedCategory.toLowerCase().trim();
      const supplierMatch =
        selectedSupplier === 'all' ||
        (log.supplier || '').toLowerCase().trim() ===
          selectedSupplier.toLowerCase().trim();
      return categoryMatch && supplierMatch;
    });

    return logsToFilter;
  }, [allLogs, selectedCategory, selectedSupplier, selectedDate, startDate, endDate]);

  const searchedLogs = useMemo(() => {
    if (!searchTerm) return filteredLogs;
    const searchKeywords = searchTerm
      .toLowerCase()
      .split(' ')
      .filter((kw) => kw.trim() !== '');
    return filteredLogs.filter((log) => {
      const descriptionText = (log.materialDescription || '').toLowerCase();
      return searchKeywords.every((kw) => descriptionText.includes(kw));
    });
  }, [filteredLogs, searchTerm]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return searchedLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [searchedLogs, currentPage]);

  const totalPages = Math.ceil(searchedLogs.length / ITEMS_PER_PAGE);

  const handleOpenForm = (log = null) => {
    setEditingLog(log);
    setIsFormOpen(true);
  };
  const handleCloseForm = () => {
    setEditingLog(null);
    setIsFormOpen(false);
  };

  const handleExport = (format) => {
    if (searchedLogs.length === 0) {
      toast.error('No logs to export.');
      return;
    }
    const dataToExport = searchedLogs.map((log) => {
      const date = log.date?.toDate
        ? log.date.toDate().toLocaleDateString()
        : log.date;
      return {
        Date: date,
        Material: log.materialDescription,
        Supplier: log.supplier || 'N/A',
        Grade: log.materialGrade,
        'Bore 1': log.boreSize1,
        'Bore 2': log.boreSize2 || 'N/A',
        Quantity: log.quantity,
        Remarks: log.remarks || 'N/A',
      };
    });
    const filename = `${type}_log_${new Date().toISOString().split('T')[0]}`;
    if (format === 'csv') {
      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text(`${currentConfig.title} Report`, 14, 16);
      doc.autoTable({
        head: [Object.keys(dataToExport[0])],
        body: dataToExport.map((row) => Object.values(row)),
        startY: 25,
        styles: { fontSize: 8 },
      });
      doc.save(`${filename}.pdf`);
    }
  };
  
  // NEW: This function handles the export after a date is selected from the modal
  const handleExportByDate = (date) => {
    setIsDatePickerOpen(false); // Close the modal

    if (!date) {
      toast.error('No date was selected.');
      return;
    }

    // Filter all logs to get only the ones for the selected date
    const logsForDate = allLogs.filter((log) => {
      const logDate = log.date?.toDate
        ? log.date.toDate().toISOString().split('T')[0]
        : null;
      return logDate === date;
    });

    if (logsForDate.length === 0) {
      toast.error(`No delivery logs found for ${date}.`);
      return;
    }
    
    // Prepare details for the report header
    const reportDetails = {
      sheetNo: 1,
      date: date,
      docNo: `SITSL/GBARAN/25/QMS/MIR/001`,
      receivedBy: {
          name: 'VICTOR IKEH',
          position: 'QAQC ENGINEER'
      }
    };
    
    toast.success(`Exporting ${logsForDate.length} logs for ${date}...`);
    exportToMir(logsForDate, reportDetails);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow">
            {currentConfig.icon}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            {currentConfig.title}
          </h1>
        </div>
        {!currentUser.isViewer && (
          <button
            onClick={() => handleOpenForm()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add New {type}</span>
          </button>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-2 mt-1 border border-gray-300 rounded-md shadow-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Categories</option>
              {appMetadata.categories?.sort().map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Supplier
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full h-10 px-2 mt-1 border border-gray-300 rounded-md shadow-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Suppliers</option>
              {appMetadata.suppliers?.sort().map((sup) => (
                <option key={sup} value={sup}>
                  {sup}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-10 px-2 mt-1 border border-gray-300 rounded-md shadow-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Dates</option>
              <option value="custom">Custom Range</option>
              {uniqueDates.map((date, index) => (
                <option key={`${date}-${index}`} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>
          {selectedDate === 'custom' && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 px-2 mt-1 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-10 px-2 mt-1 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </>
          )}
          <div className="lg:col-start-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Search Material
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search descriptions..."
                className="pl-10 pr-10 w-full h-10 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Export:
          </span>
          <button
            onClick={() => handleExport('csv')}
            disabled={searchedLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50"
            title="Export current view to CSV"
          >
            <FileDown size={16} /> CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={searchedLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50"
            title="Export current view to PDF"
          >
            <FileDown size={16} /> PDF
          </button>
          {/* MODIFIED: The MIR button now opens the modal */}
          {type === 'delivery' && (
            <button
              onClick={() => setIsDatePickerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
              title="Export MIR for a Specific Date"
            >
              <Printer size={16} /> MIR
            </button>
          )}
        </div>
      </div>

      <LogTable
        logs={paginatedLogs}
        type={type}
        onEdit={handleOpenForm}
        currentPage={currentPage}
        itemsPerPage={ITEMS_PER_PAGE}
        allMaterials={allMaterials}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      {isFormOpen && (
        <LogForm
          type={type}
          log={editingLog}
          onClose={handleCloseForm}
          allMaterials={allMaterials}
        />
      )}
      
      {/* NEW: Render the modal conditionally at the end of the component */}
      {isDatePickerOpen && (
        <DatePickerModal
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          onExport={handleExportByDate}
          availableDates={uniqueDates}
        />
      )}
    </div>
  );
};

export default LogPage;