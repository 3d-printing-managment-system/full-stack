import {
  InventoryItemBeforeJoining,
  PrintModelFile,
  QueueFile,
  Profile,
  Tags,
  Printer,
  Command,
  StepKey,
} from "@/lib/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";

interface ProfilesContextType {
  profiles: Profile[];
  setupCompleted: Record<StepKey, boolean>;
  existingTags: Tags[];
  files: PrintModelFile[];
  queuefile: QueueFile[];
  commands: Command[];
  printers: Printer[];
  markSetupDone: (key: StepKey) => void;
  setCommands: React.Dispatch<React.SetStateAction<Command[]>>;
  setPrinters: React.Dispatch<React.SetStateAction<Printer[]>>;
  setQueueFile: React.Dispatch<React.SetStateAction<QueueFile[]>>;
  setExistingTags: React.Dispatch<React.SetStateAction<Tags[]>>;
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  setInventory: React.Dispatch<
    React.SetStateAction<InventoryItemBeforeJoining[]>
  >;
  inventory: InventoryItemBeforeJoining[];
  addProfile: (profile: Profile) => void;
  deleteProfiles: (ids: string[]) => void;
  deleteInventoryItems: (id: string[]) => void;
  deleteFiles: (id: string[]) => void;
  deleteFromFilesQueue: (id: string) => void;
  updateProfile: (profile: Profile) => void;
  updateInventoryItem: (inventoryItem: InventoryItemBeforeJoining) => void;
  addToInventory: (item: InventoryItemBeforeJoining) => void;
  addFile: (file: PrintModelFile) => void;
  addTag: (tag: Tags) => void;
  updateTag: (tag: Tags) => void;
  deleteTag: (id: string) => void;
  addToQueue: (files: QueueFile[], position: "top" | "bottom") => void;
  refreshInventory: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  refreshJobs: () => Promise<void>;
  refreshParts: () => Promise<void>;
  refreshPrinters: () => Promise<void>;
  refreshCommands: () => Promise<void>;
  refreshTags: () => Promise<void>;
  handleCancelJob: (jobId: string) => Promise<void>;
  handleResumeJob: (jobId: string) => Promise<void>;
  handlePauseJob: (jobId: string) => Promise<void>;
}

const ProfilesContext = createContext<ProfilesContextType | undefined>(
  undefined,
);

