//Comment added for CI testing purposes
const dex = require("./pokedex.json");
const responseHandler = require("./responses.js");

const  typeList = [
  "normal",
  "fire",
  "fighting",
  "water",
  "flying",
  "grass",
  "poison",
  "electric",
  "ground",
  "psychic",
  "rock",
  "ice",
  "bug",
  "dragon",
  "ghost",
  "dark",
  "steel",
  "fairy"
];

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

const getTypes = (request,response) => {
  const responseJSON = {
    message: 'Must be a real type.',
  };
  //extracts search parameters from URL
  const reqURL = new URL(request.url, `http://${request.headers.host}`);
  const params = reqURL.searchParams;
  const type = params.get("type");
  const secType = params.get("secType");
  //verifies request is a real type, the creates subset of entries including given type, otherwise return a 400 bad params
  if(!(typeList.includes(type.toLowerCase()))){
    responseJSON.id = 'failedParams';
     return responseHandler.serveFile(request, response, JSON.stringify(responseJSON), "application/json", 400);
  }
  let filteredDex = [];
  let secondFilterDex = [];
  //creates proper string for filtering
  const properType = properNoun(type);
  console.log(properType);
  dex.forEach((element) => {if(element.type.includes(properType)){filteredDex.push(element)};});
  //handles optional second type filtering
  if(secType != null){
    const properSecType = properNoun(secType);
    console.log(properSecType);
    filteredDex.forEach((element) => {if(element.type.includes(properSecType)){secondFilterDex.push(element)};});
    filteredDex = secondFilterDex;
  }
  if(filteredDex.length > 0){
    return responseHandler.serveFile(request, response, JSON.stringify(filteredDex), "application/json", 200);
  }
  responseJSON.message = "No such Pokemon in the Pokedex.";
  return responseHandler.serveFile(request, response, JSON.stringify(responseJSON), "application/json", 200);

}

const dexNav = (request,response) => {
  const responseJSON = {
    message: 'No such Pokemon in the Pokedex.',
  };
  //extracts search parameters from URL
  const reqURL = new URL(request.url, `http://${request.headers.host}`);
  const params = reqURL.searchParams;
  const name = params.get("name");
  console.log(name);

  let filteredDex = [];
  //filters dex entries for names containing name parameter (not case-sensitive)
  dex.forEach((element) => {if(element.name.toLowerCase().includes(name.toLowerCase())){filteredDex.push(element);}});
   if(filteredDex.length > 0){
    return responseHandler.serveFile(request, response, JSON.stringify(filteredDex), "application/json", 200);
  }
  return responseHandler.serveFile(request, response, JSON.stringify(responseJSON), "application/json", 200);
}

const properNoun = (str) => {
  const firstLetter = str.charAt(0);
  const firstCap = firstLetter.toUpperCase();
  const restOfWord = str.slice(1);
  return firstCap + restOfWord;
  
}

module.exports = {
  addUser,
  respondJSON,
  getTypes,
  dexNav
};