import { useLocation, Link, Outlet } from "react-router-dom";
import { useProfiles } from "@/context/ProfilesContext";
import { DataTableDragable } from "@/components/data table component/DataTableDragable";

function PrintQueuePage() {
  const location = useLocation();
  const { queuefile } = useProfiles();
  console.log("this is hte queeue file", queuefile);

  return (
    <div className="container mx-auto bg-white w-full p-4 rounded-md ring-1 ring-foreground/10 mt-6">
      {location.pathname === "/printing-queue" && (
        <DataTableDragable data={queuefile} />
      )}
      <Outlet />
    </div>
  );
}

export default PrintQueuePage;
