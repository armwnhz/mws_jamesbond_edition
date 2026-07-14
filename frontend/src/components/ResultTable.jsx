const ResultTable = ({ result }) => {
  const categories = [
    { key: 'mobiles', label: '📱 موبایل' },
    { key: 'landlines', label: '🏠 ثابت' },
    { key: 'emails', label: '✉️ ایمیل' },
    { key: 'instagram', label: '📸 اینستاگرام' },
    { key: 'youtube', label: '▶️ یوتیوب' }
  ];

  let rows = [];
  categories.forEach(cat => {
    const values = result[cat.key] || [];
    if (values.length === 0) {
      rows.push({ type: cat.label, value: '—' });
    } else {
      values.forEach(v => rows.push({ type: cat.label, value: v }));
    }
  });

  return (
    <div className="result-container">
      <h3 style={{ color: '#b0c4de', marginTop: '20px' }}>📄 نتایج اسکرپ</h3>
      <table className="result-table">
        <thead>
          <tr>
            <th>نوع</th>
            <th>مقدار</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td className="type-cell">{row.type}</td>
              <td className="value-cell">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .result-container {
          margin-top: 25px;
        }
        .result-table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
          overflow: hidden;
        }
        .result-table th {
          background: rgba(79,172,254,0.15);
          padding: 12px 16px;
          text-align: right;
          font-weight: 600;
          color: #b0c4de;
          border-bottom: 2px solid rgba(79,172,254,0.1);
        }
        .result-table td {
          padding: 10px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          color: #e0e8f0;
        }
        .result-table tr:hover td {
          background: rgba(79,172,254,0.05);
        }
        .type-cell {
          color: #8ab4ff;
          font-weight: 500;
        }
        .value-cell {
          font-family: 'Consolas', monospace;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default ResultTable;