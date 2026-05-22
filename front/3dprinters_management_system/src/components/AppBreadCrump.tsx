"use client";

import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { IconInnerShadowTop } from "@tabler/icons-react";

// Map URL segments to readable names
const nameMap: Record<string, string> = {
  home: "Home",
  materials: "Materials",
  files: "Files",
  queue: "Queue",
};

export function AppBreadcrumb() {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((x) => x); // removes empty strings
  console.log(pathnames);

  return (
    <Breadcrumb className="">
      <BreadcrumbList className="">
        <IconInnerShadowTop className="size-5!" />
        {">"}
        {pathnames.map((segment, index) => {
          const to = "/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1;

          return (
            <>
              {" "}
              <BreadcrumbItem key={to} className="flex items-center">
                {isLast ? (
                  <BreadcrumbPage className="">
                    {nameMap[segment.toLowerCase()] || segment}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="">
                    <Link to={to}>
                      {nameMap[segment.toLowerCase()] || segment}
                    </Link>
                  </BreadcrumbLink>
                )}

                {/* Only show separator if it's not the last */}
                {!isLast && <span className="px-1">{">"}</span>}
              </BreadcrumbItem>
            </>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
