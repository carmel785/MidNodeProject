var express = require('express');
var router = express.Router();
var dal = require('../Dals/webDal')
const model = require('../model');
const { query } = require('express');
const { render } = require('ejs');

router.get('/', function(req, res, next) {
  var zero = "false"
  res.redirect('/login/'+zero)
});
router.get('/login/:zero', function(req, res, next) {
  res.render('login', {zero : req.params.zero});
});

router.get('/newUser',async function(req, res, next) {
  //if Admin
  let alreadyRedirect = false
  if(model.isAdmin(req.query))
  {
    alreadyRedirect = true
    console.log("true one")
    res.redirect('/menu/'+req.query.user+"/"+req.query.pwd)
  }
  //if already registered
  let ifRegistered = await model.checkIfRegister(req.query.user)
  if(ifRegistered == true)
  {
    //how if the user have enough transaction to go to menu
    let isHaveTransaction = await model.checkTransactionsNum(req.query.user, req.query.pwd)
    if(isHaveTransaction == true)
    {
      res.redirect('/menu/'+req.query.user+"/"+req.query.pwd)
    }
    else
    {
      var zero = true
      res.redirect('/login/'+zero)
      // res.send(" the user have 0 transaction")
    }
  }

  else if(alreadyRedirect == false)
  {
    //createing new user
    console.log("wtf")
    model.takeUserData(req.query,0)
      res.redirect('/menu/'+req.query.user+"/"+req.query.pwd)
    
    //cant count users created cause I didnt change the value when the user already in so its kepp counting
    //res.send(appSession.createdUser+" Users created")
  }
  
});


router.get('/menu/:user/:pwd',async function(req, res, next) {
  res.render('menu', { user: req.params.user, pwd: req.params.pwd });
});

router.get('/createMovie/:user/:pwd', async function(req, res, next) {
  let pwd = req.params.pwd
  res.render('createMovie', {user: req.params.user, pwd });
});

router.post('/createNewMovie/:user/:pwd', async function(req, res, next) {
  //if there is no transactions left
  let tNum = await model.checkTransactionsNum(req.params.user, req.params.pwd)
  if(tNum!= true)
  {
    let zero = "true"
    res.redirect('/login/'+zero)
  }
  let appSession = req.session
  if(appSession.createdMovie)
  {
    appSession.createdMovie+=1
  }
  else{
    appSession.createdMovie =1
  }
  await model.reduceTransactions(req.params.user)
  console.log(req.params.user+" has 1 transaction less")
  model.createMovie(req.body, appSession.createdMovie)
  let pwd = req.params.pwd
  res.render('menu', {user: req.params.user, pwd });
});

router.get('/searchMovie/:user/:pwd',async function(req, res, next) {
  let pwd = req.params.pwd
  res.render('searchMovie', {user: req.params.user, pwd });
});

router.get('/searchResults/:user/:pwd',async function(req, res, next) {

  //if there is no transactions left
  let tNum = await model.checkTransactionsNum(req.params.user, req.params.pwd)
  if(tNum!= true)
  {
    let zero = "true"
    res.redirect('/login/'+zero)
  }
  let obj = {
    "user" : req.params.user,
    "genres" : req.query.genre,
    "name" : req.query.name,
    "language" : req.query.language
  }
  await model.reduceTransactions(req.params.user)
  let movies = await model.sameGenreList(req.query.genre)
  let pwd = req.params.pwd
  res.render('searchResults', {movie: obj, allMovies: movies, user: req.params.user, pwd});
});

router.get('/movieData/:user/:movie/:pwd',async function(req, res, next) {
//if there is no transactions left
  let tNum = await model.checkTransactionsNum(req.params.user, req.params.pwd)
  if(tNum!= true)
  {
    let zero = "true"
    res.redirect('/login/'+zero)
  }

  let user = req.params.user
  let pwd = req.params.pwd
  let m = req.params.movie
  let movie = JSON.parse(m)

  //one less transaction..
  await model.reduceTransactions(req.params.user)

  res.render('movieData', {movie,user,pwd})
});


router.get('/userManagement/:user/:pwd',async function(req, res, next) {
  let users = await model.getUsers()
  res.render('userManagement', {users, user: req.params.user , pwd:req.params.pwd})
});

router.get('/userManagement/delete/:user/:pwd',async function(req, res, next) {
  let users = await model.deleteUser(req.params.user)
  let user = req.params.user
  let pwd = req.params.pwd
  // res.render('userManagement', {user , pwd , users})
  res.render('userManagement' , {users,user : "carmel", pwd : "123"})
});

// take the data to the form of user data page
router.get('/userData/:user/:pwd/:userForUpdate/:num',async function(req, res, next) {
  let user = req.params.user
  let pwd = req.params.pwd
  let num = req.params.num
  let updateU = JSON.parse(req.params.userForUpdate)
  if(user == "carmel" && pwd == "123")
  {
  res.render('userData', {updateU,user, pwd, num})
  }
});
  
router.get('/userData/create/:user/:pwd',async function(req, res, next) {
  let user = req.params.user
  let pwd = req.params.pwd  
  //creatae User
  model.takeUserData(req.query,1)
  res.redirect('/userManagement/'+user+'/'+pwd)

  });
  router.get('/userData/:user/:pwd/:pastUser',async function(req, res, next) {
    newUser = {
      "User":{
      user: req.query.user,
      pwd: req.query.pwd,
      created_date: req.query.created_date,
      TransactionsNum: parseInt(req.query.TransactionsNum)
      }
    }
    let pastUser = JSON.parse(req.params.pastUser)
    await model.updateUser(pastUser,newUser)

  res.redirect('/userManagement/carmel/123')
  // res.render('userManagement', {users, user: req.params.user , pwd:req.params.pwd})
});


  

module.exports = router;
