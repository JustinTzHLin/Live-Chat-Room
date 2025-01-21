import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import moment from "moment-timezone";

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
  const [search, setSearch] = useState("");
  const [selectedTimeZone, setSelectedTimeZone] = useState("");

  const filteredZones = timeZones.filter((tz) =>
    tz.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-100">
      {/* Search Bar */}
      <div className="p-4">
        <Input
          placeholder="Search time zones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Time Zone List */}
      <ScrollArea className="flex-1 p-4">
        {filteredZones.map((tz) => (
          <Card
            key={tz.value}
            onClick={() => setSelectedTimeZone(tz.value)}
            className={`w-full flex items-center justify-between p-2 px-4 mb-2 cursor-pointer ${
              selectedTimeZone === tz.value ? "bg-blue-100" : ""
            }`}
          >
            <div className="w-full flex justify-between items-center">
              <span>{tz.label}</span>
              {selectedTimeZone === tz.value && <span>✔️</span>}
            </div>
          </Card>
        ))}
      </ScrollArea>

      {/* Current Time Preview */}
      <Separator />
      <div className="p-4">
        {selectedTimeZone ? (
          <Card className="p-4">
            Current Time in {selectedTimeZone}:{" "}
            {new Date().toLocaleString("en-US", { timeZone: selectedTimeZone })}
          </Card>
        ) : (
          <Card className="p-4">
            Select a time zone to see the current time.
          </Card>
        )}
      </div>
    </div>
  );
}
