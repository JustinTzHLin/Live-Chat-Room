"use client";

import { useRef, useEffect, useState, Suspense } from "react";
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
import { useUserStore, Friend } from "@/stores/userStore";
import { useSocketStore } from "@/stores/socketStore";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import axios from "axios";

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const Page = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [infoTokenVerified, setInfoTokenVerified] = useState(false);
  const [socketSetted, setSocketSetted] = useState(false);
  const [callSetted, setCallSetted] = useState(false);
  const [videoShareBtnDisabled, setVideoShareBtnDisabled] = useState(true);
  const [hangupBtnDisabled, setHangupBtnDisabled] = useState(true);
  const [micBtnDisabled, setMicBtnDisabled] = useState(true);
  const [soundBtnDisabled, setSoundBtnDisabled] = useState(true);
  const [videoOn, setVideoOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  interface CallersInfo {
    caller: Friend;
    callee: Friend;
  }
  const [callersInfo, setCallersInfo] = useState<CallersInfo | null>(null);
  const peerConnectionRef = useRef<null | RTCPeerConnection>(null);
  const localStreamRef = useRef<null | MediaStream>(null);
  const localVideo = useRef<null | HTMLVideoElement>(null);
  const remoteVideo = useRef<null | HTMLVideoElement>(null);
  const { userInformation } = useUserStore((state) => state);
  const { socket, connect } = useSocketStore((state) => state);
  const { handleUnexpectedError } = useUnexpectedErrorHandler();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const getCallerInfoToken = async () => {
      try {
        const callerInfoToken = searchParams.get("callerInfoToken");
        if (!callerInfoToken) {
          toast({
            variant: "destructive",
            title: "Info not found",
            description: "Please try again.",
            duration: 3000,
          });
          window.close();
          return router.push("/home");
        }
        const verifyCallerInfoTokenResponse = await axios.post(
          `${BACKEND_URL}/token/verifyParamToken`,
          {
            token: callerInfoToken,
          },
          { withCredentials: true }
        );
        if (!verifyCallerInfoTokenResponse.data.tokenVerified) {
          toast({
            variant: "destructive",
            title: "Token malformed",
            description: "The token is malformed. Please try again.",
            duration: 3000,
          });
          window.close();
          return router.push("/home");
        }
        setCallersInfo(verifyCallerInfoTokenResponse.data.decoded);
        setInfoTokenVerified(true);
      } catch (err) {
        handleUnexpectedError(err);
      }
    };
    getCallerInfoToken();
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
            callersInfo: CallersInfo;
          }
        ) => {
          if (!localStreamRef.current) {
            return console.log("not ready yet");
          }
          switch (e.type) {
            case "offer":
              return handleOffer(e as RTCSessionDescriptionInit);
            case "answer":
              return handleAnswer(e as RTCSessionDescriptionInit);
            case "candidate":
              return handleCandidate(e);
            case "ready":
              if (peerConnectionRef.current)
                return console.log("already in call, ignoring");
              else return makeCall();
            case "bye":
              if (peerConnectionRef.current) return hangup();
            default:
              console.log("unhandled", e);
          }
        }
      );
      setSocketSetted(true);
      return () => {
        socket.off("webrtc_call");
      };
    } else {
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
    }
  }, [socket]);

  useEffect(() => {
    const callInitialization = async () => {
      if (socketSetted && infoTokenVerified && callersInfo) {
        try {
          localStreamRef.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: { echoCancellation: true },
          });
          if (localVideo.current) {
            localVideo.current.srcObject = localStreamRef.current;
            localVideo.current.muted = true;
            localStreamRef.current?.getVideoTracks().forEach((track) => {
              track.enabled = false;
            });
            setCallSetted(true);
            socket.emit("webrtc_call", {
              type: "ready",
              callersInfo,
            });
            socket.emit("webrtc_call", {
              type: "call_request",
              callersInfo,
            });
          } else throw new Error("No local video");
        } catch (err) {
          console.log(err);
        }
      }
    };
    callInitialization();
  }, [socketSetted, infoTokenVerified, callersInfo]);

  useEffect(() => {
    setVideoShareBtnDisabled(!callSetted);
    setHangupBtnDisabled(!callSetted);
    setMicBtnDisabled(!callSetted);
    setSoundBtnDisabled(!callSetted);
  }, [callSetted]);

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
          callersInfo,
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
        callersInfo,
        sdp: answer.sdp,
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
    console.log("Making call");
    try {
      peerConnectionRef.current = new RTCPeerConnection(configuration);
      peerConnectionRef.current.onicecandidate = (e) => {
        const message = {
          type: "candidate",
          callersInfo,
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
        callersInfo,
        sdp: offer.sdp,
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
    setCallSetted(false);
    window.close();
    return router.push("/home");
  };

  const handleHangupBtnClick = async () => {
    hangup();
    socket.emit("webrtc_call", { type: "bye", callersInfo });
  };

  const stopVideoSharing = () => {
    setVideoOn(!videoOn);
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !videoOn;
    });
  };

  const muteAudio = () => {
    setMicOn(!micOn);
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !micOn;
    });
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
    infoTokenVerified && (
      <main className="flex flex-col p-4 gap-4">
        <div className="flex flex-col md:flex-row items-center justify-around bg-slate-200">
          <video
            ref={localVideo}
            className="w-[90%] h-64 md:w-[40%] h-96 border-4 border-slate-50 rounded-lg m-3 bg-slate-900"
            autoPlay
            playsInline
          />
          <video
            ref={remoteVideo}
            className="w-[90%] h-64 md:w-[40%] h-96 border-4 border-slate-50 rounded-lg m-3 bg-slate-900"
            autoPlay
            playsInline
          />
        </div>
        <div className="flex justify-center gap-x-5 mt-3">
          <Button
            className="w-16 h-16"
            disabled={videoShareBtnDisabled}
            onClick={stopVideoSharing}
          >
            {videoOn ? (
              <Video style={{ width: "26px", height: "26px" }} />
            ) : (
              <VideoOff style={{ width: "26px", height: "26px" }} />
            )}
          </Button>
          <Button
            className="w-16 h-16"
            disabled={hangupBtnDisabled}
            onClick={handleHangupBtnClick}
            variant="destructive"
          >
            <Phone style={{ width: "26px", height: "26px" }} />
          </Button>
          <Button
            className="w-16 h-16"
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
            className="w-16 h-16"
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
    )
  );
};

const App = () => {
  return (
    <Suspense>
      <Page />
    </Suspense>
  );
};

export default App;
