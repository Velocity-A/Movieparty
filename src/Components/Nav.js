"use client";

import React from "react";
import { useRouter } from "next/navigation";

const Nav = ({ username }) => {
  const router = useRouter();

  return (
    <div className="fixed container !pt-5 bg-white z-50 flex items-center font-poppins justify-between">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => router.push("/home")}
      >
        <img src="./Images/logo.svg" className="h-10 w-auto" alt="Logo" />
        <p className="text-xl ml-2">Parti</p>
      </div>
      <ul className="font-poppins text-[16px] flex gap-5">
        <li>
          <a className="cursor-pointer">Home</a>
        </li>
        <li>
          <a className="cursor-pointer">Developer</a>
        </li>
        <li>
          <a className="cursor-pointer">Terms of use</a>
        </li>
        <li>
          <a className="cursor-pointer">About us</a>
        </li>
      </ul>
      <p className="font-medium text-[16px]">Hello, {username || "unknown"}</p>
    </div>
  );
};

export default Nav;
