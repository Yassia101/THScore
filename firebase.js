// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANbiHJdcuH4BHWuEqeRPUReuqAcEd7r0k",
  authDomain: "scoreth-44880.firebaseapp.com",
  projectId: "scoreth-44880",
  storageBucket: "scoreth-44880.firebasestorage.app",
  messagingSenderId: "421013194625",
  appId: "1:421013194625:web:92ac8c56a598e0cc9fca80",
  measurementId: "G-Y6NWZ33CMR"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
