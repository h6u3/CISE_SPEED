import { useState, useEffect } from "react";
import SortableTable from "../components/table/SortableTable";
import SearchBar from "../components/nav/SearchBar";
import Cookies from "js-cookie";

// Define interfaces for articles and saved queries
interface ArticlesInterface {
  title: string;
  authors: string;
  pubyear: string;
  doi: string;
  claim: string;
}

interface SavedQuery {
  queryName: string;
  queryData: {
    query: string;
    startDate: string;
    endDate: string;
    claim: string;
  };
}

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const Home = () => {
  const headers: { key: keyof ArticlesInterface; label: string }[] = [
    { key: "title", label: "Title" },
    { key: "authors", label: "Authors" },
    { key: "pubyear", label: "Publication Year" },
    { key: "doi", label: "DOI" },
    { key: "claim", label: "Claim" }
  ];

  const [articles, setArticles] = useState<ArticlesInterface[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticlesInterface[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [claim, setClaim] = useState<string>("");
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved queries from cookies on component mount
  useEffect(() => {
    const savedQueryKeys = Object.keys(Cookies.get());
    const uniqueQueries = new Set(savedQueryKeys); // Ensure unique saved searches
    const loadedSavedQueries = Array.from(uniqueQueries).map((key) => ({
      queryName: key,
      queryData: JSON.parse(Cookies.get(key) || '{}'),
    }));
    setSavedQueries(loadedSavedQueries);
  }, []);

  // Fetch verified articles on mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(apiUrl ? `${apiUrl}/articles/all` : 'http://localhost:8082/articles/all');  // Assuming this only returns verified articles
        if (!response.ok) {
          throw new Error("Failed to fetch articles");
        }
        const data: ArticlesInterface[] = await response.json();
  
        const sanitizedData = data.map((article) => ({
          ...article,
          title: article.title || "Untitled",
          authors: article.authors || "Unknown",
          pubyear: article.pubyear || "N/A",
          doi: article.doi || "N/A",
          claim: article.claim || "N/A",
        }));
  
        setArticles(sanitizedData);
        setFilteredArticles(sanitizedData);  // Initialize filtered articles to show all
      } catch (error) {
        setError("Error fetching articles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchArticles();
  }, []);

  // Handle search logic
  const handleSearch = (
    query: string,
    startDate: string,
    endDate: string,
    claim: string
  ) => {
    let filtered = articles;

    if (query.trim() !== "") {
      filtered = filtered.filter((article) =>
        article.title?.toLowerCase().includes(query.toLowerCase()) ||
        article.authors?.toLowerCase().includes(query.toLowerCase()) ||
        article.claim?.toLowerCase().includes(query.toLowerCase())
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

    setFilteredArticles(filtered);
  };

  // Save search query to cookies
  const saveSearchQuery = () => {
    const queryName = prompt("Enter a name for your saved search:");
    if (queryName) {
      const queryData = {
        query: searchQuery,
        startDate,
        endDate,
        claim,
      };
      Cookies.set(queryName, JSON.stringify(queryData), { expires: 30 });  // Set expiration to 30 days
      setSavedQueries([...savedQueries, { queryName, queryData }]);
    }
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
          />
        </section>

        {savedQueries.length > 0 && (
          <div>
            <h3>Saved Searches</h3>
            <ul>
              {savedQueries.map((query) => (
                <li key={query.queryName}>
                  {query.queryName}
                  {/* Remove the reapply button */}
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
