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
  const [callingId, setCallingId] = useState("");
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
  const { userInformation, setUserInformation } = useUserStore(
    (state) => state
  );
  const { socket, connect } = useSocketStore((state) => state);
  const { handleUnexpectedError } = useUnexpectedErrorHandler();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const getCallersInfoToken = async () => {
      try {
        const callersInfoToken = searchParams.get("callersInfoToken");
        if (!callersInfoToken) {
          toast({
            variant: "destructive",
            title: "Info not found",
            description: "Please try again.",
            duration: 3000,
          });
          window.close();
          return router.push("/home");
        }
        const verifyCallersInfoTokenResponse = await axios.post(
          `${BACKEND_URL}/token/verifyParamToken`,
          {
            token: callersInfoToken,
          },
          { withCredentials: true }
        );
        if (!verifyCallersInfoTokenResponse.data.tokenVerified) {
          toast({
            variant: "destructive",
            title: "Token malformed",
            description: "The token is malformed. Please try again.",
            duration: 3000,
          });
          window.close();
          return router.push("/home");
        }
        if ("callingId" in verifyCallersInfoTokenResponse.data.decoded) {
          const {
            callersInfo: callersInfoDecoded,
            callingId: callingIdDecoded,
          } = verifyCallersInfoTokenResponse.data.decoded;
          setCallingId(callingIdDecoded);
          setCallersInfo(callersInfoDecoded);
        } else {
          const newCallingId = `${Date.now().toString(36)}-${Math.random()
            .toString(36)
            .substring(2, 10)}`;
          setCallingId(newCallingId);
          setCallersInfo(verifyCallersInfoTokenResponse.data.decoded);
        }
        setInfoTokenVerified(true);
      } catch (err) {
        handleUnexpectedError(err);
      }
    };
    getCallersInfoToken();
    return () => {
      useSocketStore.getState().disconnect();
    };
  }, []);

  useEffect(() => {
    if (infoTokenVerified && !socket) {
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
  }, [infoTokenVerified, socket]);

  useEffect(() => {
    if (socket && callingId) {
      const handleWebRTCMessage = (
        e: (RTCSessionDescriptionInit | RTCIceCandidateInit) & {
          callingId: string;
          type: string;
          callersInfo: CallersInfo;
        }
      ) => {
        if (!localStreamRef.current) return console.log("not ready yet");
        console.log("webrtc_call", e);
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
            else return makeCall(callingId);
          case "bye":
            if (peerConnectionRef.current) return hangup();
            else return console.log("not in call, ignoring");
          default:
            console.log("unhandled", e);
        }
      };
      socket.off("webrtc_call");
      socket.on("webrtc_call", handleWebRTCMessage);
      setSocketSetted(true);
      return () => {
        socket.off("webrtc_call", handleWebRTCMessage);
      };
    }
  }, [socket, callingId]);

  useEffect(() => {
    const verifyLoggedInToken = async () => {
      if (socketSetted && infoTokenVerified && callersInfo && callingId) {
        try {
          const tokenVerified = await axios(
            `${BACKEND_URL}/token/verifyLoggedInToken`,
            { withCredentials: true }
          );
          if (tokenVerified.data.tokenVerified) {
            socket.emit("join_room", callingId);
            setUserInformation(tokenVerified.data.user);
            socket.emit("join_room", tokenVerified.data.user.userId);
          } else {
            router.push("/home");
            if (tokenVerified.data.errorMessage === "no token found")
              toast({
                title: "No token found",
                description: "Please login instead.",
                duration: 3000,
              });
            else if (tokenVerified.data.errorMessage === "jwt malformed")
              toast({
                variant: "destructive",
                title: "Token malformed",
                description: "The token is malformed. Please login instead.",
                duration: 3000,
              });
            else if (tokenVerified.data.errorMessage === "jwt expired")
              toast({
                variant: "destructive",
                title: "Token expired",
                description: "The token has expired. Please login instead.",
                duration: 3000,
              });
            else throw new Error("Token not verified");
          }
        } catch (err) {
          router.push("/home");
          handleUnexpectedError(err, "Please login instead.");
        }
      }
    };
    verifyLoggedInToken();
  }, [socketSetted, infoTokenVerified, callersInfo, callingId]);

  useEffect(() => {
    const callInitialization = async () => {
      if (userInformation.userId) {
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
            if (callersInfo?.callee.id === userInformation.userId) {
              socket.emit("webrtc_call", {
                callingId: callingId,
                type: "ready",
                callersInfo,
              });
            } else {
              socket.emit("webrtc_call", {
                newCallingId: callingId,
                callingId: callersInfo?.callee.id,
                type: "call_request",
                callersInfo,
              });
            }
          } else throw new Error("No local video");
        } catch (err) {
          console.error(err);
        }
      }
    };
    callInitialization();
  }, [userInformation.userId]);

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
          callingId,
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
        callingId,
        type: "answer",
        callersInfo,
        sdp: answer.sdp,
      });
      await peerConnectionRef.current.setLocalDescription(answer);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) {
      console.error("no peerconnection");
      return;
    }
    try {
      await peerConnectionRef.current.setRemoteDescription(answer);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      if (!peerConnectionRef.current) {
        console.error("no peerconnection");
        return;
      }
      await peerConnectionRef.current.addIceCandidate(candidate || null);
    } catch (err) {
      console.error(err);
    }
  };

  const makeCall = async (callingId: string) => {
    try {
      peerConnectionRef.current = new RTCPeerConnection(configuration);
      peerConnectionRef.current.onicecandidate = (e) => {
        const message = {
          callingId,
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
        callingId,
        type: "offer",
        callersInfo,
        sdp: offer.sdp,
      });
      await peerConnectionRef.current.setLocalDescription(offer);
    } catch (err) {
      console.error(err);
    }
  };

  const hangup = async () => {
    console.log("Hanging up");
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
    socket.emit("webrtc_call", {
      callingId,
      type: "bye",
      callersInfo,
    });
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
