"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Header from "@/components/layout/Header";
import { Thread, User, Comment } from "@/types/types";
import CommentOnComment from "@/components/CommentOnComment";

const ThreadDetailPage: React.FC = () => {
  const pathname = usePathname();
  const [thread, setThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [creatorName, setCreatorName] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({});
  const [currentUserUID, setCurrentUserUID] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [markedAnswerId, setMarkedAnswerId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUserUID(user.uid);

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setCurrentUserName(userData.userName);
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    const pathSegments = pathname?.split("/");
    const threadId = pathSegments
      ? pathSegments[pathSegments.length - 1]
      : null;

    if (threadId) {
      const fetchThread = async () => {
        try {
          const threadDoc = await getDoc(doc(db, "threads", threadId));
          if (threadDoc.exists()) {
            const threadData = threadDoc.data() as Thread;
            setThread({ ...threadData, id: threadDoc.id });
            setIsLocked(threadData.locked);
            setMarkedAnswerId(threadData.markedAnswerId || null);

            const userDoc = await getDoc(doc(db, "users", threadData.creator));
            if (userDoc.exists()) {
              const userData = userDoc.data() as User;
              setCreatorName(userData.userName);
            }
          }
        } catch (error) {
          console.error("Error fetching thread:", error);
        }
      };

      const fetchComments = async () => {
        try {
          const commentsQuery = query(
            collection(db, "comments"),
            where("threadId", "==", threadId)
          );
          const commentsSnapshot = await getDocs(commentsQuery);
          const commentsData = commentsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: (data.createdAt as Timestamp) || Timestamp.now(),
            };
          }) as Comment[];
          setComments(commentsData);

          const usernamesMap: { [key: string]: string } = {};
          await Promise.all(
            commentsData.map(async (comment) => {
              if (!usernamesMap[comment.creator]) {
                const userDoc = await getDoc(doc(db, "users", comment.creator));
                if (userDoc.exists()) {
                  const userData = userDoc.data() as User;
                  usernamesMap[comment.creator] = userData.userName;
                }
              }
            })
          );
          setUsernames(usernamesMap);
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      };

      fetchThread();
      fetchComments();
    }
  }, [pathname]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pathSegments = pathname?.split("/");
    const threadId = pathSegments
      ? pathSegments[pathSegments.length - 1]
      : null;
    if (threadId && newComment.trim() && currentUserUID) {
      try {
        const newCommentData = {
          content: newComment,
          createdAt: serverTimestamp(),
          creator: currentUserUID,
          threadId: threadId,
          markedAsAnswer: false,
        };
        const docRef = await addDoc(collection(db, "comments"), newCommentData);
        const addedComment = {
          ...newCommentData,
          id: docRef.id,
          createdAt: Timestamp.now(),
        } as Comment;
        setComments([...comments, addedComment]);
        setNewComment("");

        if (!usernames[currentUserUID]) {
          const userDoc = await getDoc(doc(db, "users", currentUserUID));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUsernames((prevUsernames) => ({
              ...prevUsernames,
              [currentUserUID]: userData.userName,
            }));
          }
        }
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const handleMarkAsAnswer = async (commentId: string) => {
    if (thread && thread.creator === currentUserUID) {
      const newMarkedAnswerId = markedAnswerId === commentId ? null : commentId;
      setMarkedAnswerId(newMarkedAnswerId);
      try {
        await updateDoc(doc(db, "threads", thread.id), {
          markedAnswerId: newMarkedAnswerId,
        });
      } catch (error) {
        console.error("Error marking comment as answer:", error);
      }
    }
  };

  const sortedComments = comments.sort((a, b) => {
    if (a.id === markedAnswerId) return -1;
    if (b.id === markedAnswerId) return 1;
    return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
  });

  return (
    <div>
      <Header />
      <div className="container mx-auto p-6 max-w-4xl">
        {thread ? (
          <div className="bg-white shadow-xl rounded-lg p-8 mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-black">
                {thread.title}
              </h1>
              {isLoggedIn && thread.creator === currentUserUID && (
                <button
                  onClick={async () => {
                    try {
                      await updateDoc(doc(db, "threads", thread.id), {
                        locked: !isLocked,
                      });
                      setIsLocked(!isLocked);
                    } catch (error) {
                      console.error(
                        "Error updating thread lock status:",
                        error
                      );
                    }
                  }}
                  className={`p-3 rounded-md text-white font-semibold ${
                    isLocked ? "bg-blue-500 " : "bg-red-500 "
                  } transition-all`}
                >
                  {isLocked ? "Låst" : "Upplåst"}
                </button>
              )}
            </div>
            <p className="text-lg text-black mt-4 whitespace-pre-wrap">
              {thread.description}
            </p>
            <div className="text-sm text-gray-500 mt-4">
              <p>
                Skapad av:{" "}
                <span className="font-semibold text-black">
                  {creatorName}
                </span>
              </p>

              <p>
                Kategori:{" "}
                <span className="font-semibold">{thread.category}</span>
              </p>

              <p>
                Datum och tid: {new Date(thread.creationDate).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <p>Laddar</p>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Kommentarer</h2>
          {isLoggedIn && !isLocked && (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 border  rounded-lg shadow focus:outline-none focus:ring-2  transition-all"
                placeholder="Kommentera här..."
                required
              />
              <button
                type="submit"
                className="mt-4 bg-red-400 text-white border  p-3 rounded-lg hover:bg-blue-700 transition"
              >
                Skicka
              </button>
            </form>
          )}

          {sortedComments.length > 0 ? (
            sortedComments.map((comment) => (
              <div
                key={comment.id}
                className={`bg-gray-100 shadow-lg rounded-lg p-6 mb-6 relative ${
                  comment.id === markedAnswerId
                    ? "border-4 border-green-600"
                    : ""
                }`}
              >
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500 font-semibold">
                    Kommenterad av: {usernames[comment.creator] || "Unknown"}
                  </p>
                  {isLoggedIn && thread?.creator === currentUserUID && (
                    <button
                      onClick={() => handleMarkAsAnswer(comment.id)}
                      className="text-red-500 text-xs hover:underline"
                    >
                      {comment.id === markedAnswerId ? "Avmarkera" : "Markera"}
                    </button>
                  )}
                </div>
                <p className="mt-2 text-black whitespace-pre-wrap">
                  {comment.content}
                </p>
                <p className="mt-4 text-black text-xs">
                  {comment.createdAt.toDate().toLocaleString()}
                </p>
                {comment.id === markedAnswerId && (
                  <p className="text-green-500 text-xs mt-2">Bästa kommentar</p>
                )}
                <hr className="mt-4" />
                <CommentOnComment />
              </div>
            ))
          ) : (
            <p className="text-black">
              {isLocked ? "Låst." : "Inga kommentarer än."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadDetailPage;
