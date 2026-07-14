import { useState } from 'react';
import api from '../api/axios';
import { normalizeUrl } from '../utils/helpers';
import ResultTable from '../components/ResultTable';
import Swal from 'sweetalert2';

export default function ScrapeTab() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [options, setOptions] = useState({
    extract_mobile: true,
    extract_landline: true,
    extract_email: true,
    extract_instagram: true,
    extract_youtube: true,
    extract_links: false,
    depth: 0,
  });

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setOptions((prev) => {
      const newOptions = { ...prev, [name]: checked };
      if (name === 'extract_links') {
        newOptions.depth = checked ? 1 : 0;
      }
      return newOptions;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedUrl = normalizeUrl(url);
    if (!normalizedUrl) {
      Swal.fire('خطا', 'لطفاً آدرس وب‌سایت را وارد کنید', 'error');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        urls: [normalizedUrl],
        ...options,
        save_history: true,
      };
      const res = await api.post('/scrape', payload);
      if (res.data.results && res.data.results[0]) {
        setResult(res.data.results[0]);
        if (res.data.results[0].error) {
          Swal.fire('خطا', res.data.results[0].error, 'error');
        } else {
          Swal.fire('موفق', 'اسکرپ با موفقیت انجام شد!', 'success');
        }
      } else {
        Swal.fire('خطا', 'نتیجه‌ای دریافت نشد', 'error');
      }
    } catch (err) {
      Swal.fire('خطا', err.response?.data?.detail || 'خطا در ارتباط با سرور', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>🌐 آدرس وب‌سایت</label>
          <input
            type="text"
            placeholder="مثلاً: hamzehalizadeh.ir"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>🔍 انتخاب داده‌ها برای استخراج</label>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                name="extract_mobile"
                checked={options.extract_mobile}
                onChange={handleCheckboxChange}
              />
              📱 موبایل
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                name="extract_landline"
                checked={options.extract_landline}
                onChange={handleCheckboxChange}
              />
              🏠 ثابت
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                name="extract_email"
                checked={options.extract_email}
                onChange={handleCheckboxChange}
              />
              ✉️ ایمیل
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                name="extract_instagram"
                checked={options.extract_instagram}
                onChange={handleCheckboxChange}
              />
              📸 اینستاگرام
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                name="extract_youtube"
                checked={options.extract_youtube}
                onChange={handleCheckboxChange}
              />
              ▶️ یوتیوب
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                name="extract_links"
                checked={options.extract_links}
                onChange={handleCheckboxChange}
              />
              🔗 لینک (کراولینگ خودکار)
            </label>
          </div>
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? '⏳ در حال اسکرپ...' : '🚀 شروع اسکرپ'}
        </button>
      </form>

      {result && <ResultTable result={result} />}

      <style>{`
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          color: #b0c4de;
          font-size: 0.95rem;
        }
        .form-group input[type="text"] {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.07);
          border: 2px solid #2a3f5f;
          border-radius: 12px;
          color: #f0f0f0;
          font-size: 1rem;
          transition: all 0.3s ease;
          outline: none;
        }
        .form-group input[type="text"]:focus {
          border-color: #4facfe;
          background: rgba(255,255,255,0.12);
          box-shadow: 0 0 20px rgba(79,172,254,0.15);
        }
        .checkbox-group {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin: 10px 0 20px 0;
        }
        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          font-size: 0.95rem;
          color: #d0d8ec;
        }
        .checkbox-item:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(79,172,254,0.3);
        }
        .checkbox-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #4facfe;
          cursor: pointer;
        }
        .btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          border: none;
          border-radius: 12px;
          color: #1a1a2e;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(79,172,254,0.3);
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
}