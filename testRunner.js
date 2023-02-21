let fs = require('fs');
let lis = require('./lisVeb');

let tests = {};
generateTests();
runTests();

function generateTests() {
	let files = fs.readdirSync('./tests');
	for (let file of files) {
		let pattern = /Test_(\d)_(input|output)/;
		let match = file.match(pattern);
		let testCase = match[1];
		let type = match[2];
		let contents = fs.readFileSync(`./tests/${file}`).toString('utf8');
		tests[testCase] = tests[testCase] || {};
		if (type === 'input') {
			let split = contents.split('\n');
			let numCities = Number(split[0]);
			let cities = split.slice(1, numCities + 1);
			let distances = split[split.length - 1].split(' ');
			tests[testCase].inputCities = cities;
			tests[testCase].inputDistances = distances;
		} else {
			tests[testCase].output = Number(contents);
		}
	}
}

function runTests() {
	let max = Math.max(...Object.keys(tests).map(Number));
	for (let i = 1; i <= max; i++) {
		console.log('test', i);
		let cities = tests[i].inputCities;
		let distances = tests[i].inputDistances;
		let expected = tests[i].output;
		let ans = lis(cities, distances);
		console.log({expected, ans});
		// console.log(paths.map(p => p.map(c => c.name)));
	}
}


