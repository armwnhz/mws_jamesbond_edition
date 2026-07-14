import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatDate } from '../utils/helpers';
import HistoryItem from '../components/HistoryItem';
import Swal from 'sweetalert2';

export default function TrashTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await api.get('/history?page=1&limit=100&show_deleted=true');
      setItems(res.data.items);
    } catch (err) {
      Swal.fire('خطا', 'بارگذاری سطل زباله ناموفق', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id) => {
    try {
      await api.post(`/history/${id}/restore`);
      Swal.fire('موفق', 'آیتم بازیابی شد', 'success');
      fetchTrash();
    } catch (err) {
      Swal.fire('خطا', 'خطا در بازیابی', 'error');
    }
  };

  const handleDeletePermanent = async (id) => {
    const confirm = await Swal.fire({
      title: 'پاک‌سازی نهایی',
      text: 'آیا این آیتم را برای همیشه حذف می‌کنید؟',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'بله، حذف',
      cancelButtonText: 'لغو',
    });
    if (!confirm.isConfirmed) return;
    try {
      await api.delete(`/history/${id}?permanent=true`);
      Swal.fire('موفق', 'آیتم برای همیشه حذف شد', 'success');
      fetchTrash();
    } catch (err) {
      Swal.fire('خطا', 'خطا در حذف', 'error');
    }
  };

  const handleEmptyTrash = async () => {
    const confirm = await Swal.fire({
      title: 'پاک‌سازی نهایی سطل زباله',
      text: 'آیا همه‌ی آیتم‌ها را برای همیشه حذف می‌کنید؟ این عمل قابل بازگشت نیست!',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'بله، پاک‌سازی',
      cancelButtonText: 'لغو',
    });
    if (!confirm.isConfirmed) return;
    try {
      await api.delete('/history/trash/empty');
      Swal.fire('موفق', 'سطل زباله خالی شد', 'success');
      fetchTrash();
    } catch (err) {
      Swal.fire('خطا', 'خطا در پاک‌سازی', 'error');
    }
  };

  const handleRestoreAll = async () => {
    const confirm = await Swal.fire({
      title: 'بازیابی همه',
      text: 'همه‌ی آیتم‌های سطل زباله بازیابی می‌شوند',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'بله',
      cancelButtonText: 'لغو',
    });
    if (!confirm.isConfirmed) return;
    try {
      await api.post('/history/trash/restore-all');
      Swal.fire('موفق', 'همه‌ی آیتم‌ها بازیابی شدند', 'success');
      fetchTrash();
    } catch (err) {
      Swal.fire('خطا', 'خطا در بازیابی', 'error');
    }
  };

  return (
    <div>
      <div className="trash-actions">
        <button className="btn-outline" onClick={fetchTrash}>🔄 بارگذاری</button>
        <button className="btn-outline success" onClick={handleRestoreAll}>♻️ بازیابی همه</button>
        <button className="btn-outline danger" onClick={handleEmptyTrash}>🗑️ پاک‌سازی نهایی</button>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '2rem', color: '#6a8aaa' }}>⏳ در حال بارگذاری...</div>
      ) : items.length === 0 ? (
        <div className="text-center" style={{ padding: '2rem', color: '#6a8aaa' }}>سطل زباله خالی است.</div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="trash-item">
            <div className="trash-info">
              <span className="url">{item.url}</span>
              <span>🕒 {formatDate(item.timestamp)}</span>
              <span>🗑️ حذف: {item.deleted_at ? formatDate(item.deleted_at) : 'نامشخص'}</span>
              <span>📱 {item.mobiles?.length || 0}</span>
              <span>✉️ {item.emails?.length || 0}</span>
            </div>
            <div className="trash-actions-btns">
              <button className="btn-outline success" onClick={() => handleRestore(item.id)}>♻️ بازیابی</button>
              <button className="btn-outline danger" onClick={() => handleDeletePermanent(item.id)}>🗑️ پاک‌سازی</button>
            </div>
          </div>
        ))
      )}

      <style>{`
        .trash-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }
        .btn-outline {
          padding: 8px 16px;
          background: rgba(255,255,255,0.05);
          border: 2px solid #2a3f5f;
          border-radius: 10px;
          color: #b0c4de;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          font-size: 0.9rem;
        }
        .btn-outline:hover {
          background: rgba(255,255,255,0.1);
          border-color: #4facfe;
        }
        .btn-outline.danger:hover {
          border-color: #ff6b6b;
          color: #ff6b6b;
        }
        .btn-outline.success:hover {
          border-color: #00f2fe;
          color: #4facfe;
        }
        .trash-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          margin-bottom: 8px;
          border: 1px solid rgba(255,255,255,0.06);
          opacity: 0.7;
          flex-wrap: wrap;
          gap: 8px;
        }
        .trash-info {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        .trash-info span {
          color: #a0b4c8;
        }
        .trash-info .url {
          color: #4facfe;
          font-weight: 500;
        }
        .trash-actions-btns {
          display: flex;
          gap: 8px;
        }
        .trash-actions-btns .btn-outline {
          padding: 4px 12px;
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}