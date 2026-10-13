//Comment added for CI testing purposes
const dex = require("./pokedex.json");
const responseHandler = require("./responses.js");

//basic structure of reference types
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

//handles bases cases of JSON response
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

//Returns all Pokemon of selected type(s), minimum of one type required
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
  //calls typeFilter handler to create subset of filtered data, returns a No Results message if subset length is 0.
  let filteredDex = typeFilter(type,secType);
  if(filteredDex.length > 0){
    return responseHandler.serveFile(request, response, JSON.stringify(filteredDex), "application/json", 200);
  }
  responseJSON.message = "No such Pokemon in the Pokedex.";
  return responseHandler.serveFile(request, response, JSON.stringify(responseJSON), "application/json", 200);

}

//Searches for Pokemon in base dataset by name fragments.
const dexNav = (request,response) => {
  const responseJSON = {
    message: 'No such Pokemon in the Pokedex.',
  };
  //extracts search parameters from URL
  const reqURL = new URL(request.url, `http://${request.headers.host}`);
  const params = reqURL.searchParams;
  const name = params.get("name");

  //calls nameFilter handler to create subset of filtered data
  let filteredDex = nameFilter(name);
   if(filteredDex.length > 0){
    return responseHandler.serveFile(request, response, JSON.stringify(filteredDex), "application/json", 200);
  }
  return responseHandler.serveFile(request, response, JSON.stringify(responseJSON), "application/json", 200);
}

//Advanced search, combines functionality of above, but requires at least 1 of their given parameters.
const catchEm = (request, response) => {
  const responseJSON = {
    message: 'No such Pokemon in the Pokedex.',
  };
  //extracts search parameters from URL
  const reqURL = new URL(request.url, `http://${request.headers.host}`);
  const params = reqURL.searchParams;
  const name = params.get("name");
  const type = params.get("type");
  const secType = params.get("secType");

  //checks for empty parameters
  if(name == null && type == null && secType == null){
     return responseHandler.serveFile(request, response, JSON.stringify(dex), "application/json", 200);
  }
  //handles query filters
  let filteredDex = [];
  if(name != null){
    filteredDex = nameFilter(name);
  }
  if (type != null && filteredDex.length == 0){
    filteredDex = typeFilter(type,secType);
  }
  //handles additional filters
  if(type != null){
    filteredDex = typeFilter(type,secType,filteredDex);
  }


  if(filteredDex.length > 0){
    return responseHandler.serveFile(request, response, JSON.stringify(filteredDex), "application/json", 200);
  }
  return responseHandler.serveFile(request, response, JSON.stringify(responseJSON), "application/json", 200);


}

//Adds a pokemon to the data set, requires at least number, name, and type
const scanIn = (request,response) => {
  let {num, name, type, secType, height, weight, weak,evo,img} = request.body;
  
    const responseJSON = {
      message: 'Number, name, and type are all required.',
    };

    if (!name || !num || !type) {
      responseJSON.id = 'missingParams';
      return responseHandler.serveFile(request, response, JSON.stringify(responseJSON), "application/json", 400);
    }
  
    let responseCode = 204;
    
    //checks if already in dex
    if (!dex.includes(nameFilter(name)[0])) {
      responseCode = 201;
       dex.push({name: name});
      console.log(nameFilter(name)[0]);
    }
    let dexIndex = dex.length-1;
    dex[dexIndex].name = properNoun(name);
    //number handling
    dex[dexIndex].num = `${num}`;
    if(num < 100){
      dex[dexIndex].num = "0" + num;
    }
    if(num < 10){
      dex[dexIndex].num = "0" + num;
    }
    //type handling
    if(secType){
      dex[dexIndex].type = [properNoun(type), properNoun(secType)];
    }
    else{
      dex[dexIndex].type = [properNoun(type)];
    }
    //optional param handling
    if(height){
      dex[dexIndex].height = `${height} m`;
    }
    if(weight){
      dex[dexIndex].weight = `${weight} kg`;
    }

    //weakness array creation
    if(weak){
      let weakArray = weak.replace(" ", "").split(",");
      weakArray = weakArray.map(element => properNoun(element));
      dex[dexIndex].weaknesses = weakArray;
    }

    //evolution array creation - calls a nameFilter on dex, adds the object if results aren't empty
    if(evo){
      let evoNameArray = evo.replace(" ", "").split(",");
      let evoArray = [];
      evoNameArray.forEach((element) => {
        let results = nameFilter(element);
        if(results.length === 1){
          evoArray.push(results[0]);
        }
      });
      dex[dexIndex].next_evolution = evoArray;
    }
    if(img){
      dex[dexIndex].img = img;
    }


    if (responseCode === 201) {
      responseJSON.message = 'Created Successfully';
      return responseHandler.serveFile(request, response, JSON.stringify(responseJSON), "application/json", responseCode);
    }
  
    return responseHandler.serveFile(request, response, "", "application/json", responseCode);
}

//Adds entry property to pokemon based on name, FULL NAME IS REQUIRED
const addEntry = (request,response) => {
  const {entry, pkmn} = request.body;
   const responseJSON = {
      message: 'Entry and Pokemon are both required. Must be an existing Pokemon.',
    };

    //checks if PKMN exists
    const dexMon = nameFilter(pkmn)[0];
    const inTheDex = dex.includes(dexMon);
    if (!entry || !pkmn || !inTheDex) {
      responseJSON.id = 'missingParams';
      return responseHandler.serveFile(request, response, JSON.stringify(responseJSON), "application/json", 400);
    }

    let responseCode = 204;

    //checks if PKMN has dex entry, changes responseCode accordingly
    if(!dexMon.entry){
      responseCode = 201;
    }

    dexMon.entry = entry;
    
    if (responseCode === 201) {
      responseJSON.message = 'Created Successfully';
      return responseHandler.serveFile(request, response, JSON.stringify(responseJSON), "application/json", responseCode);
    }
  
    return responseHandler.serveFile(request, response, "", "application/json", responseCode);
}

//converts given string into proper noun formatting (ex: testString --> Teststring)
const properNoun = (str) => {
  const firstLetter = str.charAt(0);
  const firstCap = firstLetter.toUpperCase();
  const restOfWord = str.slice(1);
  return firstCap + restOfWord.toLowerCase();
  
}
//filters set based on typeList const, optional secondary type filtering.
const typeFilter = (type,secType, set=dex) => {
   let filteredDex = [];
  let secondFilterDex = [];
  //creates proper string for filtering
  const properType = properNoun(type);
  console.log(properType);
  set.forEach((element) => {if(element.type.includes(properType)){filteredDex.push(element)};});
  //handles optional second type filtering
  if(secType != null){
    const properSecType = properNoun(secType);
    console.log(properSecType);
    filteredDex.forEach((element) => {if(element.type.includes(properSecType)){secondFilterDex.push(element)};});
    filteredDex = secondFilterDex;
  }
  return filteredDex;
}

//filters set based on name fragments.
const nameFilter = (name, set=dex) => {
  let filteredDex = [];
  //filters dex entries for names containing name parameter (not case-sensitive)
  set.forEach((element) => {if(element.name.toLowerCase().includes(name.toLowerCase())){filteredDex.push(element);}});
  return filteredDex;
}

//quick checker for posting

module.exports = {
  respondJSON,
  getTypes,
  dexNav,
  catchEm,
  scanIn,
  addEntry
};