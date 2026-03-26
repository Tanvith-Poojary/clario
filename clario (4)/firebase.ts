import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Configuration for the backend database
const firebaseConfig = {
   apiKey: "AIzaSyAfKX0DM_r-afbWlw4awJfLW8UXJREX9VM",
  authDomain: "my-clario-app.firebaseapp.com",
  projectId: "my-clario-app",
  storageBucket: "my-clario-app.firebasestorage.app",
  messagingSenderId: "87049644349",
  appId: "1:87049644349:web:1f363288df84fbce2a7d54",
  measurementId: "G-T7SD3733V0"
};

// Initialize Firebase
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
export const auth = firebase.auth();
export const db = firebase.firestore();