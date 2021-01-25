const webDal = require('./Dals/webDal')
const jsonDal = require('./Dals/jsonDal')
const jsonUserDal = require('./Dals/jsonUsersDal')
const { json } = require('express')
const { format } = require('morgan')
const { all } = require('./routes')

exports.createMovie = async function(movie, createdMovieSession)
{
    //adding new id
    let nextId = await getLastId(createdMovieSession)+createdMovieSession
    movie.id = nextId

    // var data1 = {"movies": [movie]}
    var data1 = [movie]
    

    //getting the json of movies and adding it a new movie
    if(createdMovieSession>1)
    {
        let movies = await jsonDal.readFile()
        let objNew = {name: movie.name,
            language: movie.language,
            genres: movie.genres,
            id: movie.id
           }
            movies.push(objNew)
            data1 = movies
    }


  jsonDal.writeFile('JsonsFiles/NewMovies.json',data1)
}

async function getLastId()
{
    let lastOne = 0
    let data = await webDal.getAllMovies()
    data.data.forEach(movie=>
        {
            if(movie.id > lastOne)
                {
                    lastOne = (movie.id)+1
                }
        })
    return lastOne
}

exports.takeUserData = async function(userData,admin)
{
    // var admin = [{
    //     "Admin":{
    //         "username" : "carmel",
    //         "password" : 123,
    //         "created Date" : "22.10.2020",
    //         "num of transactions" : "infinity"
    //         }
    //     }]
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();

    if(admin==1)
    {
        newUser = {
            "User":{
            user: userData.user,
            pwd: userData.pwd,
            created_date: userData.created_date,
            TransactionsNum: parseInt(userData.TransactionsNum)
            }
        }
    }
    else{
        newUser = {
            "User":{
            user: userData.user,
            pwd: userData.pwd,
            created_date: dd+"/"+mm+"/"+yyyy,
            TransactionsNum:5
            }
        }
    }
    let users = await jsonUserDal.readFile()
    users.push(newUser)
    jsonUserDal.writeFile('JsonsFiles/users.json',users)
}

//check if the user in the data base(already registered)
exports.checkIfRegister = async function(userName)
{
    let users = await jsonUserDal.readFile()
    if(users.some(x=> x.User))
    {
        let arr = users.filter(u=> u.User)
        for(let i =0; i< arr.length; i++)
            {
                if(arr[i].User.user == userName)
                {
                    return true
                }
            }
    }
    return false
}       


//check user transcation number
exports.checkTransactionsNum = async function(userName,pwd)
{
    
    let users = await jsonUserDal.readFile()
    let arr = users.filter(u=> u.User)
    for(let i =0; i< arr.length; i++)
        {
            if(arr[i].User.user == userName && arr[i].User.pwd == pwd)
            {
                //before checking if there is enough transactions it checking if the user has to get more transactions because the day is passed
                await checkToday(arr[i].User,i)
               if(arr[i].User.TransactionsNum>0)
                {
                    return true
                }
                
            }
        }
    return false
}
// reduce one point fromn spcific user transactions
exports.reduceTransactions = async function(userName)
{
    let users = await jsonUserDal.readFile()
    let arr = users.filter(u=> u.User)
    arr.forEach(x=>
        {
            if(x.User.user == userName)
            {
                let a = x.User.TransactionsNum= x.User.TransactionsNum - 1
                x.User = {
                    user: x.User.user,
                    pwd: x.User.pwd,
                    created_date: x.User.created_date,
                    TransactionsNum: a
                }
                jsonUserDal.writeFile('JsonsFiles/users.json',users)
                
            }
        }) 
}

exports.sameGenreList = async function(genre)
{
    let a = await webDal.getAllMovies()
    let b = await jsonDal.readFile()

    //get only movies with the same genre as the movie the function got
    let allMovies = a.data.filter(m=> m.genres.some(g=> g == genre))
    let allmovies2 = b.filter(m=> m.genres == genre)
    for(let i=0; i< allmovies2.length; i++)
    {
        allMovies.push(allmovies2[i])
    }
    return allMovies
}
exports.getUsers = async function()
{
   return await jsonUserDal.readFile()
}

exports.deleteUser = async function(user)
{
    let users = await jsonUserDal.readFile()
    let index = users.findIndex(x => 
        {
            if(x.User)
            {
              return x.User.user == user
            }
        })
    if(index >= 0)
    {
        users.splice(index,1)
        jsonUserDal.writeFile('JsonsFiles/Users.json',users)
        return users
    }
}

exports.updateUser = async function(user, newUser)
{
    let users = await jsonUserDal.readFile()
    let index = users.findIndex(x => 
        {
            if(x.User)
            {
              return ((x.User.user == user.user) 
                        && (x.User.pwd == user.pwd) 
                        && (x.User.created_date == user.created_date) 
                        && (x.User.TransactionsNum == user.TransactionsNum))
            }
        })
    if(index >= 0)
    {
        users[index] = {
            "User":{
                user: newUser.User.user,
                pwd: newUser.User.pwd,
                created_date: newUser.User.created_date,
                TransactionsNum: newUser.User.TransactionsNum
                }
        }
    }
        await jsonUserDal.writeFile('JsonsFiles/Users.json',users)
}

exports.isAdmin = function(user)
{
    if(user.user == "carmel" && user.pwd == "123")
    return true
}

//checking the date today and return true if a day past and the user need to get 5 transaction(max) and updating
async function checkToday(user,i)
{
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    var d1 =  dd+"/"+mm+"/"+yyyy
    let users = await jsonUserDal.readFile()
    let arr = users.filter(u=> u.User)
    if(user.created_date<d1)
    {
        arr[i] = {
            "User":{
            user: user.user,
            pwd: user.pwd,
            created_date: dd+"/"+mm+"/"+yyyy,
            TransactionsNum:5
            }
        }
        await jsonUserDal.writeFile('JsonsFiles/Users.json',arr)
    }
}
