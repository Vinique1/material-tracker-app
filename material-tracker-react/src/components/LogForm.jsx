import React, { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, doc, runTransaction, serverTimestamp, query, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { X, LoaderCircle, ChevronsUpDown, Check, Layers, Maximize2 } from 'lucide-react';
import { Combobox, Transition } from '@headlessui/react';
import clsx from 'clsx';

const LogForm = ({ type, log, onClose }) => {
  const { currentUser, ADMIN_UID } = useAuth();
  const [allMaterials, setAllMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quantity, setQuantity] = useState(log?.quantity || 1);
  const [remarks, setRemarks] = useState(log?.remarks || '');
  const [logDate, setLogDate] = useState(log?.date || new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [materialQuery, setMaterialQuery] = useState('');

  // NEW: State to control quantity input step (for decimals)
  const [quantityStep, setQuantityStep] = useState(1);

  useEffect(() => {
    const materialsRef = collection(db, `materials/${ADMIN_UID}/items`);
    
    getDocs(materialsRef).then(snapshot => {
      const materialsList = snapshot.docs.map(doc => ({
        id: doc.id,
        label: doc.data().description,
        ...doc.data()
      }));
      setAllMaterials(materialsList);

      if (log) {
        const preselected = materialsList.find(m => m.id === log.materialId);
        setSelectedMaterial(preselected);
      }
    });
  }, [ADMIN_UID, log]);

  // NEW: Effect to update quantity step when material changes
  useEffect(() => {
    if (selectedMaterial?.category?.toLowerCase() === 'pipes') {
      setQuantityStep(0.01);
    } else {
      setQuantityStep(1);
    }
  }, [selectedMaterial]);

  const filteredMaterials = materialQuery === ''
    ? allMaterials
    : allMaterials.filter(m => m.label.toLowerCase().includes(materialQuery.toLowerCase()));
  
  const issuanceOptions = type === 'issuance' 
    ? filteredMaterials.filter(m => (m.delivered || 0) > (m.issued || 0)) 
    : filteredMaterials;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMaterial || !quantity || quantity <= 0) {
      setError("Please select a material and enter a valid quantity.");
      return;
    }
    setError('');
    setIsSubmitting(true);
    const toastId = toast.loading("Saving log...");

    const logCollectionRef = collection(db, `${type}_logs`);
    const materialRef = doc(db, `materials/${ADMIN_UID}/items`, selectedMaterial.id);
    const logRef = log ? doc(logCollectionRef, log.id) : doc(logCollectionRef);

    try {
      await runTransaction(db, async (transaction) => {
        const materialDoc = await transaction.get(materialRef);
        if (!materialDoc.exists()) throw new Error("Material does not exist!");

        const materialData = materialDoc.data();
        const oldLogQty = log ? log.quantity : 0;
        
        // NEW: Use parseFloat for pipes, otherwise parseInt
        const numQuantity = quantityStep === 1 ? parseInt(quantity, 10) : parseFloat(quantity);

        const quantityChange = numQuantity - oldLogQty;
        
        const newDelivered = (materialData.delivered || 0) + (type === 'delivery' ? quantityChange : 0);
        const newIssued = (materialData.issued || 0) + (type === 'issuance' ? quantityChange : 0);
        
        if (newDelivered < newIssued) {
          throw new Error("This action would result in a negative stock balance.");
        }
        if (type === 'issuance' && quantityChange > 0) {
            const currentBalance = (materialData.delivered || 0) - (materialData.issued || 0);
            if(quantityChange > currentBalance) {
                throw new Error(`Issuance failed. Only ${currentBalance} items are in stock.`);
            }
        }
        
        const logData = {
          materialId: selectedMaterial.id,
          materialDescription: selectedMaterial.label,
          materialGrade: selectedMaterial.materialGrade,
          boreSize1: selectedMaterial.boreSize1,
          boreSize2: selectedMaterial.boreSize2 || null,
          quantity: numQuantity,
          remarks,
          date: logDate,
          supplier: type === 'delivery' ? selectedMaterial.supplier : null,
          lastEditedBy: currentUser.email,
          lastEditedAt: serverTimestamp(),
        };

        if (log) {
          transaction.update(logRef, logData);
        } else {
          transaction.set(logRef, {
            ...logData,
            createdBy: currentUser.email,
            createdAt: serverTimestamp(),
          });
        }
        
        transaction.update(materialRef, {
            delivered: newDelivered,
            issued: newIssued
        });
      });

      toast.success(`Log ${log ? 'updated' : 'created'} successfully!`, { id: toastId });
      onClose();

    } catch (err) {
      console.error("Transaction failed: ", err);
      toast.error(err.message || "An unknown error occurred.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full flex items-center justify-center p-4 z-50" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative mx-auto p-8 w-full max-w-2xl shadow-lg rounded-xl bg-white">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 capitalize">{log ? `Edit ${type} Log` : `Add New ${type} Log`}</h3>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <Combobox value={selectedMaterial} onChange={setSelectedMaterial} nullable disabled={!!log}>
                {({ open }) => (
                  <div className="relative">
                    <Combobox.Input
                        className="w-full h-11 rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        displayValue={(material) => material?.label || ''}
                        onChange={(event) => setMaterialQuery(event.target.value)}
                        placeholder="Select a material..."
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronsUpDown className="h-5 w-5 text-gray-400" />
                    </Combobox.Button>
                    <Transition as={Fragment} show={open} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-20">
                            {(type === 'issuance' ? issuanceOptions : filteredMaterials).map((material) => (
                                <Combobox.Option key={material.id} value={material} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900'}`}>
                                    {({ selected }) => ( <> <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{material.label}</span> {selected ? <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-blue-600'}`}><Check/></span> : null} </>)}
                                </Combobox.Option>
                            ))}
                        </Combobox.Options>
                    </Transition>
                  </div>
                )}
              </Combobox>
            </div>
            {selectedMaterial && (
                <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                    <div className="flex items-center gap-2"><Layers size={14} className="text-gray-500" /><div><span className="font-semibold">Grade: </span><span>{selectedMaterial.materialGrade}</span></div></div>
                    <div className="flex items-center gap-2"><Maximize2 size={14} className="text-gray-500" /><div><span className="font-semibold">Bore 1: </span><span>{selectedMaterial.boreSize1}</span></div></div>
                    <div className="flex items-center gap-2"><Maximize2 size={14} className="text-gray-500" /><div><span className="font-semibold">Bore 2: </span><span>{selectedMaterial.boreSize2 || 'N/A'}</span></div></div>
                </div>
            )}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              {/* NEW: Input step is now dynamic */}
              <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} step={quantityStep} className="w-full h-11 px-4 rounded-md border border-gray-300 shadow-sm" min="0.01" />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" id="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="w-full h-11 px-4 rounded-md border border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
              <textarea id="remarks" rows="3" value={remarks} onChange={e => setRemarks(e.target.value)} className="w-full p-4 rounded-md border border-gray-300 shadow-sm" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-semibold bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={clsx("flex items-center justify-center w-32 px-6 py-3 text-sm font-semibold text-white rounded-lg shadow-md", isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700")}>
              {isSubmitting ? <LoaderCircle className="animate-spin h-5 w-5" /> : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogForm;
