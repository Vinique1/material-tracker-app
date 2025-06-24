import React, { useState, useRef } from 'react';
import { useAuth } from '../context/authContext';
import { db } from '../firebase';
import { collection, doc, writeBatch, arrayUnion, serverTimestamp } from 'firebase/firestore';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { Upload, LoaderCircle } from 'lucide-react';
import clsx from 'clsx';

const ImportCSV = () => {
  const { currentUser, ADMIN_UID } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    const toastId = toast.loading('Parsing CSV file...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processAndUpload(results.data, toastId);
      },
      error: (error) => {
        toast.error(`Error parsing file: ${error.message}`, { id: toastId });
        setIsImporting(false);
      },
    });

    event.target.value = null;
  };

  // MODIFIED: Rearchitected to handle batching and large datasets
  const processAndUpload = async (data, toastId) => {
    toast.loading('Preparing data for upload...', { id: toastId });

    if (data.length === 0) {
      toast.error('CSV file is empty or has no data rows.', { id: toastId });
      setIsImporting(false);
      return;
    }

    const requiredHeaders = ['Description', 'ExpectedQuantity', 'Category', 'Supplier', 'MaterialGrade', 'BoreSize1'];
    const fileHeaders = Object.keys(data[0]);
    const missingHeaders = requiredHeaders.filter(h => !fileHeaders.includes(h));

    if (missingHeaders.length > 0) {
      toast.error(`Missing required columns: ${missingHeaders.join(', ')}`, { id: toastId });
      setIsImporting(false);
      return;
    }

    try {
      const materialsCollectionRef = collection(db, `materials/${ADMIN_UID}/items`);
      const metadataRef = doc(db, 'app_metadata', 'lists');
      const newMetadata = {
        categories: new Set(),
        suppliers: new Set(),
        materialGrades: new Set(),
        boreSize1Options: new Set(),
        boreSize2Options: new Set(),
      };

      // First, parse all data to collect metadata
      data.forEach(row => {
        if (row.Category) newMetadata.categories.add(row.Category);
        if (row.Supplier) newMetadata.suppliers.add(row.Supplier);
        if (row.MaterialGrade) newMetadata.materialGrades.add(row.MaterialGrade);
        if (row.BoreSize1) newMetadata.boreSize1Options.add(row.BoreSize1);
        if (row.BoreSize2) newMetadata.boreSize2Options.add(row.BoreSize2);
      });

      // Update metadata in a single operation
      await writeBatch(db)
        .update(metadataRef, {
            categories: arrayUnion(...Array.from(newMetadata.categories)),
            suppliers: arrayUnion(...Array.from(newMetadata.suppliers)),
            materialGrades: arrayUnion(...Array.from(newMetadata.materialGrades)),
            boreSize1Options: arrayUnion(...Array.from(newMetadata.boreSize1Options)),
            boreSize2Options: arrayUnion(...Array.from(newMetadata.boreSize2Options)),
        })
        .commit();
      
      toast.loading('Metadata updated. Now uploading materials...', { id: toastId });

      // NEW: Chunking logic for materials
      const BATCH_SIZE = 499; // Firestore limit is 500 writes per batch
      const batchPromises = [];

      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const chunk = data.slice(i, i + BATCH_SIZE);
        const batch = writeBatch(db);

        chunk.forEach(row => {
          const newMaterialRef = doc(materialsCollectionRef);
          const materialData = {
            description: row.Description || '',
            expectedQty: Number(row.ExpectedQuantity) || 0,
            category: row.Category || '',
            supplier: row.Supplier || '',
            materialGrade: row.MaterialGrade || '',
            boreSize1: row.BoreSize1 || '',
            boreSize2: row.BoreSize2 || null,
            delivered: 0,
            issued: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          batch.set(newMaterialRef, materialData);
        });
        
        batchPromises.push(batch.commit());
      }

      await Promise.all(batchPromises);

      toast.success(`Successfully imported ${data.length} materials!`, { id: toastId });

    } catch (error) {
      console.error("Import failed: ", error);
      toast.error(`Import failed: ${error.message}`, { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

  if (currentUser.isViewer) return null;

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv"
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current.click()}
        disabled={isImporting}
        className={clsx(
            "bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors",
            isImporting && "bg-gray-400 cursor-not-allowed"
        )}
      >
        {isImporting ? (
            <LoaderCircle className="animate-spin h-5 w-5" />
        ) : (
            <Upload className="h-5 w-5" />
        )}
        <span>Import CSV</span>
      </button>
    </>
  );
};

export default ImportCSV;