import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const Theme = () => {
  const {
    userInformation: { theme: preferenceTheme },
    setUserInformation,
  } = useUserStore((state) => state);
  const [isLoading, setIsLoading] = useState(false);
  const { handleUnexpectedError } = useUnexpectedErrorHandler();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme);
  const { toast } = useToast();

  const handleChangeTheme = useCallback(async () => {
    setIsLoading(true);
    try {
      const changeThemeResponse = await axios.post(
        `${BACKEND_URL}/user/changeTheme`,
        {
          theme: currentTheme,
        },
        { withCredentials: true }
      );
      if (changeThemeResponse.data.themeChanged) {
        toast({
          title: "Theme updated",
          description: "Your theme has been updated.",
          duration: 3000,
        });
        setUserInformation((prev) => ({
          ...prev,
          theme: currentTheme || "system",
        }));
      } else throw new Error("Theme not changed");
    } catch (err) {
      handleUnexpectedError(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentTheme]);

  useEffect(() => {
    setTheme(currentTheme || "system");
  }, [currentTheme]);

  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col justify-center items-center gap-3 p-6">
        <RadioGroup
          value={currentTheme}
          onValueChange={(new2FA) => setCurrentTheme(new2FA)}
          className={cn(
            "flex flex-wrap w-[250px] sm:w-[798px] max-w-[calc(100vw-64px)] justify-center gap-4 sm:gap-6"
          )}
        >
          <div className="w-full h-[130px] sm:h-[160px] flex-1 grow min-w-[150px] sm:min-w-[200px] max-w-[180px] sm:max-w-[250px] flex flex-col justify-center items-center">
            <div
              className="w-full h-[calc(100%-32px)] flex justify-end items-end bg-slate-300 rounded-xl ring-4 ring-slate-600 hover:cursor-pointer"
              onClick={() => setCurrentTheme("light")}
            >
              <div className="w-3/4 h-[70%] flex flex-col bg-slate-50 rounded-tl-xl rounded-br-xl">
                <p className="text-3xl font-semibold text-slate-900 p-3">Aa</p>
              </div>
            </div>
            <div className="w-full h-8 flex justify-start items-end">
              <div
                className="flex items-center gap-1 hover:cursor-pointer"
                onClick={() => setCurrentTheme("light")}
              >
                <RadioGroupItem value="light" />
                <p className="flex items-center text-lg text-left font-semibold pl-2">
                  Light
                </p>
              </div>
            </div>
          </div>
          <div className="w-full h-[130px] sm:h-[160px] flex-1 grow min-w-[150px] sm:min-w-[200px] max-w-[180px] sm:max-w-[250px] flex flex-col justify-center items-center">
            <div
              className="w-full h-[calc(100%-32px)] flex justify-end items-end bg-slate-700 rounded-xl ring-4 ring-slate-400 hover:cursor-pointer"
              onClick={() => setCurrentTheme("dark")}
            >
              <div className="w-3/4 h-[70%] flex flex-col bg-slate-900 rounded-tl-xl rounded-br-xl">
                <p className="text-3xl font-semibold text-slate-50 p-3">Aa</p>
              </div>
            </div>
            <div className="w-full h-8 flex justify-start items-end">
              <div
                className="flex items-center gap-1 hover:cursor-pointer"
                onClick={() => setCurrentTheme("dark")}
              >
                <RadioGroupItem value="dark" />
                <p className="flex items-center text-lg text-left font-semibold pl-2">
                  Dark
                </p>
              </div>
            </div>
          </div>
          <div className="w-full h-[130px] sm:h-[160px] flex-1 grow min-w-[150px] sm:min-w-[200px] max-w-[180px] sm:max-w-[250px] flex flex-col justify-center items-center">
            <div
              className="w-full h-[calc(100%-32px)] flex ring-4 ring-slate-600 rounded-xl"
              onClick={() => setCurrentTheme("system")}
            >
              <div className="w-full h-full flex justify-end items-end bg-slate-300 rounded-tl-xl rounded-bl-xl hover:cursor-pointer">
                <div className="w-3/5 h-[70%] flex flex-col bg-slate-50 rounded-tl-xl">
                  <p className="text-3xl font-semibold text-slate-900 p-3">
                    Aa
                  </p>
                </div>
              </div>
              <div className="w-full h-full flex justify-end items-end bg-slate-700 rounded-tr-xl rounded-br-xl hover:cursor-pointer">
                <div className="w-3/5 h-[70%] flex flex-col bg-slate-900 rounded-tl-xl rounded-br-xl">
                  <p className="text-3xl font-semibold text-slate-50 p-3">Aa</p>
                </div>
              </div>
            </div>
            <div className="w-full h-8 flex justify-start items-end">
              <div
                className="flex items-center gap-1 hover:cursor-pointer"
                onClick={() => setCurrentTheme("system")}
              >
                <RadioGroupItem value="system" />
                <p className="flex items-center text-lg text-left font-semibold pl-2">
                  System
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
        <div className="w-full flex justify-center md:justify-end items-center">
          <Button
            className="w-[180px] sm:w-1/2 md:w-1/4"
            variant={resolvedTheme === "dark" ? "secondary" : "default"}
            disabled={currentTheme === preferenceTheme || isLoading}
            onClick={handleChangeTheme}
          >
            {isLoading && <LoaderCircle className="animate-spin" />}
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Theme;
