// app/party-ended/page.js
export default function PartyEndedPage() {
  return (
    <div className="text-center mt-32">
      <h1 className="text-2xl font-bold text-red-600">❌ Party Ended</h1>
      <p className="text-gray-600 mt-2">
        The host has ended the party. You have been disconnected.
      </p>
    </div>
  );
}
