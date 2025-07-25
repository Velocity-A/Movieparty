// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB5y40gJ1boza82qmpn3N4A4MpJ2P-WTmg",
  authDomain: "movie-6180c.firebaseapp.com",
  databaseURL: "https://movie-6180c-default-rtdb.firebaseio.com",
  projectId: "movie-6180c",
  storageBucket: "movie-6180c.firebasestorage.app",
  messagingSenderId: "626611817188",
  appId: "1:626611817188:web:3a368c4f34ac7298ffbaf1",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database };
