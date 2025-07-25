"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getUsernameFromDB } from "@/lib/getUsername";
import Nav from "@/Components/Nav";

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
    <div className="flex flex-col items-center">
      <Nav username={username} />
      <div className=" w-full h-screen flex items-center gap-6 !px-5">
        <div
          onClick={handleCreateParty}
          className=" w-1/2 h-[80%] relative rounded-[50px] bg-[#276744] hover:bg-[#335c46] transition-all ease-in-out duration-500 cursor-pointer flex items-center justify-center"
        >
          <p className=" font-poppins font-bold text-[5vw] text-white">
            Create a party
          </p>
          <div className=" w-[70%] h-auto absolute aspect-square border-white border-solid opacity-[9%] border-[6vw] rounded-[50%]"></div>
        </div>
        <div
          onClick={handleJoinParty}
          className=" w-1/2 h-[80%] relative bg-[#25566B] hover:bg-[#2a4550] transition-all ease-in-out duration-500 cursor-pointer rounded-[50px] flex items-center justify-center"
        >
          <img
            src="./Images/X.svg"
            className=" opacity-[9%] w-[50%] absolute"
            alt=""
          />
          <p className=" font-poppins font-bold text-[5vw] text-white">
            Join a Party
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
