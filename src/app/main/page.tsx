"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useAuthStore } from "@/providers/auth-store-provider";
import axios from "axios";

const Page = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { previousURL, updatePreviousURL } = useAuthStore((state) => state);
  const router = useRouter();
  const { toast } = useToast();
  useEffect(() => {
    const verifyLoggedInToken = async () => {
      console.log(previousURL);
      if (previousURL !== "/home") {
        updatePreviousURL("NONE");
        try {
          const tokenVerified = await axios(
            BACKEND_URL + "/token/verifyLoggedInToken",
            { withCredentials: true }
          );
          if (tokenVerified.data.tokenVerified) {
            toast({
              title: "Token verified",
              description: "Welcome back!",
              duration: 3000,
            });
            const userInformation = tokenVerified.data.user;
            console.log(userInformation);
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
          console.log(err);
          router.push("/home");
          toast({
            variant: "destructive",
            title: "Error occurred",
            description: "Something went wrong. Please try again.",
            duration: 3000,
          });
        }
      }
    };
    verifyLoggedInToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex flex-col h-screen items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Main Page</h1>
      <Toaster />
    </div>
  );
};

export default Page;
