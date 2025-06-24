// src/context/authContext.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

const authContext = createContext();

export const useAuth = () => useContext(authContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [appMetadata, setAppMetadata] = useState({ 
    categories: [], 
    suppliers: [], 
    materialGrades: [],
    boreSize1Options: [],
    boreSize2Options: []
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [metadataLoaded, setMetadataLoaded] = useState(false); // New state for metadata status

  const ADMIN_UID = "liClr3tmuecp40P96GCXoHmzc6x1";
  const VIEWER_UID = "DY1kwGWNwET1VauTFlNN0xxtH9O2";
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
      setAuthLoading(false);
    });

    const metadataRef = doc(db, 'app_metadata', 'lists');
    const unsubscribeMetadata = onSnapshot(metadataRef, (docSnap) => {
      if (docSnap.exists()) {
        setAppMetadata(docSnap.data());
      } else {
        console.log("Metadata document does not exist! Please create it in Firestore.");
      }
      setMetadataLoaded(true); // Mark metadata as loaded
    }, (error) => {
      console.error("AuthContext: Error fetching metadata! Check Firestore Rules.", error);
      setMetadataLoaded(true); // Mark as loaded even on error to prevent infinite loading
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

  // The application is considered loading until both auth and metadata are ready
  const isLoading = authLoading || !metadataLoaded;

  return (
    <authContext.Provider value={value}>
      {!isLoading && children}
    </authContext.Provider>
  );
};
