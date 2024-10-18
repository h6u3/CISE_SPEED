import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../components/nav/ModeratorPage.module.scss';

interface Article {
  _id: string;
  title: string;
  authors: string;
  status: string;
  submitterVerified: boolean;
  moderatorApproved: boolean;
  analystApproved: boolean;
  rejectionReason?: string;  // Include rejection reason
}

const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const ModeratorPage = () => {
  const [verifiedArticles, setVerifiedArticles] = useState<Article[]>([]);
  const [unverifiedArticles, setUnverifiedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState(10); // Keep the same limit
  const [unverifiedPage, setUnverifiedPage] = useState(1);
  const [totalUnverifiedPages, setTotalUnverifiedPages] = useState(1);
  const [verifiedPage, setVerifiedPage] = useState(1);
  const [totalVerifiedPages, setTotalVerifiedPages] = useState(1);

  const fetchUnverifiedArticles = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/articles/all?page=${page}&limit=${limit}`);
      const allArticles = Array.isArray(response.data) ? response.data : response.data.articles;
      const totalCount = response.data.totalCount || allArticles.length;

      const unverified = allArticles.filter((article: Article) =>
        !article.submitterVerified && !article.moderatorApproved && !article.analystApproved
      );

      setUnverifiedArticles(unverified);
      setTotalUnverifiedPages(Math.ceil(totalCount / limit));
      setError(null);
    } catch (error: any) {
      setError(`Error fetching unverified articles: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiedArticles = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/articles/all?page=${page}&limit=${limit}`);
      const allArticles = Array.isArray(response.data) ? response.data : response.data.articles;
      const totalCount = response.data.totalCount || allArticles.length;

      const verified = allArticles.filter((article: Article) =>
        article.submitterVerified && article.moderatorApproved
      );

      setVerifiedArticles(verified);
      setTotalVerifiedPages(Math.ceil(totalCount / limit));
      setError(null);
    } catch (error: any) {
      setError(`Error fetching verified articles: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const confirmApproval = window.confirm("Are you sure you want to approve this article?");
    if (!confirmApproval) return;

    try {
      await axios.post(`${apiUrl}/articles/${id}/approve`);
      fetchUnverifiedArticles(unverifiedPage); // Refresh unverified articles after approval
    } catch (error: any) {
      alert(`Failed to approve the article. ${error.message || 'Internal server error.'}`);
    }
  };

  const handleReject = async (id: string) => {
    const rejectionReason = prompt("Please enter a reason for rejecting this article:");
    if (!rejectionReason) return;

    try {
      await axios.post(`${apiUrl}/articles/${id}/reject`, { reason: rejectionReason });
      fetchUnverifiedArticles(unverifiedPage); // Refresh unverified articles after rejection
    } catch (error: any) {
      alert(`Failed to reject the article. ${error.message || 'Internal server error.'}`);
    }
  };

  // Fetch unverified and verified articles whenever the page changes
  useEffect(() => {
    fetchUnverifiedArticles(unverifiedPage);  // Refetch unverified articles when unverifiedPage changes
  }, [unverifiedPage]);

  useEffect(() => {
    fetchVerifiedArticles(verifiedPage);  // Refetch verified articles when verifiedPage changes
  }, [verifiedPage]);

  return (
    <div className={styles.container}>
      <h1>Articles Pending Moderation</h1>
      <div className={styles.content}>
        {/* Unverified Articles */}
        <div className={styles.unverified}>
          <h2>Unverified Articles</h2>
          {unverifiedArticles.length > 0 ? (
            <ul className={styles.articleList}>
              {unverifiedArticles.map(article => (
                <li key={article._id}>
                  <h2>{article.title}</h2>
                  <p>By: {article.authors}</p>
                  <p>Status: Unverified</p>
                  <p>{article.rejectionReason && `Reason for Rejection: ${article.rejectionReason}`}</p> {/* Display rejection reason */}
                  <button onClick={() => handleApprove(article._id)}>Verify</button>
                  <button onClick={() => handleReject(article._id)}>Reject</button> {/* Reject button */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No unverified articles available on this page.</p>
          )}

          {/* Unverified pagination */}
          <div className={styles.pagination}>
            {Array.from({ length: totalUnverifiedPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setUnverifiedPage(index + 1)}
                disabled={unverifiedPage === index + 1}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Verified Articles */}
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
            <p>No verified articles available on this page.</p>
          )}

          {/* Verified pagination */}
          <div className={styles.pagination}>
            {Array.from({ length: totalVerifiedPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setVerifiedPage(index + 1)}
                disabled={verifiedPage === index + 1}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorPage;
