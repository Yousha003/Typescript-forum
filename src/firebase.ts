import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getAnalytics } from "firebase/analytics"; // Import getAnalytics

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: "AIzaSyB_EP4-J1lVG9xNUuFxWh6MeL12S6K0SgE",
  authDomain: "ts-forum-a46e7.firebaseapp.com",
  databaseURL: "https://ts-forum-a46e7-default-rtdb.firebaseio.com",
  projectId: "ts-forum-a46e7",
  storageBucket: "ts-forum-a46e7.appspot.com",
  messagingSenderId: "315145622202",
  appId: "1:315145622202:web:38e630277fc80c240e2883",
  measurementId: "G-GQJH95665Z"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize auth
const db = getFirestore(app); // Initialize Firestore
const analytics = getAnalytics(app); // Initialize analytics

// Function to sign in the user
async function signInUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in:", userCredential.user);
  } catch (error) {
    console.error("Error signing in:", error);
  }
}

export const registerUser = async (email: string, password: string) => {
  await createUserWithEmailAndPassword(auth, email, password);
};

// Function to test Firestore setup
export async function testFirestore() {
  // Your Firestore test code here
}

export { auth, db }; // Export the auth and db objects
