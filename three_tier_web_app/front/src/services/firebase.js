// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_zDPZWQQWILhAvJ9gGDZN-e-U8M5nnFI",
  authDomain: "login-1665b.firebaseapp.com",
  projectId: "login-1665b",
  storageBucket: "login-1665b.firebasestorage.app",
  messagingSenderId: "896246335749",
  appId: "1:896246335749:web:bc4e05033beb810391cf6c",
  measurementId: "G-5TXPF4056R"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);