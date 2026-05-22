import FormPrinter from "@/components/FormPrinter";
import { Printer } from "@/lib/types";
import { useOutletContext } from "react-router-dom";

function SettingsPrinter() {
  const printer = useOutletContext<Printer>();

  return (
    <div className="flex justify-center w-full">
      <FormPrinter printer={printer} />
    </div>
  );
}

export default SettingsPrinter;
