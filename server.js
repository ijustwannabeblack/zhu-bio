const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.zip': 'application/zip'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);

  // API to get list of badges in badges folder
  if (reqPath === '/api/badges') {
    const badgesDir = path.join(__dirname, 'badges');
    fs.readdir(badgesDir, (err, files) => {
      if (err) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify([]));
        return;
      }
      const imageFiles = files.filter(f => !f.startsWith('.') && !f.endsWith('.tmp'));
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(imageFiles));
    });
    return;
  }

  // API to get list of songs in songs folder
  if (reqPath === '/api/songs') {
    const songsDir = path.join(__dirname, 'songs');
    if (!fs.existsSync(songsDir)) {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify([]));
      return;
    }
    fs.readdir(songsDir, (err, files) => {
      if (err) {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify([]));
        return;
      }
      const audioFiles = files.filter(f => !f.startsWith('.') && /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(f));
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(audioFiles));
    });
    return;
  }

  if (reqPath === '/api/save-cursor' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const json = JSON.parse(body);
        const data = json.image.replace(/^data:image\/\w+;base64,/, '');
        const buf = Buffer.from(data, 'base64');
        fs.writeFileSync(path.join(__dirname, 'assets', 'cursor.png'), buf);
        console.log('Saved perfect cropped cursor.png!');
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Success: cursor.png updated with 0 0 tip!');
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error: ' + e.message);
      }
    });
    return;
  }

  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(__dirname, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    let contentType = MIME_TYPES[ext];
    if (!contentType && reqPath.startsWith('/badges/')) {
      contentType = 'image/png';
    }
    if (!contentType) {
      contentType = 'application/octet-stream';
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n⚡ Guns.lol profile running at: http://localhost:${PORT}\n`);
});
