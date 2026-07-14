import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatDate } from '../utils/helpers';
import HistoryItem from '../components/HistoryItem';
import Pagination from '../components/Pagination';
import FilterBar from '../components/FilterBar';
import Swal from 'sweetalert2';

export default function HistoryTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({});
  const limit = 10;

  const fetchHistory = async (pageNum = 1, filterParams = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pageNum);
      params.append('limit', limit);
      params.append('show_deleted', false);
      
      Object.keys(filterParams).forEach(key => {
        const val = filterParams[key];
        if (key === 'has_mobile' || key === 'has_email') {
          if (val === true) params.append(key, 'true');
        } else if (val !== undefined && val !== null && val !== '') {
          params.append(key, val);
        }
      });

      const res = await api.get(`/history?${params}`);
      setItems(res.data.items || []);
      setTotalPages(res.data.pages || 1);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
      Swal.fire('خطا', 'بارگذاری تاریخچه ناموفق', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1, {});
  }, []);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    fetchHistory(1, newFilters);
  };

  const handlePageChange = (newPage) => fetchHistory(newPage, filters);
  const handleDelete = (id) => setItems(prev => prev.filter(item => item.id !== id));
  const handleRefresh = () => fetchHistory(page, filters);

  const handleExport = async (format) => {
    try {
      const res = await api.get(`/history/export?format=${format}`, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `history.${format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'txt'}`;
      link.click();
      Swal.fire('موفق', `خروجی ${format.toUpperCase()} دانلود شد`, 'success');
    } catch (err) {
      Swal.fire('خطا', 'خطا در خروجی گرفتن', 'error');
    }
  };

  const handleExportZip = async () => {
    try {
      const res = await api.get('/history/export/zip', { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'history_export.zip';
      link.click();
      Swal.fire('موفق', 'خروجی ZIP دانلود شد', 'success');
    } catch (err) {
      Swal.fire('خطا', 'خطا در خروجی ZIP', 'error');
    }
  };

  const handleDeleteAll = async () => {
    const confirm = await Swal.fire({ title: 'حذف همه', text: 'همه آیتم‌ها به سطل زباله منتقل می‌شوند', icon: 'warning', showCancelButton: true, confirmButtonText: 'بله', cancelButtonText: 'لغو' });
    if (!confirm.isConfirmed) return;
    try {
      await api.delete('/history/delete-all');
      Swal.fire('موفق', 'همه آیتم‌ها به سطل زباله منتقل شدند', 'success');
      fetchHistory(1, {});
    } catch (err) {
      Swal.fire('خطا', 'خطا در حذف', 'error');
    }
  };

  const handleBulkDelete = async (range) => {
    const confirm = await Swal.fire({ title: 'حذف بر اساس زمان', text: `آیا اسکرپ‌های ${range === 'recent' ? 'اخیر' : range === 'hour' ? 'یک ساعت گذشته' : 'هفته گذشته'} حذف شوند؟`, icon: 'warning', showCancelButton: true, confirmButtonText: 'بله', cancelButtonText: 'لغو' });
    if (!confirm.isConfirmed) return;
    try {
      await api.delete(`/history/bulk-delete?time_range=${range}`);
      Swal.fire('موفق', 'آیتم‌های مورد نظر حذف شدند', 'success');
      fetchHistory(1, {});
    } catch (err) {
      Swal.fire('خطا', 'خطا در حذف', 'error');
    }
  };

  return (
    <div>
      <div className="history-actions">
        <button className="btn-outline" onClick={handleRefresh}>🔄 بارگذاری</button>
        <button className="btn-outline" onClick={() => handleExport('csv')}>📥 CSV</button>
        <button className="btn-outline" onClick={() => handleExport('json')}>📥 JSON</button>
        <button className="btn-outline" onClick={() => handleExport('txt')}>📥 TXT</button>
        <button className="btn-outline" onClick={handleExportZip}>📥 ZIP</button>
        <button className="btn-outline danger" onClick={handleDeleteAll}>🗑️ حذف همه</button>
        <div className="dropdown">
          <button className="btn-outline">⏱️ حذف بر اساس زمان ▾</button>
          <div className="dropdown-menu">
            <button onClick={() => handleBulkDelete('recent')}>🆕 موارد اخیر (۱۰ مورد)</button>
            <button onClick={() => handleBulkDelete('hour')}>🕐 یک ساعت گذشته</button>
            <button onClick={() => handleBulkDelete('week')}>📅 هفته گذشته</button>
          </div>
        </div>
      </div>
      <FilterBar onFilter={handleFilter} />
      {loading ? <div className="text-center" style={{ padding: '2rem', color: '#6a8aaa' }}>⏳ در حال بارگذاری...</div>
        : items.length === 0 ? <div className="text-center" style={{ padding: '2rem', color: '#6a8aaa' }}>هیچ اسکرپی ثبت نشده است.</div>
        : items.map(item => <HistoryItem key={item.id} item={item} onDelete={handleDelete} />)
      }
      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      <style>{`
        .history-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px; align-items: center; }
        .btn-outline { padding: 8px 16px; background: rgba(255,255,255,0.05); border: 2px solid #2a3f5f; border-radius: 10px; color: #b0c4de; font-weight: 600; cursor: pointer; transition: all 0.3s; font-family: inherit; font-size: 0.9rem; }
        .btn-outline:hover { background: rgba(255,255,255,0.1); border-color: #4facfe; }
        .btn-outline.danger:hover { border-color: #ff6b6b; color: #ff6b6b; }
        .dropdown { position: relative; display: inline-block; }
        .dropdown-menu { display: none; position: absolute; right: 0; background: rgba(20,20,40,0.95); backdrop-filter: blur(10px); border: 1px solid rgba(79,172,254,0.2); border-radius: 10px; padding: 8px 0; min-width: 200px; z-index: 100; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
        .dropdown:hover .dropdown-menu { display: block; }
        .dropdown-menu button { display: block; width: 100%; padding: 10px 20px; border: none; background: transparent; color: #b0c4de; font-family: inherit; font-size: 0.9rem; text-align: right; cursor: pointer; transition: all 0.3s; }
        .dropdown-menu button:hover { background: rgba(79,172,254,0.1); color: #4facfe; }
      `}</style>
    </div>
  );
}