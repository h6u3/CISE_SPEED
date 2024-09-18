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

  // Filter the articles based on the search query
  const handleSearch = (query: string) => {
    if (query.trim() === "") {
      setFilteredArticles(articles); // Reset to full list if search query is empty
    } else {
      const filtered = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.authors.toLowerCase().includes(query.toLowerCase()) ||
          article.source.toLowerCase().includes(query.toLowerCase()) ||
          article.claim.toLowerCase().includes(query.toLowerCase()) ||
          article.evidence.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredArticles(filtered);
    }
    setSearchQuery(query); // Update the search query state
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
    setTimeout(() => handleSearch(queryData), 0); // Apply the saved search immediately
  };

  return (
    <div className="container">
      {/* Header with logo */}
      <header>
        <h1>SPEED</h1> {/* Logo or App name */}
      </header>

      <main>
        {/* Welcome or introduction text */}
        <section className="hero">
          <p>Welcome to SPEED, your software practice empirical evidence database.</p>
        </section>

        {/* Search Section */}
        <section className="search-section">
          <h2>Search Articles</h2>
          {/* Using the SearchBar component */}
          <SearchBar searchQuery={searchQuery} onSearch={handleSearch} onSave={saveSearchQuery} />
        </section>

        {/* Saved searches */}
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

        {/* Table of articles */}
        <section className="article-section">
          <h2>View Articles</h2>
          <SortableTable headers={headers} data={filteredArticles} />
        </section>
      </main>

      {/* Footer */}
      <footer>
        <p>© 2024 SPEED Project - All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Home;
