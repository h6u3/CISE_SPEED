import { GetStaticProps, NextPage } from "next";
import { useState, useEffect } from "react";
import SortableTable from "../../components/table/SortableTable";
import Cookies from "js-cookie";
// import data from "../../utils/dummydata";

interface ArticlesInterface {
  //id: string;
  title: string;
  authors: string;
  source: string;
  pubyear: string;
  doi: string;
  claim: string;
  evidence: string;
}

type ArticlesProps = {
  articles: ArticlesInterface[];
};

interface SavedQuery {
  queryName: string;
  queryData: string; // Assuming the search query is a string
}

const Articles: NextPage<ArticlesProps> = ({ articles }) => {
  const headers: { key: keyof ArticlesInterface; label: string }[] = [
    { key: "title", label: "Title" },
    { key: "authors", label: "Authors" },
    { key: "source", label: "Source" },
    { key: "pubyear", label: "Publication Year" },
    { key: "doi", label: "DOI" },
    { key: "claim", label: "Claim" },
    { key: "evidence", label: "Evidence" },
  ];

  // Search state and saved search state
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
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredArticles(articles); // Reset to full list if search query is empty
    } else {
      const filtered = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.evidence.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArticles(filtered);
    }
  };

  // Save the current search query to cookies
  const saveSearchQuery = () => {
    const queryName = prompt("Enter a name for your saved search:");
    if (queryName) {
      Cookies.set(queryName, searchQuery, { expires: 7 }); // Save search query in cookies for 7 days
      setSavedQueries([...savedQueries, { queryName, queryData: searchQuery }]);
    }
  };

  // Reapply a saved search query
  const reapplySearchQuery = (queryData: string) => {
    setSearchQuery(queryData);
    setTimeout(() => handleSearch(), 0); // Apply the saved search immediately
  };

  return (
    <div className="container">
      <h1>Articles Index Page</h1>
      <p>Page containing a table of articles:</p>

      {/* Search Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Enter search query"
      />
      <button onClick={handleSearch}>Search</button>
      <button onClick={saveSearchQuery}>Save Search</button>

      {/* List of Saved Search Queries */}
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

      {/* Table with filtered data */}
      <SortableTable headers={headers} data={filteredArticles} />
    </div>
  );
};


export const getStaticProps: GetStaticProps<ArticlesProps> = async () => {
  const response = await fetch('http://localhost:8082/articles');
  const articles: ArticlesInterface[] = await response.json();  // Add ArticlesInterface[] type


  return {
    props: {
      articles: articles.map((article: ArticlesInterface) => ({
        //id: article.id.toString(),
        title: article.title,
        authors: article.authors,
        source: article.source,
        pubyear: article.pubyear,
        doi: article.doi,
        claim: article.claim,
        evidence: article.evidence,
      })),
    },
  };
};


export default Articles;
