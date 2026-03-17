const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const HTTPS_PORT = 8443;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.mp3': 'audio/mpeg',
};

function handleRequest(req, res) {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);
    
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

const httpServer = http.createServer(handleRequest);
const httpsServer = https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}, handleRequest);

httpServer.listen(PORT, () => {
    console.log(`HTTP server running at http://localhost:${PORT}`);
});

httpsServer.listen(HTTPS_PORT, () => {
    console.log(`HTTPS server running at https://localhost:${HTTPS_PORT}`);
});
