import React, { useState } from 'react';
import { useAuth } from '../context/authContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { X } from 'lucide-react';

const TransactionModal = ({ details, onClose }) => {
    const { ADMIN_UID } = useAuth();
    const [qty, setQty] = useState(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { type, material } = details;

        if (isNaN(qty) || qty <= 0) {
            return alert('Please enter a valid quantity.');
        }

        const materialRef = doc(db, `materials/${ADMIN_UID}/items`, material.id);
        const currentData = material;

        try {
            if (type === 'deliver') {
                const newDelivered = (currentData.delivered || 0) + qty;
                await updateDoc(materialRef, { delivered: newDelivered });
            } else if (type === 'issue') {
                const balance = (currentData.delivered || 0) - (currentData.issued || 0);
                if (qty > balance) {
                    return alert(`Cannot issue ${qty} items. Only ${balance} available in stock.`);
                }
                const newIssued = (currentData.issued || 0) + qty;
                await updateDoc(materialRef, { issued: newIssued });
            }
            onClose();
        } catch(err) {
            console.error("Transaction failed:", err);
            alert("Transaction failed.");
        }
    };
    
    return (
        <div className="modal show fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full items-center justify-center">
            <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="text-2xl font-semibold capitalize">{details.type} Material</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X/></button>
                </div>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <p className="text-gray-800 font-medium">{details.material.description}</p>
                    <div>
                        <label htmlFor="transaction-qty" className="block text-sm font-medium text-gray-700">Quantity</label>
                        <input type="number" id="transaction-qty" value={qty} onChange={e => setQty(parseInt(e.target.value, 10))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required min="1" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;