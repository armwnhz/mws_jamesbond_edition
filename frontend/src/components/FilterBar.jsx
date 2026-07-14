import { useState } from 'react';

const FilterBar = ({ onFilter }) => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({
    url: '',
    start_date: '',
    end_date: '',
    has_mobile: false,
    has_email: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleApply = () => {
    const activeFilters = {};
    if (filters.url) activeFilters.url = filters.url;
    if (filters.start_date) activeFilters.start_date = filters.start_date;
    if (filters.end_date) activeFilters.end_date = filters.end_date;
    if (filters.has_mobile) activeFilters.has_mobile = true;
    if (filters.has_email) activeFilters.has_email = true;
    onFilter(activeFilters);
    setOpen(false);
  };

  const handleClear = () => {
    setFilters({ url: '', start_date: '', end_date: '', has_mobile: false, has_email: false });
    onFilter({});
    setOpen(false);
  };

  return (
    <div className="filter-wrapper">
      <div className="filter-toggle" onClick={() => setOpen(!open)}>
        <span>⚙️ فیلترهای پیشرفته</span>
        <span>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="filter-container">
          <div className="filter-group">
            <label>🔍 URL</label>
            <input
              type="text"
              name="url"
              placeholder="جستجوی URL..."
              value={filters.url}
              onChange={handleChange}
            />
          </div>
          <div className="filter-group">
            <label>📅 از تاریخ</label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date}
              onChange={handleChange}
            />
          </div>
          <div className="filter-group">
            <label>📅 تا تاریخ</label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date}
              onChange={handleChange}
            />
          </div>
          <div className="filter-group checkbox">
            <label>
              <input
                type="checkbox"
                name="has_mobile"
                checked={filters.has_mobile}
                onChange={handleChange}
              />
              📱 دارای موبایل
            </label>
          </div>
          <div className="filter-group checkbox">
            <label>
              <input
                type="checkbox"
                name="has_email"
                checked={filters.has_email}
                onChange={handleChange}
              />
              ✉️ دارای ایمیل
            </label>
          </div>
          <div className="filter-actions">
            <button className="btn-outline" onClick={handleApply}>✅ اعمال</button>
            <button className="btn-outline" onClick={handleClear}>❌ پاک کردن</button>
          </div>
        </div>
      )}
      <style>{`
        .filter-wrapper {
          margin-bottom: 15px;
        }
        .filter-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          user-select: none;
          color: #b0c4de;
          font-weight: 600;
        }
        .filter-toggle:hover {
          background: rgba(255,255,255,0.08);
        }
        .filter-container {
          padding: 15px;
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.04);
          margin-top: 5px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .filter-group label {
          color: #b0c4de;
          font-size: 0.85rem;
        }
        .filter-group input[type="text"],
        .filter-group input[type="date"] {
          padding: 6px 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid #2a3f5f;
          border-radius: 8px;
          color: #f0f0f0;
          font-size: 0.9rem;
          outline: none;
        }
        .filter-group input:focus {
          border-color: #4facfe;
        }
        .filter-group.checkbox {
          flex-direction: row;
          align-items: center;
          gap: 8px;
        }
        .filter-group.checkbox input[type="checkbox"] {
          accent-color: #4facfe;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        .filter-actions {
          display: flex;
          gap: 10px;
          align-items: flex-end;
          grid-column: 1 / -1;
        }
        .btn-outline {
          padding: 6px 16px;
          background: rgba(255,255,255,0.05);
          border: 2px solid #2a3f5f;
          border-radius: 10px;
          color: #b0c4de;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          font-size: 0.85rem;
        }
        .btn-outline:hover {
          background: rgba(255,255,255,0.1);
          border-color: #4facfe;
        }
      `}</style>
    </div>
  );
};

export default FilterBar;