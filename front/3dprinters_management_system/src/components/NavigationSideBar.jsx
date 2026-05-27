import photo from "@/assets/images/photo.jpg";
import {
  IconDashboard,
  IconDotsVertical,
  IconFolder,
  IconInnerShadowTop,
  IconListDetails,
  IconUserCircle,
  IconCreditCard,
  IconLogout,
  IconBell,
  IconSettings,
  IconHelp,
} from "@tabler/icons-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { ResourcesModal } from "./ResourcesModal";

const data = {
  navSecondary: [
    {
      title: "Get Help",
      // path: "/printing-queue",
      icon: IconHelp,
    },
  ],
  navMain: [
    {
      title: "Home",
      path: "/",
      icon: IconDashboard,
      activePaths: ["/home/printers", "/home/dashboard"], // 👈 add your sub paths here
    },
    {
      title: "Printing Queue",
      path: "/printing-queue",
      icon: IconListDetails,
    },
    {
      title: "Files",
      path: "/files",
      icon: IconFolder,
    },
    {
      title: "Materials",
      path: "/materials",
      icon: IconFolder,
    },
  ],
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};
function NavigationSideBar() {
  const { isMobile } = useSidebar();
  const [open, setOpen] = useState(false);
  return (
    <>
      {" "}
      <Sidebar className="p-4">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:p-1.5!"
              >
                <NavLink to="/">
                  <IconInnerShadowTop className="size-5!" />
                  <span className="text-base font-semibold">NovaForma.</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="flex flex-col justify-between">
          <SidebarGroup>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink to={item.path}>
                    {({ isActive }) => {
                      const active =
                        isActive ||
                        item.activePaths?.some((p) =>
                          location.pathname.startsWith(p),
                        );

                      return (
                        <SidebarMenuButton asChild isActive={active}>
                          <span>
                            <item.icon />
                            <span>{item.title}</span>
                          </span>
                        </SidebarMenuButton>
                      );
                    }}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarMenu>
              {data.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.path ? (
                    <SidebarMenuButton
                      asChild
                      onClick={() => setOpen(true)}
                      className="cursor-pointer"
                    >
                      <NavLink to={item.path} end={item.path === "/"}>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      onClick={() => setOpen(true)}
                      className="cursor-pointer"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg grayscale">
                      <AvatarImage src={photo} alt="Onichan senpai" />
                      <AvatarFallback className="rounded-lg">GN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">Onichan</span>
                      <span className="truncate text-xs text-muted-foreground">
                        mn.guessoum@esi-sba.dz
                      </span>
                    </div>
                    <IconDotsVertical className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={photo} alt="Onichan senpai" />
                        <AvatarFallback className="rounded-lg">
                          GN
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">Onichan</span>
                        <span className="truncate text-xs text-muted-foreground">
                          mn.guessoum@esi-sba.dz
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <IconSettings />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconUserCircle />
                      Account
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconCreditCard />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconBell />
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <IconLogout />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <ResourcesModal open={open} onOpenChange={setOpen} />
    </>
  );
}

export default NavigationSideBar;
