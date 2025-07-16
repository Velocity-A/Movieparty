"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, database } from "@/lib/firebase";
import { getUsernameFromDB } from "@/lib/getUsername";
import { ref, get } from "firebase/database";
import { addMemberToParty } from "@/lib/addMemberToParty";

const JoinPartyPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [partyId, setPartyId] = useState("");
  const [error, setError] = useState("");

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

  const handleJoin = async () => {
    if (!partyId.trim()) return;

    try {
      const partyRef = ref(database, `parties/${partyId}`);
      const snapshot = await get(partyRef);

      if (!snapshot.exists()) {
        setError("❌ Party not found. Please check the ID.");
        return;
      }

      const partyData = snapshot.val();
      const currentUsername = await getUsernameFromDB();

      if (currentUsername === partyData.hostUsername) {
        setError(
          "❌ You are the host of this party. You can’t join as a member."
        );
        return;
      }

      await addMemberToParty(partyId, currentUsername);
      router.push(`/party/${partyId}`);
    } catch (err) {
      console.error("Error joining party:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-32 p-6 border rounded shadow text-center space-y-6">
      <h1 className="text-2xl font-semibold">Join a Party</h1>
      <p className="text-gray-700">Welcome, {username}! Enter the party ID:</p>

      <input
        type="text"
        placeholder="Enter party ID"
        className="w-full px-4 py-2 border rounded"
        value={partyId}
        onChange={(e) => setPartyId(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        onClick={handleJoin}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={!partyId.trim()}
      >
        Join Party
      </button>
    </div>
  );
};

export default JoinPartyPage;
