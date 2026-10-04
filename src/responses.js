

// const getIndex = (request,response) => sendPage(request,response,index);

// const getClient2 = (request,response) => sendPage(request,response,client2);

// const sendPage = (request, response, page) => serveFile(request,response,page,"text/html");

// const getMessage = (request, response) => serveFile(request,response,"Hello World!", "text/plain"); 


const serveFile = (request, response, content,mimeType,header) => {
    response.writeHead(header, {
        "Content-Type": mimeType,
        'Content-Length': Buffer.byteLength(content, 'utf8'),
    });
    if(request.method !== "HEAD"){
        response.write(content);
    }
    response.end();

}
module.exports = {serveFile};