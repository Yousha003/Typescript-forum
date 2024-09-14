import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getAnalytics } from "firebase/analytics"; // Import getAnalytics

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: "AIzaSyCDkwD-RCC0LrrxGoyUU2Z2Mkuo8MJa5eQ",
  authDomain: "typescript-fd8d2.firebaseapp.com",
  projectId: "typescript-fd8d2",
  storageBucket: "typescript-fd8d2.appspot.com",
  messagingSenderId: "89366624320",
  appId: "1:89366624320:web:be1b5358fd0c3e678fc7a5",
  measurementId: "G-0H53KDHQKM"
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
