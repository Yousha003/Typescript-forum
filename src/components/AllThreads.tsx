import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Thread, User } from "@/types/types";
import { Timestamp } from "firebase/firestore";

type ThreadCategory = "THREAD" | "QNA";

function AllThreadsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});

  useEffect(() => {
    async function fetchData() {
      const querySnapshot = await getDocs(collection(db, "threads"));
      const threadsData = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Thread)
      );

      threadsData.sort((a, b) => {
        const dateA =
          a.creationDate instanceof Timestamp
            ? a.creationDate.toDate()
            : new Date(a.creationDate);
        const dateB =
          b.creationDate instanceof Timestamp
            ? b.creationDate.toDate()
            : new Date(b.creationDate);
        return dateB.getTime() - dateA.getTime();
      });

      setThreads(threadsData);

      const userPromises = threadsData.map((thread) => {
        // Check if thread.creator exists and is valid
        if (thread.creator) {
          return getDoc(doc(db, "users", thread.creator));
        }
        return null; // Return null if the creator is missing
      });

      // Filter out null promises
      const validUserPromises = userPromises.filter(
        (promise) => promise !== null
      );

      const userDocs = await Promise.all(validUserPromises);
      const usersData = userDocs.reduce((acc, userDoc) => {
        if (userDoc && userDoc.exists()) {
          acc[userDoc.id] = userDoc.data() as User;
        }
        return acc;
      }, {} as { [key: string]: User });
      setUsers(usersData);
    }

    fetchData();
  }, []);

  return (
    <div>
      <h2 className=" text-xl pb-3 text-center">Alla trådar</h2>
      {threads.length > 0 ? (
        <ul>
          {threads.map((thread) => (
            <li key={thread.id} className="">
              <Link href={`/threads/${thread.id}`} className="block">
                <div className=" shadow-md rounded-lg p-6 mb-6 ">
                  <div className="flex">
                    <h2 className="font-semibold flex-1 text-black text-lg">
                      {thread.title}
                    </h2>
                    <span className=" text-black text-lg">Kategori: {thread.category}</span>
                  </div>
                  <p className="text-sm text-black">
                    Publicerd av {users[thread.creator]?.userName || "Unknown"}{" "}
                    at{" "}
                    {thread.creationDate
                      ? new Intl.DateTimeFormat("sv-SE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }).format(
                          thread.creationDate instanceof Timestamp
                            ? thread.creationDate.toDate() // Convert Firestore Timestamp to JS Date
                            : new Date(thread.creationDate) // Use JavaScript Date if already a date
                        )
                      : "Unknown date"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Laddar...</p>
      )}
    </div>
  );
}

export default AllThreadsPage;
