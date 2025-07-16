// lib/addMemberToParty.js
import { database } from "./firebase";
import { ref, get, set } from "firebase/database";

export async function addMemberToParty(partyId, username) {
  const membersRef = ref(database, `parties/${partyId}/members`);
  const snapshot = await get(membersRef);
  const currentMembers = snapshot.exists() ? snapshot.val() : [];

  if (!currentMembers.includes(username)) {
    const updatedMembers = [...currentMembers, username];
    await set(membersRef, updatedMembers);
  }
}
