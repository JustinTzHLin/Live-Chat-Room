"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeOff,
  Phone,
} from "lucide-react";
import "./style.css";
import { useUserStore } from "@/stores/userStore";
import { useSocketStore } from "@/stores/socketStore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const Page = () => {
  const [startBtnDisabled, setStartBtnDisabled] = useState(false);
  const [hangupBtnDisabled, setHangupBtnDisabled] = useState(true);
  const [micBtnDisabled, setMicBtnDisabled] = useState(true);
  const [soundBtnDisabled, setSoundBtnDisabled] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const peerConnectionRef = useRef<null | RTCPeerConnection>(null);
  const localStreamRef = useRef<null | MediaStream>(null);
  const localVideo = useRef<null | HTMLVideoElement>(null);
  const remoteVideo = useRef<null | HTMLVideoElement>(null);
  const { userInformation } = useUserStore((state) => state);
  const { socket, connect } = useSocketStore((state) => state);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const onMaxRetries = () => {
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Please refresh the page and try again later.",
        duration: 3000,
      });
      router.push("/home");
    };
    connect(onMaxRetries);
    return () => {
      useSocketStore.getState().disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on(
        "webrtc_call",
        (
          e: (RTCSessionDescriptionInit | RTCIceCandidateInit) & {
            type: string;
          }
        ) => {
          if (!localStreamRef.current) {
            console.log("not ready yet");
            return;
          }
          switch (e.type) {
            case "offer":
              handleOffer(e as RTCSessionDescriptionInit);
              break;
            case "answer":
              handleAnswer(e as RTCSessionDescriptionInit);
              break;
            case "candidate":
              handleCandidate(e);
              break;
            case "ready":
              if (peerConnectionRef.current)
                console.log("already in call, ignoring");
              else makeCall();
              break;
            case "bye":
              if (peerConnectionRef.current) hangup();
              break;
            default:
              console.log("unhandled", e);
              break;
          }
        }
      );
      return () => {
        socket.off("webrtc_call");
      };
    }
  }, [socket]);

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (peerConnectionRef.current) {
      console.error("existing peerconnection");
      return;
    }
    try {
      peerConnectionRef.current = new RTCPeerConnection(configuration);
      peerConnectionRef.current.onicecandidate = (e) => {
        const message = {
          type: "candidate",
          userId: userInformation.userId,
          candidate: e.candidate?.candidate || null,
          sdpMid: e.candidate?.sdpMid,
          sdpMLineIndex: e.candidate?.sdpMLineIndex,
        };
        socket.emit("webrtc_call", message);
      };
      peerConnectionRef.current.ontrack = (e) => {
        if (remoteVideo.current) remoteVideo.current.srcObject = e.streams[0];
      };
      if (localStreamRef.current && peerConnectionRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) =>
            peerConnectionRef.current!.addTrack(track, localStreamRef.current!)
          );
      }
      await peerConnectionRef.current.setRemoteDescription(offer);

      const answer = await peerConnectionRef.current.createAnswer();
      socket.emit("webrtc_call", {
        type: "answer",
        sdp: answer.sdp,
        userId: userInformation.userId,
      });
      await peerConnectionRef.current.setLocalDescription(answer);
    } catch (e) {
      console.log(e);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) {
      console.error("no peerconnection");
      return;
    }
    try {
      await peerConnectionRef.current.setRemoteDescription(answer);
    } catch (e) {
      console.log(e);
    }
  };

  const handleCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      if (!peerConnectionRef.current) {
        console.error("no peerconnection");
        return;
      }
      await peerConnectionRef.current.addIceCandidate(candidate || null);
    } catch (e) {
      console.log(e);
    }
  };

  const makeCall = async () => {
    try {
      peerConnectionRef.current = new RTCPeerConnection(configuration);
      peerConnectionRef.current.onicecandidate = (e) => {
        const message = {
          type: "candidate",
          userId: userInformation.userId,
          candidate: e.candidate?.candidate || null,
          sdpMid: e.candidate?.sdpMid,
          sdpMLineIndex: e.candidate?.sdpMLineIndex,
        };
        socket.emit("webrtc_call", message);
      };
      peerConnectionRef.current.ontrack = (e) => {
        if (remoteVideo.current) remoteVideo.current.srcObject = e.streams[0];
      };
      if (peerConnectionRef.current && localStreamRef.current)
        localStreamRef.current
          .getTracks()
          .forEach((track) =>
            peerConnectionRef.current!.addTrack(track, localStreamRef.current!)
          );
      const offer = await peerConnectionRef.current.createOffer();
      socket.emit("webrtc_call", {
        type: "offer",
        sdp: offer.sdp,
        userId: userInformation.userId,
      });
      await peerConnectionRef.current.setLocalDescription(offer);
    } catch (e) {
      console.log(e);
    }
  };

  const hangup = async () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current)
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setStartBtnDisabled(false);
    setHangupBtnDisabled(true);
    setMicBtnDisabled(true);
    setSoundBtnDisabled(true);
  };

  const handleStartBtnClick = async () => {
    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { echoCancellation: true },
      });
      if (localVideo.current) {
        localVideo.current.srcObject = localStreamRef.current;
        localVideo.current.muted = true;
      }
    } catch (err) {
      console.log(err);
    }

    setStartBtnDisabled(true);
    setHangupBtnDisabled(false);
    setMicBtnDisabled(false);
    setSoundBtnDisabled(false);

    socket.emit("webrtc_call", {
      type: "ready",
      userId: userInformation.userId,
    });
  };

  const handleHangupBtnClick = async () => {
    hangup();
    socket.emit("webrtc_call", { type: "bye", userId: userInformation.userId });
  };

  const muteAudio = () => {
    setMicOn(!micOn);
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
  };

  const muteSound = () => {
    if (!remoteVideo.current) return;
    if (soundOn) {
      remoteVideo.current.muted = true;
      setSoundOn(false);
    } else {
      remoteVideo.current.muted = false;
      setSoundOn(true);
    }
  };

  return (
    <main className="flex flex-col p-4 gap-4">
      <div className="flex flex-col md:flex-row items-center justify-around bg-slate-200">
        <video
          ref={localVideo}
          className="w-[90%] h-64 md:w-[40%] h-96 border-4 border-slate-50 rounded-lg m-3 bg-slate-900"
          autoPlay
          playsInline
        ></video>
        <video
          ref={remoteVideo}
          className="w-[90%] h-64 md:w-[40%] h-96 border-4 border-slate-50 rounded-lg m-3 bg-slate-900"
          autoPlay
          playsInline
        ></video>
      </div>
      <div className="flex justify-center gap-x-5 mt-3">
        <Button
          className="w-16 h-16 rounded-full"
          disabled={startBtnDisabled}
          onClick={handleStartBtnClick}
        >
          <Video style={{ width: "26px", height: "26px" }} />
        </Button>
        <Button
          className="w-16 h-16 rounded-full"
          disabled={hangupBtnDisabled}
          onClick={handleHangupBtnClick}
          variant="destructive"
        >
          <Phone style={{ width: "26px", height: "26px" }} />
        </Button>
        <Button
          className="w-16 h-16 rounded-full"
          disabled={micBtnDisabled}
          onClick={muteAudio}
        >
          {micOn ? (
            <Mic style={{ width: "26px", height: "26px" }} />
          ) : (
            <MicOff style={{ width: "26px", height: "26px" }} />
          )}
        </Button>
        <Button
          className="w-16 h-16 rounded-full"
          disabled={soundBtnDisabled}
          onClick={muteSound}
        >
          {soundOn ? (
            <Volume2 style={{ width: "26px", height: "26px" }} />
          ) : (
            <VolumeOff style={{ width: "26px", height: "26px" }} />
          )}
        </Button>
      </div>
    </main>
  );
};

export default Page;
