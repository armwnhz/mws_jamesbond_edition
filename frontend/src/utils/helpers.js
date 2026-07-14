export const normalizeUrl = (url) => {
  if (!url) return '';
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) {
    return 'https://' + url;
  }
  return url;
};

export const formatDate = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleString('fa-IR');
};

export const truncate = (str, len = 30) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
};

export const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};