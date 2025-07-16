"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getUsernameFromDB } from "@/lib/getUsername";

const HomePage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loadUsername = async () => {
      if (!auth.currentUser) {
        router.push("/login");
        return;
      }

      const name = await getUsernameFromDB();
      if (!name) {
        router.push("/login");
      } else {
        setUsername(name);
      }
    };

    loadUsername();
  }, []);

  const handleCreateParty = () => router.push("/create");
  const handleJoinParty = () => router.push("/join");

  return (
    <div className="max-w-md mx-auto mt-32 p-6 border rounded shadow text-center space-y-6">
      <h1 className="text-2xl font-semibold">Hello, {username} 👋</h1>

      <div className="flex flex-col gap-4 mt-8">
        <button
          onClick={handleCreateParty}
          className="px-4 py-2 rounded text-white bg-green-500 hover:bg-green-600"
        >
          Create a Party
        </button>
        <button
          onClick={handleJoinParty}
          className="px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600"
        >
          Join a Party
        </button>
      </div>
    </div>
  );
};

export default HomePage;
