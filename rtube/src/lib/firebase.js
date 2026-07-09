// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5vV1ykeez-96dQsG0b0xh_2gNRqbCOnw",
  authDomain: "rtube-3eaa5.firebaseapp.com",
  projectId: "rtube-3eaa5",
  storageBucket: "rtube-3eaa5.firebasestorage.app",
  messagingSenderId: "127863361227",
  appId: "1:127863361227:web:3fd7c25c5b35c217ff554e",
  measurementId: "G-6M4Q5K93ME"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
