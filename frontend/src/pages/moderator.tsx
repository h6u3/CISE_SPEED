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

  const fetchPendingArticles = async () => {
    try {
      const response = await axios.get('http://localhost:8082/articles/moderation');
      setPendingArticles(response.data);  // Set only pending articles
      setError(null);
    } catch (error: any) {
      console.error("Error fetching pending articles:", error);
      setError(`Error fetching pending articles: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const createArticle = async (articleData: any) => {
    try {
      const response = await axios.post('http://localhost:8082/articles', articleData);
      
      if (response.data.status === 'rejected') {
        alert('Duplicate article detected and rejected.');
      } else {
        alert('Article submitted successfully.');
      }

      fetchPendingArticles(); // Refresh the pending articles list after article submission
    } catch (error: any) {
      console.error('Error submitting article:', error);
      alert('Failed to submit article.');
    }
  };

  const handleApprove = async (id: string) => {
    const confirmApproval = window.confirm("Are you sure you want to approve this article?");
    if (!confirmApproval) return;
  
    setActionInProgress(id);
    try {
      const response = await axios.post(`http://localhost:8082/articles/${id}/approve`);
      
      if (response.data.status === 'rejected') {
        alert('Article was rejected due to duplication.');  // Notify moderator about rejection
      } else {
        alert(response.data.message);  // Display success message
      }
  
      fetchPendingArticles();  // Refresh the pending list after action
    } catch (error: any) {
      console.error("Error approving article:", error.response || error);
      alert("Failed to approve the article. Please try again.");
    } finally {
      setActionInProgress(null);
    }
  };
  
  const handleReject = async (id: string) => {
    const reason = prompt("Enter the reason for rejection:");
    if (!reason) return;

    const confirmRejection = window.confirm(`Are you sure you want to reject this article? Reason: ${reason}`);
    if (!confirmRejection) return;

    setActionInProgress(id);
    try {
      const response = await axios.post(`http://localhost:8082/articles/${id}/reject`, { reason });
      if (response.data.success) {
        alert(response.data.message);
        fetchPendingArticles(); // Refresh the list
      } else {
        alert("Failed to reject the article.");
      }
    } catch (error: any) {
      console.error("Error rejecting article:", error.response || error);
      alert("Failed to reject the article. Please try again.");
    } finally {
      setActionInProgress(null);
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
                disabled={actionInProgress === article._id}
              >
                {actionInProgress === article._id ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => handleReject(article._id)}
                disabled={actionInProgress === article._id}
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
