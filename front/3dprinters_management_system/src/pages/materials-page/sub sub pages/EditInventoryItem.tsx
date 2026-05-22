import FormInventory from "@/components/FormInventory";
import { useProfiles } from "@/context/ProfilesContext";
import { useParams } from "react-router-dom";

export default function EditInventoryItem() {
  const { id } = useParams();
  const { inventory } = useProfiles();

  const inventoryItem = inventory.find((p) => p.orderNumber === id);
  console.log(inventoryItem);
  if (!inventoryItem) return <div>inventory item not found</div>;

  return (
    <div className="flex h-full justify-center mt-12">
      <FormInventory inventoryItem={inventoryItem} />
    </div>
  );
}
