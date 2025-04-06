import { useState, useEffect } from 'react';
import { RefreshCw, Globe, Clock, Save, Share2, Check, Search } from 'react-feather';

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('general');
  const [savedNews, setSavedNews] = useState([]);
  
  const categories = [
    { id: 'general', name: 'General' },
    { id: 'business', name: 'Business' },
    { id: 'technology', name: 'Technology' },
    { id: 'science', name: 'Science' },
    { id: 'health', name: 'Health' },
    { id: 'sports', name: 'Sports' },
    { id: 'entertainment', name: 'Entertainment' },
  ];

  useEffect(() => {
    fetchNews();
    // Load saved news from localStorage
    const saved = localStorage.getItem('savedNews');
    if (saved) {
      setSavedNews(JSON.parse(saved));
    }
  }, [category]);

  const fetchNews = async () => {
    setLoading(true);
    setError('');
    try {
      // Get token from localStorage for auth (if needed)
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await fetch(`/api/news?category=${category}`, { headers });
      const data = await response.json();

      if (response.status === 401) {
        setError('Authentication required. Please log in to use this feature.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch news');
      }

      setNews(data.articles || []);
    } catch (err) {
      console.error('News fetch error:', err);
      setError('Failed to load news: ' + (err.message || 'Please try again later'));
    } finally {
      setLoading(false);
    }
  };

  const saveNews = (article) => {
    const isAlreadySaved = savedNews.some(
      (saved) => saved.title === article.title && saved.url === article.url
    );

    if (isAlreadySaved) {
      // Remove from saved
      const filtered = savedNews.filter(
        (saved) => !(saved.title === article.title && saved.url === article.url)
      );
      setSavedNews(filtered);
      localStorage.setItem('savedNews', JSON.stringify(filtered));
    } else {
      // Add to saved
      const newSavedList = [...savedNews, article];
      setSavedNews(newSavedList);
      localStorage.setItem('savedNews', JSON.stringify(newSavedList));
    }
  };

  const shareNews = async (article) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        fallbackShare(article);
      }
    } else {
      fallbackShare(article);
    }
  };

  const fallbackShare = (article) => {
    // Fallback to copy to clipboard
    const textToCopy = `${article.title}\n\n${article.description || ''}\n\nRead more: ${article.url}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        alert('Article link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isArticleSaved = (article) => {
    return savedNews.some(
      (saved) => saved.title === article.title && saved.url === article.url
    );
  };

  return (
    <div className="rbt-dashboard-content">
      <div className="rbt-dashboard-title mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="title mb-2 text-dark fw-bold">News Feed</h4>
            <p className="description text-secondary">
              Stay updated with the latest news across different categories
            </p>
          </div>
          <button 
            className="btn btn-sm btn-light mt-3 d-flex align-items-center" 
            onClick={fetchNews}
            style={{
              borderRadius: '10px',
              padding: '8px 16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              color: '#495057',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} className="me-2" /> Refresh
          </button>
        </div>
      </div>

      <div className="categories-container mb-4">
        <div className="d-flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`btn btn-sm ${
                category === cat.id ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              style={{
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: category === cat.id ? '0 4px 10px rgba(63, 81, 181, 0.2)' : 'none',
                background: category === cat.id ? 'linear-gradient(45deg, #3F51B5, #5677fd)' : 'transparent',
                border: category === cat.id ? 'none' : '1px solid #dee2e6'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger rounded-4 shadow-sm" role="alert">
          <div className="d-flex align-items-center">
            <Search size={20} className="me-2" />
            <span className="fw-medium">{error}</span>
          </div>
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-5 p-4 bg-light rounded-4 shadow-sm">
          <Globe size={36} className="mb-3 text-primary" />
          <p className="text-dark fw-medium">No news found for this category</p>
          <p className="small text-secondary">Try selecting a different news category</p>
        </div>
      ) : (
        <div className="news-articles">
          {news.map((article, index) => (
            <div key={index} className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
              <div className="card-body p-0">
                <div className="row g-0">
                  {article.urlToImage && (
                    <div className="col-md-4">
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="img-fluid h-100 w-100 object-fit-cover"
                        style={{ maxHeight: '250px' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    </div>
                  )}
                  <div className={`col-md-${article.urlToImage ? '8' : '12'} p-4`}>
                    <div className="d-flex align-items-center mb-2">
                      <small className="text-muted me-3 d-flex align-items-center">
                        <Clock size={14} className="me-1" />
                        {formatDate(article.publishedAt)}
                      </small>
                      {article.source?.name && (
                        <small className="badge bg-light text-dark">
                          {article.source.name}
                        </small>
                      )}
                    </div>
                    <h5 className="card-title fw-bold mb-2">{article.title}</h5>
                    <p className="card-text text-secondary mb-3">
                      {article.description || 'No description available'}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                        style={{
                          background: 'linear-gradient(45deg, #3F51B5, #5677fd)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          boxShadow: '0 4px 10px rgba(63, 81, 181, 0.2)'
                        }}
                      >
                        Read More
                      </a>
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => saveNews(article)}
                          className="btn btn-sm btn-light d-flex align-items-center"
                          title={isArticleSaved(article) ? 'Unsave article' : 'Save article'}
                          style={{
                            borderRadius: '8px',
                            padding: '8px',
                            background: isArticleSaved(article) ? '#e3f2fd' : '#f8f9fa',
                            border: '1px solid #e9ecef'
                          }}
                        >
                          {isArticleSaved(article) ? (
                            <Check size={16} className="text-primary" />
                          ) : (
                            <Save size={16} className="text-secondary" />
                          )}
                        </button>
                        <button
                          onClick={() => shareNews(article)}
                          className="btn btn-sm btn-light d-flex align-items-center"
                          title="Share article"
                          style={{
                            borderRadius: '8px',
                            padding: '8px',
                            background: '#f8f9fa',
                            border: '1px solid #e9ecef'
                          }}
                        >
                          <Share2 size={16} className="text-secondary" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsFeed; 