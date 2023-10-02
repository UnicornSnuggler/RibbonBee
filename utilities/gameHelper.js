const { GAMES } = require('../data/misc');

const GetGamesByGen = exports.GetGamesByGen = function(gen) {
    let results = [];

    for (var key in GAMES) {
        if (GAMES[key].gen == gen) {
            results.push(key);
        }
    }

    return results;
};

exports.GetGenById = function(id) {
    return GAMES[id].gen;
}

const GetLatestGen = exports.GetLatestGen = function() {
    let latestGen = 1;

    for (var key in GAMES) {
        if (GAMES[key].gen > latestGen) {
            latestGen = GAMES[key].gen;
        }
    }

    return latestGen;
};

exports.GetNameById = function(id) {
    return GAMES[id].name;
}

exports.FilterGamesList = function(pokemonData, origin) {
    let latestGen = GetLatestGen();
    let filteredGames = [];

    for (let generation = origin; generation <= latestGen; generation++) {
        GetGamesByGen(generation).forEach(gameId => filteredGames.push(gameId));
    }

    return pokemonData.games.filter(x => filteredGames.includes(x));
}