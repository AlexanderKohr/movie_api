const http = require('http'),
// requires the http module
    fs = require('fs'),
    // requires the file system module
    url = require('url');
    // requires the URL module

http.createServer((request, response) => {
    let addr = request.url,
        q = url.parse(addr, true),
        filePath = '';
// creates a local server

    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }
    });
// adds every request that has been sent to the log.txt file

    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }
// distributes the documentation file by request. leads back to index.html if documentation.html cant be found

    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }
// allows the app to read a file via the file system module (fs)
// the file system function readFile is called by dot notation (fs.readFile)

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end();

    });
}).listen(8080);
// listens to port 80, which is the standart port for HTTP

console.log('My first Node test server is running on Port 8080');