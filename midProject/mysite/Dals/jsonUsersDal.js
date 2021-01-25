var jsonfile = require('jsonfile')

exports.writeFile = function(location,data)
{
    jsonfile.writeFile(location ,data, (err)=>
    {
        if(err)
        {
            console.log(err)
        }
        else
        {
            console.log("new user created")
        }    
    })
}

exports.readFile = function()
{
    return new Promise(function(resolve,reject) {
        jsonfile.readFile("/Users/carmelklein/JobPractice/Yaniv_Exc/midProject/mysite/JsonsFiles/Users.json", function(err,data)
        {
            if(err)
            {
                reject(err)
            }
            else
            {
                resolve(data)
            }    
        })
    })
    
}
