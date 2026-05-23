import { useParams } from "react-router-dom";
import { useProfiles } from "@/context/ProfilesContext";
import FormProfiles from "@/components/FormProfiles";

export default function EditProfilePage() {
  const { id } = useParams(); // /edit/:id
  const { profiles } = useProfiles();

  const profile = profiles.find((p) => p.id === id);
  console.log("here is the profile", profile);

  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="flex h-full justify-center mt-12">
      <FormProfiles profile={profile} />
    </div>
  );
}
