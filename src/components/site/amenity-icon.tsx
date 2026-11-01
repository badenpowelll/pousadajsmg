import { Car, Coffee, Refrigerator, ShowerHead, Snowflake, Sun, Tv, Wifi, Check, type LucideProps } from "lucide-react";

const icons: Record<string, React.ComponentType<LucideProps>> = {
  Wifi, Snowflake, Tv, Refrigerator, Coffee, Sun, Car, ShowerHead,
};

export function AmenityIcon({ name, ...props }: { name?: string | null } & Omit<LucideProps, "name">) {
  const Icon = (name && icons[name]) || Check;
  return <Icon {...props} />;
}
