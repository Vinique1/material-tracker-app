import React, { useState } from 'react';
import { useAuth } from '../authContext';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { X } from 'lucide-react';

const AddEditMaterialModal = ({ material, onClose }) => {
    const { ADMIN_UID } = useAuth();
    const [formData, setFormData] = useState({
        description: material?.description || '',
        poNumber: material?.poNumber || '',
        expectedQty: material?.expectedQty || 0,
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const materialsCollection = collection(db, `materials/${ADMIN_UID}/items`);
        const dataToSave = {
            description: formData.description,
            poNumber: formData.poNumber,
            expectedQty: parseInt(formData.expectedQty, 10),
            updatedAt: new Date().toISOString(),
        };

        try {
            if (material) {
                await updateDoc(doc(materialsCollection, material.id), dataToSave);
            } else {
                await addDoc(materialsCollection, {
                    ...dataToSave,
                    delivered: 0,
                    issued: 0,
                    createdAt: new Date().toISOString(),
                });
            }
            onClose();
        } catch (error) {
            console.error("Error saving material:", error);
            alert("Failed to save material.");
        }
    };

    return (
        <div className="modal show fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full items-center justify-center">
            <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="text-2xl font-semibold">{material ? 'Edit Material' : 'Add New Material'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
                </div>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required></textarea>
                    </div>
                    <div>
                        <label htmlFor="poNumber" className="block text-sm font-medium text-gray-700">Purchase Order (PO) Number</label>
                        <input type="text" id="poNumber" name="poNumber" value={formData.poNumber} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="expectedQty" className="block text-sm font-medium text-gray-700">Expected Quantity</label>
                        <input type="number" id="expectedQty" name="expectedQty" value={formData.expectedQty} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required min="0" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Save Material</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditMaterialModal;