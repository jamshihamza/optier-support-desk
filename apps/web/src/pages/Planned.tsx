import { useTranslation } from "react-i18next";
import { EmptyState } from "../components/EmptyState";

export function Planned({ name }: { name: string }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-card border border-line bg-surface">
      <EmptyState title={t("planned.title", { name })}>{t("planned.body")}</EmptyState>
    </div>
  );
}
