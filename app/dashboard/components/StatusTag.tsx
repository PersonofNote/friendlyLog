import { getStatusColor, getStatusIcon, getStatusLabel } from "./helpers";



export function StatusTag({
  status,
  onClick,
}: {
  status: string;
  onClick?: (status: string) => void;
}) {
  const color = getStatusColor(status);
  return (
    <button
      onClick={() => onClick?.(status)}
      className={`flex items-center gap-1 ${color} text-sm font-medium rounded-full px-2 py-1 hover:bg-base-200 transition`}
    >
      <span>{getStatusIcon(status)}</span>
      <span>{getStatusLabel(status)}</span>
    </button>
  );
}
