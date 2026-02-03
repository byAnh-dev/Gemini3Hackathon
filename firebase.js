// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfWdhjF79TBjUtGt7f3oyGtY0nJdEKOAE",
  authDomain: "gemini3hackathon-47bf6.firebaseapp.com",
  projectId: "gemini3hackathon-47bf6",
  storageBucket: "gemini3hackathon-47bf6.firebasestorage.app",
  messagingSenderId: "919414872074",
  appId: "1:919414872074:web:51828acf238a70c020e7f3",
  measurementId: "G-22E1M36RYQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
