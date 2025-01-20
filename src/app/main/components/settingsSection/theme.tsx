import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUserStore } from "@/stores/userStore";
import { useTheme } from "next-themes";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import axios from "axios";

const Theme = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const theme = useUserStore((state) => state.userInformation.theme);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const { setTheme } = useTheme();

  const handleChangeTheme = async () => {
    setTheme(currentTheme);
    try {
      console.log(currentTheme);
      // await axios.post(`${BACKEND_URL}/user/changeTheme`, {
      //   newTheme: currentTheme,
      // });
    } catch (err) {
      console.error(err);
      useUnexpectedErrorHandler();
    }
  };

  useEffect(() => {
    handleChangeTheme();
  }, [currentTheme]);

  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col justify-center items-center gap-4 p-6">
        <RadioGroup
          value={currentTheme}
          onValueChange={(new2FA) => setCurrentTheme(new2FA)}
          className={cn(
            "flex flex-wrap w-[1000px] max-w-[calc(100vw-64px)] justify-center gap-6"
          )}
        >
          <div className="w-full h-[160px] flex-1 grow min-w-[200px] max-w-[250px] flex flex-col justify-center items-center">
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
          <div className="w-full h-[160px] flex-1 min-w-[200px] max-w-[250px] flex flex-col justify-center items-center">
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
          <div className="w-full h-[160px] flex-1 min-w-[200px] max-w-[250px] flex flex-col justify-center items-center">
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
      </div>
    </div>
  );
};

export default Theme;
