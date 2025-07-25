"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getUsernameFromDB } from "@/lib/getUsername";
import { createPartyInDatabase } from "@/lib/createParty";
import Nav from "@/Components/Nav";

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

  const handleReturnHome = () => {
    router.push("/home");
  };

  return (
    <div className="flex flex-col items-center">
      <Nav username={username} />
      <div className=" flex items-center justify-center h-screen w-screen">
        {" "}
        <div className=" flex flex-col items-center justify-center  border-solid border-black border-[2px] rounded-4xl !px-[150px] !py-[50px]">
          <h2 className=" font-poppins font-bold text-4xl">Create a party</h2>
          <p className=" font-poppins opacity-[18%]">yo dude ready to party?</p>
          <div className=" text-center w-[300px] flex flex-col gap-4 !mt-[30px]">
            <div
              onClick={handleStartParty}
              disabled={loading}
              className=" !py-[15px] rounded-xl bg-[#276744] font-poppins font-medium text-white cursor-pointer "
            >
              {loading ? "Creating..." : `Create a party as ${username}`}
            </div>
            <div
              onClick={handleReturnHome}
              className=" !py-[15px] rounded-xl bg-black font-poppins font-medium text-white cursor-pointer "
            >
              Return to home
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePartyPage;
