const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  console.log('Request for:', req.url);
  
  const filePath = req.url === '/' ? '/public/index.html' : req.url;
  const fullPath = path.join(__dirname, filePath);
  
  console.log('Serving file:', fullPath);
  
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      console.log('File not found:', fullPath);
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    
    const ext = path.extname(fullPath);
    const contentType = ext === '.css' ? 'text/css' : 'text/html';
    console.log('Serving file successfully, type:', contentType);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

const wss = new WebSocket.Server({ server });

console.log('WebSocket server created');

wss.on('connection', (ws) => {
  console.log('User connected - Total clients:', wss.clients.size);
  
  ws.on('message', (message) => {
    const messageStr = message.toString();
    console.log('Received message:', messageStr);
    console.log('Message type:', typeof messageStr);
    console.log('Broadcasting to', wss.clients.size - 1, 'other clients');
    
    // Validate JSON before broadcasting
    try {
      JSON.parse(messageStr);
      // Broadcast to all other clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
          console.log('Message sent to client');
        }
      });
    } catch (error) {
      console.error('Invalid JSON received:', error);
    }
  });
  
  ws.on('close', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});