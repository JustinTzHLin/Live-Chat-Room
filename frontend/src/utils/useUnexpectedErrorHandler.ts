import { useToast } from "@/hooks/use-toast";

const useUnexpectedErrorHandler = () => {
  const { toast } = useToast();

  const handleUnexpectedError = (err: any, message?: string) => {
    console.error(err);
    toast({
      variant: "destructive",
      title: "Error occurred",
      description: `Something went wrong. ${message || "Please try again."}`,
      duration: 3000,
    });
  };

  return { handleUnexpectedError };
};

export default useUnexpectedErrorHandler;
