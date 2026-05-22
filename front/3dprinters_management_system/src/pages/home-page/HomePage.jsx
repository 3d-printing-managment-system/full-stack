import { TabsLine } from "@/components/tabs-line";
import { Outlet } from "react-router-dom";

function HomePage() {
  const paths = [
    {
      name: "Printers",
      path: "/home/printers",
    },
    {
      name: "Dashboard",
      path: "/home/dashboard",
    },
  ];
  return (
    <div className="container mx-auto py-6">
      <TabsLine paths={paths} />
      <Outlet />
    </div>
  );
}

export default HomePage;
