import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  statuses: { label: string; value: string }[];
  placeholder?: string;
}

export default function FilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statuses,
  placeholder = "Search records..."
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 w-full">
      {/* Search Input */}
      <div className="relative w-full md:w-96 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors z-10" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          className="h-14 pl-14 pr-6 bg-white border-2 border-gray-100 rounded-3xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-xl shadow-gray-200/20 placeholder:text-gray-400 placeholder:font-medium"
        />
      </div>

      {/* Status Switcher (Pill Style) */}
      <div className="flex items-center bg-white p-1.5 rounded-[2rem] border-2 border-gray-100 shadow-xl shadow-gray-200/10 w-full md:w-auto overflow-x-auto no-scrollbar">
        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            className={`
              px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap
              ${statusFilter === status.value
                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-100'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
}
