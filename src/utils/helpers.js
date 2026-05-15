export const formatCurrency = (amount) =>
  `PHP ${Number(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

export const getNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  return Math.max(1, Math.round(
    (new Date(checkOut) - new Date(checkIn)) / 86400000
  ));
};

export const getTodayStr   = () => new Date().toISOString().split('T')[0];
export const getTomorrowStr = () =>
  new Date(Date.now() + 86400000).toISOString().split('T')[0];

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).replace('_', ' ') : '';
