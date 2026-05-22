import { TabsLine } from "@/components/tabs-line";
import { useProfiles } from "@/context/ProfilesContext";
import { Printer } from "@/lib/types";
import axios from "axios";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";

type PrinterPageProps = {
  title?: string;
};

function PrinterPage({ title }: PrinterPageProps) {
  const { idPrinter } = useParams();
  console.log("here is the printer id", idPrinter);
  // const [printer, setPrinter] = useState<Printer | null>(null);
  // useEffect(() => {
  //   const fetchPrinter = async () => {
  //     const res = await axios.get(
  //       `http://localhost:3000/api/printers/${idPrinter}`,
  //     );
  //     setPrinter(res.data);
  //   };

  //   fetchPrinter();
  // }, [idPrinter]);
  const { printers } = useProfiles();

  const printer = printers.find((p) => p.id === idPrinter) ?? null;

  const paths = [
    {
      name: "General",
      path: `/home/printers/${idPrinter}/general`,
    },
    {
      name: "Gcode console",
      path: `/home/printers/${idPrinter}/gcode-console`,
    },
    {
      name: "Settings",
      path: `/home/printers/${idPrinter}/settings-printer`,
    },
  ];
  if (!printer) return <div>Loading...</div>;
  return (
    <>
      <p className="text-2xl mb-3">{printer?.model}</p>
      <div className="bg-white w-full p-4 rounded-md ring-1 ring-foreground/10 flex flex-col">
        <TabsLine paths={paths} />

        <Outlet context={printer} />
      </div>
    </>
  );
}

export default PrinterPage;
