// src/components/AddEditMaterialModal.jsx
import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useAuth } from '../context/authContext';
import { db } from '../firebase';
import { doc, updateDoc, addDoc, collection, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { Combobox, Transition } from '@headlessui/react';
import { FileText, Tag, Hash, Plus, Check, ChevronsUpDown, LoaderCircle, Info, Maximize2, Layers, X } from 'lucide-react';
import clsx from 'clsx';

const AddEditMaterialModal = ({ material, onClose }) => {
    const { currentUser, ADMIN_UID, appMetadata } = useAuth();

    // Form field states
    const [description, setDescription] = useState(material?.description || '');
    const [selectedBoreSize1, setSelectedBoreSize1] = useState(material?.boreSize1 || null);
    const [selectedBoreSize2, setSelectedBoreSize2] = useState(material?.boreSize2 || null);
    const [expectedQty, setExpectedQty] = useState(material?.expectedQty || 1);
    const [selectedCategory, setSelectedCategory] = useState(material?.category || null);
    const [selectedSupplier, setSelectedSupplier] = useState(material?.supplier || null);
    const [selectedMaterialGrade, setSelectedMaterialGrade] = useState(material?.materialGrade || null);

    const [categoryQuery, setCategoryQuery] = useState('');
    const [supplierQuery, setSupplierQuery] = useState('');
    const [materialGradeQuery, setMaterialGradeQuery] = useState('');
    const [boreSize1Query, setBoreSize1Query] = useState('');
    const [boreSize2Query, setBoreSize2Query] = useState('');

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use data directly from the context. No local copies needed.
    const categories = appMetadata.categories || [];
    const suppliers = appMetadata.suppliers || [];
    const materialGrades = appMetadata.materialGrades || [];
    const boreSize1Options = appMetadata.boreSize1Options || [];
    const boreSize2Options = appMetadata.boreSize2Options || [];

    const descriptionInputRef = useRef(null);
    useEffect(() => {
        // The only thing needed in this effect now is the focus action.
        setTimeout(() => descriptionInputRef.current?.focus(), 100);
    }, []); // Dependency array can now be empty.

    const filteredCategories = categoryQuery === '' ? categories : categories.filter(cat => cat.toLowerCase().includes(categoryQuery.toLowerCase()));
    const filteredSuppliers = supplierQuery === '' ? suppliers : suppliers.filter(sup => sup.toLowerCase().includes(supplierQuery.toLowerCase()));
    const filteredMaterialGrades = materialGradeQuery === '' ? materialGrades : materialGrades.filter(grade => grade.toLowerCase().includes(materialGradeQuery.toLowerCase()));
    const filteredBoreSize1 = boreSize1Query === '' ? boreSize1Options : boreSize1Options.filter(size => size.includes(boreSize1Query));
    const filteredBoreSize2 = boreSize2Query === '' ? boreSize2Options : boreSize2Options.filter(size => size.includes(boreSize2Query));

    const handleQtyChange = (amount) => {
        setExpectedQty(prev => Math.max(0, prev + amount));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!description) newErrors.description = 'Description is required.';
        if (!selectedBoreSize1) newErrors.selectedBoreSize1 = 'Bore Size 1 is required.';
        if (!selectedCategory) newErrors.selectedCategory = 'Category is required.';
        if (!selectedSupplier) newErrors.selectedSupplier = 'Supplier is required.';
        if (!selectedMaterialGrade) newErrors.selectedMaterialGrade = 'Material Grade is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const createMaterial = async (data) => {
        const materialsCollectionRef = collection(db, `materials/${ADMIN_UID}/items`);
        await addDoc(materialsCollectionRef, {
            ...data,
            delivered: 0,
            issued: 0,
            createdAt: serverTimestamp(),
        });
    };

    const updateMaterial = async (data) => {
        const materialRef = doc(db, `materials/${ADMIN_UID}/items`, material.id);
        await updateDoc(materialRef, data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentUser.isViewer || !validateForm()) return;

        setIsSubmitting(true);
        const dataToSave = {
            description,
            category: selectedCategory,
            supplier: selectedSupplier,
            materialGrade: selectedMaterialGrade,
            boreSize1: selectedBoreSize1,
            boreSize2: selectedBoreSize2 || null,
            expectedQty: parseInt(expectedQty, 10),
            updatedAt: serverTimestamp(),
        };

        try {
            if (material) {
                await updateMaterial(dataToSave);
            } else {
                await createMaterial(dataToSave);
            }
            onClose();
        } catch (error) {
            console.error("Error saving material:", error);
            alert("Failed to save material.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddNewItem = async (type, value) => {
        if (!value || currentUser.isViewer) return;
        const normalizedValue = value.trim();
        const metadataRef = doc(db, 'app_metadata', 'lists');

        const typeMap = {
            category: { list: categories, setter: setSelectedCategory, field: 'categories' },
            supplier: { list: suppliers, setter: setSelectedSupplier, field: 'suppliers' },
            materialGrade: { list: materialGrades, setter: setSelectedMaterialGrade, field: 'materialGrades' },
            boreSize1: { list: boreSize1Options, setter: setSelectedBoreSize1, field: 'boreSize1Options' },
            boreSize2: { list: boreSize2Options, setter: setSelectedBoreSize2, field: 'boreSize2Options' }
        };

        const config = typeMap[type];
        if (config.list.map(item => item.toLowerCase()).includes(normalizedValue.toLowerCase())) {
             config.setter(config.list.find(item => item.toLowerCase() === normalizedValue.toLowerCase()));
             return;
        }

        try {
            await updateDoc(metadataRef, { [config.field]: arrayUnion(normalizedValue) });
            config.setter(normalizedValue);
        } catch (error) {
            console.error("Failed to add new item:", error);
            alert(`Could not add new ${type}.`);
        }
    };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative mx-auto p-8 border w-full max-w-2xl shadow-lg rounded-xl bg-white dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{material ? 'Edit Material' : 'Add New Material'}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Fill out the details below to add an item to the inventory.</p>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X /></button>
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            <div className="space-y-4 p-5 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Item Details</h3>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                  <textarea id="description" name="description" ref={descriptionInputRef} rows="3"
                    className={clsx("w-full rounded-md border py-4 pl-10 pr-4 text-sm shadow-sm transition-colors bg-white dark:bg-gray-700 dark:text-gray-100", errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600')}
                    value={description} onChange={(e) => setDescription(e.target.value)} onBlur={() => validateForm()} />
                </div>
                {errors.description && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><Info size={14}/>{errors.description}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <SearchableDropdown label="Bore Size 1" items={filteredBoreSize1} selectedItem={selectedBoreSize1} setSelectedItem={setSelectedBoreSize1} query={boreSize1Query} setQuery={setBoreSize1Query} onAddNew={(value) => handleAddNewItem('boreSize1', value)} error={errors.selectedBoreSize1} onBlur={() => validateForm()} icon={<Maximize2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />} allowAddNew={true} isRequired={true}/>
                 <SearchableDropdown label="Bore Size 2" items={filteredBoreSize2} selectedItem={selectedBoreSize2} setSelectedItem={setSelectedBoreSize2} query={boreSize2Query} setQuery={setBoreSize2Query} onAddNew={(value) => handleAddNewItem('boreSize2', value)} icon={<Maximize2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />} allowAddNew={true} isRequired={false}/>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Quantity</label>
                <div className="relative flex items-center"><button type="button" onClick={() => handleQtyChange(-1)} className="h-11 px-3 bg-slate-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 rounded-l-md hover:bg-slate-300 dark:hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 z-10">-</button><Hash className="absolute left-12 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" /><input type="number" id="quantity" className="w-full h-11 border-y border-gray-300 dark:border-gray-600 text-center pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 z-10 bg-white dark:bg-gray-700 dark:text-gray-100" value={expectedQty} onChange={(e) => setExpectedQty(parseInt(e.target.value, 10) || 0)} /><button type="button" onClick={() => handleQtyChange(1)} className="h-11 px-3 bg-slate-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 rounded-r-md hover:bg-slate-300 dark:hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 z-10">+</button></div>
              </div>
            </div>
            <div className="space-y-4 p-5 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-600">
               <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Classification</h3>
              <SearchableDropdown label="Category" items={filteredCategories} selectedItem={selectedCategory} setSelectedItem={setSelectedCategory} query={categoryQuery} setQuery={setCategoryQuery} onAddNew={(value) => handleAddNewItem('category', value)} error={errors.selectedCategory} onBlur={() => validateForm()} icon={<Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />} />
              <SearchableDropdown label="Supplier" items={filteredSuppliers} selectedItem={selectedSupplier} setSelectedItem={setSelectedSupplier} query={supplierQuery} setQuery={setSupplierQuery} onAddNew={(value) => handleAddNewItem('supplier', value)} error={errors.selectedSupplier} onBlur={() => validateForm()} icon={<Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />} />
              <SearchableDropdown label="Material Grade" items={filteredMaterialGrades} selectedItem={selectedMaterialGrade} setSelectedItem={setSelectedMaterialGrade} query={materialGradeQuery} setQuery={setMaterialGradeQuery} onAddNew={(value) => handleAddNewItem('materialGrade', value)} error={errors.selectedMaterialGrade} onBlur={() => validateForm()} icon={<Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />} />
            </div>
          </div>
          <div className="mt-8 pt-5 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-semibold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={clsx("flex items-center justify-center w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white rounded-lg shadow-md transition-all duration-300", isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-0.5")}>
              {isSubmitting ? (<><LoaderCircle className="animate-spin mr-2 h-4 w-4" />Saving...</>) : ('Save Material')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SearchableDropdown = ({ label, items, selectedItem, setSelectedItem, query, setQuery, onAddNew, error, onBlur, icon, allowAddNew = true, isRequired = true }) => {
  const [showAddNew, setShowAddNew] = useState(false);
  const [newItem, setNewItem] = useState('');

  const handleAddNewKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddNew(newItem);
      setShowAddNew(false);
      setNewItem('');
    }
  };

  return (
    <div>
      <Combobox value={selectedItem} onChange={(value) => {
        if (allowAddNew && value === "add_new") { setShowAddNew(true); }
        else { setShowAddNew(false); setSelectedItem(value); }
      }} nullable>
        {({ open }) => (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label} {isRequired ? <span className="text-red-500">*</span> : <span className="text-gray-400 dark:text-gray-500">(Optional)</span>}
            </label>
            <div className="relative">
              {icon}
              <Combobox.Input className={clsx("w-full h-11 rounded-md border bg-white dark:bg-gray-700 py-2 pl-10 pr-10 text-sm shadow-sm transition-colors dark:text-gray-100", error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600')} displayValue={(item) => item || ''} onChange={(event) => setQuery(event.target.value)} placeholder={`Select a ${label.toLowerCase()}`} onBlur={onBlur} autoComplete="off" />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2"><ChevronsUpDown className="h-5 w-5 text-gray-400" /></Combobox.Button>
            </div>
            <Transition as={Fragment} show={open} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0" afterLeave={() => setQuery('')}>
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-20">
                {items.length === 0 && query !== '' ? (<div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">Nothing found.</div>) : 
                (items.map((item) => (
                    <Combobox.Option key={item} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-gray-300'}`} value={item}>
                        {({ selected, active }) => (<><span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{item}</span>{selected && <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-blue-600'}`}><Check className="h-5 w-5" /></span>}</>)}
                    </Combobox.Option>
                )))}
                {allowAddNew && (<Combobox.Option className="relative cursor-default select-none py-2 px-4 text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20" value="add_new">+ Add New {label}</Combobox.Option>)}
              </Combobox.Options>
            </Transition>
          </div>
        )}
      </Combobox>
      {error && <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><Info size={14}/>{error}</p>}
      {showAddNew && (
        <div className="relative mt-2">
          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={handleAddNewKeyDown} placeholder={`Type new ${label.toLowerCase()} and press Enter`} className="w-full h-11 rounded-md border bg-white dark:bg-gray-700 py-2 pl-10 pr-4 text-sm shadow-sm border-blue-500 focus:border-blue-500 focus:ring-blue-500 dark:text-gray-100 dark:border-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500" autoFocus />
        </div>
      )}
    </div>
  );
};

export default AddEditMaterialModal;