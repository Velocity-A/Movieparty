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
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const hideTimeout = useRef(null);

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
    <div className="h-screen w-screen bg-black text-white overflow-hidden relative">
      {/* Top-left Party Info */}
      <div className="absolute top-4 left-4 z-30 bg-black/60 backdrop-blur-sm p-2 rounded shadow text-sm">
        <p>
          <span className="font-semibold">Party ID:</span> {party.partyId}
        </p>
        <p>
          <span className="font-semibold">Host:</span> {party.hostUsername}
        </p>
      </div>

      {/* Leave Party Button */}
      <button
        onClick={() => router.push("/")}
        className=" top-4 left-4 mt-20 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm z-30"
      >
        Leave Party
      </button>

      {/* Sidebar Members */}
      <div
        onMouseEnter={() => {
          clearTimeout(hideTimeout.current);
          setSidebarVisible(true);
        }}
        onMouseLeave={() => {
          hideTimeout.current = setTimeout(() => {
            setSidebarVisible(false);
          }, 200);
        }}
        className={`absolute top-0 right-0 h-full w-64 bg-black/80 backdrop-blur-lg p-4 transition-transform duration-500 ease-in-out z-10 ${
          sidebarVisible ? "translate-x-0" : "translate-x-63"
        }`}
      >
        <h2 className="text-xl font-bold mb-4 border-b pb-2">👥 Members</h2>
        {members.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {members.map((name, index) => (
              <li key={index} className="border-b border-gray-700 pb-1">
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No members yet</p>
        )}
      </div>

      {/* Main Video Player Area */}
      <div className="flex flex-col items-center justify-center h-full w-full px-4">
        {isHost && (
          <div className="absolute bottom-6 left-6 z-20 bg-black/70 p-4 rounded shadow w-[300px]">
            <h2 className="text-lg font-semibold mb-2">🎬 Select Video</h2>
            <input
              type="text"
              placeholder="Enter video URL"
              className="w-full p-2 text-black rounded mb-2"
              value={videoURL}
              onChange={(e) => setVideoURL(e.target.value)}
            />
            <button
              onClick={handleSetVideo}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
            >
              Set Video
            </button>
          </div>
        )}

        {video ? (
          <div className="w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              src={video.url}
              controls={isHost}
              muted
              onContextMenu={(e) => !isHost && e.preventDefault()}
              className="w-full h-full object-contain bg-black"
              onPlay={isHost ? handlePlay : undefined}
              onPause={isHost ? handlePause : undefined}
              onSeeked={isHost ? handleSeek : undefined}
            />
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <p className="text-lg">No video selected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartyPage;
