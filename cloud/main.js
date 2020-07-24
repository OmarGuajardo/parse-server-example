//CLOUD FUNCS

//TODO: get the key from .env
Parse.initialize(process.env.APP_ID);
Parse.serverURL = 'http://localhost:1337/parse'

Parse.Cloud.define('hello', function(req, res) {
  return 'Hi';
});

Parse.Cloud.define("hello_world_omar",function(){
  return 'Hello from FBU at Texas';
})
