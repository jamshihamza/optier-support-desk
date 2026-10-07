import { useQuery } from "@tanstack/react-query";
import { WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../lib/api";

/** The server is a PC at Azoan, so tell people plainly when it cannot be reached. */
export function ConnectionBanner() {
  const { t } = useTranslation();
  const { isError } = useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    refetchInterval: 10_000,
    retry: false,
  });
  if (!isError) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 bg-danger-soft px-4 py-2 text-sm font-medium text-danger"
    >
      <WifiOff size={16} aria-hidden="true" />
      {t("topbar.connectionLost")}
    </div>
  );
}
