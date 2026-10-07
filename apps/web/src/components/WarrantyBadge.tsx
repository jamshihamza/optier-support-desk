import type { WarrantyStatus } from "@optier/shared";
import { useTranslation } from "react-i18next";
import type { Tone } from "../lib/status";
import { StatusChip } from "./StatusChip";

const tone: Record<WarrantyStatus, Tone> = {
  in_warranty: "ok",
  expiring: "warn",
  expired: "danger",
  unknown: "neutral",
};

/** Dashed outline marks a sale date stated by the customer and not yet verified (docs/UI.md 4.3). */
export function WarrantyBadge({
  status,
  unverified = false,
}: {
  status: WarrantyStatus;
  unverified?: boolean;
}) {
  const { t } = useTranslation();
  const chip = <StatusChip tone={tone[status]} label={t(`warranty.${status}`)} />;
  if (!unverified) return chip;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-muted px-1 py-0.5">
      {chip}
      <span className="pr-1.5 text-xs text-muted">{t("warranty.unverified")}</span>
    </span>
  );
}
