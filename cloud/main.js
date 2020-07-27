//CLOUD FUNCS

let listLayer = [];
let listTop = [];
let listBottom = [];
let listShoes = [];


Parse.Cloud.define('hello', function(req, res) {
  return "Hello new function " + name;
});

Parse.Cloud.define("updateLists", async (request)=>{
  var query = new Parse.Query("Closet");
  var userCloset = query.get(request.params.currentUserCloset);
  let layerRelation = (await userCloset).relation("Layer");
  let topRelation = (await userCloset).relation("Top");
  let bottomRelation = (await userCloset).relation("Bottom");
  let shoesRelation = (await userCloset).relation("Shoes");


  listLayer = (await layerRelation.query().find());
  listTop = (await topRelation.query().find());
  listBottom = (await bottomRelation.query().find());
  listShoes = (await shoesRelation.query().find());
  return ("Lists updated!");
});




