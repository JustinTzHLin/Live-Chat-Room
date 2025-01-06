export default (timestamp: Date) => {
  const date = new Date(timestamp);
  const options = {
    hour: "numeric" as const,
    minute: "numeric" as const,
    hour12: true,
  };
  return date.toLocaleTimeString("en-US", options);
};
