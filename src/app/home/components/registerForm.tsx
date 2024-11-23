import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, X, Eye, EyeOff, UserRound } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";
import axios from "axios";
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

const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(32, { message: "Username must be at most 32 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(32, { message: "Password must be at most 32 characters" }),
});

const RegisterForm = ({
  toast,
  registerEmail,
}: {
  toast: any;
  registerEmail: string;
}) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [showPassword, setShowPassword] = useState(false);
  const { updatePreviousURL } = useAuthStore((state) => state);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const { username, password } = values;
    try {
      const registerResult = await axios.post(
        BACKEND_URL + "/user/signUp",
        { username, password, email: registerEmail },
        { withCredentials: true }
      );
      if (registerResult.data.userExists)
        toast({
          title: "User already exists",
          description: "Please login instead.",
          duration: 3000,
        });
      else if (registerResult.data.userCreated) {
        updatePreviousURL("/home");
        router.push("/main");
        toast({
          title: "User created",
          description: "Happy chatting!",
          duration: 3000,
        });
      } else throw new Error("User not created");
    } catch (err) {
      console.log(err);
      toast({
        variant: "destructive",
        title: "Error occurred",
        description: "Something went wrong. Please try again.",
        duration: 3000,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col w-full max-w-sm justify-center gap-3 px-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="JustInChat@example.com"
            className="bg-slate-200 pl-8"
            value={registerEmail}
            disabled
          />
        </div>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username(Nickname)</FormLabel>
              <div className="relative">
                <UserRound className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="text"
                    placeholder="New Chatter"
                    className="focus-visible:ring-slate-400 pl-8"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => {
                    form.setValue("username", "");
                  }}
                  className="absolute right-1 top-1.5 h-6 w-6 text-muted-foreground rounded-full"
                >
                  <X />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Secure Password"
                    className="focus-visible:ring-slate-400 pl-8"
                    {...field}
                  />
                </FormControl>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1.5 h-6 w-6 text-muted-foreground rounded-full"
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full mt-3" type="submit">
          Register
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
