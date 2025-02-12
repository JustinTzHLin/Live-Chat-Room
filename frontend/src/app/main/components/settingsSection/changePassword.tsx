import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, LoaderCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { z } from "zod";
import axiosInstance from "@/lib/axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const formSchema = z
  .object({
    oldPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(32, { message: "Password must be at most 32 characters" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(32, { message: "Password must be at most 32 characters" }),
    confirmNewPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(32, { message: "Password must be at most 32 characters" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

const ChangePassword = ({
  setCurrentSetting,
}: {
  setCurrentSetting: (section: string) => void;
}) => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { handleUnexpectedError } = useUnexpectedErrorHandler();
  const [isLoading, setIsLoading] = useState(false);
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const handleSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      if (values.oldPassword === values.newPassword) {
        toast({
          title: "Old password cannot be the same as new password",
          description: "Please try again.",
          duration: 3000,
        });
        return;
      }
      setIsLoading(true);
      try {
        const changePassword = await axiosInstance.post(
          `${BACKEND_URL}/user/changePassword`,
          values,
          { withCredentials: true }
        );
        if (changePassword.data.passwordChanged) {
          setCurrentSetting("settings");
          toast({
            title: "Password changed",
            description: "Your password has been changed.",
            duration: 3000,
          });
        } else if (changePassword.data.errorMessage === "incorrect password")
          toast({
            title: "Password incorrect",
            description: "Please try again.",
            duration: 3000,
          });
      } catch (err) {
        handleUnexpectedError(err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const formInputItems = [
    {
      name: "oldPassword",
      label: "Current Password",
      placeholder: "Enter your current password",
      showPassword: showOldPassword,
      setShowPassword: setShowOldPassword,
    },
    {
      name: "newPassword",
      label: "New Password",
      placeholder: "Enter a new password",
      showPassword: showNewPassword,
      setShowPassword: setShowNewPassword,
    },
    {
      name: "confirmNewPassword",
      label: "Confirm New Password",
      placeholder: "Re-enter the new password",
      showPassword: showConfirmPassword,
      setShowPassword: setShowConfirmPassword,
    },
  ];

  return (
    <div className="flex w-full justify-center">
      <Form {...form}>
        <form
          className="flex flex-col w-full max-w-sm justify-center gap-3 px-4 mt-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          {formInputItems.map((inputItem) => (
            <FormField
              key={`input_item_${inputItem.name}`}
              control={form.control}
              name={
                inputItem.name as
                  | "oldPassword"
                  | "newPassword"
                  | "confirmNewPassword"
              }
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{inputItem.label}</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input
                        type={inputItem.showPassword ? "text" : "password"}
                        placeholder={inputItem.placeholder}
                        className="pl-8 pr-8"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() =>
                        inputItem.setShowPassword(!inputItem.showPassword)
                      }
                      className="absolute right-1 top-1.5 h-6 w-6 text-muted-foreground hover:bg-transparent rounded-full"
                    >
                      {inputItem.showPassword ? <Eye /> : <EyeOff />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            className="w-full mt-3"
            variant={resolvedTheme === "dark" ? "secondary" : "default"}
            type="submit"
            disabled={isLoading}
          >
            {isLoading && <LoaderCircle className="animate-spin" />}
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ChangePassword;
