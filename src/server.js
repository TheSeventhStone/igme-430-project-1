const http = require('http');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');
// const { json } = require('stream/consumers');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// key:value object to look up URL routes to specific functions
const urlStruct = {
    '/': htmlHandler.getIndex,
    '/docs' : htmlHandler.getDocs,
    '/style.css': htmlHandler.getCSS,
    '/catchEmAll': jsonHandler.respondJSON,
    '/notReal': jsonHandler.respondJSON,
    "/getTypes": jsonHandler.getTypes,
    "/dexNav": jsonHandler.dexNav,  
    "/catchEm": jsonHandler.catchEm,
    notFound: jsonHandler.respondJSON
};

const parseBody = (request, response,fun) => {
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
        console.log(type);
        if (type === 'application/json') {
            request.body = JSON.parse(body);
            //console.log(request.body);
        }
        //if urlencoded, convert to JSON body
        else if (type === "application/x-www-form-urlencoded"){
            console.log(body);
            const preBody= new URLSearchParams(body);
            console.log(preBody);
            const jsonedBody = Object.fromEntries(preBody);
            const stringBody = JSON.stringify(jsonedBody);
            request.body = JSON.parse(stringBody);
            console.log(request.body);
        }
        else {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.write(JSON.stringify({ error: 'invalid data format' }));
            return response.end();
        }
        //jsonHandler.addUser(request, response);
        if(fun === jsonHandler.scanIn){
            jsonHandler.scanIn(request,response);
        }
        else if(fun === jsonHandler.addEntry){
            jsonHandler.addEntry(request,response);
        }
    });
}

// URL-based parsing and handler lookup implementation adopted
//  with no changes from the Accept-Header-Status-Code-Spring-2026 example
const onRequest = (request, response) => {
    const protocol = request.connection.encrypted ? 'https' : 'http';
    const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
    console.log('++++++++URL: ' + parsedUrl.href);
    console.log(request.headers["content-type"]);

    if (request.method === 'POST') {
        if(parsedUrl.pathname === "/scanIn") {
            parseBody(request,response,jsonHandler.scanIn);
        }
        if(parsedUrl.pathname === "/addEntry") {
            parseBody(request,response,jsonHandler.addEntry);
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