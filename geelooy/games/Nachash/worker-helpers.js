//B"H
//file worker-helpers.js

// --- CORE PERFORMANCE CLASS: Spatial Partitioning Grid ---
class SpatialGrid {
	constructor(worldWidth, worldHeight,
		cellSize) {
		this.cellSize = cellSize;
		this.cols = Math.ceil(
			worldWidth /
			cellSize);
		this.rows = Math.ceil(
			worldHeight /
			cellSize);
		this.cells = Array(this
				.cols * this.rows)
			.fill(null)
			.map(() => []);
	}
	clear() {
		for (const cell of this
				.cells) {
			cell.length = 0;
		}
	}
	getCellIndex(x, y) {
		const col = Math.floor(x /
			this.cellSize);
		const row = Math.floor(y /
			this.cellSize);
		return row * this.cols +
			col;
	}
	insert(obj) {
		const indices = new Set();
		// Insert head
		indices.add(this
			.getCellIndex(obj.x,
				obj.y));
		// Insert body segments for snakes
		if (obj.body) {
			for (const seg of obj
					.body) {
				indices.add(this
					.getCellIndex(
						seg.x,
						seg.y));
			}
		}
		indices.forEach(index => {
			if (index >=
				0 && index <
				this.cells
				.length) {
				this.cells[
						index
					]
					.push(
						obj
					);
			}
		});
	}
	getNearbyObjects(obj) {
		const nearby = new Set();
		const checkCell = (x,
		y) => {
			const col = Math
				.floor(x / this
					.cellSize);
			const row = Math
				.floor(y / this
					.cellSize);
			if (col < 0 ||
				col >= this
				.cols || row <
				0 || row >= this
				.rows) return;
			const index = row *
				this.cols + col;
			this.cells[index]
				.forEach(item =>
					nearby.add(
						item));
		};
		// Check a 3x3 grid of cells around the object's head
		const {
			x,
			y
		} = obj;
		const cs = this.cellSize;
		checkCell(x - cs, y - cs);
		checkCell(x, y - cs);
		checkCell(x + cs, y - cs);
		checkCell(x - cs, y);
		checkCell(x, y);
		checkCell(x + cs, y);
		checkCell(x - cs, y + cs);
		checkCell(x, y + cs);
		checkCell(x + cs, y + cs);
		return Array.from(nearby);
	}
}

// --- UTILITY & POOL ---
function getDistance(x1, y1, x2, y2) {
	const dx = x1 - x2;
	const dy = y1 - y2;
	return Math.sqrt(dx * dx + dy * dy);
}
class ObjectPool {
	/* ... (Same as previous version, no changes needed) ... */
	constructor(createFn, initialSize) {
		this._createFn = createFn;
		this._pool = [];
		this.last = null;
		for (let i = 0; i <
			initialSize; i++) {
			this._pool.push(this
				._createFn());
		}
	}
	get() {
		if (this._pool.length > 0) {
			this.last = this._pool
				.pop();
		} else {
			this.last = this
				._createFn();
		}
		return this.last;
	}
	release(obj) {
		obj.reset();
		this._pool.push(obj);
	}
	reset() {
		this._pool.forEach(obj =>
			obj.reset());
	}
}

// --- GAME OBJECTS ---
const KABBALA_NAMES = [
	// Angels & Archangels
	'Metatron', 'Sandalphon',
	'Raziel', 'Tzaphqiel',
	'Tzadkiel', 'Camael',
	'Raphael', 'Haniel', 'Michael',
	'Gabriel', 'Uriel', 'Azrael',
	'Jophiel',
	'Zadkiel', 'Nuriel', 'Pravuil',
	'Zagzagel', 'Hadraniel',
	'Galgaliel',
	'Kokabiel', 'Suriel', 'Cassiel',
	'Sachiel', 'Anael', 'Orifiel',

	// Demonic & Adversarial Figures
	'Samael', 'Lilith', 'Asmodeus',
	'Agrat', 'Mahalat', 'Naamah',
	'Eisheth',
	'Belial', 'Mastema', 'Azazel',
	'Beelzebub', 'Abaddon', 'Dumah',
	'Rahab', 'Shemyaza', 'Sariel',
	'Ananel', 'Tamiel', 'Ramiel',

	// mystical Creatures & Concepts
	'Leviathan', 'Behemoth', 'Ziz',
	'Tannin', 'Ophion', 'Golem',
	'Dybbuk',
	'Nephilim', 'Seraphim',
	'Cherubim', 'Ophanim', 'Chayot',
	'Arelim',

	// Sephirot (Divine Emanations)
	'Keter', 'Chokmah', 'Binah',
	'Chesed', 'Geburah', 'Tiferet',
	'Netzach',
	'Hod', 'Yesod', 'Malkuth',
	'Daat',

	// Other Mystical Terms
	'EinSof', 'Tohu', 'Bohu',
	'Chashmal', 'Merkabah',
	'Yetzirah', 'Beriah',
	'Atziluth', 'Assiah',
	'Qliphoth', 'Shekhinah'
];

