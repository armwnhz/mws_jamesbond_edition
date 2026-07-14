import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';

const Layout = ({ activeTab, setActiveTab, children }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'خروج از حساب',
      text: 'آیا مطمئن هستید؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'بله، خروج',
      cancelButtonText: 'لغو',
      background: '#1a1a2e',
      color: '#e8e8e8',
    });
    if (result.isConfirmed) {
      await logout();
    }
  };

  const tabs = [
    { id: 'scrape', label: '🔍 اسکرپ جدید' },
    { id: 'history', label: '📋 تاریخچه' },
    { id: 'trash', label: '🗑️ سطل زباله' },
    { id: 'stats', label: '📊 آمار' },
  ];

  return (
    <div className="container">
      <header className="header">
        <h1>🕷️ Minouta Web Scraper</h1>
        <div className="user-info">
          <span className="username">👤 {user?.username || 'کاربر'}</span>
          <button className="btn-outline danger" onClick={handleLogout}>🚪 خروج</button>
        </div>
      </header>

      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {children}
      </div>

      <style>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(79,172,254,0.15);
        }
        .header h1 {
          font-size: 2.2rem;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        .username {
          color: #b0c4de;
          font-weight: 600;
        }
        .btn-outline {
          padding: 8px 20px;
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
        .tabs {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }
        .tab-btn {
          padding: 12px 30px;
          background: rgba(255,255,255,0.05);
          border: 2px solid #2a3f5f;
          border-radius: 12px;
          color: #b0c4de;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }
        .tab-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .tab-btn.active {
          background: rgba(79,172,254,0.2);
          border-color: #4facfe;
          color: #fff;
          box-shadow: 0 0 20px rgba(79,172,254,0.15);
        }
        .tab-content {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 30px;
          border: 1px solid rgba(79,172,254,0.15);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
};

export default Layout;