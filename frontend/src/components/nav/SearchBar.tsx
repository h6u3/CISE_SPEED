import React, { useState, useEffect } from "react";
import styles from "./searchbar.module.scss";

interface SearchBarProps {
  onSearch: (query: string, startDate: string, endDate: string, claim: string) => void;
  onSave: (query: string) => void;
  searchQuery: string;
  startDate: string;
  endDate: string;
  claim: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onSave, searchQuery, startDate, endDate, claim }) => {
  const [query, setQuery] = useState<string>(searchQuery);
  const [start, setStart] = useState<string>(startDate);
  const [end, setEnd] = useState<string>(endDate);
  const [claimFilter, setClaimFilter] = useState<string>(claim);

  // Sync local state with parent props when they change
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setStart(startDate);
  }, [startDate]);

  useEffect(() => {
    setEnd(endDate);
  }, [endDate]);

  useEffect(() => {
    setClaimFilter(claim);
  }, [claim]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page refresh
    onSearch(query, start, end, claimFilter);
  };

  const handleSave = () => {
    onSave(query);
  };

  return (
    <form className={styles["search-container"]} onSubmit={handleSearch}>
      <input
        type="text"
        className={styles["search-input"]}
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <input
        type="text"
        className={styles["date-input"]}
        placeholder="Start Year"
        value={start}
        onChange={(e) => setStart(e.target.value)}
      />
      <input
        type="text"
        className={styles["date-input"]}
        placeholder="End Year"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
      />
      <input
        type="text"
        className={styles["claim-input"]}
        placeholder="Claim"
        value={claimFilter}
        onChange={(e) => setClaimFilter(e.target.value)}
      />
      <div className={styles["button-group"]}>
        <button type="submit" className={styles["search-button"]}>
          Search
        </button>
        <button type="button" className={styles["save-button"]} onClick={handleSave}>
          Save Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
