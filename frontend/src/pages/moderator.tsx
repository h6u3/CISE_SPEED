import { useEffect, useState } from 'react';
import axios from 'axios';

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

  // Fetch articles that require moderator approval
  const fetchPendingArticles = async () => {
    try {
      const response = await axios.get('http://localhost:8082/articles/moderation');
      const allArticles = response.data;
  
      // Unverified articles: Either submitter is not verified or moderator hasn't approved
      const unverified = allArticles.filter((article: Article) => {
        return !article.submitterVerified || (article.submitterVerified && !article.moderatorApproved);
      });
  
      // Verified articles: Both submitter and moderator approved
      const verified = allArticles.filter((article: Article) => {
        return article.submitterVerified && article.moderatorApproved;  // Both conditions should be true
      });
  
      setUnverifiedArticles(unverified);
      setVerifiedArticles(verified);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching pending articles:", error);
      setError(`Error fetching pending articles: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };
  

  // Approve an article
  const handleApprove = async (id: string) => {
    const confirmApproval = window.confirm("Are you sure you want to approve this article?");
    if (!confirmApproval) return;

    try {
      const response = await axios.post(`http://localhost:8082/articles/${id}/approve`);
      alert(response.data.message);  // Display success message
      fetchPendingArticles();  // Refresh the pending list after action
    } catch (error: any) {
      console.error("Error approving article:", error.response || error);
      alert("Failed to approve the article. Please try again.");
    }
  };

  // Reject an article
  const handleReject = async (id: string, reason: string) => {
    const confirmRejection = window.confirm(`Are you sure you want to reject this article? Reason: ${reason}`);
    if (!confirmRejection) return;

    try {
      const response = await axios.post(`http://localhost:8082/articles/${id}/reject`, { reason });
      alert(response.data.message);
      fetchPendingArticles();  // Refresh the list
    } catch (error: any) {
      console.error("Error rejecting article:", error.response || error);
      alert("Failed to reject the article. Please try again.");
    }
  };

  useEffect(() => {
    fetchPendingArticles();
  }, []);

  if (loading) {
    return <p>Loading pending articles...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Articles Pending Moderation</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left-hand side: Unverified Submitter Articles */}
        <div style={{ width: '45%' }}>
          <h2>Unverified or Rejected Articles</h2>
          {unverifiedArticles.length > 0 ? (
            <ul>
              {unverifiedArticles.map(article => (
                <li key={article._id}>
                  <h2>{article.title}</h2>
                  <p>By: {article.authors}</p>
                  <p>Status: Rejected (Unverified or Not Approved by Moderator)</p>
                  {/* No buttons needed for unverified articles */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No unverified articles.</p>
          )}
        </div>

        {/* Right-hand side: Verified Submitter Articles */}
        <div style={{ width: '45%' }}>
          <h2>Verified and Approved Articles</h2>
          {verifiedArticles.length > 0 ? (
            <ul>
              {verifiedArticles.map(article => (
                <li key={article._id}>
                  <h2>{article.title}</h2>
                  <p>By: {article.authors}</p>
                  <p>Status: Auto Submitted (Approved by Moderator)</p>
                  {/* No need for further approval or rejection */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No verified articles pending moderation.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeratorPage;
