import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB8DF0WXTWK0GquN0w-P5u4H2JEcWbabMI",
  authDomain: "music-50b9c.firebaseapp.com",
  projectId: "music-50b9c",
  storageBucket: "music-50b9c.firebasestorage.app",
  messagingSenderId: "123813401506",
  appId: "1:123813401506:web:8aa5d0f14370a7c1b798fb",
};

export const firebaseReady = true;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
