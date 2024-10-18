import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../components/nav/AnalystPage.module.scss';

interface Article {
  _id: string;
  title: string;
  authors: string;
  claim: string;
  evidence: string;
  status: string;
  submitterVerified: boolean;
  moderatorApproved: boolean;
  analystApproved: boolean;
}

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const AnalystPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null); // Track the article being edited
  const [editedClaim, setEditedClaim] = useState<string>('');  // Store edited claim
  const [editedEvidence, setEditedEvidence] = useState<string>(''); // Store edited evidence

  // Fetch articles that are approved by the moderator but not by the analyst
  const fetchAnalystQueue = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/articles/analyst-queue`);
      setArticles(response.data.articles);
      setError(null);
    } catch (error: any) {
      setError(`Error fetching analyst queue: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  // Edit button handler to allow editing of claim and evidence
  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setEditedClaim(article.claim || ''); // Initialize claim for editing
    setEditedEvidence(article.evidence || ''); // Initialize evidence for editing
  };

  // Save changes to claim and evidence
  const handleSave = async (articleId: string) => {
    try {
      setLoading(true);
      const updatedArticle = {
        claim: editedClaim,
        evidence: editedEvidence,
      };

      await axios.post(`${apiUrl}/articles/${articleId}/analyst-approve`, updatedArticle);
      fetchAnalystQueue(); // Refresh the queue after saving
      setEditingArticle(null); // Close edit mode
    } catch (error: any) {
      setError(`Error saving article: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalystQueue();  // Fetch the articles on component mount
  }, []);

  if (loading) {
    return <p>Loading articles...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.container}>
      <h1>Articles for Analyst Review</h1>
      {articles.length > 0 ? (
        <ul className={styles.articleList}>
          {articles.map((article) => (
            <li key={article._id}>
              <h2>{article.title}</h2>
              <p>By: {article.authors}</p>
              <p>Status: Pending Analyst Review</p>

              {/* If the article is being edited, show input fields */}
              {editingArticle && editingArticle._id === article._id ? (
                <div className={styles.editForm}>
                  <label>
                    Claim:
                    <textarea
                      value={editedClaim}
                      onChange={(e) => setEditedClaim(e.target.value)}
                    />
                  </label>
                  <label>
                    Evidence:
                    <textarea
                      value={editedEvidence}
                      onChange={(e) => setEditedEvidence(e.target.value)}
                    />
                  </label>
                  <button onClick={() => handleSave(article._id)}>Save</button>
                  <button onClick={() => setEditingArticle(null)}>Cancel</button>
                </div>
              ) : (
                <div>
                  <p>Claim: {article.claim || 'N/A'}</p>
                  <p>Evidence: {article.evidence || 'N/A'}</p>
                  <button onClick={() => handleEdit(article)}>Edit</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No articles available for review.</p>
      )}
    </div>
  );
};

export default AnalystPage;
