const http = require('http');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// key:value object to look up URL routes to specific functions
const urlStruct = {
   '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/catchEmAll': jsonHandler.respondJSON,
    '/notReal': jsonHandler.respondJSON,
    "/getTypes": jsonHandler.getTypes,
    notFound: jsonHandler.respondJSON
};

const parseBody = (request, response) => {
    let body = '';

    request.on('error', (err) => {
        console.dir(err);
        response.statusCode = 400;
        response.end();
    });

    request.on('data', (chunk) => {
        console.log(body + '+' + chunk);
        body += chunk;
    });

    request.on('end', () => {
        const type = request.headers['content-type'];
        if (type === 'application/json') {
            request.body = JSON.parse(body);
        }
        else {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.write(JSON.stringify({ error: 'invalid data format' }));
            return response.end();
        }
        jsonHandler.addUser(request, response);
    });
}

// URL-based parsing and handler lookup implementation adopted
//  with no changes from the Accept-Header-Status-Code-Spring-2026 example
const onRequest = (request, response) => {
    const protocol = request.connection.encrypted ? 'https' : 'http';
    const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
    console.log('++++++++URL: ' + parsedUrl.href);

    if (request.method === 'POST') {
        if (parsedUrl.pathname === '/addUser') {
            parseBody(request, response, jsonHandler.addUser);
        }
    } 
    else {
        if (urlStruct[parsedUrl.pathname]) {
            return urlStruct[parsedUrl.pathname](request, response);
        } else {
            return urlStruct.notFound(request, response);
        }
    }
};

http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1:${port}`);
});