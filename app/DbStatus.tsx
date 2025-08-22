"use client";

interface DbStatusProps {
  connected: boolean | null;
}

export default function DbStatus({ connected }: DbStatusProps) {
  const { text, border, dot } =
    connected === true
      ? {
          text: "DB Connected",
          border: "border-green-300 text-green-700",
          dot: "bg-green-500",
        }
      : connected === false
      ? {
          text: "DB Disconnected",
          border: "border-red-300 text-red-700",
          dot: "bg-red-500",
        }
      : {
          text: "Checking DB connection...",
          border: "border-gray-300 text-gray-700",
          dot: "bg-gray-400",
        };

  return (
    <div className="flex items-center justify-center mb-4">
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium border ${border}`}
      >
        <span className={`mr-2 h-2 w-2 rounded-full ${dot}`} />
        {text}
      </span>
    </div>
  );
}
