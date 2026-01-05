import { createServer } from 'http';
import { stat, readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mime from './utils/mime.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 4173;

const baseDir = path.resolve(__dirname);

export function createAppServer() {
  return createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
    if (urlPath.includes('..')) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }
    const safePath = path.normalize(urlPath).replace(/^\/+/, '');
    let filePath = path.resolve(baseDir, safePath || 'index.html');

    if (!filePath.startsWith(baseDir + path.sep) && filePath !== baseDir) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    let fileStat;
    try {
      fileStat = await stat(filePath);
      if (fileStat.isDirectory()) {
        filePath = path.resolve(filePath, 'index.html');
        if (!filePath.startsWith(baseDir + path.sep)) {
          res.writeHead(403, { 'Content-Type': 'text/plain' });
          res.end('403 Forbidden');
          return;
        }
        fileStat = await stat(filePath);
      }
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mime[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error');
  }
  });
}

export function startServer(port = PORT) {
  const server = createAppServer();
  server.listen(port, () => {
    console.log(`The Desert Looks Back running at http://localhost:${port}`);
  });
  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}
