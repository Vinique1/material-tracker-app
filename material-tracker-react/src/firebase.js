import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBNZgou-GZMD-ajy_HywunRD3-JdntRv1I",
  authDomain: "sitsl-inventory-tracker.firebaseapp.com",
  projectId: "sitsl-inventory-tracker",
  storageBucket: "sitsl-inventory-tracker.firebasestorage.app",
  messagingSenderId: "238816182378",
  appId: "1:238816182378:web:7070e7eadb9b4ee7b3ca13"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);