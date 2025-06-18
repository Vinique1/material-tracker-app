import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, addDoc, collection, arrayUnion } from 'firebase/firestore';
import { X } from 'lucide-react';

const AddEditMaterialModal = ({ material, onClose }) => {
    const { currentUser, ADMIN_UID, appMetadata } = useAuth();
    
    // Form state
    const [description, setDescription] = useState(material?.description || '');
    const [category, setCategory] = useState(material?.category || '');
    const [supplier, setSupplier] = useState(material?.supplier || '');
    const [expectedQty, setExpectedQty] = useState(material?.expectedQty || 0);

    // State for the "Add New..." feature
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [showNewSupplierInput, setShowNewSupplierInput] = useState(false);
    const [newSupplier, setNewSupplier] = useState('');

    const handleCategoryChange = (e) => {
        const { value } = e.target;
        if (value === 'add_new') {
            setShowNewCategoryInput(true);
        } else {
            setCategory(value);
            setShowNewCategoryInput(false);
        }
    };
    
    const handleSupplierChange = (e) => {
        const { value } = e.target;
        if (value === 'add_new') {
            setShowNewSupplierInput(true);
        } else {
            setSupplier(value);
            setShowNewSupplierInput(false);
        }
    };

    const handleSaveNewMetadata = async (type) => {
        if(currentUser.isViewer) return;
        const metadataRef = doc(db, 'app_metadata', 'lists');
        let valueToAdd;
        let fieldToUpdate;

        if (type === 'category' && newCategory.trim() !== '') {
            valueToAdd = newCategory.trim();
            fieldToUpdate = 'categories';
        } else if (type === 'supplier' && newSupplier.trim() !== '') {
            valueToAdd = newSupplier.trim();
            fieldToUpdate = 'suppliers';
        } else {
            return;
        }

        await updateDoc(metadataRef, {
            [fieldToUpdate]: arrayUnion(valueToAdd)
        });
        
        if (type === 'category') {
            setCategory(valueToAdd); // Select the new category
            setNewCategory('');
            setShowNewCategoryInput(false);
        } else {
            setSupplier(valueToAdd); // Select the new supplier
            setNewSupplier('');
            setShowNewSupplierInput(false);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentUser.isViewer) return;
        if (!category || !supplier) {
            alert('Please select a category and a supplier.');
            return;
        }

        const materialsCollectionRef = collection(db, `materials/${ADMIN_UID}/items`);
        const dataToSave = {
            description,
            category,
            supplier,
            expectedQty: parseInt(expectedQty, 10),
            updatedAt: new Date().toISOString()
        };

        try {
            if (material) { // Editing existing material
                await updateDoc(doc(materialsCollectionRef, material.id), dataToSave);
            } else { // Adding new material
                await addDoc(materialsCollectionRef, {
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
        <div className="modal show fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full items-center justify-center p-4">
            <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center border-b pb-3">
                    <h3 className="text-2xl font-semibold">{material ? 'Edit Material' : 'Add New Material'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
                </div>
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required></textarea>
                    </div>

                    {/* Category Dropdown */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select id="category" value={category} onChange={handleCategoryChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                            <option value="" disabled>Select a category</option>
                            {appMetadata.categories?.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            <option value="add_new" className="font-bold text-blue-600">Add New Category...</option>
                        </select>
                    </div>
                    {showNewCategoryInput && (
                        <div className="flex items-center gap-2">
                            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category name" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                            <button type="button" onClick={() => handleSaveNewMetadata('category')} className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm">Save</button>
                        </div>
                    )}

                    {/* Supplier Dropdown */}
                    <div>
                        <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">Supplier</label>
                        <select id="supplier" value={supplier} onChange={handleSupplierChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                            <option value="" disabled>Select a supplier</option>
                            {appMetadata.suppliers?.map(sup => <option key={sup} value={sup}>{sup}</option>)}
                            <option value="add_new" className="font-bold text-blue-600">Add New Supplier...</option>
                        </select>
                    </div>
                     {showNewSupplierInput && (
                        <div className="flex items-center gap-2">
                            <input type="text" value={newSupplier} onChange={(e) => setNewSupplier(e.target.value)} placeholder="New supplier name" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                            <button type="button" onClick={() => handleSaveNewMetadata('supplier')} className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 text-sm">Save</button>
                        </div>
                    )}

                    <div>
                        <label htmlFor="expectedQty" className="block text-sm font-medium text-gray-700">Expected Quantity</label>
                        <input type="number" id="expectedQty" value={expectedQty} onChange={(e) => setExpectedQty(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required min="0" />
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