import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirestore, collection, getDocs } from "firebase/firestore";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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

  return (
    <header className="bg-white mx-4 my-6 p-6 flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-2xl font-bold text-black">
          <Link href="/" className="text-black hover:text-red-500">
            Chit Chat
          </Link>
        </span>
      </div>

      <nav className="flex items-center space-x-6 mx-auto">
        <Link href="/" className="text-black hover:text-red-500">
          Hem
        </Link>
        <Link href="/threads" className="text-black hover:text-red-500">
          Trådar
        </Link>

        {isLoggedIn ? (
          <>
            <button
              onClick={handleLogout}
              className="text-black hover:text-red-500"
            >
              Logga ut
            </button>
            {error && <p className="text-red-500">{error}</p>}
          </>
        ) : (
          <>
            <Link href="/login" className=" text-black hover:text-red-500">
              Logga in
            </Link>
            <Link href="/register" className="bg-black text-white px-4 py-2 rounded-full hover:bg-red-500">
              Registrera
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;