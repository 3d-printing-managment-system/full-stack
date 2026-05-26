import { Camera } from "lucide-react";
import { useEffect, useState } from "react";
import img1 from "@/assets/images/img1.jpg";

interface PrinterCameraProps {
  path: string | null | undefined;
}

function CardPrinterCamera({ path }: PrinterCameraProps) {
  const [tick, setTick] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!cameraOn) return;
    const interval = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(interval);
  }, [cameraOn]);

  return (
    <div className="w-full aspect-[16/12] bg-gray-100 rounded-xl overflow-hidden relative">
      {cameraOn ? (
        <img
          src={`${path}/shot.jpg?t=${tick}`}
          alt="live feed"
          className="w-full h-full object-cover"
          onError={() => {
            setError(true);
            setCameraOn(false);
          }}
        />
      ) : (
        <img src={img1} alt="printer" className="w-full h-full object-cover" />
      )}

      {error && !cameraOn && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-red-400 text-xs bg-white px-2 py-1 rounded shadow">
            Could not connect
          </p>
        </div>
      )}

      <button
        onClick={() => {
          setError(false);
          setCameraOn((prev) => !prev);
        }}
        className="absolute bottom-2 left-2 p-2 bg-white rounded-md shadow-md hover:bg-gray-100 cursor-pointer"
      >
        <Camera
          className={`h-3 w-3 ${cameraOn ? "text-red-500" : "text-gray-700"}`}
        />
      </button>
    </div>
  );
}

export default CardPrinterCamera;
