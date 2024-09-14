"use client";
import Header from "@/components/layout/Header";
import React from "react";
import AllThreads from "@/components/AllThreads";

const AllThreadsPage = () => {
  return (
    <main className="container mx-auto bg-white">
      <div className="mb-20">
        <Header />
      </div>
      <div className="pt-10 flex justify-end">
        <a
          href="/create-thread"
          className="bg-white text-white py-3 px-5 rounded-md hover:opacity-75"
        >
          Create Thread
        </a>
      </div>
      <AllThreads />
      <div className="p-5"></div>
    </main>
  );
};

export default AllThreadsPage;