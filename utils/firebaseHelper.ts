// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0cSbqcr8HTCoz7F8hxqsX7yC6GIwWs2A",
  authDomain: "ping-ac23a.firebaseapp.com",
  projectId: "ping-ac23a",
  storageBucket: "ping-ac23a.appspot.com",
  messagingSenderId: "1072813130309",
  appId: "1:1072813130309:web:b1a08f6bf9f24c7098592c",
  measurementId: "G-LYBFJB7F42"
};

// Initialize Firebase
export const getFirebaseApp = () => initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);