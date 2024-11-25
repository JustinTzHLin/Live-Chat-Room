"use client";

import { useEffect, useState, Suspense } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import LoginForm from "./components/loginForm";
import SignupForm from "./components/signupForm";
import RegisterForm from "./components/registerForm";
import { useAuthStore } from "@/providers/auth-store-provider";
import { useSearchParams } from "next/navigation";
import axios from "axios";

const Home = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { authAction, updateAuthAction } = useAuthStore((state) => state);
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [registerEmail, setRegisterEmail] = useState("");

  useEffect(() => {
    const verifyRegisterToken = async () => {
      const registerToken = searchParams.get("registerToken");
      if (registerToken) {
        try {
          const tokenVerified = await axios.post(
            BACKEND_URL + "/token/verifyParamToken",
            { registerToken },
            { withCredentials: true }
          );
          if (tokenVerified.data.tokenVerified) {
            updateAuthAction("register");
            setRegisterEmail(tokenVerified.data.useremail);
            toast({
              title: "Token verified",
              description: "Please complete the registration form.",
              duration: 3000,
            });
          } else if (tokenVerified.data.errorMessage === "jwt malformed")
            toast({
              variant: "destructive",
              title: "Token malformed",
              description: "The token is malformed. Please signup again.",
              duration: 3000,
            });
          else if (tokenVerified.data.errorMessage === "jwt expired")
            toast({
              variant: "destructive",
              title: "Token expired",
              description: "The token has expired. Please signup again.",
              duration: 3000,
            });
          else throw new Error("Token not verified");
        } catch (err) {
          console.log(err);
          toast({
            variant: "destructive",
            title: "Error occurred",
            description: "Something went wrong. Please try again.",
            duration: 3000,
          });
          updateAuthAction("login");
        }
      }
    };
    verifyRegisterToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="flex flex-col h-screen items-center justify-center gap-4 min-h-[500px] min-w-[320px]">
      <h1 className="text-3xl font-bold">Just In Chat</h1>
      <p className="text-sm text-slate-500">
        Your <span className="font-semibold">Secure</span> and{" "}
        <span className="font-semibold">Private</span> Live Chat Space
      </p>
      {authAction === "login" ? (
        <LoginForm toast={toast} />
      ) : authAction === "signup" ? (
        <SignupForm toast={toast} />
      ) : (
        <RegisterForm toast={toast} registerEmail={registerEmail} />
      )}
      <p className="text-slate-600">
        {authAction === "login"
          ? "Don't have an account? "
          : "Already have an account? "}
        <span
          className="font-semibold hover:underline hover:cursor-pointer"
          onClick={() => {
            if (authAction === "login") updateAuthAction("signup");
            else updateAuthAction("login");
          }}
        >
          {authAction === "login" ? "Sign Up" : "Login"}
        </span>
      </p>
      <Toaster />
    </div>
  );
};

const App = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-screen items-center justify-center gap-4 min-h-[500px] min-w-[320px]">
          <h1 className="text-4xl font-bold text-slate-300">Loading</h1>
        </div>
      }
    >
      <Home />
    </Suspense>
  );
};

export default App;
