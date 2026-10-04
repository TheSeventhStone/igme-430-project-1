//Comment added for CI testing purposes
const dex = require("./pokedex.json");
const responseHandler = require("./responses.js");

const respondJSON = (request, response) => {
  let content;
    let code;

    switch (request.url) {
        case '/catchEmAll':
            content = JSON.stringify(dex)
            code = 200;
            break;

        case '/notReal':
        default:
            {let contentJSON = {};

            contentJSON.message = 'The page you are looking for was not found.';
            contentJSON.id = 'notFound';
            content = JSON.stringify(contentJSON);
            code = 404;
            break;}
    }

    responseHandler.serveFile(request, response, content, 'application/json', code);
};

const addUser = (request, response) => {
  const {num, name, img, type, height, weight, weaknesses, next_evolution} = request.body;

  const responseJSON = {
    message: 'Name and age are both required.',
  };

  if (!request.body.name || !request.body.num || !request.body.type ) {
    responseJSON.id = 'missingParams';
    return responseHandler.serveFile(request, response, JSON.stringify(responseJSON), "application/json", 400);
  }

  let responseCode = 204;
  
  if (!dex[name]) {
    responseCode = 201;
    dex[name] = {};
  }

  dex[name].name = name;
  dex[name].num = num;
  dex[name].type = type;
  //Optional parameter fill-in
  if(request.body.img){
    dex[name].img = img;
  }
  if(request.body.height){
    dex[name].height = height;
  }
  if(request.body.weight){
    dex[name].weight = weight;
  }
  if(request.body.weaknesses){
    dex[name].weaknesses = weaknesses;
  }
  if(request.body.next_evolution){
    dex[name].next_evolution = next_evolution;
  }

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return responseHandler.serveFile(request, response, JSON.stringify(responseJSON), "application/json", responseCode);
  }

  return responseHandler.serveFile(request, response, "", "application/json", responseCode);
};

module.exports = {
  addUser,respondJSON
};