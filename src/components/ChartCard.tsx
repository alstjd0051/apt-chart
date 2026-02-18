import { memo, type ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const ChartCard = memo(function ChartCard({ title, description, children, className = "" }: Props) {
  return (
    <div className={`rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      <div className="w-full overflow-x-auto">{children}</div>
    </div>
  );
});
