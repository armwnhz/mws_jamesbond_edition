const Pagination = ({ page, totalPages, onPageChange }) => {
  return (
    <div className="pagination">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        قبلی
      </button>
      <span>صفحه {page} از {totalPages}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        بعدی
      </button>
      <style>{`
        .pagination {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 15px;
          align-items: center;
        }
        .pagination button {
          padding: 6px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid #2a3f5f;
          border-radius: 8px;
          color: #b0c4de;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }
        .pagination button:hover:not(:disabled) {
          background: rgba(79,172,254,0.15);
          border-color: #4facfe;
        }
        .pagination button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .pagination span {
          color: #b0c4de;
        }
      `}</style>
    </div>
  );
};

export default Pagination;