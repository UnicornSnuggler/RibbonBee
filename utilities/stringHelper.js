const superscriptCharacters = {
	0: '\u2070',
	1: '\u00B9',
	2: '\u00B2',
	3: '\u00B3',
	4: '\u2074',
	5: '\u2075',
	6: '\u2076',
	7: '\u2077',
	8: '\u2078',
	9: '\u2079'
};

exports.SuperscriptNumber = function(number) {
	return number.toString().split('').map(x => superscriptCharacters[x] ?? '').join('');
}