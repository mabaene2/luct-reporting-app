import React, { useState } from 'react';
import { 
  exportUniversalData,
  exportReportsAdvanced,
  exportCoursesAdvanced,
  exportStudentsAdvanced,
  exportMonitoringAdvanced,
  exportRatingsAdvanced,
  exportByDateRange
} from '../services/api';

const AdvancedExport = ({ moduleType, availableFilters = {} }) => {
  const [exportConfig, setExportConfig] = useState({
    format: 'excel',
    includeAll: true,
    dateFrom: '',
    dateTo: '',
    filters: {}
  });
  const [exporting, setExporting] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      let response;
      const filters = { ...exportConfig.filters };

      if (exportConfig.dateFrom) filters.dateFrom = exportConfig.dateFrom;
      if (exportConfig.dateTo) filters.dateTo = exportConfig.dateTo;

      switch(moduleType) {
        case 'reports':
          response = await exportReportsAdvanced(filters);
          break;
        case 'courses':
          response = await exportCoursesAdvanced(filters);
          break;
        case 'students':
          response = await exportStudentsAdvanced(filters);
          break;
        case 'monitoring':
          response = await exportMonitoringAdvanced(filters);
          break;
        case 'ratings':
          response = await exportRatingsAdvanced(filters);
          break;
        default:
          response = await exportUniversalData(filters);
      }

      // Download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${moduleType}-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('Export completed successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="advanced-export">
      <div className="export-header">
        <h4>📊 Advanced Export</h4>
        <button 
          className="btn btn-outline btn-sm"
          onClick={() => setShowConfig(!showConfig)}
        >
          {showConfig ? '▲ Hide Options' : '▼ Show Options'}
        </button>
      </div>
      
      {showConfig && (
        <div className="export-config">
          <div className="config-group">
            <label>Date Range:</label>
            <div className="date-inputs">
              <input
                type="date"
                value={exportConfig.dateFrom}
                onChange={(e) => setExportConfig(prev => ({...prev, dateFrom: e.target.value}))}
                placeholder="From"
              />
              <span>to</span>
              <input
                type="date"
                value={exportConfig.dateTo}
                onChange={(e) => setExportConfig(prev => ({...prev, dateTo: e.target.value}))}
                placeholder="To"
              />
            </div>
          </div>

          {availableFilters.status && (
            <div className="config-group">
              <label>Status:</label>
              <select
                value={exportConfig.filters.status || ''}
                onChange={(e) => setExportConfig(prev => ({
                  ...prev,
                  filters: {...prev.filters, status: e.target.value}
                }))}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          )}

          <div className="config-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={exportConfig.includeAll}
                onChange={(e) => setExportConfig(prev => ({...prev, includeAll: e.target.checked}))}
              />
              Include All Data Fields
            </label>
          </div>
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={exporting}
        className="btn btn-success export-btn"
      >
        {exporting ? '⏳ Exporting...' : '📥 Download Excel Report'}
      </button>

      <div className="export-info">
        <small>Exports include: Basic info, dates, status, and relevant metrics in Excel format</small>
      </div>
    </div>
  );
};

export default AdvancedExport;