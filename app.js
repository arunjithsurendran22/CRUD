const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const dataFile = path.join(__dirname, 'data.json');

// Read data from the JSON file
function readData() {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Write data to the JSON file
function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
}

// Create  HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === '/create' && req.method === 'POST') {
    let body = '';
    req.on('data', (data) => {
      body += data;
    });
    req.on('end', () => {
      const formData = JSON.parse(body);
      const records = readData();
      records.push(formData);
      writeData(records);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(formData));
    });
  } else if (parsedUrl.pathname === '/read' && req.method === 'GET') {
    const records = readData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(records));
  } else if (parsedUrl.pathname === '/update' && req.method === 'PUT') {
    let body = '';
    req.on('data', (data) => {
      body += data;
    });
    req.on('end', () => {
      const formData = JSON.parse(body);
      const records = readData();
      const recordIndex = parseInt(parsedUrl.query.index);
      if (recordIndex >= 0 && recordIndex < records.length) {
        records[recordIndex] = formData;
        writeData(records);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(formData));
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid index');
      }
    });
  } else if (parsedUrl.pathname === '/delete' && req.method === 'DELETE') {
    const records = readData();
    const recordIndex = parseInt(parsedUrl.query.index);
    if (recordIndex >= 0 && recordIndex < records.length) {
      records.splice(recordIndex, 1);
      writeData(records);
      res.writeHead(204);
      res.end();
    } else {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid index');
    }
  } else {
    // Serve the HTML file for the web interface
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlFile = fs.readFileSync(htmlPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlFile);
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
