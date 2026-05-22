import { TabsLine } from "@/components/tabs-line";
import { Outlet } from "react-router-dom";

function MaterialsPage() {
  const paths = [
    {
      name: "Profiles & Inventory",
      path: "/materials/profiles-inventory",
    },
    {
      name: "Inventory adjustments",
      path: "/materials/inventory-adjustments",
    },
  ];
  return (
    <div className="container mx-auto  py-6">
      <TabsLine paths={paths} />
      <Outlet />
    </div>
  );
}

export default MaterialsPage;
