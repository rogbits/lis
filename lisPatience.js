let VEB = require('./veb');

module.exports = function lisPatience(names, distances) {
	let n = names.length;
	distances = distances.map(Number);

	// assign ranks to distances
	let ranked = rank(distances);

	// create city objects, map rank->city
	// and sort cities alphabetically by name
	let cities = [];
	let rankToCity = {};
	for (let i = 0; i < names.length; i++) {
		let city = {
			name: names[i],
			rank: ranked[i],
			dist: distances[i]
		};
		cities.push(city);
		rankToCity[ranked[i]] = city;
	}
	cities.sort((a, b) => {
		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;
		return 0;
	});

	// patience sort
	// runs in n lg lg u, faster than n lg n
	let veb = new VEB(n);
	for (let i = 0; i < n; i++) {
		veb.insert(cities[i].rank);
		let s = veb.successor(cities[i].rank);
		if (s !== null) veb.delete(s);
	}

	let lis = [];
	let r = veb.min;
	while (r !== null) {
		lis.push(r);
		r = veb.successor(r);
	}

	// one permutation of LIS
	lis = lis.map(r => rankToCity[r].name);
	return lis.length;
}

function rank(arr) {
	let copy = arr
		.slice()
		.sort((a, b) => a - b);

	let rank = 0;
	let ranks = {};
	for (let i = 0; i < copy.length; i++) {
		let k = copy[i];
		ranks[k] = ranks[k] || [];
		ranks[k].push(rank++);
	}
	for (let i = 0; i < arr.length; i++) {
		copy[i] = ranks[arr[i]].shift();
	}

	return copy;
}