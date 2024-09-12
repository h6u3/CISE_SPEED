import { GetStaticProps, NextPage } from "next";
import { useState, useEffect } from "react";
import SortableTable from "../../components/table/SortableTable";
import Cookies from "js-cookie";
import data from "../../utils/dummydata";

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

type ArticlesProps = {
  articles: ArticlesInterface[];
};

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

   // Search state and saved searches state
   const [searchQuery, setSearchQuery] = useState('');
   const [savedQueries, setSavedQueries] = useState([]);
    // Load saved search queries from cookies on page load
  useEffect(() => {
    const allCookies = Cookies.get();
    const savedSearches = Object.keys(allCookies).map((key) => ({
      queryName: key,
      queryData: allCookies[key],
    }));
    setSavedQueries(savedSearches);
  }, []);

  // Save the current search query to cookies
  const saveSearchQuery = () => {
    const queryName = prompt("Enter a name for your saved search:");
    if (queryName) {
      Cookies.set(queryName, searchQuery, { expires: 7 }); // Save search query in cookies for 7 days
      setSavedQueries([...savedQueries, { queryName, queryData: searchQuery }]);
    }
  };

  // Reapply a saved search query
  const reapplySearchQuery = (queryData) => {
    setSearchQuery(queryData);
    handleSearch();
  };

  return (
    <div className="container">
      <h1>Articles Index Page</h1>
      <p>Page containing a table of articles:</p>
      <SortableTable headers={headers} data={articles} />
    </div>
  );
};

export const getStaticProps: GetStaticProps<ArticlesProps> = async (_) => {
  // Map the data to ensure all articles have consistent property names
  const articles = data.map((article) => ({
    id: article.id ?? article._id,
    title: article.title,
    authors: article.authors,
    source: article.source,
    pubyear: article.pubyear,
    doi: article.doi,
    claim: article.claim,
    evidence: article.evidence,
  }));


  return {
    props: {
      articles,
    },
  };
};

export default Articles;
