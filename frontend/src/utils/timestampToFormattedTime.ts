const timestampToFormattedTime = (
  timestamp: string,
  timeZone: string | null
) => {
  const date = new Date(timestamp);
  const options = {
    timeZone: timeZone || undefined,
    hour: "numeric" as const,
    minute: "numeric" as const,
    hour12: true,
  };
  return date.toLocaleTimeString("en-US", options);
};

export default timestampToFormattedTime;
