import { useEffect, useState, useRef } from 'react';
import api from '../api/axios';
import { Chart } from 'chart.js/auto';

export default function StatsTab() {
  const [stats, setStats] = useState({});
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (stats.chart_data && chartRef.current) {
      if (chartInstance.current) chartInstance.current.destroy();
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: stats.chart_data.map(d => d.date),
          datasets: [
            {
              label: '📱 موبایل',
              data: stats.chart_data.map(d => d.mobiles),
              backgroundColor: 'rgba(79,172,254,0.6)',
              borderColor: '#4facfe',
              borderWidth: 2,
            },
            {
              label: '✉️ ایمیل',
              data: stats.chart_data.map(d => d.emails),
              backgroundColor: 'rgba(0,242,254,0.6)',
              borderColor: '#00f2fe',
              borderWidth: 2,
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { labels: { color: '#b0c4de' } },
            title: { display: true, text: '📊 روند استخراج داده‌ها', color: '#b0c4de' }
          },
          scales: {
            y: { ticks: { color: '#a0b4c8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            x: { ticks: { color: '#a0b4c8', maxRotation: 45 }, grid: { display: false } }
          }
        }
      });
    }
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [stats]);

  return (
    <div>
      <h2 style={{ color: '#b0c4de', marginBottom: '20px' }}>📊 داشبورد آمار</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="number">{stats.total_scrapes || 0}</div>
          <div className="label">📋 تعداد اسکرپ</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.total_mobiles || 0}</div>
          <div className="label">📱 تعداد موبایل</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.total_emails || 0}</div>
          <div className="label">✉️ تعداد ایمیل</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.total_instagram || 0}</div>
          <div className="label">📸 اینستاگرام</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.total_youtube || 0}</div>
          <div className="label">▶️ یوتیوب</div>
        </div>
      </div>
      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }
        .stat-card {
          background: rgba(255,255,255,0.04);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          text-align: center;
        }
        .stat-card .number {
          font-size: 2.2rem;
          font-weight: 700;
          color: #4facfe;
        }
        .stat-card .label {
          color: #a0b4c8;
          font-size: 0.9rem;
          margin-top: 4px;
        }
        .chart-container {
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
          padding: 20px;
          margin-top: 15px;
        }
      `}</style>
    </div>
  );
}