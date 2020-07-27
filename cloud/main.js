//CLOUD FUNCS

let listLayer = [];
let listTop = [];
let listBottom = [];
let listShoes = [];



Parse.Cloud.define("updateLists", async (request)=>{
  var query = new Parse.Query("Closet");
  var userCloset = query.get(request.params.currentUserCloset);
  let allItems = [];

  listLayer = [];
  listTop = [];
  listBottom = [];
  listShoes = [];
  let allItemsRelation = (await userCloset).relation("allItems");

  allItems = (await allItemsRelation.query().find());
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
  weatherFilter("Bottom",listBottom,100);
  weatherFilter("Bottom",listBottom,60);
  weatherFilter("Bottom",listBottom,50);
  return ("Lists updated!");
});



function weatherFilter(listName, list, temp){
  
  let unacceptableStyle = [];
  let unacceptableType = [];
  if(temp > 75){
    //Unacceptable Bottoms= {Style: Sweatpants}
    unacceptableStyle = ["Sweatpants"];
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
  
  console.log(listName + "RESULTS AT " + temp) ;
  // console.log(list[1].get("Style"));
  // console.log(unacceptableStyle.includes(list[1].get("Style")))
  let appropiateItems = list.filter(item => !unacceptableType.includes(item.get("Type")) &&  !unacceptableStyle.includes(item.get("Style")))
  for(let i = 0; i < appropiateItems.length; i++){
    console.log("Name: "+appropiateItems[i].get("Name"))
    console.log("Fit: "+appropiateItems[i].get("Fit"))
    console.log("Type: "+appropiateItems[i].get("Type"))
    console.log("Style: "+appropiateItems[i].get("Style"))
    console.log("--------");
  }
  console.log("                     ");
  // console.log(appropiateItems);
 

}



