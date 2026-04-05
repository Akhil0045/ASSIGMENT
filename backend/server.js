require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB().then(() => {
  const server = http.createServer(app);
  const host = process.env.HOST || '0.0.0.0';
  server.listen(PORT, host, () => {
    console.log(`Server listening on http://${host}:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to DB', err);
  // Optional: proceed anyway if database is not available for setup
  // process.exit(1);
});
