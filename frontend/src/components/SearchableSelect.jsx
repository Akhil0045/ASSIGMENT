import React, { useState, useRef, useEffect } from 'react';

const SearchableSelect = ({ options, value, onChange, placeholder = "Select category..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find((opt) => opt === value || opt.value === value);
  const selectedLabel = typeof selectedOption === 'string' ? selectedOption : selectedOption?.label || value;

  // Filter options based on search text
  const filteredOptions = options.filter((opt) => {
    const label = typeof opt === 'string' ? opt : opt.label;
    return label.toLowerCase().includes(search.toLowerCase());
  });

  const exactMatchExists = options.some((opt) => {
    const label = typeof opt === 'string' ? opt : opt.label;
    return label.toLowerCase() === search.toLowerCase().trim();
  });

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Focus input when popover opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    } else {
      setSearch(''); // Reset search on close
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    const val = typeof option === 'string' ? option : option.value;
    onChange({ target: { name: 'category', value: val } });
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 text-left px-4 border border-slate-200 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex justify-between items-center transition-colors shadow-sm rounded-xl text-sm"
      >
        <span className={selectedLabel ? "text-slate-800 font-medium" : "text-slate-400"}>
          {selectedLabel || placeholder}
        </span>
        <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search category..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <ul className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 && search.trim() === '' ? (
              <li className="px-4 py-3 text-sm text-slate-500 italic text-center">No categories found</li>
            ) : (
              filteredOptions.map((opt, i) => {
                const label = typeof opt === 'string' ? opt : opt.label;
                const val = typeof opt === 'string' ? opt : opt.value;
                const active = value === val;
                return (
                  <li
                    key={i}
                    onClick={() => handleSelect(opt)}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm rounded-lg cursor-pointer transition-colors ${
                      active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{label}</span>
                    {active && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                  </li>
                );
              })
            )}
            
            {search.trim().length > 0 && !exactMatchExists && (
              <li
                onClick={() => handleSelect(search.trim())}
                className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg cursor-pointer text-indigo-600 font-medium bg-indigo-50/50 hover:bg-indigo-50 transition-colors border border-dashed border-indigo-200 mt-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Create "{search.trim()}"
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
