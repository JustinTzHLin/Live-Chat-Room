import { useState } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";

const formSchema = z.object({
  email: z.string().email(),
});

const SignupForm = ({ toast }: { toast: any }) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const userExists = await axios.post(
        BACKEND_URL + "/user/userExists",
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
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      toast({
        variant: "destructive",
        title: "Error occurred",
        description: "Something went wrong. Please try again.",
        duration: 3000,
      });
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
        <Button className="w-full mt-3" type="submit" disabled={isLoading}>
          {isLoading && <LoaderCircle className="animate-spin" />}
          {isLoading ? "Sending Email..." : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
