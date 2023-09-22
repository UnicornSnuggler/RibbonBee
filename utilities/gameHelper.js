const { GAMES } = require('../data/misc');

exports.GetGamesByGen = function(gen) {
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

exports.GetLatestGen = function() {
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