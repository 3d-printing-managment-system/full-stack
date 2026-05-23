import FileInput from "@/components/FileInput";
import { parseInfo } from "@/lib/utils";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

function FileAdditionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    setFile(file);

    reader.onload = () => {
      const text = reader.result as string;
      const info = parseInfo(text);
      navigate("/files/adding-part/the-card", {
        state: {
          fileName: file.name,
          fileInfo: info,
          imageURL: "/uploads/previews/img1.jpg",
          gcodeFile: file,
        },
      });
    };

    reader.readAsText(file);
  };

  return (
    <div className="px-20 py-4 h-[700px] flex flex-col">
      {location.pathname === "/files/adding-part" && (
        <>
          <div className="mb-12">
            <h1 className="text-3xl">Upload Print File</h1>
            <p>
              We currently only accept files sliced with Bambu, Prusa, or Orca
              slicers. You may upload files sliced with other slicers, but not
              all features will be available.
            </p>
          </div>
          <FileInput onFileSelect={handleFileSelect} />
          {/* {file && <p>{file.name}</p>} */}
        </>
      )}
      <Outlet />
    </div>
  );
}

export default FileAdditionPage;
