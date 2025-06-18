// Import the functions you need from the SDKs you need
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBhL62F0mLyxNgnOA6n5hD7nhGA8DYmsE",
  authDomain: "studygroup-s-sat-wordle.firebaseapp.com",
  databaseURL: "https://studygroup-s-sat-wordle-default-rtdb.firebaseio.com",
  projectId: "studygroup-s-sat-wordle",
  storageBucket: "studygroup-s-sat-wordle.appspot.com", 
  messagingSenderId: "298041542959",
  appId: "1:298041542959:web:0286f3fc6d8c0fd6d8f9da"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // Changed name for clarity
const auth = getAuth(app);

export { database, auth }