const COLLECTIBLE_EMOJIS = Array.from(
	'🌼🌻💐🌹🌺🌸🏵️🪻🍎🍇🍉🍊🍋🍓🍒🍑🥝'
);
const HEBREW_LETTERS = Array.from(
	'אבגדהוזחטיכלמנסעפצקרשת');

function generateAiName() {
	let name = KABBALA_NAMES[Math.floor(
		Math.random() *
		KABBALA_NAMES.length)];
	name += Math.floor(Math.random() *
		90) + 10;
	return name.split('')
		.map((c, i) => i % 2 === 0 ? c
			.toLowerCase() : c
			.toUpperCase())
		.join('');
}




class Collectible {
	constructor(x, y) {
		this.type = 'collectible';
		this.x = x;
		this.y = y;
		this.size = 14;
		this.char =
			COLLECTIBLE_EMOJIS[Math
				.floor(Math
					.random() *
					COLLECTIBLE_EMOJIS
					.length)];
		this.isAlive = true;
	}
	draw(ctx) {
		if (this.isAlive) {
			ctx.font =
				'28px sans-serif';
			ctx.fillText(this.char,
				this.x - this
				.size, this.y +
				this.size / 2);
		}
	}
}

class Particle {
	init(x, y) {
		this.isActive = true;
		this.x = x;
		this.y = y;
		this.vx = Math.random() *
			6 - 3;
		this.vy = Math.random() * -
			6 - 2;
		this.life = 100;
		this.size = 20;
		this.text = HEBREW_LETTERS[
			Math.floor(Math
				.random() *
				HEBREW_LETTERS
				.length)];
		this.color =
			`hsl(${Math.random() * 360}, 100%, 80%)`;
	}
	reset() {
		this.isActive = false;
	}
	update() {
		if (!this.isActive) return;
		this.x += this.vx;
		this.y += this.vy;
		this.vy += 0.1;
		this.life--;
		if (this.life <= 0) this
			.reset();
	}
	draw(ctx) {
		if (!this.isActive) return;
		ctx.globalAlpha = this
			.life / 100;
		ctx.fillStyle = this.color;
		ctx.font =
			`bold ${this.size * (this.life / 100)}px 'Cormorant Garamond'`;
		ctx.textAlign = 'center';
		ctx.fillText(this.text, this
			.x, this.y);
		ctx.globalAlpha = 1.0;
	}
}

class Lightning {
	constructor(x1, y1, x2, y2) {
		this.life = 25;
		this.segments = [];
		this.generate(x1, y1, x2,
			y2, 25);
	}
	generate(x1, y1, x2, y2,
		displacement) {
		const midX = (x1 + x2) / 2 +
			(Math.random() - 0.5) *
			displacement;
		const midY = (y1 + y2) / 2 +
			(Math.random() - 0.5) *
			displacement;
		if (displacement < 5) {
			this.segments.push({
				x1,
				y1,
				x2: midX,
				y2: midY
			});
			this.segments.push({
				x1: midX,
				y1: midY,
				x2,
				y2
			});
		} else {
			this.generate(x1, y1,
				midX, midY,
				displacement / 2
			);
			this.generate(midX,
				midY, x2, y2,
				displacement / 2
			);
			// --- VIVID: Add random forks ---
			if (Math.random() >
				0.7) {
				this.generate(midX,
					midY, midX +
					(Math
						.random() -
						0.5) *
					displacement *
					2, midY + (
						Math
						.random() -
						0.5) *
					displacement *
					2,
					displacement /
					2);
			}
		}
	}
	update() {
		this.life--;
	}
	draw(ctx) {
		ctx.strokeStyle =
			`rgba(255, 255, 255, ${this.life / 25})`;
		ctx.lineWidth = 3;
		ctx.beginPath();
		this.segments.forEach(
		seg => {
			ctx.moveTo(seg
				.x1, seg
				.y1);
			ctx.lineTo(seg
				.x2, seg
				.y2);
		});
		ctx.stroke();
	}
}

