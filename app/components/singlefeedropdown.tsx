"use client";

interface SingleFeeDropdownProps {
  feeCap: string; // "all" or a numeric string like "1000"
  setFeeCap: (value: string) => void;
  items?: { label: string; value: string }[];
}

const defaultItems: { label: string; value: string }[] = [
  { label: "All Fees", value: "all" },
  { label: "Under ₹1,000", value: "1000" },
  { label: "Under ₹2,000", value: "2000" },
  { label: "Under ₹5,000", value: "5000" },
  { label: "Under ₹10,000", value: "10000" },
];

export default function SingleFeeDropdown({ feeCap, setFeeCap, items }: SingleFeeDropdownProps) {
  const options = items && items.length > 0 ? items : defaultItems;
  return (
    <select
      value={feeCap}
      onChange={(e) => setFeeCap(e.target.value)}
      className="h-12 px-4 rounded-lg border border-indigo-500 text-indigo-600 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-[160px]"
      title="Max monthly fee"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}