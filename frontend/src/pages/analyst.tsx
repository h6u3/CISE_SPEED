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
}

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const AnalystPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [processedArticles, setProcessedArticles] = useState<Article[]>([]);  // Track processed articles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null); // Track the article being edited
  const [editedClaim, setEditedClaim] = useState<string>('');  // Store edited claim
  const [editedEvidence, setEditedEvidence] = useState<string>(''); // Store edited evidence

  // Fetch all articles approved by both submitter and moderator
  const fetchAnalystQueue = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/articles/analyst-queue?page=1&limit=100`); // Increase limit or remove pagination
      setArticles(response.data.articles); // Fetch all articles awaiting review
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

      // Save updated article via API
      await axios.post(`${apiUrl}/articles/${articleId}/analyst-edit`, updatedArticle);
      
      // Move the article from the unprocessed list to the processed list
      const processedArticle = articles.find((article) => article._id === articleId);
      if (processedArticle) {
        setProcessedArticles([...processedArticles, { ...processedArticle, ...updatedArticle }]);  // Update the claim/evidence in the processed list
        setArticles(articles.filter((article) => article._id !== articleId)); // Remove from unprocessed list
      }

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
      <div className={styles.wrapper}>
        <div className={styles.unprocessed}>
          <h2>Unprocessed Articles</h2>
          {articles.length > 0 ? (
            <ul className={styles.articleList}>
              {articles.map((article) => (
                <li key={article._id}>
                  <h3>{article.title}</h3>
                  <p>By: {article.authors}</p>

                  {/* If the article is being edited, show input fields */}
                  {editingArticle && editingArticle._id === article._id ? (
                    <div>
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
                      <button className={styles.button} onClick={() => handleSave(article._id)}>Save</button>
                      <button className={styles.button} onClick={() => setEditingArticle(null)}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <p>Claim: {article.claim || 'N/A'}</p>
                      <p>Evidence: {article.evidence || 'N/A'}</p>
                      <button className={styles.button} onClick={() => handleEdit(article)}>Edit</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No articles available for review.</p>
          )}
        </div>
        
        <div className={styles.processed}>
          <h2>Processed Articles</h2>
          {processedArticles.length > 0 ? (
            <ul className={styles.articleList}>
              {processedArticles.map((article) => (
                <li key={article._id}>
                  <h3>{article.title}</h3>
                  <p>By: {article.authors}</p>
                  <p>Claim: {article.claim || 'N/A'}</p>
                  <p>Evidence: {article.evidence || 'N/A'}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No articles have been processed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalystPage;
