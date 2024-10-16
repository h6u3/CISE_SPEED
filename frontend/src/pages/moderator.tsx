import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../components/nav/ModeratorPage.module.scss';

// Define the structure of an article
interface Article {
  _id: string;
  title: string;
  authors: string;
  status: string;
  submitterVerified: boolean;
  moderatorApproved: boolean;
  analystApproved: boolean;
}

const ModeratorPage = () => {
  const [verifiedArticles, setVerifiedArticles] = useState<Article[]>([]);
  const [unverifiedArticles, setUnverifiedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all articles and categorize them
  const fetchArticles = async () => {
    try {
      const response = await axios.get('http://localhost:8082/articles/all');
      const allArticles: Article[] = response.data;
  
      console.log("Fetched Articles:", allArticles); // Debug to ensure data is fetched
  
      // Unverified Articles: All fields are initially false
      const unverified = allArticles.filter((article) => 
        !article.submitterVerified && !article.moderatorApproved && !article.analystApproved
      );
  
      // Verified Articles: submitterVerified and moderatorApproved are true
      const verified = allArticles.filter((article) => 
        article.submitterVerified && article.moderatorApproved
      );
  
      setUnverifiedArticles(unverified);
      setVerifiedArticles(verified);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching articles:", error);
      setError(`Error fetching articles: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };
  

  // Approve an article
  const handleApprove = async (id: string) => {
    console.log("Approving article with ID:", id); // Log the ID to check if it's correct
  
    const confirmApproval = window.confirm("Are you sure you want to approve this article?");
    if (!confirmApproval) return;
  
    try {
      const response = await axios.post(`http://localhost:8082/articles/${id}/approve`);
      console.log('Article approved successfully:', response.data);
      fetchArticles();  // Refresh the lists after action
    } catch (error: any) {
      console.error("Error approving article:", error.response?.data || error.message);
      alert(`Failed to approve the article. ${error.response?.data?.message || 'Internal server error.'}`);
    }
  };
  
  
  

  useEffect(() => {
    fetchArticles();
  }, []);

  if (loading) {
    return <p>Loading articles...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <h1>Articles Pending Moderation</h1>
      <div className={styles.content}>
        {/* Left: Unverified Articles */}
        <div className={styles.unverified}>
          <h2>Unverified Articles</h2>
          {unverifiedArticles.length > 0 ? (
            <ul className={styles.articleList}>
              {unverifiedArticles.map(article => (
                <li key={article._id}>
                  <h2>{article.title}</h2>
                  <p>By: {article.authors}</p>
                  <p>Status: Unverified</p>
                  <button onClick={() => handleApprove(article._id)}>Verify</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No unverified articles.</p>
          )}
        </div>

        {/* Right: Verified Articles */}
        <div className={styles.verified}>
          <h2>Verified and Approved Articles</h2>
          {verifiedArticles.length > 0 ? (
            <ul className={styles.articleList}>
              {verifiedArticles.map(article => (
                <li key={article._id}>
                  <h2>{article.title}</h2>
                  <p>By: {article.authors}</p>
                  <p>Status: {article.analystApproved ? 'Fully Approved' : 'Moderator Approved'}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No verified articles available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeratorPage;
