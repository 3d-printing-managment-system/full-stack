import { useLocation } from "react-router-dom";
import { GCodeInfo, PrintModelFile } from "@/lib/types";
import { useProfiles } from "@/context/ProfilesContext";
import { ThePreviewCard } from "./ThepreviewCard";

function FilePreview() {
  const location = useLocation();
  const { fileName, fileInfo, imageURL, gcodeFile } = location.state as {
    fileName: String;
    fileInfo: GCodeInfo;
    imageURL: string;
  };
  const { addFile } = useProfiles();
  const handleAddPrint = (newFile: PrintModelFile) => {
    addFile(newFile);
  };

  if (!fileName) return <p>No file info available.</p>;
  return (
    <div>
      <ThePreviewCard
        info={fileInfo}
        name={fileName}
        image={imageURL}
        onSubmit={handleAddPrint}
        file={gcodeFile}
      />
    </div>
  );
}

export default FilePreview;
