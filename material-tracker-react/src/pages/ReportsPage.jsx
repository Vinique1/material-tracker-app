import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import toast from 'react-hot-toast';
import { FileDown, LoaderCircle, Eye, X } from 'lucide-react';

// A new component for the preview modal
const PreviewModal = ({ data, onClose, onDownload, isLoadingDownload }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Report Data Preview</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X /></button>
        </div>
        <div className="p-4 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">S/N</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">QTY</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((row) => (
                <tr key={row.sn}>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{row.sn}</td>
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{row.description}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{row.qty}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{row.type}</td>
                  <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{row.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-sm font-semibold bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Close</button>
          <button onClick={onDownload} disabled={isLoadingDownload} className="w-48 flex items-center justify-center gap-2 px-6 py-2 text-sm font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
            {isLoadingDownload ? <><LoaderCircle className="animate-spin h-5 w-5" /> Downloading...</> : <><FileDown size={16} /> Download XLSX</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const ReportsPage = () => {
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingDownload, setIsLoadingDownload] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handlePreview = async () => {
    setIsLoadingPreview(true);
    const toastId = toast.loading('Fetching preview data...');
    try {
      const functions = getFunctions();
      const getPreview = httpsCallable(functions, 'getReportPreviewData'); // Assumes this new function exists
      const result = await getPreview({ reportDate });
      setPreviewData(result.data.reportData);
      toast.success('Preview ready.', { id: toastId });
    } catch (error) {
      toast.error(error.message || 'Failed to get preview data.', { id: toastId });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDownload = async () => {
    setIsLoadingDownload(true);
    const toastId = toast.loading('Generating report...');
    // ... download logic from previous step ...
    setIsLoadingDownload(false);
  };
  
  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Generate Inspection Report</h1>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md">
          <div className="space-y-4">
            <div>
              <label htmlFor="report-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Report Date</label>
              <input type="date" id="report-date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="w-full h-11 px-4 rounded-md border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm" />
            </div>
            <button onClick={handlePreview} disabled={isLoadingPreview} className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg shadow-md bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
              {isLoadingPreview ? <><LoaderCircle className="animate-spin h-5 w-5" /> Loading Preview...</> : <><Eye size={16} /> Preview Report</>}
            </button>
          </div>
        </div>
      </div>
      {previewData && (
        <PreviewModal 
          data={previewData} 
          onClose={() => setPreviewData(null)}
          onDownload={handleDownload}
          isLoadingDownload={isLoadingDownload}
        />
      )}
    </>
  );
};

export default ReportsPage;