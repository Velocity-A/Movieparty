// lib/cleanupParties.js
import { database } from "./firebase";
import { ref, get, remove } from "firebase/database";

export async function cleanupInactiveParties(timeout = 30000) {
  const partiesRef = ref(database, "parties");
  const snapshot = await get(partiesRef);

  if (!snapshot.exists()) return;

  const allParties = snapshot.val();
  const now = Date.now();

  for (const partyId in allParties) {
    const party = allParties[partyId];
    if (!party.lastActive || now - party.lastActive > timeout) {
      await remove(ref(database, `parties/${partyId}`));
      console.log(`🗑 Removed inactive party: ${partyId}`);
    }
  }
}
