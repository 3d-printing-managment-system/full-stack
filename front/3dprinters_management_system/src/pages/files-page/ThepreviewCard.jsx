import { Stat } from "@/components/Stat";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { parseDurationToSeconds } from "@/lib/utils";
import { useProfiles } from "@/context/ProfilesContext";
import { toast } from "sonner";

export function ThePreviewCard({ info, name, image, onSubmit, file }) {
  const { markSetupDone } = useProfiles();
  const location = useLocation();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1️⃣ upload file to Google Drive
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axios.post(
        "http://localhost:3000/api/parts/upload-file",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const {
        fileUrl, // 👈
      } = uploadRes.data; // 👈 both from Drive

      // 2️⃣ save metadata + fileUrl to DB
      const newFile = {
        image: image,
        title: name,
        duration: parseDurationToSeconds(info.estimated_printing_time),
        nozzleDiameter: Number(info.nozzle_diameter),
        filamentUsed: Number(info.filament_used),
        fileUrl, // 👈
        createdAt: new Date(),
      };

      const response = await axios.post(
        "http://localhost:3000/api/parts",
        newFile,
      );
      markSetupDone("printFile");

      const savedFile = response.data;
      toast.success("File uploaded successfully!", {
        description: `"${name}" has been added. Check the Files page to view it.`,
      });

      onSubmit(savedFile);
      navigate(-2);
    } catch (error) {
      console.error("Full error:", error);
      console.error("Response data:", error?.response?.data);
      console.error("Response status:", error?.response?.status);
      toast.error("Upload failed", {
        description:
          error?.response?.data?.error ??
          error?.response?.data?.message ??
          error.message,
      });
    }
  };

  return (
    <>
      {location.pathname === "/files/adding-part/the-card" && (
        <form onSubmit={handleSubmit}>
          <Card className="relative mx-auto w-full max-w-sm pt-0">
            <img
              src={`http://localhost:3000${image}`}
              className="aspect-video w-full object-cover"
            />

            <CardHeader className="flex flex-col">
              <CardTitle>The Print Main Info</CardTitle>
              <CardDescription>
                Here are the main information about the print.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Stat
                  label="Nozzle Temp"
                  description={`${info.nozzle_temperature}°C`}
                />
                <Stat
                  label="Nozzle Diameter"
                  description={`${info.nozzle_diameter} mm`}
                />
                <Stat
                  label="Print Time"
                  description={info.estimated_printing_time}
                />
                <Stat
                  label="Filament Used"
                  description={`${info.filament_used}g`}
                />
              </div>
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Complete Upload
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </>
  );
}
