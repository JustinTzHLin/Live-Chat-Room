"use client";

import {
  useRef,
  useEffect,
  useState,
  Suspense,
  useCallback,
  useMemo,
} from "react";
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
import { webrtcConfig } from "@/lib/webRTCCOnfig";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

const Page = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [currentStep, setCurrentStep] = useState(0);
  const [callSetted, setCallSetted] = useState(false);
  const [callingId, setCallingId] = useState("");
  const [callSettings, setCallSettings] = useState({
    videoShareBtnDisabled: true,
    hangupBtnDisabled: true,
    micBtnDisabled: true,
    soundBtnDisabled: true,
  });
  const [mediaSettings, setMediaSettings] = useState({
    videoOn: false,
    micOn: true,
    soundOn: true,
    p2VideoOn: false,
    p2MicOn: true,
  });
  const myCurrentMedia = useRef({
    videoOn: false,
    micOn: true,
  });
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
  const { socket, connect, disconnect } = useSocketStore((state) => state);
  const { handleUnexpectedError } = useUnexpectedErrorHandler();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Step 1-1: Verify callers info token
  const verifyCallersInfoToken = useCallback(async () => {
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
      const verifyCallersInfoTokenResponse = await axiosInstance.post(
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
      return verifyCallersInfoTokenResponse.data.decoded;
    } catch (err) {
      handleUnexpectedError(err);
    }
  }, []);

  // Step 1-2: Set callers info and calling id
  const setCallersInfoAndCallingId = useCallback(async (decodedData: any) => {
    if ("callingId" in decodedData) {
      const { callersInfo: callersInfoDecoded, callingId: callingIdDecoded } =
        decodedData;
      setCallingId(callingIdDecoded);
      setCallersInfo(callersInfoDecoded);
    } else {
      const newCallingId = `${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .substring(2, 10)}`;
      setCallingId(newCallingId);
      setCallersInfo(decodedData);
    }
    setCurrentStep(1);
  }, []);

  // Step 2: Connect socket
  const connectSocket = useCallback(() => {
    if (socket) return;
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
    setCurrentStep(2);
  }, [socket]);

  // Step 3: Set socket listeners
  const setSocketListeners = useCallback(() => {
    if (!socket) return;
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
          else return makeCall();
        case "bye":
          if (peerConnectionRef.current) return hangup();
          else return console.log("not in call, ignoring");
        default:
          console.log("unhandled", e);
      }
    };
    const handleCallSettingChange = (data: {
      callingId: string;
      type: string;
      value: {
        videoOn: boolean;
        micOn: boolean;
      };
    }) => {
      setMediaSettings((prev) => ({
        ...prev,
        p2VideoOn: data.value.videoOn,
        p2MicOn: data.value.micOn,
      }));
    };
    socket.on("webrtc_call", handleWebRTCMessage);
    socket.on("change_call_setting", handleCallSettingChange);
    setCurrentStep(3);
    return () => {
      socket.off("webrtc_call", handleWebRTCMessage);
      socket.off("change_call_setting", handleCallSettingChange);
    };
  }, [socket]);

  // Step 4: Verify logged in token
  const verifyLoggedInToken = useCallback(async () => {
    if (!callingId) return;
    try {
      const tokenVerified = await axiosInstance(
        `${BACKEND_URL}/token/verifyLoggedInToken`,
        { withCredentials: true }
      );
      if (tokenVerified.data.tokenVerified) {
        socket.emit("join_room", callingId);
        setUserInformation(tokenVerified.data.user);
        socket.emit("join_room", tokenVerified.data.user.userId);
        setCurrentStep(4);
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
  }, [socket, callingId]);

  // Step 5: Call initialization
  const callInitialization = useCallback(async () => {
    if (!userInformation.userId || !callersInfo) return;
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
  }, [userInformation.userId, callersInfo]);

  // Steps array for call setup
  const setUpfuncs = useMemo(
    () => [
      async () => {
        const decodedData = await verifyCallersInfoToken();
        if (decodedData) setCallersInfoAndCallingId(decodedData);
      },
      () => {
        connectSocket();
        return () => disconnect();
      },
      setSocketListeners,
      verifyLoggedInToken,
      callInitialization,
    ],
    [
      verifyCallersInfoToken,
      connectSocket,
      setSocketListeners,
      verifyLoggedInToken,
      callInitialization,
    ]
  );

  // Execute steps for call setup
  const executeSteps = useCallback(async () => {
    const stepFunction = setUpfuncs[currentStep];
    if (stepFunction) {
      const result = await stepFunction();
      if (typeof result === "function") return result;
    } else console.log(`Invalid step: ${currentStep}`);
  }, [currentStep, setUpfuncs]);

  // Execute steps to set up call based on current step
  useEffect(() => {
    executeSteps();
  }, [currentStep, socket, callingId, userInformation.userId, callersInfo]);

  // Set button disabled status
  useEffect(() => {
    setCallSettings({
      videoShareBtnDisabled: !callSetted,
      hangupBtnDisabled: !callSetted,
      micBtnDisabled: !callSetted,
      soundBtnDisabled: !callSetted,
    });
  }, [callSetted]);

  // Caller offer call to callee
  const makeCall = useCallback(async () => {
    try {
      socket.emit("change_call_setting", {
        callingId,
        value: myCurrentMedia.current,
      });
      peerConnectionRef.current = new RTCPeerConnection(webrtcConfig);
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
  }, [socket, callingId, callersInfo]);

  // Callee answer offer from caller
  const handleOffer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      if (peerConnectionRef.current) {
        console.error("existing peerconnection");
        return;
      }
      try {
        peerConnectionRef.current = new RTCPeerConnection(webrtcConfig);
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
              peerConnectionRef.current!.addTrack(
                track,
                localStreamRef.current!
              )
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
    },
    [socket, callingId, callersInfo]
  );

  // Caller handle answer from callee
  const handleAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit) => {
      if (!peerConnectionRef.current) {
        console.error("no peerconnection");
        return;
      }
      try {
        await peerConnectionRef.current.setRemoteDescription(answer);
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  // Handle candidate from other
  const handleCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      try {
        if (!peerConnectionRef.current) {
          console.error("no peerconnection");
          return;
        }
        await peerConnectionRef.current.addIceCandidate(candidate || null);
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  // Hang up
  const hangup = useCallback(async () => {
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
  }, []);

  // Handle hang up button click
  const handleHangupBtnClick = useCallback(async () => {
    hangup();
    socket.emit("webrtc_call", {
      callingId,
      type: "bye",
      callersInfo,
    });
  }, [socket, hangup, callingId, callersInfo]);

  // Toggle self video
  const toggleVideo = useCallback(() => {
    setMediaSettings((prev) => {
      const newVideoOn = !prev.videoOn;
      localStreamRef.current?.getVideoTracks().forEach((track) => {
        track.enabled = newVideoOn;
      });
      socket.emit("change_call_setting", {
        callingId,
        value: {
          ...prev,
          videoOn: newVideoOn,
        },
      });
      myCurrentMedia.current = {
        ...myCurrentMedia.current,
        videoOn: newVideoOn,
      };
      return { ...prev, videoOn: newVideoOn };
    });
  }, [socket, callingId]);

  // Toggle self mic
  const toggleMic = useCallback(() => {
    setMediaSettings((prev) => {
      const newMicOn = !prev.micOn;
      localStreamRef.current?.getAudioTracks().forEach((track) => {
        track.enabled = newMicOn;
      });
      socket.emit("change_call_setting", {
        callingId,
        value: {
          ...prev,
          micOn: newMicOn,
        },
      });
      myCurrentMedia.current = {
        ...myCurrentMedia.current,
        micOn: newMicOn,
      };
      return { ...prev, micOn: newMicOn };
    });
  }, [socket, callingId]);

  // Toggle other's sound
  const muteSound = useCallback(() => {
    if (!remoteVideo.current) return;
    remoteVideo.current.muted = mediaSettings.soundOn;
    setMediaSettings((prev) => ({ ...prev, soundOn: !mediaSettings.soundOn }));
  }, [mediaSettings]);

  return (
    currentStep > 0 && (
      <main className="min-w-[320px] flex flex-col items-center p-4 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="aspect-auto border-8 border-slate-200 rounded-lg relative">
            <video
              ref={localVideo}
              className="w-full h-full rounded-md bg-black"
              autoPlay
              playsInline
            />
            {!mediaSettings.videoOn && (
              <VideoOff className="w-1/4 h-auto absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] text-white opacity-50 rounded-full" />
            )}
            <div className="w-full flex items-center justify-end absolute top-full left-full translate-x-[-100%] translate-y-[-100%] text-lg text-white">
              <div className="flex items-center bg-slate-800 bg-opacity-70 rounded-lg m-1 px-1.5 gap-1">
                {userInformation.username}
                <p className="text-sm font-semibold">(You)</p>
                {!mediaSettings.micOn && (
                  <MicOff
                    strokeWidth={2.5}
                    size={18}
                    className="text-red-600 rounded-full"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="aspect-auto border-8 border-slate-200 rounded-lg relative">
            <video
              ref={remoteVideo}
              className="w-full h-full rounded-md bg-black"
              autoPlay
              playsInline
            />
            {!mediaSettings.p2VideoOn && (
              <VideoOff className="w-1/4 h-auto absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] text-white opacity-50 rounded-full" />
            )}
            <div className="w-full flex items-center justify-end absolute top-full left-full translate-x-[-100%] translate-y-[-100%] text-lg text-white">
              <div className="flex items-center justify-center bg-slate-800 bg-opacity-70 rounded-lg m-1 px-1.5">
                {userInformation.userId === callersInfo?.caller.id
                  ? callersInfo?.callee.username
                  : userInformation.userId === callersInfo?.callee.id
                  ? callersInfo?.caller.username
                  : ""}
                {!mediaSettings.p2MicOn && (
                  <MicOff
                    strokeWidth={2.5}
                    size={18}
                    className="text-red-600 rounded-full"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-around w-full max-w-96 mt-3">
          <Button
            className="w-16 h-16"
            disabled={callSettings.videoShareBtnDisabled}
            onClick={toggleVideo}
          >
            {mediaSettings.videoOn ? (
              <Video style={{ width: "26px", height: "26px" }} />
            ) : (
              <VideoOff style={{ width: "26px", height: "26px" }} />
            )}
          </Button>
          <Button
            className="w-16 h-16"
            disabled={callSettings.hangupBtnDisabled}
            onClick={handleHangupBtnClick}
            variant="destructive"
          >
            <Phone style={{ width: "26px", height: "26px" }} />
          </Button>
          <Button
            className="w-16 h-16"
            disabled={callSettings.micBtnDisabled}
            onClick={toggleMic}
          >
            {mediaSettings.micOn ? (
              <Mic style={{ width: "26px", height: "26px" }} />
            ) : (
              <MicOff style={{ width: "26px", height: "26px" }} />
            )}
          </Button>
          <Button
            className="w-16 h-16"
            disabled={callSettings.soundBtnDisabled}
            onClick={muteSound}
          >
            {mediaSettings.soundOn ? (
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
