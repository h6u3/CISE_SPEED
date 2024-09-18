import React, { useState } from "react";
import styles from "./searchbar.module.scss";

interface SearchBarProps {
  onSearch: (query: string, startDate: string, endDate: string, claim: string, evidence: string) => void;
  onSave: (query: string) => void;
  searchQuery: string;
  startDate: string;
  endDate: string;
  claim: string;
  evidence: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onSave, searchQuery, startDate, endDate, claim, evidence }) => {
  const [query, setQuery] = useState<string>(searchQuery);
  const [start, setStart] = useState<string>(startDate);
  const [end, setEnd] = useState<string>(endDate);
  const [claimFilter, setClaimFilter] = useState<string>(claim);
  const [evidenceFilter, setEvidenceFilter] = useState<string>(evidence);

  const handleSearch = () => {
    onSearch(query, start, end, claimFilter, evidenceFilter);
  };

  const handleSave = () => {
    onSave(query);
  };

  return (
    <div className={styles["search-container"]}>
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
      <input
        type="text"
        className={styles["evidence-input"]}
        placeholder="Evidence"
        value={evidenceFilter}
        onChange={(e) => setEvidenceFilter(e.target.value)}
      />
      <div className={styles["button-group"]}>
        <button className={styles["search-button"]} onClick={handleSearch}>
          Search
        </button>
        <button className={styles["save-button"]} onClick={handleSave}>
          Save Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
