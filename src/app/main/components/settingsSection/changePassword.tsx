import { useState } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";

const formSchema = z.object({
  oldPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(32, { message: "Password must be at most 32 characters" }),
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(32, { message: "Password must be at most 32 characters" }),
});

const ChangePassword = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    console.log(values);
  };

  return (
    <div className="flex w-full justify-center">
      <Form {...form}>
        <form
          className="flex flex-col w-full max-w-sm justify-center gap-3 px-4 mt-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Old Password</FormLabel>
                <div className="relative">
                  <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      type={showOldPassword ? "text" : "password"}
                      placeholder="Old Secure Password"
                      className="focus-visible:ring-slate-400 pl-8 pr-8"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-1 top-1.5 h-6 w-6 text-muted-foreground hover:bg-transparent rounded-full"
                  >
                    {showOldPassword ? <Eye /> : <EyeOff />}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New Secure Password"
                      className="focus-visible:ring-slate-400 pl-8 pr-8"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-1 top-1.5 h-6 w-6 text-muted-foreground hover:bg-transparent rounded-full"
                  >
                    {showNewPassword ? <Eye /> : <EyeOff />}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full mt-3" type="submit" disabled={isLoading}>
            {isLoading && <LoaderCircle className="animate-spin" />}
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ChangePassword;
