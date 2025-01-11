import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  KeyRound,
  Languages,
  Globe,
  SunMoon,
  UserPen,
} from "lucide-react";
import ChangePassword from "./settingsSection/changePassword";
import EditProfile from "./settingsSection/editProfile";

const SettingsSection = ({
  userInformation,
  setUserInformation,
  setCurrentSection,
}: {
  userInformation: {
    userId: string;
    username: string;
    email: string;
    twoFactor: string;
    createdAt: Date;
    lastActive: Date;
  };
  setUserInformation: React.Dispatch<
    React.SetStateAction<{
      userId: string;
      username: string;
      email: string;
      twoFactor: string;
      createdAt: Date;
      lastActive: Date;
    }>
  >;
  setCurrentSection: (section: string) => void;
}) => {
  const settingItems = {
    password: {
      icon: <LockKeyhole />,
      name: "Change Password",
      onClick: () => setCurrentSetting("password"),
    },
    "2fa": {
      icon: <KeyRound />,
      name: "2-Step Verification",
      onClick: () => setCurrentSetting("2fa"),
    },
    language: {
      icon: <Languages />,
      name: "Language",
      onClick: () => setCurrentSetting("language"),
    },
    timezone: {
      icon: <Globe />,
      name: "Time Zone",
      onClick: () => setCurrentSetting("timezone"),
    },
    theme: {
      icon: <SunMoon />,
      name: "Theme",
      onClick: () => setCurrentSetting("theme"),
    },
    profile: {
      icon: <UserPen />,
      name: "Edit Profile",
      onClick: () => setCurrentSetting("profile"),
    },
  };
  const [currentSetting, setCurrentSetting] = useState<string>("settings"); // settings, password, 2fa, language, timezone, theme, profile

  return (
    <div className="w-full h-[calc(100%-80px)] flex flex-col items-center">
      <div className="w-full flex items-center justify-center h-10">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="text-muted-foreground w-10 h-10 absolute left-2 hover:bg-transparent"
          onClick={() =>
            currentSetting === "settings"
              ? setCurrentSection("tabs")
              : setCurrentSetting("settings")
          }
        >
          <ChevronLeft style={{ width: "26px", height: "26px" }} />
        </Button>
        <div className="text-xl font-semibold">
          {currentSetting === "settings"
            ? "Settings"
            : settingItems[currentSetting as keyof typeof settingItems].name}
        </div>
      </div>
      <div className="w-full h-2 bg-slate-100"></div>
      <ScrollArea className="flex flex-col w-full h-[calc(100%-48px)] p-2">
        {currentSetting === "settings" ? (
          Object.entries(settingItems).map(([key, item]) => (
            <React.Fragment key={`setting_item_${key}`}>
              <div
                className="w-full flex gap-2 h-10 items-center justify-between px-4 rounded-md hover:bg-slate-100 hover:cursor-pointer"
                onClick={item.onClick}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <div className="text-lg font-medium">{item.name}</div>
                </div>
                <ChevronRight />
              </div>
              {key !== "profile" && <Separator className="my-2" />}
            </React.Fragment>
          ))
        ) : currentSetting === "password" ? (
          <ChangePassword setCurrentSetting={setCurrentSetting} />
        ) : currentSetting === "profile" ? (
          <EditProfile
            userInformation={userInformation}
            setUserInformation={setUserInformation}
          />
        ) : null}
      </ScrollArea>
    </div>
  );
};

export default SettingsSection;
