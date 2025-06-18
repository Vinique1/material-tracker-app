import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import StatsCards from './StatsCards';
import AddEditMaterialModal from './AddEditMaterialModal';
import TransactionModal from './TransactionModal';

const MaterialTable = ({ filterKey, filterValue }) => {
    const { currentUser, ADMIN_UID } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [transactionDetails, setTransactionDetails] = useState(null);

    useEffect(() => {
        const materialsCollectionRef = collection(db, `materials/${ADMIN_UID}/items`);
        let q;

        if (filterKey && filterValue) {
            q = query(materialsCollectionRef, where(filterKey, "==", filterValue));
        } else {
            q = query(materialsCollectionRef);
        }

        const unsubscribe = onSnapshot(q, snapshot => {
            const materialsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setMaterials(materialsData);
        }, (error) => {
            console.error("Error fetching materials: ", error);
        });

        return () => unsubscribe();
    }, [ADMIN_UID, filterKey, filterValue]);

    const handleDelete = async (id) => {
      if(currentUser.isViewer) return;
      if (window.confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
        try {
          await deleteDoc(doc(db, `materials/${ADMIN_UID}/items`, id));
        } catch (error) {
          console.error("Error deleting material: ", error);
          alert("Failed to delete material.");
        }
      }
    };

    const filteredMaterials = materials.filter(m =>
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const dashboardStats = {
        totalMaterials: materials.length,
        totalDelivered: materials.reduce((sum, m) => sum + (m.delivered || 0), 0),
        totalIssued: materials.reduce((sum, m) => sum + (m.issued || 0), 0),
    };

    return (
        <>
            <StatsCards stats={dashboardStats} />
            <div className="bg-white rounded-lg shadow-md mt-8">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-xl font-semibold text-gray-800 capitalize">
                      {filterValue ? `${filterValue} List` : 'All Materials'}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search descriptions..." className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                        </div>
                        {!currentUser.isViewer && (
                             <button onClick={() => setIsMaterialModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                                <Plus className="h-5 w-5" />
                                <span>Add Material</span>
                            </button>
                        )}
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {/* MODIFIED: Added new table headers */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bore 1</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bore 2</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMaterials.length > 0 ? filteredMaterials.map(material => {
                                const delivered = material.delivered || 0;
                                const issued = material.issued || 0;
                                const balance = delivered - issued;
                                return (
                                <tr key={material.id}>
                                    {/* MODIFIED: Added new table data cells */}
                                    <td className="px-6 py-4 whitespace-pre-wrap max-w-sm"><div className="text-sm font-medium text-gray-900">{material.description}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.supplier}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.materialGrade}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.boreSize1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.boreSize2 || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.expectedQty}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{delivered}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-semibold">{issued}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{balance}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {!currentUser.isViewer && <div className="flex items-center space-x-2">
                                            <button onClick={() => setTransactionDetails({ type: 'deliver', material })} className="text-green-600 hover:text-green-900">Deliver</button>
                                            <button onClick={() => setTransactionDetails({ type: 'issue', material })} className="text-yellow-600 hover:text-yellow-900">Issue</button>
                                            <button onClick={() => {setEditingMaterial(material); setIsMaterialModalOpen(true);}} className="text-blue-600 hover:text-blue-900"><Edit className="h-4 w-4" /></button>
                                            <button onClick={() => handleDelete(material.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                                        </div>}
                                    </td>
                                </tr>
                            )}) : (
                                <tr><td colSpan="11" className="text-center py-10 text-gray-500">No materials found for this filter.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isMaterialModalOpen && <AddEditMaterialModal material={editingMaterial} onClose={() => {setIsMaterialModalOpen(false); setEditingMaterial(null);}} />}
            {isTransactionModalOpen && <TransactionModal details={transactionDetails} onClose={() => setIsTransactionModalOpen(false)} />}
        </>
    );
};

export default MaterialTable;
