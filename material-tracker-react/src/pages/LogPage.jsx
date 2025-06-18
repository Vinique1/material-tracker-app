import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import LogForm from '../components/LogForm';
import LogTable from '../components/LogTable';
import { Download, Upload } from 'lucide-react';

const LogPage = ({ type }) => {
  const { ADMIN_UID } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  // Determine configuration based on the 'type' prop
  const config = {
    delivery: {
      title: "Delivery Log",
      collectionName: "delivery_logs",
      icon: <Download className="h-8 w-8 text-blue-600" />,
      formButtonText: "Add New Delivery"
    },
    issuance: {
      title: "Issuance Log",
      collectionName: "issuance_logs",
      icon: <Upload className="h-8 w-8 text-red-600" />,
      formButtonText: "Add New Issuance"
    }
  };

  const currentConfig = config[type];

  useEffect(() => {
    if (!ADMIN_UID) return;
    
    const logCollectionRef = collection(db, currentConfig.collectionName);
    const q = query(logCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logsData);
    }, (error) => {
      console.error(`Error fetching ${type} logs: `, error);
    });

    return () => unsubscribe();
  }, [ADMIN_UID, currentConfig.collectionName, type]);

  const handleOpenForm = (log = null) => {
    setEditingLog(log);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingLog(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white rounded-lg shadow">
            {currentConfig.icon}
          </div>
          <h1 className="text-3xl font-bold text-gray-800">{currentConfig.title}</h1>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <span>{currentConfig.formButtonText}</span>
        </button>
      </div>

      <LogTable 
        logs={logs}
        type={type}
        onEdit={handleOpenForm}
      />

      {isFormOpen && (
        <LogForm
          type={type}
          log={editingLog}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default LogPage;
