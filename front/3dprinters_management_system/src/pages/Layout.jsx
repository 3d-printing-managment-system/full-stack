import AppBar from "@/components/AppBar";
import NavigationSideBar from "@/components/NavigationSideBar";
import HomePage from "./home-page/HomePage";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { Navigate, RouterProvider, useParams } from "react-router";
import PrintQueuePage from "./print-queue-page/PrintQueuePage";
import FilesPage from "./files-page/FilesPage";
import MaterialsPage from "./materials-page/MaterialsPage";
import SettingsPage from "./settings-page/SettingsPage";

import InventoryAdjustmentsPage from "./materials-page/sub_pages/InventoryAdjustmentsPage";
import CreateProfile from "./materials-page/sub sub pages/CreateProfile";
import Dashboard from "./home-page/sub_pages/Dashboard";
import Printers from "./home-page/sub_pages/Printers";
import { ProfilesProvider } from "@/context/ProfilesContext";
import UpdateFilamentStock from "./materials-page/sub sub pages/UpdateFilamentStock";
import FileAdditionPage from "./files-page/FileAdditionPage";
import FilePreview from "./files-page/FilePreview";
import PrintFileForm from "./files-page/PrintFileForm";
import EditProfilePage from "./materials-page/sub sub pages/EditProfiles";
import EditInventoryItem from "./materials-page/sub sub pages/EditInventoryItem";
import PrinterPage from "./home-page/sub_pages/PrinterPage";
import GcodeConsolePrinter from "./home-page/sub_pages/GcodeConsolePrinter";
import PrinterGeneralInfo from "./home-page/sub_pages/PrinterGeneralInfo";
import SettingsPrinter from "./home-page/sub_pages/SettingsPrinter";
import ProfilesInventoryPage from "./materials-page/sub_pages/ProfilesInventoryPage";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
function Layout() {
  return (
    <TooltipProvider>
      {" "}
      <SidebarProvider>
        <div className="h-screen w-full flex">
          <NavigationSideBar />
          <div className="flex-1 flex-col flex">
            <AppBar />
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>
          <Toaster richColors position="bottom-right" expand={true} />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      {
        path: "home",
        element: <HomePage />,
        children: [
          { index: true, element: <Navigate to="/home/printers" replace /> },

          { path: "dashboard", element: <Dashboard /> },
          {
            path: "printers",
            element: <Outlet />,
            children: [
              { index: true, element: <Printers /> },
              {
                path: ":idPrinter",
                element: <PrinterPage />, // This component must contain an <Outlet />
                children: [
                  {
                    index: true,
                    element: <NavigateWithParam />,
                  },
                  { path: "general", element: <PrinterGeneralInfo /> }, // You need this!
                  { path: "gcode-console", element: <GcodeConsolePrinter /> },
                  { path: "settings-printer", element: <SettingsPrinter /> },
                ],
              },
            ],
          },
        ],
      },
      { path: "printing-queue", element: <PrintQueuePage /> },
      {
        path: "files",
        element: <FilesPage />,
        children: [
          {
            path: "adding-part",
            element: <FileAdditionPage />,
            children: [
              {
                path: "the-card",
                element: <FilePreview />,
              },
            ],
          },
          { path: "printing-settings", element: <PrintFileForm /> },
        ],
      },
      {
        path: "materials",
        element: <MaterialsPage />,
        children: [
          {
            index: true,
            element: <Navigate to="/materials/profiles-inventory" replace />,
          },
          {
            path: "inventory-adjustments",
            element: <InventoryAdjustmentsPage />,
            children: [
              { path: "update-stock", element: <UpdateFilamentStock /> },
              { path: "edit/:id", element: <EditInventoryItem /> },
            ],
          },
          {
            path: "profiles-inventory",
            element: <ProfilesInventoryPage />,
            children: [
              { path: "create", element: <CreateProfile /> },
              { path: "edit/:id", element: <EditProfilePage /> },
            ],
          },
        ],
      },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
function NavigateWithParam() {
  const { modelName } = useParams();
  return <Navigate to={`/home/printers/${modelName}/general`} replace />;
}

export default function App() {
  return (
    <ProfilesProvider>
      <RouterProvider router={router} />
    </ProfilesProvider>
  );
}
