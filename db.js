// Import core Firebase and Firestore functionalities from the CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your exact configuration from the Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyCfUofxNrF-Ryo7OYcLGNU7w49hJvvemQ",
  authDomain: "verdeledger-84601.firebaseapp.com",
  projectId: "verdeledger-84601",
  storageBucket: "verdeledger-84601.firebasestorage.app",
  messagingSenderId: "524558330324",
  appId: "1:524558330324:web:fde914adc7dd1c58694e41",
  measurementId: "G-0MC5M0QNEX"
};

// Initialize the Firebase App
const app = initializeApp(firebaseConfig);

// Initialize and export the Firestore Database so it can be used in your other files
export const db = getFirestore(app);
