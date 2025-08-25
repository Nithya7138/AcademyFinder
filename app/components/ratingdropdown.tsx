"use client";
// Purpose: Dropdown to pick minimum rating filter for academies

interface RatingDropdownProps {
  minRating: string;
  setMinRating: (value: string) => void;
}

export default function RatingDropdown({ minRating, setMinRating }: RatingDropdownProps) {
  return (
    <select
      value={minRating}
      onChange={(e) => setMinRating(e.target.value)}
      className="h-12 px-4 rounded-lg border border-indigo-500 text-indigo-600 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-[160px]"
    >
      <option value="0">All Ratings</option>
      <option value="1">1.0 – 1.9 ⭐</option>
      <option value="2">2.0 – 2.9 ⭐</option>
      <option value="3">3.0 – 3.9 ⭐</option>
      <option value="4">4.0 – 4.9 ⭐</option>
      <option value="5">5.0 ⭐ only</option>
    </select>
  );
}