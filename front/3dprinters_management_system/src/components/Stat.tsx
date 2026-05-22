import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function Stat({ label, description }: any) {
  return (
    <Card className="">
      {" "}
      <CardHeader className="flex flex-col">
        {" "}
        <CardDescription className="">{label}</CardDescription>{" "}
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {description}
        </CardTitle>{" "}
      </CardHeader>{" "}
    </Card>
  );
}
