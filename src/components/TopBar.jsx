import { useEffect, useState } from "react";

export default function TopBar({ listeners = 50 }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(new Date()),
      );
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between px-5 py-5 text-sm font-medium text-white sm:px-8 sm:py-7">
      {/* Current IST Time */}
      <div className="drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">{time}</div>

      {/* Live Listeners */}
      <div className="flex items-center gap-2 text-white/80">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#53d769] shadow-[0_0_12px_#53d769]" />

        <span>{listeners} listening</span>
      </div>
    </header>
  );
}
