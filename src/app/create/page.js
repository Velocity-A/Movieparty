"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getUsernameFromDB } from "@/lib/getUsername";
import { createPartyInDatabase } from "@/lib/createParty";

const CreatePartyPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleStartParty = async () => {
    try {
      setLoading(true);
      const partyId = await createPartyInDatabase();

      // ❌ Avoid: router.push(`/party/${partyId}`);
      // ✅ Use: hard reload to activate real disconnect tracking
      window.location.href = `/party/${partyId}`;
    } catch (error) {
      console.error("Error creating party:", error.message);
      alert("Failed to create party.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-32 p-6 border rounded shadow text-center space-y-6">
      <h1 className="text-2xl font-semibold">Create a Party</h1>
      <p className="text-gray-700">
        Hello, {username}! Ready to start your party?
      </p>

      <button
        onClick={handleStartParty}
        disabled={loading}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        {loading ? "Creating..." : "Start Party"}
      </button>
    </div>
  );
};

export default CreatePartyPage;
