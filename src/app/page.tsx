"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col h-screen items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Just In Chat</h1>
      <p className="text-sm text-slate-500">
        Your <span className="font-semibold">Secure</span> and{" "}
        <span className="font-semibold">Private</span> Live Chat Space
      </p>
      <div className="flex flex-col w-full max-w-sm justify-center gap-1.5 p-4">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="JustInChat@example.com"
            className="focus-visible:ring-slate-400 pl-8"
          />
        </div>
        <Button
          className="w-full max-w-sm mt-4"
          onClick={() => {
            alert("Continue");
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
