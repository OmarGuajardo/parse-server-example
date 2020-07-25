//CLOUD FUNCS

// //TODO: get the key from .env
// Parse.initialize(process.env.APP_ID);
// Parse.serverURL = 'http://localhost:1337/parse'
let x = 2;
Parse.Cloud.define('hello', function(req, res) {
  return 'Hi ' + x;
});
Parse.Cloud.define('get_user_name', function(objID, res) {
  return Parse.User.get(objID).get("username");
});


