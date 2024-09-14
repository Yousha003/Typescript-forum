'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Header from '@/components/layout/Header';
import { useRouter } from 'next/navigation';

function CreateThreadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [creator, setCreator] = useState('');
  const [locked, setLocked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCreator(user.uid);
      } else {
        console.log('User is not logged in');
        router.push("/login"); // Redirect to login if the user is not authenticated
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creator) {
      console.error("No authenticated user found");
      return;
    }

    const newThread = {
      title,
      description,
      category,
      creator,
      creationDate: new Date().toISOString(),
      locked,
    };
    
    try {
      await addDoc(collection(db, 'threads'), newThread);
      console.log('Document successfully written!');
      setTitle('');
      setDescription('');
      setCategory('');
      router.push('/');
    } catch (error) {
      console.error('Error writing document: ', error);
    }
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gradient ">
          Skapa en ny thread
        </h1>
        {creator ? (
          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 mb-6">
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-2">Titel</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                placeholder="Skriv här..."
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-2">Kategori</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                placeholder="Skriv här..."
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-2">Beskrivning</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                placeholder="Skriv här..."
                required
                rows={4}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-black text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
            >
              Klar!
            </button>
          </form>
        ) : (
          <p className="text-red-500 text-center text-lg mb-8">Logga in för att skapa en thread</p>
        )}
      </div>
    </div>
  );
}

export default CreateThreadPage;