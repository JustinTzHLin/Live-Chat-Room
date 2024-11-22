"use client";

import LoginForm from "./components/loginForm";
import SignupForm from "./components/signupForm";
import { useAuthStore } from "@/providers/auth-store-provider";

export default function Home() {
  const { authAction, updateAuthAction } = useAuthStore((state) => state);

  return (
    <div className="flex flex-col h-screen items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Just In Chat</h1>
      <p className="text-sm text-slate-500">
        Your <span className="font-semibold">Secure</span> and{" "}
        <span className="font-semibold">Private</span> Live Chat Space
      </p>
      {authAction === "login" ? <LoginForm /> : <SignupForm />}
      <p className="text-slate-600">
        {authAction === "login"
          ? "Don't have an account? "
          : "Already have an account? "}
        <span
          className="font-semibold hover:underline hover:cursor-pointer"
          onClick={() => {
            if (authAction === "login") updateAuthAction("signup");
            else if (authAction === "signup") updateAuthAction("login");
          }}
        >
          {authAction === "login" ? "Sign Up" : "Login"}
        </span>
      </p>
      {/* <div className="flex flex-col w-full max-w-sm justify-center gap-1.5 p-4">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="JustInChat@example.com"
            className="focus-visible:ring-slate-400 pl-8"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEmail("")}
            className="absolute right-1 top-1.5 h-6 w-6 text-muted-foreground rounded-full"
          >
            <X />
          </Button>
        </div>
        <Button
          className="w-full max-w-sm mt-4"
          onClick={() => {
            alert(email);
          }}
        >
          Continue
        </Button>
      </div> */}
    </div>
  );
}
