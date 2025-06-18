import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { X } from 'lucide-react';

const TransactionModal = ({ details, onClose }) => {
    const { ADMIN_UID } = useAuth();
    const [qty, setQty] = useState(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { type, material } = details;
        const numQty = parseInt(qty, 10);

        if (isNaN(numQty) || numQty <= 0) {
            return alert('Please enter a valid quantity.');
        }

        const materialRef = doc(db, `materials/${ADMIN_UID}/items`, material.id);
        const currentData = material;

        try {
            if (type === 'deliver') {
                const newDelivered = (currentData.delivered || 0) + numQty;
                await updateDoc(materialRef, { delivered: newDelivered });
            } else if (type === 'issue') {
                const balance = (currentData.delivered || 0) - (currentData.issued || 0);
                if (numQty > balance) {
                    return alert(`Cannot issue ${numQty} items. Only ${balance} available in stock.`);
                }
                const newIssued = (currentData.issued || 0) + numQty;
                await updateDoc(materialRef, { issued: newIssued });
            }
            onClose();
        } catch(err) {
            console.error("Transaction failed:", err);
            alert("Transaction failed.");
        }
    };
    
    return (
        // MODIFIED: Added onClick handler to the overlay for closing the modal
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50"
             onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
             }}
        >
            <div className="relative mx-auto p-8 border w-full max-w-lg shadow-lg rounded-xl bg-white">
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h3 className="text-2xl font-semibold capitalize">{details.type} Material</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X/></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <p className="text-gray-800 font-medium truncate mb-4" title={details.material.description}>{details.material.description}</p>
                    <div>
                        <label htmlFor="transaction-qty" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input type="number" id="transaction-qty" value={qty} onChange={e => setQty(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 px-4" required min="1" autoFocus/>
                    </div>
                    <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end gap-3">
                        {/* MODIFIED: Added Cancel button */}
                        <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-semibold bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-3 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;
