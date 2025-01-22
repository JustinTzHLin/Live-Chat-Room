import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
import TwoStepVerification from "./settingsSection/twoStepVerification";
import TimeZone from "./settingsSection/timeZone";
import Theme from "./settingsSection/theme";
import EditProfile from "./settingsSection/editProfile";
import { useUserStore } from "@/stores/userStore";

import ComingSoon from "@/components/comingSoon";

const SettingsSection = ({
  setCurrentSection,
}: {
  setCurrentSection: (section: string) => void;
}) => {
  const { mainPageSectionFlow, setMainPageSectionFlow } = useUserStore(
    (state) => state
  );
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
    timeZone: {
      icon: <Globe />,
      name: "Time Zone",
      onClick: () => setCurrentSetting("timeZone"),
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
  const [currentSetting, setCurrentSetting] = useState<string>("settings"); // settings, password, 2fa, language, timeZone, theme, profile

  return (
    <div className="w-full h-[calc(100%-80px)] flex flex-col items-center">
      <div className="w-full flex items-center justify-center h-10">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className="text-muted-foreground w-10 h-10 absolute left-2 hover:bg-transparent"
          onClick={() => {
            if (currentSetting === "settings") {
              setCurrentSection(mainPageSectionFlow.at(-2) as string);
              setMainPageSectionFlow((prev) => prev.slice(0, -1));
            } else setCurrentSetting("settings");
          }}
        >
          <ChevronLeft style={{ width: "26px", height: "26px" }} />
        </Button>
        <div className="text-xl font-semibold">
          {currentSetting === "settings"
            ? "Settings"
            : settingItems[currentSetting as keyof typeof settingItems].name}
        </div>
      </div>
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800"></div>
      <div className="flex flex-col w-full h-[calc(100%-48px)] p-2">
        {currentSetting === "settings" ? (
          Object.entries(settingItems).map(([key, item]) => (
            <React.Fragment key={`setting_item_${key}`}>
              <div
                className="w-full flex gap-2 h-10 items-center justify-between px-4 rounded-md hover:cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
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
        ) : currentSetting === "2fa" ? (
          <TwoStepVerification />
        ) : currentSetting === "timeZone" ? (
          <TimeZone />
        ) : currentSetting === "theme" ? (
          <Theme />
        ) : currentSetting === "profile" ? (
          <EditProfile />
        ) : (
          <ComingSoon />
        )}
      </div>
    </div>
  );
};

export default SettingsSection;
