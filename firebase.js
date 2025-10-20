// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDu5HrS1C-sL1mvTIpQ8Z_29l46SgmXugM",
  authDomain: "getestimation-e0978.firebaseapp.com",
  projectId: "getestimation-e0978",
  storageBucket: "getestimation-e0978.firebasestorage.app",
  messagingSenderId: "305257891317",
  appId: "1:305257891317:web:5b20c8e5121d0fbb9a0cbc",
  measurementId: "G-21C5H9BRQ7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, signInWithEmailAndPassword, signOut };
