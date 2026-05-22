import { useRef, useState } from "react";

function FileInput({ onFileSelect }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (!file) return;

    if (!file.name.endsWith(".gcode")) {
      alert("Only .gcode and .stl files are allowed");
      return;
    }
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div className="w-full flex flex-col flex-1">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col flex-1 items-center justify-center gap-2 h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors text-center
          ${isDragging ? "border-blue-500 bg-blue-100" : "border-gray-400 bg-white"}`}
      >
        <p className="text-2xl text-gray-500">Click or drag a file here</p>
        <p className="text-xs text-gray-400">Supported: .gcode</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept=".gcode"
      />
    </div>
  );
}

export default FileInput;
