import { memo } from "react";

interface Props {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

export const StatCard = memo(function StatCard({ label, value, sub, accent = "text-indigo-600" }: Props) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
});
