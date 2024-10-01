import { useState, useEffect } from "react";
import SortableTable from "../components/table/SortableTable";
import SearchBar from "../components/nav/SearchBar";
import Cookies from "js-cookie";

// Define interfaces for articles and saved queries
interface ArticlesInterface {
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
  queryData: {
    query: string;
    startDate: string;
    endDate: string;
    claim: string;
    evidence: string;
  };
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

  // State for articles, search, saved queries, loading, and error handling
  const [articles, setArticles] = useState<ArticlesInterface[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticlesInterface[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [claim, setClaim] = useState<string>("");
  const [evidence, setEvidence] = useState<string>("");
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved queries from cookies and fetch articles on mount
  useEffect(() => {
    const allCookies = Cookies.get();
    
    // Parse saved queries from cookies
    const savedSearches = Object.keys(allCookies)
      .map((key) => {
        try {
          const queryData = allCookies[key] ? JSON.parse(allCookies[key]) : null;
          return {
            queryName: key,
            queryData: queryData,
          };
        } catch (error) {
          console.error(`Failed to parse cookie for ${key}:`, error);
          return null;
        }
      })
      .filter((item) => item !== null); // Filter out null values in case of errors

    console.log("Loaded saved queries:", savedSearches); // Debugging: log saved queries
    setSavedQueries(savedSearches);

    const fetchArticles = async () => {
      try {
        const response = await fetch("http://localhost:8082/articles");
        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }
        const data: ArticlesInterface[] = await response.json();
        setArticles(data);
        setFilteredArticles(data); // Set initial state of filtered articles
      } catch (error) {
        setError("Error fetching articles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Handle the search logic
  const handleSearch = (
    query: string,
    startDate: string,
    endDate: string,
    claim: string,
    evidence: string
  ) => {
    let filtered = articles;

    if (query.trim() !== "") {
      filtered = filtered.filter((article) =>
        article.title?.toLowerCase().includes(query.toLowerCase()) ||
        article.authors?.toLowerCase().includes(query.toLowerCase()) ||
        article.source?.toLowerCase().includes(query.toLowerCase()) ||
        article.claim?.toLowerCase().includes(query.toLowerCase()) ||
        article.evidence?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (startDate) {
      filtered = filtered.filter(
        (article) => parseInt(article.pubyear) >= parseInt(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (article) => parseInt(article.pubyear) <= parseInt(endDate)
      );
    }

    if (claim) {
      filtered = filtered.filter((article) =>
        article.claim?.toLowerCase().includes(claim.toLowerCase())
      );
    }

    if (evidence) {
      filtered = filtered.filter((article) =>
        article.evidence?.toLowerCase().includes(evidence.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
    setSearchQuery(query);
    setStartDate(startDate);
    setEndDate(endDate);
    setClaim(claim);
    setEvidence(evidence);
  };

  // Save the current search query to cookies
  const saveSearchQuery = () => {
    const queryName = prompt("Enter a name for your saved search:");
    if (queryName) {
      const queryData = {
        query: searchQuery,
        startDate,
        endDate,
        claim,
        evidence,
      };
      Cookies.set(queryName, JSON.stringify(queryData), { expires: 7 }); // Set cookie to expire in 7 days
      setSavedQueries([...savedQueries, { queryName, queryData }]); // Update state with new saved query
    }
  };

  // Reapply a saved search query
  const reapplySearchQuery = (queryData: SavedQuery["queryData"]) => {
    // Check if queryData exists and is valid
    if (!queryData) {
      console.error("Invalid or null query data.");
      alert("The saved search data is corrupted or unavailable.");
      return; // Exit early if queryData is invalid
    }
  
    // Log for debugging (optional)
    console.log("Reapplying query:", queryData);
  
    // Safely reapply the search query and fields (empty string fallback)
    setSearchQuery(queryData.query || "");
    setStartDate(queryData.startDate || "");
    setEndDate(queryData.endDate || "");
    setClaim(queryData.claim || "");
    setEvidence(queryData.evidence || "");
  
    // Trigger search, even if it's invalid data (which will result in no results)
    handleSearch(
      queryData.query || "",
      queryData.startDate || "",
      queryData.endDate || "",
      queryData.claim || "",
      queryData.evidence || ""
    );
  };
  


  if (loading) {
    return <div>Loading articles...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

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
                  <button onClick={() => reapplySearchQuery(query.queryData)}>Reapply</button>
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
