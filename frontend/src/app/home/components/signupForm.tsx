import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, X, LoaderCircle } from "lucide-react";
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
const formSchema = z.object({
  email: z.string().email(),
});

const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleUnexpectedError } = useUnexpectedErrorHandler();
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setIsLoading(true);
      try {
        const userExists = await axiosInstance.post(
          `${BACKEND_URL}/user/registerCheck`,
          values,
          { withCredentials: true }
        );
        if (userExists.data.userExists)
          toast({
            title: "User already exists",
            description: "Please login instead.",
            duration: 3000,
          });
        else if (!userExists.data.userExists && userExists.data.emailSent)
          toast({
            title: "Email sent",
            description: "Please check your email to complete signup.",
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
                    className="pl-8 pr-8"
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
                  }}
                  className="absolute right-1 top-1.5 h-6 w-6 text-muted-foreground hover:bg-transparent rounded-full"
                >
                  <X />
                </Button>
              </div>
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
          {isLoading ? "Sending Email..." : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
