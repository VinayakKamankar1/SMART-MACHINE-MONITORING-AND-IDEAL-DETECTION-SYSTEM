import { initializeApp } from "firebase/app";
import { getDatabase, ref } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA5ZElXpSOafoHNa95jC5sHIbYPx81w8S4",
  authDomain: "smartirrigation-c0009.firebaseapp.com",
  databaseURL: "https://smartirrigation-c0009-default-rtdb.firebaseio.com",
  projectId: "smartirrigation-c0009",
  storageBucket: "smartirrigation-c0009.firebasestorage.app",
  messagingSenderId: "119683172583",
  appId: "1:119683172583:web:3a472911f3f3c107e1ba42",
  measurementId: "G-H241N0E3WE"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

// References
export const machineRef = ref(database, "smart_machine");
export const connectedRef = ref(database, ".info/connected");

export { app, database };
