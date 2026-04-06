import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/sdk.js', (req, res) => {
  const sdkPath = path.join(__dirname, '../../public/sdk.js');
  const backendUrl = process.env.BACKEND_URL || `http://${req.get('host')}`;
  const apiBase = `${backendUrl}/api/public`;

  try {
    let sdkContent = fs.readFileSync(sdkPath, 'utf8');
    // Replace the placeholder with the actual API Base URL
    sdkContent = sdkContent.replace('__API_BASE_URL__', apiBase);
    res.setHeader('Content-Type', 'application/javascript');
    res.send(sdkContent);
  } catch (error) {
    console.error('Error serving SDK:', error);
    res.status(500).send(`Error serving SDK: ${error}`);
  }
});

export default router;
