// src/components/LogTable.jsx
import React, { useMemo } from 'react';
import { useAuth } from '../context/authContext';
import { db } from '../firebase';
import { doc, runTransaction } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Edit, Trash2 } from 'lucide-react';

const LogTable = ({ logs, type, onEdit, currentPage, itemsPerPage, allMaterials }) => {
  const { currentUser, ADMIN_UID } = useAuth();

  const materialsMap = useMemo(() => {
    return new Map(allMaterials.map(m => [m.id, m]));
  }, [allMaterials]);

  const handleDelete = async (log) => {
    if (!window.confirm("Are you sure you want to delete this log? This action is permanent and will update the inventory count.")) return;

    const toastId = toast.loading("Deleting log...");
    const logRef = doc(db, `${type}_logs`, log.id);
    const materialRef = doc(db, `materials/${ADMIN_UID}/items`, log.materialId);

    try {
      await runTransaction(db, async (transaction) => {
        const materialDoc = await transaction.get(materialRef);
        if (!materialDoc.exists()) throw new Error("Associated material not found!");

        const materialData = materialDoc.data();
        const quantityChange = -log.quantity;

        const newDelivered = (materialData.delivered || 0) + (type === 'delivery' ? quantityChange : 0);
        const newIssued = (materialData.issued || 0) + (type === 'issuance' ? quantityChange : 0);

        if (newDelivered < newIssued) {
            throw new Error("Deletion failed: This would result in a negative stock balance.");
        }

        transaction.delete(logRef);
        transaction.update(materialRef, {
            delivered: newDelivered,
            issued: newIssued,
        });
      });
      toast.success("Log deleted successfully.", { id: toastId });
    } catch (err) {
      console.error("Delete transaction failed:", err);
      toast.error(err.message || "Failed to delete log.", { id: toastId });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md dark:bg-gray-800">
      <div className="overflow-x-auto overflow-y-auto max-h-[65vh]">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">{/*
          */}<thead className="bg-gray-50 dark:bg-gray-700">{/*
            */}<tr className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700">{/*
              */}<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">S/N</th>{/*
              */}<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>{/*
              */}<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Material</th>{/*
              */}<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>{/*
              */}<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Supplier</th>{/*
              */}<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Grade</th>{/*
              */}<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bore 1</th>{/*
              */}<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bore 2</th>{/*
              */}<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>{/*
              */}<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Remarks</th>{/*
              */}<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>{/*
            */}</tr>{/*
          */}</thead>{/*
          */}<tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">{/*
            */}{logs.length > 0 ? logs.map((log, index) => {
              const category = log.category || materialsMap.get(log.materialId)?.category || 'N/A';
              const displayDate = log.date?.toDate ? log.date.toDate().toLocaleDateString() : log.date;

              return (
              <tr key={log.id}>{/*
                */}<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>{/*
                */}<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{displayDate}</td>{/*
                */}<td className="px-6 py-4 whitespace-pre-wrap max-w-sm text-sm font-medium text-gray-900 dark:text-white">{log.materialDescription}</td>{/*
                */}<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{category}</td>{/*
                */}<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{log.supplier || 'N/A'}</td>{/*
                */}<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{log.materialGrade || 'N/A'}</td>{/*
                */}<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{log.boreSize1 || 'N/A'}</td>{/*
                */}<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{log.boreSize2 || 'N/A'}</td>{/*
                */}<td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 dark:text-gray-200 text-center">{log.quantity}</td>{/*
                */}<td className="px-6 py-4 whitespace-pre-wrap max-w-xs text-sm text-gray-500 dark:text-gray-400">{log.remarks || 'N/A'}</td>{/*
                */}<td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {!currentUser.isViewer && (
                    <div className="flex items-center justify-center space-x-4">
                      <button onClick={() => onEdit(log)} className="text-blue-600 hover:text-blue-900" title="Edit Log"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(log)} className="text-red-600 hover:text-red-900" title="Delete Log"><Trash2 size={16} /></button>
                    </div>
                  )}
                </td>{/*
              */}</tr>
            )}) : (
              <tr><td colSpan="11" className="text-center py-10 text-gray-500 dark:text-gray-400">No logs found.</td></tr>
            )}{/*
          */}</tbody>{/*
        */}</table>
      </div>
    </div>
  );
};

export default LogTable;
