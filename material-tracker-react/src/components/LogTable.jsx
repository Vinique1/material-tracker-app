import React from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, runTransaction } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Edit, Trash2 } from 'lucide-react';

const LogTable = ({ logs, type, onEdit }) => {
  const { currentUser, ADMIN_UID } = useAuth();

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
        const quantityChange = -log.quantity; // We are subtracting from the total

        const newDelivered = (materialData.delivered || 0) + (type === 'delivery' ? quantityChange : 0);
        const newIssued = (materialData.issued || 0) + (type === 'issuance' ? quantityChange : 0);

        // INTEGRITY CHECK
        if (newDelivered < newIssued) {
            throw new Error("Deletion failed: This would result in a negative stock balance.");
        }

        transaction.delete(logRef);
        transaction.update(materialRef, {
            delivered: newDelivered,
            issued: newIssued,
            balance: newDelivered - newIssued,
        });
      });
      toast.success("Log deleted successfully.", { id: toastId });
    } catch (err) {
      console.error("Delete transaction failed:", err);
      toast.error(err.message || "Failed to delete log.", { id: toastId });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="table-responsive">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.length > 0 ? logs.map(log => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.date}</td>
                <td className="px-6 py-4 whitespace-pre-wrap max-w-sm text-sm text-gray-700">{log.materialDescription}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{log.quantity}</td>
                <td className="px-6 py-4 whitespace-pre-wrap max-w-xs text-sm text-gray-500">{log.remarks || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.createdBy}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {!currentUser.isViewer && (
                    <div className="flex items-center space-x-4">
                      <button onClick={() => onEdit(log)} className="text-blue-600 hover:text-blue-900"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(log)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                    </div>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="text-center py-10 text-gray-500">No logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogTable;
