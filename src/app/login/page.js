"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, database } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";

const LoginPage = () => {
  const router = useRouter();
  const [isNewUser, setIsNewUser] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // New state for username
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isNewUser) {
        // SIGN UP
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
        await set(ref(database, "users/" + user.uid), {
          email: user.email,
          verified: false,
          username: username.trim(),
        });

        setMessage("Signup successful! Please verify your email.");
      } else {
        // LOGIN
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

        // ✅ Fetch username from database
        const snapshot = await get(ref(database, "users/" + user.uid));
        const userData = snapshot.val();

        if (!userData?.username) {
          setMessage("No username found. Please contact support.");
          return;
        }

        // Update verified flag if needed
        await set(ref(database, "users/" + user.uid), {
          ...userData,
          verified: true,
        });

        // Save to localStorage (or context, or cookies)
        localStorage.setItem("username", userData.username);

        // ✅ Redirect to home
        router.push("/home");
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">
        {isNewUser ? "Sign Up" : "Log In"}
      </h2>
      <form onSubmit={handleAuth} className="flex flex-col gap-4">
        {isNewUser && (
          <input
            type="text"
            placeholder="Username"
            className="border px-3 py-2 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="border px-3 py-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border px-3 py-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {isNewUser ? "Sign Up" : "Log In"}
        </button>

        <p
          className="text-sm text-gray-600 cursor-pointer underline"
          onClick={() => setIsNewUser(!isNewUser)}
        >
          {isNewUser
            ? "Already have an account? Log In"
            : "Don't have an account? Sign Up"}
        </p>
      </form>

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default LoginPage;
