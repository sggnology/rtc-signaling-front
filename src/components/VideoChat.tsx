import React, { useEffect, useRef, useState } from "react";

const SIGNAL_SERVER = "ws://localhost:8080/ws";

const VideoChat: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // TODO: localhost 환경에서 ws 연결 안됨
    const ws = new WebSocket(SIGNAL_SERVER);
    setSocket(ws);

    const rtcPeer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    rtcPeer.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.send(JSON.stringify({ type: "candidate", candidate: event.candidate }));
      }
    };

    rtcPeer.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    setPeer(rtcPeer);

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "offer" && peer) {
          await peer.setRemoteDescription(new RTCSessionDescription(message));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          socket.send(JSON.stringify(answer));
        } else if (message.type === "answer" && peer) {
          await peer.setRemoteDescription(new RTCSessionDescription(message));
        } else if (message.type === "candidate" && peer) {
          await peer.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
      };
    }
  }, [socket, peer]);

  const startCall = async () => {
    if (!peer || !socket) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.send(JSON.stringify(offer));
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-200">
      <h1 className="text-xl font-bold mb-4">WebRTC 화상 통화</h1>

      <div className="grid grid-cols-2 gap-4">
        <video ref={localVideoRef} autoPlay playsInline className="w-64 h-48 border border-gray-300 rounded-lg" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-64 h-48 border border-gray-300 rounded-lg" />
      </div>

      <button
        onClick={startCall}
        className="mt-6 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
      >
        통화 시작
      </button>
    </div>
  );
};

export default VideoChat;
