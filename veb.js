module.exports = class VEB {
	constructor(u, type = "root", level = 0) {
		this.u = 2 ** Math.ceil(Math.log2(u));
		this.min = null;
		this.max = null;
		this.base = u === 2;
		this.type = type;
		this.level = level;
		if (this.base) return;

		this.lowerRoot = 2 ** Math.floor(Math.log2(this.u) / 2);
		this.upperRoot = 2 ** Math.ceil(Math.log2(this.u) / 2);
		this.summary = new VEB(this.upperRoot, 'summary', this.level + 1);
		this.clusters = Array
			.from({length: this.upperRoot})
			.map((_, i) => new VEB(
				this.lowerRoot,
				this.type === 'summary' ? `summcl${i}` : `clustr${i}`,
				this.level + 1)
			);
	}

	high(x) {
		return Math.floor(x / this.lowerRoot);
	}

	low(x) {
		return x % this.lowerRoot;
	}

	index(ci, v) {
		return ci * this.lowerRoot + v;
	}

	insert(x) {
		if (this.min === null) {
			this.min = x;
			this.max = x;
			return;
		}
		if (x < this.min) {
			[x, this.min] = [this.min, x];
		}
		if (x > this.max) {
			this.max = x;
		}
		if (!this.base) {
			let ci = this.high(x);
			let vl = this.low(x);
			if (this.clusters[ci].min === null) {
				this.summary.insert(ci);
				this.clusters[ci].min = vl;
				this.clusters[ci].max = vl;
			} else {
				this.clusters[ci].insert(vl);
			}
		}
	}

	delete(x) {
		if (this.min === this.max && this.min === x) {
			this.min = null;
			this.max = null;
			return;
		}
		if (this.base) {
			this.min = x === 0 ? 1 : 0;
			this.max = this.min;
			return;
		}
		if (x === this.min) {
			let ci = this.summary.min;
			let v = this.clusters[ci].min;
			this.min = this.index(ci, v);
			x = this.min;
		}

		let ci = this.high(x);
		let v = this.low(x);
		this.clusters[ci].delete(v);
		if (this.clusters[ci].min === null) {
			this.summary.delete(ci);
			if (x === this.max) {
				let hi = this.summary.max;
				if (hi === null) this.max = this.min;
				else {
					let v = this.clusters[hi].max;
					this.max = this.index(hi, v);
				}
			}
		} else {
			let lo = this.clusters[ci].max;
			if (x === this.max) this.max = this.index(ci, lo);
		}
	}

	member(x) {
		if (x === this.min
			|| x === this.max) return true;
		if (this.base
			&& x !== this.min
			&& x !== this.max) return false;

		let ci = this.high(x);
		let v = this.low(x);
		return this.clusters[ci].member(v);
	}

	successor(x) {
		if (this.base) {
			if (x === 0 && this.max === 1) return 1;
			else return null;
		}
		if (this.min !== null && x < this.min) {
			return this.min;
		}

		let ci = this.high(x);
		let v = this.low(x);
		let cMax = this.clusters[ci].max;
		if (cMax !== null && v < cMax) {
			let sv = this.clusters[ci].successor(v);
			return this.index(ci, sv);
		} else {
			let sci = this.summary.successor(ci);
			if (sci === null) return null;
			v = this.clusters[sci].min;
			return this.index(sci, v);
		}
	}

	predecessor(x) {
		if (this.base) {
			if (x === 1 && this.min === 0) return 0;
			else return null;
		}
		if (this.max !== null && x > this.max) {
			return this.max;
		}

		let ci = this.high(x);
		let v = this.low(x);
		let min = this.clusters[ci].min;
		if (min !== null && v > min) {
			let pv = this.clusters[ci].predecessor(v);
			return this.index(ci, pv);
		} else {
			let pci = this.summary.predecessor(ci);
			if (pci === null) {
				if (this.min !== null && x > this.min) return this.min;
				else return null;
			} else {
				let v = this.clusters[pci].max;
				return this.index(pci, v);
			}
		}
	}

	toString() {
		let blue = (text) => '\x1B[34m' + text + '\x1B[0m';
		let highlight = (text) => text === null
			? text
			: '\x1B[31m' + text + '\x1B[0m';

		let line = '';
		let keys = ['type', 'u', 'min', 'max'];
		for (let k of keys) {
			let minMax = k === 'min' || k === 'max';
			let l = blue(k);
			let v = minMax ? highlight(this[k]) : this[k];
			line += `${l}:${v}, `;
		}
		line = ' '.repeat(this.level * 2) + line;
		if (this.base) {
			return line;
		} else {
			line += '\n' + this.summary.toString();
			this.clusters.forEach(c => line += '\n' + c.toString());
			return line;
		}
	}
};