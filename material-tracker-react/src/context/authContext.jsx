import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [appMetadata, setAppMetadata] = useState({ categories: [], suppliers: [] });
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

    // Listen for changes in our metadata (categories, suppliers)
    const metadataRef = doc(db, 'app_metadata', 'lists');
    const unsubscribeMetadata = onSnapshot(metadataRef, (docSnap) => {
      if (docSnap.exists()) {
        setAppMetadata(docSnap.data());
      } else {
        console.log("Metadata document does not exist!");
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
