import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Add onAuthStateChanged import

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_UID = "V8zL2oH8b1ZSmG1tdp11gmdtylM2";
  const VIEWER_UID = "Z35t7DqNx5OJktX39895BK2MS773";
  const authorizedUIDs = [ADMIN_UID, VIEWER_UID];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user && authorizedUIDs.includes(user.uid)) {
        const isViewer = user.uid === VIEWER_UID;
        setCurrentUser({ ...user, isViewer, isAdmin: !isViewer });
      } else {
        if (user) signOut(auth);
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    ADMIN_UID,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};