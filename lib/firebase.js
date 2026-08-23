import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// GANTI 6 NILAI DI BAWAH DENGAN CONFIG DARI FIREBASE CONSOLE ANDA
const firebaseConfig = {
  apiKey: "AIzaSyBfpVExGN7F89yKu9w5rI04e3N_Bf8cNyc",
  authDomain: "neurix-medical.firebaseapp.com",
  projectId: "neurix-medical",
  storageBucket: "neurix-medical.firebasestorage.app",
  messagingSenderId: "1038785000681",
  appId: "1:1038785000681:web:ea21eb00800012b0fbec78"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
