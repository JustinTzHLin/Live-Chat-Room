import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import moment from "moment-timezone";
import { useUserStore } from "@/stores/userStore";
import useUnexpectedErrorHandler from "@/utils/useUnexpectedErrorHandler";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// Example array with UTC offsets
const timeZones = moment.tz.names().map((tz) => {
  const offset = moment.tz(tz).utcOffset() / 60;
  const sign = offset >= 0 ? "+" : "-";
  return {
    value: tz,
    label: `${tz} (UTC${sign}${Math.abs(offset)})`,
  };
});

export default function TimeZoneEditor() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { handleUnexpectedError } = useUnexpectedErrorHandler();
  const { resolvedTheme } = useTheme();
  const { userInformation, setUserInformation } = useUserStore(
    (state) => state
  );
  const [search, setSearch] = useState("");
  const [selectedTimeZone, setSelectedTimeZone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const filteredZones = timeZones.filter((tz) =>
    tz.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleChangeTimeZone = async () => {
    setIsLoading(true);
    try {
      const changeTimeZoneResponse = await axios.post(
        `${BACKEND_URL}/user/changeTimeZone`,
        { timeZone: selectedTimeZone },
        { withCredentials: true }
      );
      if (changeTimeZoneResponse.data.timeZoneChanged) {
        toast({
          title: "Time zone updated",
          description: "Your time zone has been updated.",
          duration: 3000,
        });
        setUserInformation((prev) => ({
          ...prev,
          timeZone: selectedTimeZone,
        }));
      } else throw new Error("Time zone not changed");
    } catch (err) {
      handleUnexpectedError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col py-2 gap-2">
      {/* Search Bar */}
      <div className="mx-4 relative">
        <Input
          className="pr-8"
          placeholder="Search time zones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => setSearch("")}
          className="absolute right-1 top-1.5 h-6 w-6 text-muted-foreground hover:bg-transparent rounded-full"
        >
          <X />
        </Button>
      </div>

      {/* Time Zone List */}
      <ScrollArea className="flex-1 mx-4 rounded-md border">
        {filteredZones.map((tz) => (
          <div
            key={`timeZone_${tz.value}`}
            className={cn(
              "flex items-center justify-between p-2 m-2 gap-2 rounded-lg bg-slate-100 dark:bg-slate-800",
              selectedTimeZone === tz.value && "ring-ring ring-2"
            )}
            onClick={() => {
              if (selectedTimeZone === tz.value) setSelectedTimeZone("");
              else setSelectedTimeZone(tz.value);
            }}
          >
            <div className="w-full flex justify-between items-center">
              <span>{tz.label}</span>
            </div>
          </div>
        ))}
      </ScrollArea>

      {/* Current Time Preview */}
      <div className="flex mx-4 items-center justify-center gap-2">
        <div className="flex-1">
          {selectedTimeZone ? (
            <div
              className="p-2 rounded-md border shadow"
              onClick={() => setSelectedTimeZone("")}
            >
              Current Time in <b>{selectedTimeZone}</b>:{" "}
              {new Date().toLocaleString("en-US", {
                timeZone: selectedTimeZone,
              })}
            </div>
          ) : (
            <div className="p-2 rounded-md border shadow">
              Select a time zone to see the current time and save it.
            </div>
          )}
        </div>
        <Button
          variant={resolvedTheme === "dark" ? "secondary" : "default"}
          className="h-full"
          onClick={handleChangeTimeZone}
          disabled={selectedTimeZone === "" || isLoading}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
