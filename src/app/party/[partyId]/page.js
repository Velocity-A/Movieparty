"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { auth, database } from "@/lib/firebase";
import { ref, get, onValue, update, onDisconnect } from "firebase/database";
import { getUsernameFromDB } from "@/lib/getUsername";

const PartyPage = () => {
  const { partyId } = useParams();
  const router = useRouter();

  const [party, setParty] = useState(null);
  const [members, setMembers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [videoURL, setVideoURL] = useState("");
  const [video, setVideo] = useState(null);
  const [playback, setPlayback] = useState(null);

  const videoRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await get(ref(database, `parties/${partyId}`));
      if (!snapshot.exists()) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const partyData = snapshot.val();
      setParty(partyData);
      setMembers(partyData.members || []);

      const name = await getUsernameFromDB();
      setUsername(name);
      setIsHost(name === partyData.hostUsername);

      setLoading(false);
    };

    fetchData();
  }, [partyId]);

  useEffect(() => {
    const membersRef = ref(database, `parties/${partyId}/members`);
    const unsubscribe = onValue(membersRef, (snapshot) => {
      const data = snapshot.val();
      setMembers(data ? data : []);
    });

    return () => unsubscribe();
  }, [partyId]);

  useEffect(() => {
    const videoRef = ref(database, `parties/${partyId}/video`);
    const unsubscribe = onValue(videoRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setVideo(data);
      }
    });

    return () => unsubscribe();
  }, [partyId]);

  useEffect(() => {
    if (!isHost) return;

    const interval = setInterval(() => {
      update(ref(database, `parties/${partyId}`), {
        lastActive: Date.now(),
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [isHost, partyId]);

  useEffect(() => {
    if (!isHost) return;

    const connectedRef = ref(database, ".info/connected");
    const partyRef = ref(database, `parties/${partyId}`);

    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        setTimeout(() => {
          onDisconnect(partyRef).remove();
        }, 3000);
      }
    });

    return () => {};
  }, [isHost, partyId]);

  useEffect(() => {
    if (isHost) return;

    const partyRef = ref(database, `parties/${partyId}`);
    const unsubscribe = onValue(partyRef, (snapshot) => {
      if (!snapshot.exists()) {
        router.replace("/party-ended");
      }
    });

    return () => unsubscribe();
  }, [isHost, partyId]);

  useEffect(() => {
    if (isHost) return;

    const timeout = setTimeout(() => {
      const playbackRef = ref(database, `parties/${partyId}/playback`);
      const unsubscribe = onValue(playbackRef, (snapshot) => {
        const data = snapshot.val();
        const video = videoRef.current;
        if (!data || !video) return;

        console.log("SYNCING PLAYBACK", data);

        const timeDiff = Math.abs(video.currentTime - data.currentTime);
        if (timeDiff > 1) {
          video.currentTime = data.currentTime;
        }

        if (data.playing && video.paused) {
          video.play();
        } else if (!data.playing && !video.paused) {
          video.pause();
        }
      });

      return () => unsubscribe();
    }, 100);

    return () => clearTimeout(timeout);
  }, [isHost, partyId]);

  const handleSetVideo = async () => {
    if (!videoURL.trim()) return;
    try {
      const partyRef = ref(database, `parties/${partyId}`);
      await update(partyRef, {
        video: {
          url: videoURL,
          name: "Selected Video",
        },
      });
      setVideo({ url: videoURL, name: "Selected Video" });
    } catch (error) {
      console.error("Failed to set video:", error.message);
    }
  };

  const handlePlay = () => {
    const currentTime = videoRef.current?.currentTime || 0;
    update(ref(database, `parties/${partyId}/playback`), {
      playing: true,
      currentTime,
    });
  };

  const handlePause = () => {
    const currentTime = videoRef.current?.currentTime || 0;
    update(ref(database, `parties/${partyId}/playback`), {
      playing: false,
      currentTime,
    });
  };

  const handleSeek = () => {
    const currentTime = videoRef.current?.currentTime || 0;
    update(ref(database, `parties/${partyId}/playback`), {
      playing: !videoRef.current?.paused,
      currentTime,
    });
  };

  if (loading) return <p className="text-center mt-20">Loading party...</p>;
  if (notFound) {
    return (
      <div className="text-center mt-32 text-red-500">
        <h1 className="text-2xl font-bold">❌ Party Not Found</h1>
        <p>Make sure the party ID is correct or create a new one.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-32 p-6 border rounded shadow text-center space-y-6">
      <h1 className="text-2xl font-bold">🎉 Party Started!</h1>
      <p>
        <strong>Party ID:</strong> {party.partyId}
      </p>
      <p>
        <strong>Host:</strong> {party.hostUsername}
      </p>

      <div className="mt-6 text-left">
        <h2 className="text-lg font-semibold mb-2">👥 Members:</h2>
        {members.length > 0 ? (
          <ul className="list-disc pl-5">
            {members.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No members yet</p>
        )}
      </div>

      {isHost && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">🎬 Select Video</h2>
          <input
            type="text"
            placeholder="Enter video URL"
            className="w-full p-2 border rounded mb-2"
            value={videoURL}
            onChange={(e) => setVideoURL(e.target.value)}
          />
          <button
            onClick={handleSetVideo}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Set Video
          </button>
        </div>
      )}

      {video && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">🎥 Now Playing:</h2>
          <p className="text-gray-700">{video.name}</p>
          <video
            ref={videoRef}
            src={video.url}
            controls
            muted
            className="w-full mt-2 rounded border"
            onPlay={isHost ? handlePlay : undefined}
            onPause={isHost ? handlePause : undefined}
            onSeeked={isHost ? handleSeek : undefined}
          />
        </div>
      )}
    </div>
  );
};

export default PartyPage;
