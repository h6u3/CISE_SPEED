import React, { useState } from 'react';
import styles from './SearchBar.module.scss';

const SearchBar = () => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    // Handle the search logic here
    console.log("Searching for:", query);
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className={styles.searchButton} onClick={handleSearch}>
        Submit
      </button>
    </div>
  );
};

export default SearchBar;
