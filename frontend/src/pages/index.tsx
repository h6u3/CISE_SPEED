import { useState, useEffect } from "react";
import SortableTable from "../components/table/SortableTable";
import SearchBar from "../components/nav/SearchBar";
import Cookies from "js-cookie";

// Define interfaces for articles and saved queries
interface ArticlesInterface {
  title: string;
  authors: string;
  pubYear: string;
  doi: string;
  claim: string;
  evidence: string;  // Include evidence field
}

interface SavedQuery {
  queryName: string;
  queryData: {
    query: string;
    startDate: string;
    endDate: string;
    claim: string;
    evidence: string;  // Include evidence in saved queries
  };
}

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const Home = () => {
  const headers: { key: keyof ArticlesInterface; label: string }[] = [
    { key: "title", label: "Title" },
    { key: "authors", label: "Authors" },
    { key: "pubYear", label: "Publication Year" },
    { key: "doi", label: "DOI" },
    { key: "claim", label: "Claim" },
    { key: "evidence", label: "Evidence" }, // Add evidence to table headers
  ];

  const [articles, setArticles] = useState<ArticlesInterface[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticlesInterface[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [claim, setClaim] = useState<string>("");
  const [evidence, setEvidence] = useState<string>(""); // Add state for evidence

  const [page, setPage] = useState(1); // Current page
  const [limit] = useState(10); // Limit per page
  const [totalPages, setTotalPages] = useState(1); // Total pages
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved queries from cookies
  useEffect(() => {
    const savedSearches = Object.keys(Cookies.get()).map((key) => {
      const queryData = Cookies.get(key);
      return {
        queryName: key,
        queryData: queryData ? JSON.parse(queryData) : null,
      };
    }).filter(item => item.queryData); // Filter out any null data
    setSavedQueries(savedSearches as SavedQuery[]);
  }, []);

  // Function to fetch articles from the backend with search and pagination
  const fetchArticles = async (query = "", startDate = "", endDate = "", claim = "", evidence = "") => {
    setLoading(true);
    try {
      const searchUrl = `${apiUrl}/articles/search?query=${query}&startDate=${startDate}&endDate=${endDate}&claim=${claim}&evidence=${evidence}&page=${page}&limit=${limit}`;
      console.log("API URL being used:", searchUrl);
    
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
    
      const data = await response.json();
      console.log("Fetched data:", data);  // Log fetched data to inspect
      setArticles(data.articles);
      setFilteredArticles(data.articles);
      setTotalPages(Math.ceil(data.totalCount / limit));  // Set total pages for pagination
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(`Error fetching articles: ${error.message}`);
      } else {
        setError("Error fetching articles: An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  

  // Fetch articles when the page or search changes
  useEffect(() => {
    fetchArticles(searchQuery, startDate, endDate, claim, evidence); // Include evidence in fetch
  }, [page, searchQuery, startDate, endDate, claim, evidence]);

  // Handle search logic
  const handleSearch = (
    query: string,
    startDate: string,
    endDate: string,
    claim: string,
    evidence: string  // Add evidence to handleSearch
  ) => {
    setSearchQuery(query);
    setStartDate(startDate);
    setEndDate(endDate);
    setClaim(claim);
    setEvidence(evidence);  // Update evidence state
    setPage(1);  // Reset to the first page when searching
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
        evidence,  // Include evidence in saved queries
      };
      Cookies.set(queryName, JSON.stringify(queryData), { expires: 30 });
      setSavedQueries([...savedQueries, { queryName, queryData }]);
    }
  };

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
            evidence={evidence}  // Pass evidence to SearchBar
          />
        </section>

        {savedQueries.length > 0 && (
          <div>
            <h3>Saved Searches</h3>
            <ul>
              {savedQueries.map((query) => (
                <li key={query.queryName}>
                  {query.queryName}
                </li>
              ))}
            </ul>
          </div>
        )}

        <section className="article-section">
          <h2>View Articles</h2>
          <SortableTable headers={headers} data={filteredArticles} />

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                disabled={page === index + 1}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <p>© 2024 SPEED Project - All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Home;
