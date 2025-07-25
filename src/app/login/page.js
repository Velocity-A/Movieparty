"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, database } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";

export default function LoginPage() {
  const router = useRouter();
  const [isNewUser, setIsNewUser] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Load remembered email on initial render
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    // Check auth state after loading remembered email
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          router.replace("/home");
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isNewUser) {
        if (!username.trim()) {
          setMessage("Please enter a username.");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await sendEmailVerification(user);
        await set(ref(database, `users/${user.uid}`), {
          email: user.email,
          verified: false,
          username: username.trim(),
        });

        setMessage("Signup successful! Please verify your email.");
        setUsername("");
        setPassword("");
      } else {
        // Set persistence based on rememberMe selection
        await setPersistence(
          auth,
          rememberMe ? browserLocalPersistence : browserSessionPersistence
        );

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        await user.reload();

        if (!user.emailVerified) {
          setMessage("Please verify your email before logging in.");
          return;
        }

        const snapshot = await get(ref(database, `users/${user.uid}`));
        const userData = snapshot.val();

        if (!userData?.username) {
          setMessage("No username found. Please contact support.");
          return;
        }

        // Only save email if Remember Me is checked
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        localStorage.setItem("username", userData.username);
        router.push("/home");
      }
    } catch (error) {
      setMessage(error.message || "Authentication failed");
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-lg font-poppins">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex w-screen h-screen px-4 relative">
      <div className="w-1/2 bg-black h-[95%] absolute top-1/2 -translate-y-1/2 rounded-[5%] text-center text-white flex justify-center items-center font-playfair text-[48px]">
        <p>
          Bring your friends.
          <br />
          Start the night.
        </p>
      </div>

      <div className="w-1/2 h-full absolute right-0 flex flex-col px-10 py-6">
        <div className="left-1/2 -translate-x-1/2 absolute flex items-center justify-center mt-4 mb-6">
          <img src="./images/logo.svg" alt="Logo" className="h-10 w-auto" />
          <p className="font-poppins text-xl">Parti</p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="font-semibold text-[45px] font-playfair">
                {isNewUser ? "Join the Party" : "Welcome Back"}
              </h2>
              <p className="font-poppins opacity-70">
                {isNewUser
                  ? "Let’s get you set up"
                  : "Yo, welcome back to the party"}
              </p>
            </div>

            <form onSubmit={handleAuth} className="flex flex-col gap-5 w-full">
              {isNewUser && (
                <div>
                  <p className="font-poppins text-[17px]">Username</p>
                  <input
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 h-[45px] rounded-[8px] font-poppins text-[rgba(0,0,0,0.5)] bg-[#d9d9d920]"
                  />
                </div>
              )}

              <div>
                <p className="font-poppins text-[17px]">Email</p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 h-[45px] rounded-[8px] font-poppins text-[rgba(0,0,0,0.5)] bg-[#d9d9d920]"
                />
              </div>

              <div>
                <p className="font-poppins text-[17px]">Password</p>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 h-[45px] rounded-[8px] font-poppins text-[rgba(0,0,0,0.5)] bg-[#d9d9d920]"
                />
              </div>

              {!isNewUser && (
                <label className="flex items-center gap-2 mt-[-10px] font-poppins text-sm text-black">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-black"
                  />
                  Remember Me
                </label>
              )}

              {message && (
                <p className="text-red-500 text-sm text-center px-3 mt-2 font-poppins">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="w-full h-[46px] bg-black text-white rounded-[11px] font-poppins font-semibold mt-[10px] cursor-pointer hover:bg-gray-800 transition-colors"
              >
                {isNewUser ? "Sign Up" : "Sign In"}
              </button>
            </form>
          </div>
        </div>

        <div className="flex justify-center mb-6 gap-1">
          <p className="text-black text-sm font-poppins">
            {isNewUser
              ? "Already have an account?"
              : "Haven’t joined the party yet?"}
          </p>
          <span
            onClick={() => {
              setIsNewUser(!isNewUser);
              setMessage("");
            }}
            className="text-sm underline cursor-pointer font-poppins hover:text-gray-700 transition-colors"
          >
            {isNewUser ? "Sign In" : "Sign Up"}
          </span>
        </div>
      </div>
    </div>
  );
}
