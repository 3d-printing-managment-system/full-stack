import Form from "@/components/FormProfiles";
import { Toaster } from "@/components/ui/sonner";

function CreateProfile() {
  return (
    <div className="flex h-full justify-center mt-12">
      <Form />
      <Toaster />
    </div>
  );
}

export default CreateProfile;
