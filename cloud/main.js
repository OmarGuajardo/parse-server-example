//CLOUD FUNCS

let listLayer = [];
let listTop = [];
let listBottom = [];
let listShoes = [];
let filter = "";
let userFitsRelation;
let listFavoriteFits = [];

Parse.Cloud.define("updateLists", async (request)=>{
  var query = new Parse.Query("Closet");
  var userCloset = query.get(request.params.currentUserCloset);
  let allItems = [];

  listLayer = [];
  listTop = [];
  listBottom = [];
  listShoes = [];
  let allItemsRelation = (await userCloset).relation("allItems");
  userFitsRelation = (await userCloset).relation("UserFits");

  //allItems needs to be clean Items only
  const allItemsQuery = allItemsRelation.query();
  allItemsQuery.equalTo("Worn",false)
  allItems = (await allItemsQuery.find());
  for (let i = 0; i < allItems.length; i++) {
    let className = allItems[i].get("Class");
    switch(className){
      case "Layer":
        listLayer.push(allItems[i]);
        break;
      case "Top":
        listTop.push(allItems[i]);
        break;
      case "Bottom":
        listBottom.push(allItems[i]);
        break;
      case "Shoes":
        listShoes.push(allItems[i]);
        break;
      default:
        break;
    }
  }
  console.log("temperature received ",request.params.temp);
  //Apply weather filter
  listTop = weatherFilter(listTop,request.params.temp);
  listBottom = weatherFilter(listBottom,request.params.temp);
  return ("Lists updated!");
});

Parse.Cloud.define("generateOutfits",async(request)=>{
  if(filter == "Favorite"){
    return {
      Category : filter,
      Fits: listFavoriteFits
    }
  }
  //Filter based on wether the user wants a Random,Seasonal or Occasion Outfit
  //From filtered lists choose random selection of Layer,Top,Bottom and Shoes
  let generated_outfits = [];
  let local_layer_list = [...listLayer];
  let local_top_list = [...listTop];
  let local_bottom_list = [...listBottom];
  let local_shoes_list = [...listShoes];
  
  for(let i = 0; i < 30; i++){
      //refilling array
    if(local_layer_list.length < 1){
        local_layer_list = [...listLayer];
    }
    if(local_top_list.length < 1){
      local_top_list = [...listTop];
    }
    if(local_bottom_list.length < 1){
      local_bottom_list = [...listBottom];
    }
    if(local_shoes_list.length < 1)
    {
      local_shoes_list = [...listShoes];
    }

    //choosing random layer,tops,bottoms and shoes
    let random_layer= local_layer_list[Math.floor(Math.random()*local_layer_list.length)]
    let random_top = local_top_list[Math.floor(Math.random()*local_top_list.length)]
    let random_bottom = local_bottom_list[Math.floor(Math.random()*local_bottom_list.length)]
    let random_shoe = local_shoes_list[Math.floor(Math.random()*local_shoes_list.length)]

    let newFit = {
        Layer:random_layer,
        Top:random_top,
        Bottom:random_bottom,
        Shoe:random_shoe
    }

    // let newFit = [random_layer,random_top,random_bottom,random_shoe]
    generated_outfits.push(newFit)
    //removing the items
    local_layer_list.splice(local_layer_list.indexOf(random_layer),1)
    local_top_list.splice(local_top_list.indexOf(random_top),1)
    local_bottom_list.splice(local_bottom_list.indexOf(random_bottom),1)
    local_shoes_list.splice(local_shoes_list.indexOf(random_shoe),1)
  }
  return {
    Category : filter,
    Fits: generated_outfits
  }

});

Parse.Cloud.define("categoryRandom",async(request)=>{
  filter = "Random";
  if(listTop.length == 0 || listBottom.length == 0 || listShoes.length == 0){
    return false;
  }
  return true;
});

Parse.Cloud.define("categoryFavorite",async(request)=>{
  listFavoriteFits = [];
  filter = "Favorite";
  const userFitsQuery = userFitsRelation.query();
  userFitsQuery.equalTo("Favorite",true);
  let queriedFavoriteFits = (await userFitsQuery.find());
  if(queriedFavoriteFits.length > 1){
    for(let i = 0; i < queriedFavoriteFits.length; i++){
      let fitItem = queriedFavoriteFits[i];
      
      let newFit = {
        Layer: (fitItem.get("Layer") == undefined ? undefined : (await(fitItem.get("Layer")).fetch())),
        Top:(await(fitItem.get("Top")).fetch()),
        Bottom:(await(fitItem.get("Bottom")).fetch()),
        Shoe:(await(fitItem.get("Shoes")).fetch())
      }
      listFavoriteFits.push(newFit);
    }
    console.log("lengt of favorite fits " , listFavoriteFits.length)
    return true;
  }
  return false;
  
});

Parse.Cloud.define("categoryOccasion",async(request)=>{
  filter = "Occasion";
  listLayer = occassionFilter(listLayer,request.params.occasion);
  listTop =occassionFilter(listTop,request.params.occasion);
  listBottom =occassionFilter(listBottom,request.params.occasion);
  listShoes =occassionFilter(listShoes,request.params.occasion);
  if(listTop.length == 0 || listBottom.length == 0 || listShoes.length == 0){
    return false;
  }
  return true;
});

Parse.Cloud.define("categorySeason",async(request)=>{
  filter = "Season";
  listLayer = seasonFilter(listLayer,request.params.season);
  listTop = seasonFilter(listTop,request.params.season);
  listBottom = seasonFilter(listBottom,request.params.season);
  if(listTop.length == 0 || listBottom.length == 0 || listShoes.length == 0){
    return false;
  }
  return true;
});

function weatherFilter(list, temp){

  let unacceptableStyle = [];
  let unacceptableType = [];
  if(temp > 75){
    //Unacceptable Bottoms= {Style: Sweatpants}
    unacceptableStyle = ["Sweatpants"];
    listLayer = [];
  }
  else if(55 < temp && temp <= 75){
    //Layer needed if Top is Short Sleeve if Long Sleeve then not needed
    //Unacceptable Tops= {Type: Crop Top}
    //Unacceptable Bottoms  = {Style: Skirts}
    unacceptableType = ["Crop Top"];
    unacceptableStyle = ["Skirt"];

  }
  else{
    //NEEDS A LAYER
    //Unacceptable Tops= {Type: Crop Top,Off The Shoulder}
    //Unacceptable Bottoms  = {Style: Shorts,Skirts}
    unacceptableType = ["Crop Top","Off The Shoulder"];
    unacceptableStyle = ["Skirt","Shorts"];
  }
  
  let appropiateItems = list.filter(item => !unacceptableType.includes(item.get("Type")) && !unacceptableStyle.includes(item.get("Style")));

  return(appropiateItems);
}

function occassionFilter(list,category){ 
  let newList = list.filter(item => item.get("Category") == category);
  return(newList)
}

function seasonFilter(list,season){ 
  let coolColors = ["Red","Blue","Grey","Purple","Black","White","Pink"];
  let warmColors = ["Green","Grey","Yellow","Black","Brown","White","Tan","Orange"];
  let newList = [];
  if(season == "Summer"  || season == "Winter"){
    newList = list.filter(item => coolColors.includes(item.get("Color")));
  }
  else{
    newList = list.filter(item => warmColors.includes(item.get("Color")));
  }
  return(newList)
}




