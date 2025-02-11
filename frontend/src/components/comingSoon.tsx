import { Terminal, Construction, Clock } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ComingSoon = () => {
  return (
    <div className="flex w-full items-center justify-center p-5">
      <Alert className="max-w-xl">
        <Clock className="h-4 w-4" />
        <AlertTitle className="text-base font-semibold">Coming Soon</AlertTitle>
        <AlertDescription>
          This feature is currently under development. Stay tuned for
          updates—exciting things are on the way!
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ComingSoon;
