"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, database } from "@/lib/firebase";
import { getUsernameFromDB } from "@/lib/getUsername";
import { ref, get } from "firebase/database";
import { addMemberToParty } from "@/lib/addMemberToParty";
import Nav from "@/Components/Nav";

const JoinPartyPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [partyId, setPartyId] = useState("");
  const [error, setError] = useState("");
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

  const handleJoin = async () => {
    if (!partyId.trim()) {
      setError("❌ Please enter a party ID.");
      return;
    }

    setLoading(true);
    setError("");

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Nav username={username} />
      <div className="flex items-center justify-center h-screen w-screen">
        <div className="flex flex-col items-center justify-center border-solid border-black border-[2px] rounded-4xl !px-[100px] !py-[50px]">
          <h2 className="font-poppins font-bold text-4xl">Join a party</h2>
          <p className="font-poppins opacity-[18%]">
            Welcome, {username}! Enter the party ID:
          </p>
          <div className="!mt-[20px] flex gap-2 items-center">
            <input
              type="text"
              placeholder="Enter the party id"
              required
              value={partyId} // ✅ bind state
              onChange={(e) => setPartyId(e.target.value)} // ✅ update state
              className="w-[400px] !px-3 h-[45px] rounded-[8px] font-poppins text-[rgba(0,0,0,0.5)] bg-[#d9d9d920]"
            />
            <div
              className="w-[45px] h-[45px] bg-accent flex items-center justify-center text-[14px] font-poppins font-medium text-white rounded-[9px] cursor-pointer"
              onClick={handleJoin} // ✅ call handler
            >
              {loading ? "..." : "Go!"} {/* ✅ loading indicator */}
            </div>
          </div>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default JoinPartyPage;
