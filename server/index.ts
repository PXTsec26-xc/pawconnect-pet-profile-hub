import path from 'path';
import express from 'express';
import app from './app.js';

const PORT = process.env.PORT || 5000;

// Serve static client assets in production
const publicPath = path.resolve(process.cwd(), 'dist/public');
app.use(express.static(publicPath));

// Fallback to client index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('PawConnect API server running. Frontend client is available on port 3000 during development.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🐾 PawConnect Backend Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
