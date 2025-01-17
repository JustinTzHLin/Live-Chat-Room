import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/userStore";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import axios from "axios";

const TwoStepVerification = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const twoFactor = useUserStore((state) => state.userInformation.twoFactor);
  const setTwoFactor = useUserStore((state) => state.setTwoFactor);
  const [current2FA, setCurrent2FA] = useState(twoFactor);
  const router = useRouter();
  const { toast } = useToast();
  const { handleUnexpectedError } = useUnexpectedErrorHandler();

  const handleChange2FA = async () => {
    try {
      const change2FAResponse = await axios.post(
        `${BACKEND_URL}/user/change2FA`,
        { twoFactor: current2FA },
        { withCredentials: true }
      );
      if (change2FAResponse.data.twoFactorChanged) {
        toast({
          title: "2FA updated",
          description: "Your 2FA has been updated.",
          duration: 3000,
        });
        setTwoFactor(current2FA);
      } else {
        if (change2FAResponse.data.errorMessage === "no token found")
          toast({
            title: "No token found",
            description: "Please login instead.",
            duration: 3000,
          });
        else if (change2FAResponse.data.errorMessage === "jwt malformed")
          toast({
            variant: "destructive",
            title: "Token malformed",
            description: "The token is malformed. Please login instead.",
            duration: 3000,
          });
        else if (change2FAResponse.data.errorMessage === "jwt expired")
          toast({
            variant: "destructive",
            title: "Token expired",
            description: "The token has expired. Please login instead.",
            duration: 3000,
          });
        else throw new Error("Token not verified");
        return router.push("/home");
      }
    } catch (err) {
      handleUnexpectedError(err);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col justify-center items-center gap-4 p-4">
        <RadioGroup
          value={current2FA}
          onValueChange={(new2FA) => setCurrent2FA(new2FA)}
          className={cn("flex flex-wrap gap-4")}
        >
          <Card
            className={cn(
              "w-full flex-1 min-w-[250px] max-w-[500px]",
              current2FA === "none" && "ring-2 ring-slate-600"
            )}
          >
            <CardHeader
              className="hover:cursor-pointer"
              onClick={() => setCurrent2FA("none")}
            >
              <div className="flex w-full justify-between items-center">
                <CardTitle>None</CardTitle>
                <RadioGroupItem value="none" />
              </div>
              <CardDescription>
                Access your account with just your password. While convenient,
                this option does not provide an extra layer of security.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card
            className={cn(
              "w-full flex-1 min-w-[250px] max-w-[500px]",
              current2FA === "email" && "ring-2 ring-slate-600"
            )}
          >
            <CardHeader
              className="hover:cursor-pointer"
              onClick={() => setCurrent2FA("email")}
            >
              <div className="flex w-full justify-between items-center">
                <CardTitle>Email Authentication</CardTitle>
                <RadioGroupItem value="email" />
              </div>
              <CardDescription>
                Enhance your account&apos;s security by requiring a verification
                code sent to your email address during login.
              </CardDescription>
            </CardHeader>
          </Card>
        </RadioGroup>
        <div className="flex w-full justify-end">
          <Button
            className="w-full sm:w-1/2 md:w-1/4"
            disabled={current2FA === twoFactor}
            onClick={handleChange2FA}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TwoStepVerification;
