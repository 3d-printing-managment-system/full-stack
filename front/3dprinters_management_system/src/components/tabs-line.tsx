import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "react-router-dom";
export function TabsLine({
  paths,
}: {
  paths?: { name: string; path: string }[];
}) {
  if (!paths) return null;
  const location = useLocation();
  const activeTab = paths.reduce<string | null>((best, item) => {
    if (
      location.pathname.startsWith(item.path) &&
      (best === null || item.path.length > best.length)
    ) {
      return item.path;
    }
    return best;
  }, null);
  return (
    <Tabs className="mb-6 border-b-2  border-gray-200" value={activeTab ?? ""}>
      <TabsList variant="line" className="">
        {paths.map((item) => (
          <TabsTrigger value={item.path} className="" key={item.path} asChild>
            <Link to={item.path}>{item.name}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
