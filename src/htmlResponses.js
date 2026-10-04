const fs = require("fs");
const responseHandler = require("./responses.js");

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
// const client2 = fs.readFileSync(`${__dirname}/../client/client2.html`);
const style = fs.readFileSync(`${__dirname}/../client/style.css`);

const getIndex = (request,response) => sendPage(request,response,index);

// const getClient2 = (request,response) => sendPage(request,response,client2);

const getCSS  = (request, response) => responseHandler.serveFile(request, response, style, "text/css",200);

const sendPage = (request, response, page) => responseHandler.serveFile(request,response,page,"text/html",200);

module.exports = {getIndex, getCSS};