import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      Swal.fire({ icon: 'error', title: 'خطا', text: 'لطفاً همه فیلدها را پر کنید', background: '#1a1a2e', color: '#e8e8e8' });
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password.trim());
      navigate('/');
      Swal.fire({ icon: 'success', title: 'ورود موفق', timer: 1500, showConfirmButton: false, background: '#1a1a2e', color: '#e8e8e8' });
    } catch (err) {
      let msg = 'خطا در ورود';
      if (err.response?.status === 401) msg = '❌ نام کاربری یا رمز عبور اشتباه است';
      else if (err.response?.data?.detail) msg = err.response.data.detail;
      Swal.fire({ icon: 'error', title: 'ورود ناموفق', text: msg, background: '#1a1a2e', color: '#e8e8e8', confirmButtonColor: '#4facfe' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🕷️ ورود</h1>
        <p>به Minouta Web Scraper خوش آمدید</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>نام کاربری</label>
            <input type="text" placeholder="نام کاربری" value={username} onChange={e => setUsername(e.target.value)} disabled={loading} />
          </div>
          <div className="form-group">
            <label>رمز عبور</label>
            <input type="password" placeholder="رمز عبور" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
          </div>
          <button type="submit" className="btn" disabled={loading}>{loading ? '⏳ در حال ورود...' : '🚀 ورود'}</button>
        </form>
        <div className="auth-footer">حساب ندارید؟ <Link to="/register">ثبت نام کنید</Link></div>
      </div>
      <style>{`
        .auth-container { min-height: 100vh; display: flex; justify-content: center; align-items: center; background: linear-gradient(135deg, #0f0f1a, #1a1a2e); padding: 20px; }
        .auth-card { max-width: 420px; width: 100%; background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border-radius: 24px; padding: 40px; border: 1px solid rgba(79,172,254,0.15); box-shadow: 0 20px 60px rgba(0,0,0,0.5); }
        .auth-card h1 { text-align: center; font-size: 2rem; background: linear-gradient(135deg, #4facfe, #00f2fe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 4px; }
        .auth-card p { text-align: center; color: #a0b4c8; margin-bottom: 25px; }
        .form-group { margin-bottom: 18px; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 6px; color: #b0c4de; font-size: 0.9rem; }
        .form-group input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.07); border: 2px solid #2a3f5f; border-radius: 12px; color: #f0f0f0; font-size: 1rem; outline: none; }
        .form-group input:focus { border-color: #4facfe; background: rgba(255,255,255,0.12); }
        .btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #4facfe, #00f2fe); border: none; border-radius: 12px; color: #1a1a2e; font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: all 0.3s; }
        .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(79,172,254,0.3); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-footer { text-align: center; margin-top: 20px; color: #6a8aaa; font-size: 0.9rem; }
        .auth-footer a { color: #4facfe; font-weight: 600; }
      `}</style>
    </div>
  );
}