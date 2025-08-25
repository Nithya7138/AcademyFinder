"use client";
// Purpose: Dropdown for selecting academy type filter (All, Sports, Art)

interface FilterDropdownProps {
  filter: string;
  setFilter: (value: string) => void;
}

export default function FilterDropdown({ filter, setFilter }: FilterDropdownProps) {
  return (
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="h-12 px-4 rounded-lg border border-indigo-500 text-indigo-600 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-[160px]"
    >
      <option value="all">All Types</option>
      <option value="Sports">Sports</option>
      <option value="Art">Art</option>
    </select>
  );
}