export const ProfilesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [setupCompleted, setSetupCompleted] = useState<
    Record<StepKey, boolean>
  >({
    filament: false,
    inventory: false,
    printFile: false,
    printer: false,
    firstPrint: false,
  });

  const markSetupDone = (key: StepKey) => {
    setSetupCompleted((prev) => {
      if (prev[key]) return prev; // already done, do nothing
      const updated = { ...prev, [key]: true };
      localStorage.setItem("setup", JSON.stringify(updated));
      return updated;
    });
  };

  const [inventory, setInventory] = useState<InventoryItemBeforeJoining[]>([]);
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/inventory");

        const formatted = res.data.map((item: any) => ({
          ...item,
          cost_per_kg:
            item.updateType === "ORDER" ? item.totalCost / item.quantity : 0,
        }));

        setInventory(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchInventory();
  }, []);

  const [profiles, setProfiles] = useState<Profile[]>([]);

  const fetchProfiles = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/filament-profiles",
      );
      setProfiles(res.data);
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Add these two functions inside ProfilesProvider
  const refreshInventory = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/inventory");
      const formatted = res.data.map((item: any) => ({
        ...item,
        cost_per_kg:
          item.updateType === "ORDER" ? item.totalCost / item.quantity : 0,
      }));
      setInventory(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshProfiles = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/filament-profiles",
      );
      setProfiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshJobs = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/print-jobs");
      setQueueFile(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const refreshPrinters = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/printers");
      setPrinters(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    refreshJobs();
    refreshPrinters();

    const interval = setInterval(() => {
      // console.log("boombastic");
      refreshJobs();
      refreshPrinters();
    }, 3000);

    return () => clearInterval(interval);
  }, [refreshJobs, refreshPrinters]);

  const [commands, setCommands] = useState<Command[]>([]);
  const fetchCommands = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/gcode-commands");
      setCommands(res.data);
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  };

  useEffect(() => {
    fetchCommands();
  }, []);
  const refreshCommands = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/gcode-commands");
      setCommands(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const [files, setFiles] = useState<PrintModelFile[]>([]);

  const fetchFiles = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/parts");
      setFiles(res.data);
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);
  const refreshParts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/parts");
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const [queuefile, setQueueFile] = useState<QueueFile[]>([]);

  const [existingTags, setExistingTags] = useState<Tags[]>([]);

  const fetchTags = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/tags");
      setExistingTags(res.data);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const refreshTags = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/tags");
      setExistingTags(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const [printers, setPrinters] = useState<Printer[]>([]);

  const addProfile = (profile: Profile) =>
    setProfiles((prev) => [...prev, profile]);

  const addFile = (file: PrintModelFile) => setFiles((prev) => [...prev, file]);

  const addToQueue = (files: QueueFile[], position: "top" | "bottom") => {
    setQueueFile((prev) =>
      position === "top" ? [...files, ...prev] : [...prev, ...files],
    );
  };

  const addToInventory = (item: InventoryItemBeforeJoining) =>
    setInventory((prev) => [...prev, item]);

  const addTag = (tag: Tags) => setExistingTags((prev) => [...prev, tag]);

  const deleteProfiles = (ids: string[]) => {
    setProfiles((prev) => prev.filter((p) => !ids.includes(p.id)));
  };

  const deleteTag = (id: string) =>
    setExistingTags((prev) => prev.filter((t) => t.id !== id));

  const deleteInventoryItems = (ids: string[]) =>
    setInventory((prev) => prev.filter((p) => !ids.includes(p.orderNumber)));

  const deleteFiles = (ids: string[]) =>
    setFiles((prev) => prev.filter((p) => !ids.includes(p.id)));

  const deleteFromFilesQueue = (id: string) =>
    setQueueFile((prev) => prev.filter((p) => p.id !== id));

  const updateProfile = (updatedProfile: Profile) =>
    setProfiles((prev) =>
      prev.map((p) => (p.id === updatedProfile.id ? updatedProfile : p)),
    );

  const updateTag = (updatedTag: Tags) =>
    setExistingTags((prev) =>
      prev.map((t) => (t.id === updatedTag.id ? updatedTag : t)),
    );
  const updateInventoryItem = (
    updatedInventoryItem: InventoryItemBeforeJoining,
  ) =>
    setInventory((prev) =>
      prev.map((p) =>
        p.orderNumber === updatedInventoryItem.orderNumber
          ? updatedInventoryItem
          : p,
      ),
    );

  const handleCancelJob = async (jobId: string) => {
    try {
      await axios.post(`http://localhost:3000/api/print-jobs/${jobId}/cancel`);

      await refreshJobs();
      await refreshPrinters();
    } catch (error) {
      console.error("Failed to cancel job:", error);
    }
  };

  const handlePauseJob = async (jobId: string) => {
    try {
      await axios.post(`http://localhost:3000/api/print-jobs/${jobId}/pause`);

      await refreshJobs();
      await refreshPrinters();
    } catch (error: any) {
      console.error("Failed to pause job:", error.response?.data || error);
    }
  };

  const handleResumeJob = async (jobId: string) => {
    try {
      await axios.post(`http://localhost:3000/api/print-jobs/${jobId}/resume`);

      await refreshJobs();
      await refreshPrinters();
    } catch (error: any) {
      console.error("Failed to resume job:", error.response?.data || error);
    }
  };

  return (
    <ProfilesContext.Provider
      value={{
        handleCancelJob,
        handleResumeJob,
        handlePauseJob,
        setupCompleted,
        markSetupDone,
        setExistingTags,
        addTag,
        updateTag,
        deleteTag,
        refreshTags,
        refreshParts,
        refreshInventory,
        refreshProfiles,
        refreshJobs,
        refreshPrinters,
        setInventory,
        setProfiles,
        commands,
        setCommands,
        refreshCommands,
        existingTags,
        addToQueue,
        queuefile,
        setQueueFile,
        profiles,
        files,
        printers,
        setPrinters,
        addProfile,
        deleteProfiles,
        deleteFromFilesQueue,
        deleteInventoryItems,
        deleteFiles,
        updateProfile,
        inventory,
        addToInventory,
        addFile,
        updateInventoryItem,
      }}
    >
      {children}
    </ProfilesContext.Provider>
  );
};

export const useProfiles = () => {
  const context = useContext(ProfilesContext);
  if (!context)
    throw new Error("useProfiles must be used within ProfilesProvider");
  return context;
};
