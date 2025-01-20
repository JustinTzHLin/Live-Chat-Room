import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { z } from "zod";
import axios from "axios";

const formSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 characters" }),
});

const OTPForm = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [isLoading, setIsLoading] = useState(false);
  const { updatePreviousURL, updateAuthAction } = useAuthStore(
    (state) => state
  );
  const { handleUnexpectedError } = useUnexpectedErrorHandler();
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const otpVerified = await axios.post(
        `${BACKEND_URL}/user/verifyOTPCode`,
        values,
        { withCredentials: true }
      );
      if (otpVerified.data.otpVerified) {
        router.push("/main");
        toast({
          title: "User logged in",
          description: "Welcome back!",
          duration: 3000,
        });
        updatePreviousURL("/home");
        updateAuthAction("login");
      } else if (otpVerified.data.errorMessage === "incorrect otp code")
        toast({
          title: "Incorrect OTP code",
          description: "Please try again.",
          duration: 3000,
        });
      else if (otpVerified.data.errorMessage === "jwt malformed")
        toast({
          variant: "destructive",
          title: "Token malformed",
          description: "The token is malformed. Please signup again.",
          duration: 3000,
        });
      else if (otpVerified.data.errorMessage === "jwt expired")
        toast({
          variant: "destructive",
          title: "Token expired",
          description: "The token has expired. Please signup again.",
          duration: 3000,
        });
      else throw new Error("Token not verified");
    } catch (err) {
      handleUnexpectedError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col w-full max-w-sm justify-center gap-3 px-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-center w-full ">
              <FormLabel>OTP Code</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  className="w-full"
                  {...field}
                  autoFocus
                >
                  <InputOTPGroup className="w-full">
                    {new Array(6).fill(null).map((_, index) => (
                      <InputOTPSlot
                        key={`input_otp_slot_${index}`}
                        index={index}
                        className="w-1/6"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="w-full mt-3"
          variant={resolvedTheme === "dark" ? "secondary" : "default"}
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading && <LoaderCircle className="animate-spin" />}
          {isLoading ? "Verifying OTP..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
};

export default OTPForm;
