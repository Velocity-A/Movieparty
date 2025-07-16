// lib/createParty.js
import { auth, database } from "./firebase";
import { ref, push, set, get } from "firebase/database";

export async function createPartyInDatabase() {
  const user = auth.currentUser;
  if (!user || !user.uid) throw new Error("User not authenticated");

  const userSnap = await get(ref(database, `users/${user.uid}`));
  const username = userSnap.val()?.username;
  if (!username) throw new Error("Username not found");

  const partyRef = ref(database, "parties");
  const newPartyKey = push(partyRef).key;

  const partyData = {
    partyId: newPartyKey,
    hostUsername: username,
    createdAt: Date.now(),
    lastActive: Date.now(), // ✅ for heartbeat
    members: [],
    status: "waiting",
  };

  await set(ref(database, `parties/${newPartyKey}`), partyData);
  return newPartyKey;
}
