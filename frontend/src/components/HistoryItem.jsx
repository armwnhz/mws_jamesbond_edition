import { useState } from 'react';
import api from '../api/axios';
import { formatDate } from '../utils/helpers';
import Swal from 'sweetalert2';

const HistoryItem = ({ item, onDelete }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState(null);

  const loadDetail = async () => {
    if (showDetail) {
      setShowDetail(false);
      return;
    }
    try {
      const res = await api.get(`/history/${item.id}`);
      setDetail(res.data);
      setShowDetail(true);
    } catch (err) {
      Swal.fire('خطا', 'بارگذاری جزئیات ناموفق', 'error');
    }
  };

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: 'حذف آیتم',
      text: 'آیا این آیتم را به سطل زباله منتقل می‌کنید؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله',
      cancelButtonText: 'لغو',
    });
    if (!confirm.isConfirmed) return;
    try {
      await api.delete(`/history/${item.id}`);
      Swal.fire('موفق', 'آیتم به سطل زباله منتقل شد', 'success');
      onDelete(item.id);
    } catch (err) {
      Swal.fire('خطا', 'خطا در حذف', 'error');
    }
  };

  return (
    <div className="history-item">
      <div className="item-info">
        <span className="url">{item.url}</span>
        <span>🕒 {formatDate(item.timestamp)}</span>
        <span>📱 {item.mobiles?.length || 0}</span>
        <span>✉️ {item.emails?.length || 0}</span>
        <span>📸 {item.instagram?.length || 0}</span>
        <span>▶️ {item.youtube?.length || 0}</span>
      </div>
      <div className="item-actions">
        <button className="badge" onClick={loadDetail}>مشاهده</button>
        <button className="badge danger" onClick={handleDelete}>🗑️</button>
      </div>

      {showDetail && detail && (
        <div className="detail-box">
          <h4>📄 جزئیات</h4>
          <div className="detail-grid">
            {['mobiles', 'landlines', 'emails', 'instagram', 'youtube'].map(key => (
              <div key={key}>
                <strong>{key}:</strong> {detail[key]?.join(', ') || '—'}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .history-item {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          margin-bottom: 8px;
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.3s ease;
        }
        .history-item:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(79,172,254,0.2);
        }
        .item-info {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        .item-info span {
          color: #a0b4c8;
        }
        .item-info .url {
          color: #4facfe;
          font-weight: 500;
        }
        .item-actions {
          display: flex;
          gap: 8px;
        }
        .badge {
          background: rgba(79,172,254,0.15);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #8ab4ff;
          cursor: pointer;
          border: none;
          font-family: inherit;
          transition: all 0.3s ease;
        }
        .badge:hover {
          opacity: 0.8;
        }
        .badge.danger {
          background: rgba(255,70,70,0.2);
          color: #ff6b6b;
        }
        .detail-box {
          width: 100%;
          margin-top: 10px;
          padding: 12px;
          background: rgba(0,0,0,0.3);
          border-radius: 10px;
        }
        .detail-box h4 {
          color: #b0c4de;
          margin-bottom: 8px;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 8px;
        }
        .detail-grid div {
          color: #d0d8ec;
          font-size: 0.9rem;
        }
        .detail-grid strong {
          color: #8ab4ff;
        }
      `}</style>
    </div>
  );
};

export default HistoryItem;