// --- NEW HELPER FUNCTIONS ---
function drawWorld(ctx) {
	// This function can be expanded with background details, but for now objects are drawn here
	state.collectibles.forEach(c => c
		.draw(ctx));
	state.aiSnakes.forEach(s => s.draw(
		ctx));
	state.player.draw(ctx);
	state.particles.forEach(p => p.draw(
		ctx));
	state.lightningEffects.forEach(l =>
		l.draw(ctx));
}

function drawMinimap(ctx) {
	const mapW = 100;
	const mapH = 100;
	const x = state.camera.width -
		mapW - 10;
	const y = state.camera.height -
		mapH - 10;
	// Background
	ctx.fillStyle =
		'rgba(0, 0, 0, 0.4)';
	ctx.fillRect(x, y, mapW, mapH);
	// Border
	ctx.strokeStyle =
		'rgba(255, 255, 255, 0.5)';
	ctx.strokeRect(x, y, mapW, mapH);
	// Player dot
	const playerX = x + (state.player
			.x / state.world.width) *
		mapW;
	const playerY = y + (state.player
			.y / state.world.height) *
		mapH;
	ctx.fillStyle = 'yellow';
	ctx.beginPath();
	ctx.arc(playerX, playerY, 3, 0, Math
		.PI * 2);
	ctx.fill();
}



// --- FIX: Corrected Player Class ---
class Player {
	constructor(x, y, length) {
		this.type = 'player';
		this.x = x;
		this.y = y;
		this.size = 14;
		this.angle = 0;
		this.speed = 4.5;
		this.body = [];
		this.maxLength = length;
		this.isTurning = false;
		this.targetAngle = 0;
		this.turnSpeed = 0.1;
		this.borderPadding = 30;
		this.isInvincible = false;
		this.isAlive = true;
		this.score = 0;
	}

	setTargetAngle(angle) {
		this.isTurning = true;
		this.targetAngle = angle;
	}

	stopTurning() {
		this.isTurning = false;
	}

	update() {
		if (!this.isAlive) return;

		// This is the core movement logic that was failing
		if (this.isTurning) {
			let angleDiff = this
				.targetAngle - this
				.angle;
			while (angleDiff < -Math
				.PI) angleDiff +=
				2 * Math.PI;
			while (angleDiff > Math
				.PI) angleDiff -=
				2 * Math.PI;
			this.angle +=
				angleDiff * this
				.turnSpeed;
		}

		// Update body and position
		this.body.unshift({
			x: this.x,
			y: this.y
		});
		if (this.body.length > this
			.maxLength) this.body
			.pop();
		this.x += Math.cos(this
			.angle) * this.speed;
		this.y += Math.sin(this
			.angle) * this.speed;

		this.handleBorders();
		state.score = this.score;
	}

	handleBorders() {
		const {
			width,
			height
		} = state.world;
		const pad = this
			.borderPadding;
		if ((this.x < pad && Math
				.cos(this.angle) < 0
			) || (this.x >
				width - pad && Math
				.cos(this.angle) > 0
			)) {
			this.angle = Math.PI -
				this.angle;
		}
		if ((this.y < pad && Math
				.sin(this.angle) < 0
			) || (this.y >
				height - pad && Math
				.sin(this.angle) > 0
			)) {
			this.angle = -this
				.angle;
		}
		this.x = Math.max(pad, Math
			.min(width - pad,
				this.x));
		this.y = Math.max(pad, Math
			.min(height - pad,
				this.y));
	}

	draw(ctx) {
		const color = 120;
		this.body.forEach((seg,
			i) => {
			const ratio =
				1 - (i /
					this
					.body
					.length
				);
			ctx.fillStyle =
				`hsl(${color + i*0.5}, 100%, ${30 + ratio * 25}%)`;
			ctx.beginPath();
			ctx.arc(seg.x,
				seg.y,
				this
				.size,
				0, Math
				.PI * 2);
			ctx.fill();
		});
		ctx.fillStyle =
			`hsl(${color}, 100%, 70%)`;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this
			.size, 0, Math.PI *
			2);
		ctx.fill();
	}

	grow(amount) {
		this.maxLength += amount;
	}

	die() {
		if (this.type === 'player')
			gameOver();
		this.isAlive = false;
	}
}


