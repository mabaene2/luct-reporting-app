import React, { useState } from 'react';
import { universalSearch } from '../services/api';

const UniversalSearch = ({ onSearchResults, placeholder = "Search across all modules..." }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    module: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await universalSearch(query, filters);
      onSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = async (quickQuery) => {
    setQuery(quickQuery);
    setLoading(true);
    try {
      const response = await universalSearch(quickQuery, {});
      onSearchResults(response.data);
    } catch (error) {
      console.error('Quick search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setFilters({
      module: '',
      dateFrom: '',
      dateTo: '',
      status: ''
    });
    onSearchResults(null);
  };

  return (
    <div className="universal-search">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button 
            type="button" 
            className="btn btn-outline filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? '▲ Filters' : '▼ Filters'}
          </button>
          {query && (
            <button 
              type="button" 
              className="btn btn-outline clear-btn"
              onClick={clearSearch}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="search-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Module:</label>
                <select 
                  value={filters.module} 
                  onChange={(e) => setFilters(prev => ({...prev, module: e.target.value}))}
                >
                  <option value="">All Modules</option>
                  <option value="reports">Reports</option>
                  <option value="courses">Courses</option>
                  <option value="students">Students</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="ratings">Ratings</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Status:</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="approved">Approved</option>
                </select>
              </div>

              <div className="filter-group">
                <label>From:</label>
                <input 
                  type="date" 
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({...prev, dateFrom: e.target.value}))}
                />
              </div>

              <div className="filter-group">
                <label>To:</label>
                <input 
                  type="date" 
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({...prev, dateTo: e.target.value}))}
                />
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Quick Search Suggestions */}
      <div className="quick-search">
        <span>Quick search:</span>
        <button onClick={() => handleQuickSearch('pending review')}>Pending Review</button>
        <button onClick={() => handleQuickSearch('this week')}>This Week</button>
        <button onClick={() => handleQuickSearch('high rating')}>High Ratings</button>
        <button onClick={() => handleQuickSearch('attendance low')}>Low Attendance</button>
      </div>
    </div>
  );
};

export default UniversalSearch;