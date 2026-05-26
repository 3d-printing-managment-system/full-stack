import { useEffect, useState } from "react";

export function GeneralPrinterCamera({ path }: { path: string }) {
  const [tick, setTick] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);

  useEffect(() => {
    if (!cameraOn) return;
    const interval = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(interval);
  }, [cameraOn]);

  return (
    <div className="relative bg-black min-h-[400px]">
      {cameraOn ? (
        <img
          src={`${path}/shot.jpg?t=${tick}`}
          alt="Printer Live Feed"
          className="w-full h-full object-cover opacity-90"
          onError={() => setCameraOn(false)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-500 text-sm">Camera off</p>
        </div>
      )}

      {cameraOn && (
        <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      )}

      <button
        onClick={() => setCameraOn((prev) => !prev)}
        className="absolute bottom-4 right-4 bg-white text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-gray-100 transition"
      >
        {cameraOn ? "Stop Camera" : "Start Camera"}
      </button>
    </div>
  );
}
