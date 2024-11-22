import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, X, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store-provider";

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
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(32, { message: "Password must be at most 32 characters" }),
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { authAction } = useAuthStore((state) => state);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col w-full max-w-sm justify-center gap-3 px-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className="relative">
                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="text"
                    placeholder="JustInChat@example.com"
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
                    form.setValue("email", "");
                    console.log(field.onChange);
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
          {authAction === "login" ? "Login" : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
