const fuzzy = require('./fuzzy');

const { BULBAPEDIA_SUFFIX, BULBAPEDIA_URI, SPRITE_FILE_EXTENSION, SPRITE_URI } = require('../constants');
const { POKEMON } = require('../data/pokemon');
const { COMMON_FORMS } = require('../data/misc');

const { GetLatestGen, GetGenById } = require('./gameHelper');

exports.BuildBulbapediaUri = exports.BuildBulbapediaUri = function(name) {
    return `${BULBAPEDIA_URI}${name}${BULBAPEDIA_SUFFIX}`;
}

exports.BuildSpriteUri = function(name) {
    return `${SPRITE_URI}${name}${SPRITE_FILE_EXTENSION}`;
}

exports.FindEarliestGen = function(pokemonData) {
    let latestGen = GetLatestGen();
    let earliestGen = latestGen;
    
    for (let index = 0; index < pokemonData.games.length; index++) {
        let thisGen = GetGenById(pokemonData.games[index]);
        
        if (thisGen < earliestGen && thisGen > 2) earliestGen = thisGen;
    }
    
    // if (earliestGen == 8 && pokemonData.natdex > 905) earliestGen = 9;

    return earliestGen;
}

exports.GetNameWithForm = function(pokemonData, foregoForm = false) {
    let result = '';

    if (pokemonData.forms && !foregoForm) result += `${pokemonData.forms.eng.replaceAll(/ form(?!e)/gi, '')} `;

    result += pokemonData.names.eng;

    if (pokemonData['forms-all'] && !foregoForm) result += ` ${pokemonData['forms-all']}`;

    return result;
}

exports.GetPokemonData = function(key) {
    let pokemonData = POKEMON[key];

    if (!pokemonData) return null;

    if (pokemonData['data-source']) {
        let dataSource = POKEMON[pokemonData['data-source']];
        pokemonData = { ...dataSource, ...pokemonData };
    }

    if (pokemonData['form-source']) {
        let formSource = COMMON_FORMS[pokemonData['form-source']];
        pokemonData.forms = formSource;
    }

    return pokemonData;
};

exports.SearchByName = function(query) {
    let matches = [];
    let index = {};
    
    for (let key of Object.keys(POKEMON)) {
        let data = null;
        let form = null;

        if (POKEMON[key]['data-source']) data = POKEMON[POKEMON[key]['data-source']];
        if (POKEMON[key]['form-source']) form = COMMON_FORMS[POKEMON[key]['form-source']];

        let name = `${form ? `${form.eng} ` : POKEMON[key].forms ? `${POKEMON[key].forms.eng} ` : ''}${data ? data.names.eng : POKEMON[key].names.eng}${POKEMON[key]['forms-all'] ? ` ${POKEMON[key]['forms-all']}` : ''}`;

        matches.push(fuzzy(name, query));
        index[name] = key;
        matches.push(fuzzy(key, query));
        index[key] = key;
    }

    matches.sort(fuzzy.matchComparator);

    let result = index[matches[0].term];

    return result;
}