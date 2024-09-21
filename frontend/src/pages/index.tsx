import { useState, useEffect } from "react";
import SortableTable from "../components/table/SortableTable";
import SearchBar from "../components/nav/SearchBar";
import Cookies from "js-cookie";
import data from "../utils/dummydata";

// Define interface for the articles
interface ArticlesInterface {
  id: string;
  title: string;
  authors: string;
  source: string;
  pubyear: string;
  doi: string;
  claim: string;
  evidence: string;
}

interface SavedQuery {
  queryName: string;
  queryData: string; // Assuming the search query is a string
}

const Home = () => {
  const headers: { key: keyof ArticlesInterface; label: string }[] = [
    { key: "title", label: "Title" },
    { key: "authors", label: "Authors" },
    { key: "source", label: "Source" },
    { key: "pubyear", label: "Publication Year" },
    { key: "doi", label: "DOI" },
    { key: "claim", label: "Claim" },
    { key: "evidence", label: "Evidence" },
  ];

  const articles: ArticlesInterface[] = data.map((article) => ({
    id: article.id ?? article._id,
    title: article.title,
    authors: article.authors,
    source: article.source,
    pubyear: article.pubyear,
    doi: article.doi,
    claim: article.claim,
    evidence: article.evidence,
  }));

  // State for search and saved queries
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [claim, setClaim] = useState<string>("");
  const [evidence, setEvidence] = useState<string>("");
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticlesInterface[]>(articles);

  // Load saved search queries from cookies when the page loads
  useEffect(() => {
    const allCookies = Cookies.get();
    const savedSearches = Object.keys(allCookies).map((key) => ({
      queryName: key,
      queryData: allCookies[key],
    }));
    setSavedQueries(savedSearches);
  }, []);

  // Filter the articles based on multiple search criteria
  const handleSearch = (query: string, startDate: string, endDate: string, claim: string, evidence: string) => {
    let filtered = articles;

    if (query.trim() !== "") {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.authors.toLowerCase().includes(query.toLowerCase()) ||
          article.source.toLowerCase().includes(query.toLowerCase()) ||
          article.claim.toLowerCase().includes(query.toLowerCase()) ||
          article.evidence.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (startDate) {
      filtered = filtered.filter((article) => parseInt(article.pubyear) >= parseInt(startDate));
    }

    if (endDate) {
      filtered = filtered.filter((article) => parseInt(article.pubyear) <= parseInt(endDate));
    }

    if (claim) {
      filtered = filtered.filter((article) => article.claim.toLowerCase().includes(claim.toLowerCase()));
    }

    if (evidence) {
      filtered = filtered.filter((article) => article.evidence.toLowerCase().includes(evidence.toLowerCase()));
    }

    setFilteredArticles(filtered);
    setSearchQuery(query);
    setStartDate(startDate);
    setEndDate(endDate);
    setClaim(claim);
    setEvidence(evidence);
  };

  // Save the current search query to cookies
  const saveSearchQuery = (query: string) => {
    const queryName = prompt("Enter a name for your saved search:");
    if (queryName) {
      Cookies.set(queryName, query, { expires: 7 }); // Save search query in cookies for 7 days
      setSavedQueries([...savedQueries, { queryName, queryData: query }]);
    }
  };

  // Reapply a saved search query
  const reapplySearchQuery = (queryData: string) => {
    setSearchQuery(queryData);
    setTimeout(() => handleSearch(queryData, startDate, endDate, claim, evidence), 0); // Apply the saved search immediately
  };

  return (
    <div className="container">
      <header>
        <h1>SPEED</h1>
      </header>

      <main>
        <section className="hero">
          <p>Welcome to SPEED, your software practice empirical evidence database.</p>
        </section>

        <section className="search-section">
          <h2>Search Articles</h2>
          <SearchBar
            onSearch={handleSearch}
            onSave={saveSearchQuery}
            searchQuery={searchQuery}
            startDate={startDate}
            endDate={endDate}
            claim={claim}
            evidence={evidence}
          />
        </section>

        {savedQueries.length > 0 && (
          <div>
            <h3>Saved Searches</h3>
            <ul>
              {savedQueries.map((query) => (
                <li key={query.queryName}>
                  {query.queryName}
                  <button onClick={() => reapplySearchQuery(query.queryData)}>
                    Reapply
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <section className="article-section">
          <h2>View Articles</h2>
          <SortableTable headers={headers} data={filteredArticles} />
        </section>
      </main>

      <footer>
        <p>© 2024 SPEED Project - All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Home;
