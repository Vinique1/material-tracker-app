import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBMA6HduuXEM-OF953tDiaXG3a8zYXnlEk",
  authDomain: "inventory-tracker-e5b38.firebaseapp.com",
  projectId: "inventory-tracker-e5b38",
  storageBucket: "inventory-tracker-e5b38.appspot.com",
  messagingSenderId: "486657758459",
  appId: "1:486657758459:web:ba935a81c82aa5c8394c5e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);