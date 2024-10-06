import { useEffect, useState } from 'react';
import axios from 'axios';

// Define the structure of an article
interface Article {
  _id: string;
  title: string;
  authors: string;
  status: string;
}

const ModeratorPage = () => {
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null); // Track action status

  // Fetch pending articles for moderation
  const fetchPendingArticles = async () => {
    try {
      const response = await axios.get('http://localhost:8082/articles');
      setPendingArticles(response.data);
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

    setActionInProgress(id); // Set the ID of the article being processed
    try {
      await axios.post(`http://localhost:8082/api/articles/${id}/approve`);
      fetchPendingArticles(); // Refresh the list after approval
    } catch (error: any) {
      console.error("Error approving article:", error);
      alert("Failed to approve the article. Please try again.");
    } finally {
      setActionInProgress(null); // Clear action progress
    }
  };

  // Reject an article
  const handleReject = async (id: string) => {
    const reason = prompt("Enter the reason for rejection:");
    if (!reason) return; // Exit if no reason is provided

    const confirmRejection = window.confirm(`Are you sure you want to reject this article? Reason: ${reason}`);
    if (!confirmRejection) return;

    setActionInProgress(id); // Set the ID of the article being processed
    try {
      await axios.post(`http://localhost:8082/api/articles/${id}/reject`, { reason });
      fetchPendingArticles(); // Refresh the list after rejection
    } catch (error: any) {
      console.error("Error rejecting article:", error);
      alert("Failed to reject the article. Please try again.");
    } finally {
      setActionInProgress(null); // Clear action progress
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
      {pendingArticles.length > 0 ? (
        <ul>
          {pendingArticles.map(article => (
            <li key={article._id}>
              <h2>{article.title}</h2>
              <p>By: {article.authors}</p>
              <p>Status: {article.status}</p>
              <button
                onClick={() => handleApprove(article._id)}
                disabled={actionInProgress === article._id} // Disable button if action is in progress
              >
                {actionInProgress === article._id ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => handleReject(article._id)}
                disabled={actionInProgress === article._id} // Disable button if action is in progress
              >
                {actionInProgress === article._id ? 'Rejecting...' : 'Reject'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No articles pending moderation.</p>
      )}
    </div>
  );
};

export default ModeratorPage;
