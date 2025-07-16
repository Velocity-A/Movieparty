// lib/getUsername.js
import { auth, database } from "./firebase";
import { ref, get } from "firebase/database";

export async function getUsernameFromDB() {
  const user = auth.currentUser;

  if (!user) return null;

  const snapshot = await get(ref(database, "users/" + user.uid));
  const data = snapshot.val();
  return data?.username || null;
}
