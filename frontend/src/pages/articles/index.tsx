import { GetStaticProps, NextPage } from "next";
import { useState, useEffect } from "react";
import SortableTable from "../../components/table/SortableTable";
import Cookies from "js-cookie";

interface ArticlesInterface {
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
  queryData: string;
}

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ArticlesInterface[]>(articles);

  useEffect(() => {
    const allCookies = Cookies.get();
    const savedSearches = Object.keys(allCookies).map((key) => ({
      queryName: key,
      queryData: allCookies[key],
    }));
    setSavedQueries(savedSearches);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredArticles(articles);
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

  const saveSearchQuery = () => {
    const queryName = prompt("Enter a name for your saved search:");
    if (queryName) {
      Cookies.set(queryName, searchQuery, { expires: 7 });
      setSavedQueries([...savedQueries, { queryName, queryData: searchQuery }]);
    }
  };

  const reapplySearchQuery = (queryData: string) => {
    setSearchQuery(queryData);
    setTimeout(() => handleSearch(), 0);
  };

  return (
    <div className="container">
      <h1>Articles Index Page</h1>
      <p>Page containing a table of articles:</p>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Enter search query"
      />
      <button onClick={handleSearch}>Search</button>
      <button onClick={saveSearchQuery}>Save Search</button>

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

      <SortableTable headers={headers} data={filteredArticles} />
    </div>
  );
};

export const getStaticProps: GetStaticProps<ArticlesProps> = async () => {
  const response = await fetch(apiUrl ? `${apiUrl}/articles` : 'http://localhost:8082/articles');
  const articles: ArticlesInterface[] = await response.json();

  return {
    props: {
      articles: articles.map((article: ArticlesInterface) => ({
        title: article.title || "Unknown Title",  // Fallback for undefined title
        authors: article.authors || "Unknown Authors",  // Fallback for undefined authors
        source: article.source || "Unknown Source",
        pubyear: article.pubyear || "Unknown Year",
        doi: article.doi || "Unknown DOI",
        claim: article.claim || "No Claim",
        evidence: article.evidence || "No Evidence",
      })),
    },
  };
};

export default Articles;
