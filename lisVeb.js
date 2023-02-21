let VEB = require('./veb');

module.exports = function lisVeb(names, distances) {
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

	// dp structure tracking lis lengths for a given rank
	// utilizes a vEB tree to find prev and next in O(lg lg u)
	// note: lg, of lg u, is faster than logarithmic
	// n lg lg u, is faster than linearithmic
	let veb = new VEB(ranked.length);
	let len = Array.from({length: n});
	for (let i = 0; i < n; i++) {
		let r = cities[i].rank;
		veb.insert(r);
		let p = veb.predecessor(r);
		let s = veb.successor(r);
		len[r] = len[p] ? len[p] + 1 : 1;
		if (len[s] === len[r]) veb.delete(s);
	}

	// track index of previous matching length
	// and index of previous decremented length (length-1)
	let prevMatchingIndex = [];
	let prevDecrementedIndex = [];
	let maxLength = -1;
	let i = {};
	for (let j = 0; j < len.length; j++) {
		let l = len[j];
		maxLength = Math.max(maxLength, l);
		prevMatchingIndex[j] = i[l] ?? null;
		prevDecrementedIndex[j] = i[l - 1] ?? null;
		i[l] = j;
	}

	let path = Array
		.from({length: maxLength + 1})
		.map(_ => null);

	let paths = [];
	enumerate(i[maxLength]);
	function enumerate(j) {
		let l = len[j];
		let k = path[l + 1] ?? null;
		if (l === maxLength || (k !== null && j < k)) path[l] = j;
		else return;

		let pdi = prevDecrementedIndex[j] ?? null;
		if (pdi === null) paths.push(format(path));
		else {enumerate(pdi);}

		let pmi = prevMatchingIndex[pdi] ?? null;
		if (pmi !== null) enumerate(pmi);
	}

	function format(path) {
		return path
			.slice(1)
			.map(rank => rankToCity[rank]);
	}

	return paths;
};

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

