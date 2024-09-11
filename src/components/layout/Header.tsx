import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirestore, collection, getDocs } from "firebase/firestore";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedMode);
    document.documentElement.classList.toggle('dark', savedMode);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        try {
          const db = getFirestore();
          const querySnapshot = await getDocs(collection(db, "threads"));
          querySnapshot.forEach((doc) => {
            console.log(`${doc.id} => ${doc.data()}`);
          });
        } catch (err) {
          console.error("Error accessing Firestore: ", err);
          setError("Failed to access Firestore");
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode.toString()); // Convert boolean to string
      document.documentElement.classList.toggle("dark", newMode);
      return newMode;
    });
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg rounded-lg mx-4 my-6 p-6 flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition">
            Welcome to NoneSense Forum!
          </Link>
        </span>
      </div>

      <nav className="flex items-center space-x-6">
        <Link href="/" className="text-lg text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
          Home
        </Link>
        <Link href="/threads" className="text-lg text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
          Threads
        </Link>

        <button
          onClick={toggleDarkMode}
          className="bg-gray-200 dark:bg-gray-800 p-2 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
        >
          {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        {isLoggedIn ? (
          <>
            <button
              onClick={handleLogout}
              className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-500 transition"
            >
              Logout
            </button>
            {error && <p className="text-red-500">{error}</p>}
          </>
        ) : (
          <>
            <Link href="/login" className="text-lg text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Log In
            </Link>
            <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-500 transition">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
