import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/authContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import StatsCards from './StatsCards';
import AddEditMaterialModal from './AddEditMaterialModal';
import ImportCSV from './ImportCSV';
import Pagination from './Pagination';

const ITEMS_PER_PAGE = 10;

const MaterialTable = ({ filterKey, filterValue, statusFilter, viewType }) => {
    const { currentUser, ADMIN_UID } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const materialsCollectionRef = collection(db, `materials/${ADMIN_UID}/items`);
        let q;
        if ((filterKey === 'category' || filterKey === 'supplier') && filterValue) {
            q = query(materialsCollectionRef, where(filterKey, "==", filterValue));
        } else {
            q = query(materialsCollectionRef);
        }

        const unsubscribe = onSnapshot(q, snapshot => {
            setMaterials(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            setCurrentPage(1);
        }, (error) => console.error("Error fetching materials: ", error));

        return () => unsubscribe();
    }, [ADMIN_UID, filterKey, filterValue]);

    const handleDelete = async (id) => {
      if(currentUser.isViewer) return;
      if (window.confirm('Are you sure? This will also delete associated logs.')) {
        try {
          await deleteDoc(doc(db, `materials/${ADMIN_UID}/items`, id));
          toast.success("Material deleted.");
        } catch (error) { toast.error("Failed to delete material."); }
      }
    };

    const processedMaterials = useMemo(() => {
        let filtered = [...materials];
        if (statusFilter) {
            filtered = filtered.filter(m => {
                const delivered = m.delivered || 0;
                const expected = m.expectedQty || 0;
                if (statusFilter === 'surplus') return delivered > expected;
                if (statusFilter === 'deficit') return delivered < expected && delivered > 0;
                if (statusFilter === 'exact') return delivered === expected && delivered > 0;
                return false;
            });
        }

        if (searchTerm) {
            const searchKeywords = searchTerm.toLowerCase().split(' ').filter(kw => kw.trim() !== '');
            filtered = filtered.filter(m => {
                const descriptionText = m.description.toLowerCase();
                return searchKeywords.every(kw => descriptionText.includes(kw));
            });
        }
        return filtered;
    }, [materials, searchTerm, statusFilter]);

    const paginatedMaterials = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return processedMaterials.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [processedMaterials, currentPage]);

    const totalPages = Math.ceil(processedMaterials.length / ITEMS_PER_PAGE);

    const getPageTitle = () => {
        if(statusFilter) return `${statusFilter} Materials`;
        if(viewType === 'balanced') return 'Balanced Materials';
        if(filterValue) return `${filterValue} List`;
        return 'All Materials';
    }

    const dashboardStats = {
        totalMaterials: materials.length,
        totalDelivered: materials.reduce((sum, m) => sum + (m.delivered || 0), 0),
        totalIssued: materials.reduce((sum, m) => sum + (m.issued || 0), 0),
    };

    const renderTableHeaders = () => {
        const baseHeaders = [ "S/N", "Description", "Cat.", "Grade", "Bore 1", "Bore 2"];
        const actionHeader = ["Actions"];
        let dynamicHeaders = [];

        switch(viewType) {
            case 'surplus':
                dynamicHeaders = ["Expected", "Delivered", "Surplus"];
                break;
            case 'deficit':
                dynamicHeaders = ["Expected", "Delivered", "Deficit"];
                break;
            case 'exact':
                dynamicHeaders = ["Expected", "Delivered"];
                break;
            default:
                dynamicHeaders = ["Expected", "Delivered", "Issued", "Balance"];
        }

        const allHeaders = [...baseHeaders, ...dynamicHeaders, ...actionHeader];
        return (
            <tr>
                {allHeaders.map((header, index) => (
                    <th key={index} className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${header === 'Description' ? 'text-left' : 'text-center'}`}> {/* MODIFIED: Added dark text */}
                        {header}
                    </th>
                ))}
            </tr>
        );
    };

    const renderTableBody = (material, index) => {
        const delivered = material.delivered || 0;
        const issued = material.issued || 0;
        const expected = material.expectedQty || 0;
        const balance = delivered - issued;

        const isPipe = material.category?.toLowerCase() === 'pipes';

        const formatNumber = (num) => {
            if (isPipe) {
                return Math.round(num * 100) / 100;
            }
            return Math.round(num);
        };

        const baseCells = (
            <>
                <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td> {/* MODIFIED: Added dark text */}
                <td className="px-6 py-4 max-w-sm"><div className="text-sm font-medium text-gray-900 dark:text-white">{material.description}</div></td> {/* MODIFIED: Added dark text */}
                <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{material.category}</td> {/* MODIFIED: Added dark text */}
                <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{material.materialGrade}</td> {/* MODIFIED: Added dark text */}
                <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{material.boreSize1}</td> {/* MODIFIED: Added dark text */}
                <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{material.boreSize2 || 'N/A'}</td> {/* MODIFIED: Added dark text */}
            </>
        );

        let dynamicCells;
        switch(viewType) {
            case 'surplus':
                dynamicCells = (<>
                    <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{expected}</td> {/* MODIFIED: Added dark text */}
                    <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{delivered}</td> {/* MODIFIED: Added dark text */}
                    <td className="px-6 py-4 text-center text-sm font-bold text-green-600 dark:text-green-400">{formatNumber(delivered - expected)}</td> {/* MODIFIED: Added dark text */}
                </>);
                break;
            case 'deficit':
                dynamicCells = (<>
                    <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{expected}</td> {/* MODIFIED: Added dark text */}
                    <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{delivered}</td> {/* MODIFIED: Added dark text */}
                    <td className="px-6 py-4 text-center text-sm font-bold text-red-500 dark:text-red-400">{formatNumber(expected - delivered)}</td> {/* MODIFIED: Added dark text */}
                </>);
                break;
            case 'exact':
                 dynamicCells = (<>
                    <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">{expected}</td> {/* MODIFIED: Added dark text */}
                    <td className="px-6 py-4 text-center text-sm font-bold text-blue-500 dark:text-blue-400">{delivered}</td> {/* MODIFIED: Added dark text */}
                </>);
                break;
            default:
                 dynamicCells = (<>
                    <td className="px-6 py-4 text-center text-sm text-gray-800 dark:text-gray-200 font-bold">{expected}</td> {/* MODIFIED: Added dark text */}
                    <td className="px-6 py-4 text-center text-sm text-green-600 dark:text-green-400 font-semibold">{formatNumber(delivered)}</td> {/* MODIFIED: Added dark text */}
                    <td className="px-6 py-4 text-center text-sm text-yellow-600 dark:text-yellow-400 font-semibold">{formatNumber(issued)}</td> {/* MODIFIED: Added dark text */}
                    <td className={`px-6 py-4 text-center text-sm font-bold ${balance >= 0 ? 'text-blue-500 dark:text-blue-400' : 'text-red-500 dark:text-red-400'}`}>{formatNumber(balance)}</td> {/* MODIFIED: Added dark text */}
                 </>);
        }

        return (
            <tr key={material.id}>
                {baseCells}
                {dynamicCells}
                <td className="px-6 py-4 text-center text-sm font-medium">
                    {!currentUser.isViewer &&
                        <div className="flex items-center justify-center space-x-4">
                            <button onClick={() => {setEditingMaterial(material); setIsMaterialModalOpen(true);}} className="text-blue-600 hover:text-blue-900"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(material.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    }
                </td>
            </tr>
        );
    };

    return (
        <>
            <StatsCards stats={dashboardStats} />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mt-8"> {/* MODIFIED: Added dark background */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-wrap gap-4"> {/* MODIFIED: Added dark border */}
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 capitalize">{getPageTitle()}</h2> {/* MODIFIED: Added dark text */}
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <input type="text" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} placeholder="Search descriptions..." className="pl-10 pr-10 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white" /> {/* MODIFIED: Added dark styles */}
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                            {searchTerm && (<button onClick={() => { setSearchTerm(''); setCurrentPage(1); }} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"><X className="h-5 w-5"/></button>)}
                        </div>
                        {!statusFilter && viewType !== 'balanced' && !currentUser.isViewer && (
                            <div className="flex items-center space-x-2">
                                <ImportCSV />
                                <button onClick={() => {setEditingMaterial(null); setIsMaterialModalOpen(true);}} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2" title="Add New Material">
                                    <Plus className="h-5 w-5" /><span>Add</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"> {/* MODIFIED: Added dark divide color */}
                        <thead className="bg-gray-50 dark:bg-gray-700">{renderTableHeaders()}</thead> {/* MODIFIED: Added dark background */}
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"> {/* MODIFIED: Added dark background and divide color */}
                            {paginatedMaterials.length > 0 ? paginatedMaterials.map((material, index) => renderTableBody(material, index)) : (
                                <tr><td colSpan="11" className="text-center py-10 text-gray-500 dark:text-gray-400">No materials found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
            {isMaterialModalOpen && <AddEditMaterialModal material={editingMaterial} onClose={() => {setIsMaterialModalOpen(false); setEditingMaterial(null);}} />}
        </>
    );
};

export default MaterialTable;