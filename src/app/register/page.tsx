"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Header from "@/components/layout/Header";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // New state for username
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store the username in Firestore
      await setDoc(doc(db, "users", user.uid), {
        userName: username,
        email: user.email,
        UserUID: user.uid
      });

      setSuccess("User registered successfully!");
      setError("");
      router.push("/"); // Redirect to home page or another page
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("User with email already exists.");
      } else {
        setError(err.message || "Failed to register user");
      }
      setSuccess("");
    }
  };

  return (
    <div className="mx-auto container min-h-screen">
      <Header />
      <div className="flex justify-center items-center min-h-screen">
        <div className="p-8 rounded-lg shadow-lg max-w-lg w-full">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Registrera dig här!</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block mb-2 text-gray-700">E-post:</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-gray-700">Användarnamn:</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-gray-700">Lösenord:</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {success && <p className="text-green-500 mb-4">{success}</p>}
            <button
              type="submit"
              className="w-full bg-black text-white p-3 rounded-lg transition"
            >
              Klart
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;