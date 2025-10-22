// Component ke upar ya utils.js me
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Agar already URL hai
  if (imageUrl.startsWith('http')) return imageUrl;

  // Windows path -> URL
  return `http://localhost:5000${imageUrl.replace(/\\/g, '/')}`;
};