// --- FIX: New, robust, and performant background drawing function ---
// --- NEW: Advanced, Multi-Layered Background Drawing Function ---
// Call this once when initializing the game
let grassTile, dirtTile, rockTile;

function makeTile(colorBase, hueRange, lightRange, speckColor) {
	const size = 64; // smaller texture tile, repeated
	const tile = document.createElement('canvas');
	tile.width = tile.height = size;
	const c = tile.getContext('2d');

	// Base fill
	c.fillStyle = colorBase;
	c.fillRect(0, 0, size, size);

	// Add quick random streaks and dots
	for (let i = 0; i < 80; i++) {
		const x = Math.random() * size;
		const y = Math.random() * size;
		if (Math.random() < 0.7) {
			// short line stroke
			c.strokeStyle = `hsl(${hueRange[0] + Math.random() * (hueRange[1] - hueRange[0])}, 25%, ${lightRange[0] + Math.random() * (lightRange[1] - lightRange[0])}%)`;
			c.lineWidth = 0.5;
			c.beginPath();
			c.moveTo(x, y);
			c.lineTo(x + Math.random() * 3 - 1.5, y + Math.random() * 3 - 1.5);
			c.stroke();
		} else {
			// dirt speck
			c.fillStyle = speckColor;
			c.fillRect(x, y, 1, 1);
		}
	}
	return tile;
}

function initBackgroundTiles() {
	grassTile = makeTile('hsl(105, 30%, 22%)', [95, 115], [20, 35], 'hsl(30, 20%, 15%)');
	dirtTile = makeTile('hsl(30, 25%, 20%)', [25, 35], [15, 25], 'hsl(20, 10%, 12%)');
	rockTile = makeTile('hsl(25, 15%, 25%)', [20, 30], [20, 30], 'hsl(0, 0%, 10%)');
}

// Draw visible patches lightning fast
function drawBackground(ctx) {
	const { camera, world } = state;
	if (!grassTile) initBackgroundTiles();

	const patchSize = 200;
	const view = {
		x: camera.x,
		y: camera.y,
		right: camera.x + camera.width / camera.zoom,
		bottom: camera.y + camera.height / camera.zoom
	};

	const startCol = Math.floor(view.x / patchSize);
	const endCol = Math.ceil(view.right / patchSize);
	const startRow = Math.floor(view.y / patchSize);
	const endRow = Math.ceil(view.bottom / patchSize);

	for (let row = startRow; row < endRow; row++) {
		for (let col = startCol; col < endCol; col++) {
			const seed = Math.sin(col * 1.37 + row * 5.81) * 10000;
			const r = Math.abs(Math.sin(seed)) % 1;
			let tile;
			if (r < 0.75) tile = grassTile;
			else if (r < 0.95) tile = dirtTile;
			else tile = rockTile;

			ctx.drawImage(tile, col * patchSize, row * patchSize, patchSize, patchSize);
		}
	}

	// Frame border
	ctx.strokeStyle = '#1c1206';
	ctx.lineWidth = 40;
	ctx.strokeRect(20, 20, world.width - 40, world.height - 40);
}




class AiSnake extends Player {
	constructor(x, y, length) {
		super(x, y, length);
		this.type = 'ai_snake';
		this.name =
			generateAiName();
		this.color =
			`hsl(${Math.random() * 360}, 90%, 60%)`;
		this.speed = 3 + Math
			.random() * 1.5;
		this.size = 12;
	}
	update() {
		if (!this.isAlive) return;
		this.findTarget();
		super.update();
	}
	findTarget() {
		const nearby = state.grid
			.getNearbyObjects(this);
		const food = nearby.filter(
			o => o.type ===
			'collectible' && o
			.isAlive);
		if (food.length > 0) {
			this.targetAngle = Math
				.atan2(food[0].y -
					this.y, food[0]
					.x - this.x);
		} else { // Wander
			if (Math.random() <
				0.05) this
				.targetAngle += Math
				.random() * 2 - 1;
		}
		this.isTurning = true;
	}
	draw(ctx) {
		this.body.forEach((seg,
			i) => {
			const ratio =
				1 - (i /
					this
					.body
					.length
				);
			ctx.fillStyle =
				this.color;
			ctx.beginPath();
			ctx.arc(seg.x,
				seg.y,
				
				this
				.size,
				0, Math
				.PI * 2);
			ctx.fill();
		});
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this
			.size, 0, Math.PI *
			2);
		ctx.fill();
	}
}