import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  // MODIFIED: Added new empty arrays to the initial state for the new fields.
  const [appMetadata, setAppMetadata] = useState({ 
    categories: [], 
    suppliers: [], 
    materialGrades: [],
    boreSize1Options: [],
    boreSize2Options: []
  });
  const [loading, setLoading] = useState(true);

  const ADMIN_UID = "V8zL2oH8b1ZSmG1tdp11gmdtylM2";
  const VIEWER_UID = "Z35t7DqNx5OJktX39895BK2MS773";
  const authorizedUIDs = [ADMIN_UID, VIEWER_UID];

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user && authorizedUIDs.includes(user.uid)) {
        const isViewer = user.uid === VIEWER_UID;
        setCurrentUser({ ...user, isViewer, isAdmin: !isViewer });
      } else {
        if (user) signOut(auth);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    const metadataRef = doc(db, 'app_metadata', 'lists');
    const unsubscribeMetadata = onSnapshot(metadataRef, (docSnap) => {
      if (docSnap.exists()) {
        // MODIFIED: The entire metadata document is now fetched and set.
        setAppMetadata(docSnap.data());
      } else {
        console.log("Metadata document does not exist! Please create it in Firestore.");
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMetadata();
    };
  }, []);

  const value = {
    currentUser,
    ADMIN_UID,
    appMetadata,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
