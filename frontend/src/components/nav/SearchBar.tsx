import React, { useState } from "react";
import styles from "./searchbar.module.scss";

// Define the props type for SearchBar
interface SearchBarProps {
  onSearch: (query: string) => void;
  onSave: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onSave }) => {
  const [query, setQuery] = useState<string>("");

  const handleSearch = () => {
    onSearch(query);
  };

  const handleSave = () => {
    onSave(query);
  };

  return (
    <div className={styles['search-container']}>
      <input
        type="text"
        className={styles['search-input']}
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className={styles['search-button']} onClick={handleSearch}>
        Search
      </button>
      {/* Add a save button here */}
      <button className={styles['save-button']} onClick={handleSave}>
        Save Search
      </button>
    </div>
  );
};

export default SearchBar;
