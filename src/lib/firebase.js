
import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore"
import {getStorage} from "firebase/storage"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chatapp-e9757.firebaseapp.com",
  projectId: "chatapp-e9757",
  storageBucket: "chatapp-e9757.appspot.com",
  messagingSenderId: "246059555613",
  appId: "1:246059555613:web:735df74224fdd72ee45ff4",
  measurementId: "G-1SN0JYF2FM"
};

const app = initializeApp(firebaseConfig);
export const auth =getAuth()
export const db =getFirestore()
export const storage =getStorage()