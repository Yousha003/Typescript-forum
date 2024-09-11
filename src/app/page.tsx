"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Update import
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Header from "../components/layout/Header";
import { testFirestore } from "../firebase"; // Adjust the path as necessary
import dynamic from "next/dynamic";
import ListThreads from "@/components/ListThreads";
import { auth } from '../firebase';

const Page = () => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    testFirestore();

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [isMounted, router]);

  if (!isMounted) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
    </div>;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
      router.push("/"); // Redirect to home page
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-6">
      <Header />
      <div className="p-10 bg-white shadow-lg dark:bg-gray-900 rounded-lg">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-100 pb-10">Welcome to the Forum</h1>
        
        <div className="flex justify-end">
          <a
            href="/create-thread"
            className="bg-indigo-600 text-white py-3 px-5 rounded-lg hover:bg-indigo-500 transition dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            Create Thread
          </a>
        </div>

        <div className="pt-6">
          <ListThreads />
        </div>

        <div className="pt-10 text-center">
          <a
            href="/threads"
            className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-500 transition dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            View All Threads
          </a>
        </div>

        {/* <div className="pt-10 text-center">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-500 transition"
          >
            Logout
          </button>
        </div> */}
      </div>
    </main>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });
