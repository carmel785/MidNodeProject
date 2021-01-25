const axios = require('axios')

exports.getAllMovies = function()
{
    return axios.get('https://api.tvmaze.com/shows')
}