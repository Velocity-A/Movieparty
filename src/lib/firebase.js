// lib/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getDatabase } from "firebase/database";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB5y40gJ1boza82qmpn3N4A4MpJ2P-WTmg",
  authDomain: "movie-6180c.firebaseapp.com",
  databaseURL: "https://movie-6180c-default-rtdb.firebaseio.com",
  projectId: "movie-6180c",
  storageBucket: "movie-6180c.firebasestorage.app",
  messagingSenderId: "626611817188",
  appId: "1:626611817188:web:3a368c4f34ac7298ffbaf1",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// ✅ Enable persistent login
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Auth persistence set to local");
  })
  .catch((error) => {
    console.error("❌ Failed to set auth persistence:", error.message);
  });

export { auth, database };
