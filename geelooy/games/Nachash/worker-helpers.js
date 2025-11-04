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
	// In worker-helpers.js, inside the SpatialGrid class

	getNearbyObjects(obj) {
		const nearby = new Set();
		const checkCell = (x, y) => {
			const col = Math.floor(x / this.cellSize);
			const row = Math.floor(y / this.cellSize);
			
			if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;
			
			const index = row * this.cols + col;

			// --- THE FIX IS HERE ---
			// Before trying to loop through the cell, make sure it actually exists.
			// This prevents the crash.
			const cell = this.cells[index];
			if (cell) {
				cell.forEach(item => nearby.add(item));
			}
			// --- END FIX ---
		};

		// Check a 3x3 grid of cells around the object's head
		const { x, y } = obj;
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
	'Qliphoth', 'Shekhinah',
	
	
    // --- Qliphothic Archdemons & Orders ---
    'Thaumiel', 'Ghagiel', 'Satariel', 'Ghaagsheblah', 'Golachab',
    'Thagirion', 'AarabZaraq', 'Gamaliel', 'Nehemoth', 'Bael', 'Agares',
    'Vassago', 'Gamigin', 'Marbas', 'Valefor', 'Amon', 'Barbatos',
    'Paimon', 'Buer', 'Gusion', 'Sitri', 'Beleth', 'Leraje', 'Eligos',
    'Zepar', 'Botis', 'Bathin', 'Sallos', 'Purson', 'Marax', 'Ipos',
    'Aim', 'Naberius', 'GlasyaLabolas', 'Bune', 'Ronove', 'Berith',
    'Astaroth', 'Forneus', 'Foras', 'Furfur', 'Marchosias', 'Stolas',
    'Phenex', 'Halphas', 'Malphas', 'Raum', 'Focalor', 'Vepar', 'Sabnock',
    'Shax', 'Vine', 'Bifrons', 'Vual', 'Haagenti', 'Crocell', 'Furcas',
    'Balam', 'Alloces', 'Caim', 'Murmur', 'Orobas', 'Gremory', 'Ose',
    'Amy', 'Orias', 'Vapula', 'Zagan', 'Valac', 'Andras', 'Flauros',
    'Andrealphus', 'Kimaris', 'Amdusias', 'Belial', 'Decarabia', 'Seere',
    'Dantalion', 'Andromalius',

    // --- More Angels, Choirs & Celestial Beings ---
    'Barachiel', 'Jehudiel', 'Selaphiel', 'Israfel', 'Lailah', 'Remiel',
    'Sariel', 'Shamsiel', 'Armaros', 'Ezeqeel', 'Araqiel', 'Batarel',
    'Chazaqiel', 'Ananiel', 'Hashmalim', 'Ishim', 'Adnachiel', 'Ambriel',
    'Muriel', 'Verchiel', 'Hamaliel', 'Zuriel', 'Barchiel', 'Hanael',
    'Kushiel', 'Leliel', 'Peniel', 'Shemhamphorash', 'Sopheriel', 'Yehudiam',

    // --- More Mystical Concepts & Terms ---
    'Tzimtzum', 'Shevirah', 'Kelim', 'Tikkun', 'Gevurah', 'Ratzon',
    'AdamKadmon', 'Partzufim', 'Gematria', 'Notarikon', 'Temurah',
    'Zohar', 'Bahir', 'SeferYetzirah', 'Gilgul', 'Kav', 'Reshimu',
    'Ayin', 'Yesh', 'Debekuth', 'Hitbodedut', 'Kavanah', 'Ruach',
    'Nefesh', 'Neshamah', 'Chiah', 'Yechidah',

    // --- Mythological Creatures & Spirits ---
    'Shedim', 'Mazzikin', 'Ruchin', 'Lilin', 'Grigori', 'Irin',
    'Seraph', 'Putto', 'Onocentaur', 'Chalkydri', 'Phoenix', 'Oni',

    

    // --- Planetary & Elemental Intelligences ---
    'Hagiel', 'Graphiel', 'Hismael', 'Zazel', 'Tiriel', 'Ophiel',
    'Phul', 'Bethor', 'Phaleg', 'Och', 'Aratron'

];

const COLLECTIBLE_EMOJIS = Array.from(
	'🌼🌻💐🌹🌺🌸🏵️🪻'+
	'🍎🍇🍉🍊🍋🍓🍒🍑🥝'+
	'🥩🦃🦆💧🪐🌍🌓🐃🦬🐂'
	+'🐄🦌🐐🐣🐤🐥🐔🐓🥝🫑🥬🍇🍆'
	+'🫘🌰🍠🥜🍞🧄🥔🍄‍🟫🥦🍈🍉'
	+'🌶️🍅🍎🍒🍓🥕🫛🥭🍐🍊🧅'
	+'🧅🫚🥯🍗🍗🌮🌯🥙🌮🫔🍟🥨'
	+'🍝🌭🧆🍛🍛🦪🍚🍱🥠🍨🍫🍩'
	+'🍪🍯🧂🍿🍿🧊🍵🍼🍾🥂🍻🥤'
	+'🧋🧃🍺🍴🍶🍹🍹🧉🫖🫗🥃🧉'
	+'🫙🍬🍧🥚🥚'
);
const HEBREW_LETTERS = Array.from(
	'אבגדהוזחטיכלמנסעפצקרשת');

// --- NEW HELPER FOR NAME GENERATION ---
const SYMBOLS = Array.from("$@🦢🐍🐍⚕️🦢🐓🐾🏵️🐒🌼🐇🌻"
+"😀😃😄😁😆😅🤣😭😭🥰😘😙😗"
+"🫠🙃🥲🥹☺️😌🙂‍↕️🤠😇😎🤓👊👍🦓"
+"🐊🐢🦎🦕🐉🐍🦎🦎🦎🐇🐁🐲🐇"
+"🐸🦮🐫🦨🐘🦘🦢🦧🐥🐓🦚🐳🐆"
+"🦜🦃🦆🐠🐞🦠🪱🐛🐝🐛🐛🐛🐛🐾"
+"🦠🦠🥩&#£¢¢%€§∆π¥€™®%√קראטטוןםפףךלחיעעגדשזסבהנ"
+"מתץ")

function generateAiName() {
    // 1. Pick two or three names from the list
    const nameCount = Math.random() > 0.7 ? 3 : 2; // 30% chance for a 3-part name
    let baseName = '';

    for (let i = 0; i < nameCount; i++) {
        const randomName = KABBALA_NAMES[Math.floor(Math.random() * KABBALA_NAMES.length)];
        // 2. Apply camel casing (e.g., "metatron" becomes "Metatron")
        baseName += randomName.charAt(0).toUpperCase() + randomName.slice(1).toLowerCase();
    }

    // 3. Add a random number (e.g., 100-999)
    const randomNumber = Math.floor(Math.random() * 900) + 100;

    // 4. Add a random symbol from our list
    const randomSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

    return `${baseName}${randomSymbol}${randomNumber}`;
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
            // --- THE FIX IS HERE ---
            // Explicitly set an opaque fill style. This forces the canvas to
            // render the emoji glyph with its default, full-color appearance.
            ctx.fillStyle = 'white'; 
            // Also, set text alignment to prevent it from being changed by other draw calls (like particles).
            ctx.textAlign = 'start';

			ctx.font = '28px sans-serif';
			ctx.fillText(this.char,
				this.x - this
				.size, this.y +
				this.size / 2);
		}
	}
}
const GRAVITY = 60; // Gravity in pixels/sec^2

class Particle {
	init(x, y) {
		this.isActive = true;
		this.x = x;
		this.y = y;
		this.vy = Math.random() * -360 - 120; // Velocity in pixels/sec
		this.vx = Math.random() * 360 - 180; // Velocity in pixels/sec
		this.life = 1.5; // Lifetime in seconds
		this.initialLife = 1.5; // Store max life for alpha calculation
		
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
	update(deltaTime) {
	    if (!this.isActive) return;
	    this.x += this.vx * deltaTime;
	    this.y += this.vy * deltaTime;
	    this.vy += GRAVITY * deltaTime; // Apply gravity
	    this.life -= deltaTime;
	    if (this.life <= 0) this.reset();
	}
	draw(ctx) {
	    if (!this.isActive) return;
	    // Alpha is now based on the percentage of life remaining
	    ctx.globalAlpha = this.life / this.initialLife;
	    ctx.fillStyle = this.color;
	    ctx.font = `bold ${this.size * (this.life / this.initialLife)}px 'Cormorant Garamond'`;
	    ctx.textAlign = 'center';
	    ctx.fillText(this.text, this.x, this.y);
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

function drawWorld(ctx) {
    const { camera } = state;

    // 1. Calculate the camera's visible area (the "viewport") in world coordinates.
    // We add a 'buffer' so objects don't suddenly pop into view at the very edge of the screen.
    const buffer = 200; 
    const view = {
        left: camera.x - buffer,
        top: camera.y - buffer,
        right: camera.x + (camera.width / camera.zoom) + buffer,
        bottom: camera.y + (camera.height / camera.zoom) + buffer
    };

    // 2. A helper function to quickly check if an object is inside the viewport.
    const isVisible = (obj) => 
        obj.x > view.left && obj.x < view.right && 
        obj.y > view.top && obj.y < view.bottom;

    // 3. Loop through all objects, but ONLY call .draw() on the visible ones.
    
    // Draw collectibles
    state.collectibles.forEach(c => {
        if (isVisible(c)) {
            c.draw(ctx);
        }
    });

    // Draw AI snakes (checking the head is a massive performance gain)
    state.aiSnakes.forEach(s => {
        if (isVisible(s)) {
            s.draw(ctx);
        }
    });

    // Player is always "visible" to the camera logic, so always draw it.
    state.player.draw(ctx);

    // Draw particles
    state.particles.forEach(p => {
        if (isVisible(p)) {
            p.draw(ctx);
        }
    });

    // Draw lightning effects
    state.lightningEffects.forEach(l => l.draw(ctx)); // Lightning is big, better to just draw it
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




//B"H
// In worker-helpers.js - Add this new function and delete the old background one.

/**
 * Draws the grid and the border within the game world.
 * It does NOT draw the solid background color, as that is now handled
 * by the main draw() loop for better performance and reliability.
 */
function drawWorldGridAndBorder(ctx) {
    const { world } = state;

    // 1. Draw the grid lines across the entire world map.
    const gridSize = 150;
    // I've made the grid lines slightly brighter to match your image more closely.
    ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    // Vertical lines
    for (let x = 0; x <= world.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, world.height);
    }
    // Horizontal lines
    for (let y = 0; y <= world.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(world.width, y);
    }
    ctx.stroke();

    // 2. Draw the world border on top of the grid.
    ctx.strokeStyle = '#241a0c';
    ctx.lineWidth = 40;
    ctx.strokeRect(20, 20, world.width - 40, world.height - 40);
}


// B"H
// 
class Player {
	constructor(x, y, length) {
		this.type = 'player';
		this.x = x;
		this.y = y;
		this.baseSize = 14; 
	    this.currentSize = this.baseSize; 
		this.angle = 0;
		
		this.normalSpeed = 280;
		this.boostSpeed = this.normalSpeed * 1.8;
		this.speed = this.normalSpeed;
		
		this.turnSpeed = 6.0; 
		this.body = [];
		this.maxLength = length;
		this.baseLength = length; // The minimum length it can shrink to
		
		this.isTurning = false;
		this.targetAngle = 0;
		this.borderPadding = 30;
		this.isInvincible = false;
		this.isAlive = true;
		this.score = 0;
		
		// Boosting state
		this.isBoosting = false;
		this.boostDropTimer = 0;
	}

	setTargetAngle(angle) {
		this.isTurning = true;
		this.targetAngle = angle;
	}

	stopTurning() {
		this.isTurning = false;
	}

	startBoosting() {
		this.isBoosting = true;
	}

	stopBoosting() {
		this.isBoosting = false;
	}

	dropFood() {
		if (this.body.length < 2) return; // Need at least some body to drop from
		const tail = this.body[this.body.length - 1];
		if (!tail) return;
		
		const newCollectible = new Collectible(tail.x, tail.y);
		state.collectibles.push(newCollectible);
		state.grid.insert(newCollectible);
	}

	update(deltaTime) {
	    if (!this.isAlive) return;

		// --- BOOST LOGIC ---
		if (this.isBoosting && this.maxLength > this.baseLength) {
			this.speed = this.boostSpeed;
			// Shrink while boosting, but not below the base length
			this.maxLength -= 15 * deltaTime; // Shrink 15 length units per second
			if(this.maxLength < this.baseLength) this.maxLength = this.baseLength;

			// Drop food items behind
			this.boostDropTimer += deltaTime;
			if (this.boostDropTimer > 0.05) { // Drop food every 0.05s
				this.dropFood();
				this.boostDropTimer = 0;
			}
		} else {
			this.speed = this.normalSpeed;
		}
		// --- END BOOST LOGIC ---
	
	    this.currentSize = Math.min(35, this.baseSize + Math.floor(this.maxLength / 40));
	
		if (this.isTurning) {
			let angleDiff = this.targetAngle - this.angle;
			while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
			while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
			this.angle += angleDiff * this.turnSpeed * deltaTime;
		}
	
		this.body.unshift({ x: this.x, y: this.y });
		if (this.body.length > Math.ceil(this.maxLength)) this.body.pop(); 
		
		this.x += Math.cos(this.angle) * this.speed * deltaTime;
		this.y += Math.sin(this.angle) * this.speed * deltaTime;
	
		this.handleBorders();
		state.score = this.score;
	
	    if (isNaN(this.x) || isNaN(this.y) || deltaTime > 0.5) {
	        console.error("B'H - Player position became NaN or deltaTime spiked! Resetting position.", { x: this.x, y: this.y, dt: deltaTime });
	        this.x = state.world.width / 2;
	        this.y = state.world.height / 2;
	        this.body = []; 
	    }
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
				.currentSize, 
				0, Math
				.PI * 2);
			ctx.fill();
		});
		ctx.fillStyle =
			`hsl(${color}, 100%, 70%)`;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this
			.currentSize, 0, Math.PI * 
			2);
		ctx.fill();
	}

	grow(amount) {
		this.maxLength += amount;
	}

	die() {
		if (this.type === 'ai_snake') {
            
            this.body.forEach((seg, i) => {

                if (i % 4 === 0) {
                    
                    const newCollectible = new Collectible(seg.x, seg.y);
                    state.collectibles.push(newCollectible);
                    
                    state.grid.insert(newCollectible); 
                }
            });
        } 
        else if (this.type === 'player') {
			gameOver();
        }

		this.isAlive = false;
	}
}

// 
class AiSnake extends Player {
	constructor(x, y, length) {
		super(x, y, length);
		this.type = 'ai_snake';
		this.name = generateAiName();
		this.color = `hsl(${Math.random() * 360}, 90%, 60%)`;
		this.baseSize = 12; 
	    this.currentSize = this.baseSize;

		this.normalSpeed = 210 + Math.random() * 90; 
		this.boostSpeed = this.normalSpeed * 1.9;
		this.speed = this.normalSpeed;
		this.isBoosting = false;

		this.decisionTimer = Math.random() * 0.2;
		this.boostDropTimer = 0;
	}

	update(deltaTime) {
		if (!this.isAlive) return;

		this.decisionTimer -= deltaTime;
		if (this.decisionTimer <= 0) {
			this.makeDecision();
			this.decisionTimer = (Math.random() * 0.05) + 0.1;
		}

		if (this.isBoosting && this.maxLength > this.baseLength) {
			this.speed = this.boostSpeed;
			this.maxLength -= 10 * deltaTime; 
			if (this.maxLength < this.baseLength) this.maxLength = this.baseLength;
			
			this.boostDropTimer += deltaTime;
			if (this.boostDropTimer > 0.1) {
				this.dropFood();
				this.boostDropTimer = 0;
			}
		} else {
			this.speed = this.normalSpeed;
			this.isBoosting = false; 
		}

		super.update(deltaTime);
	}

	makeDecision() {
		const visionRange = 900;
		const nearby = state.grid.getNearbyObjects(this);
		let threats = [];
		let prey = [];
		let food = [];
		let obstacles = [];

		for (const obj of nearby) {
			if (!obj.isAlive || obj === this) continue;
			const dist = getDistance(this.x, this.y, obj.x, obj.y);
			if (dist > visionRange) continue;

			if (obj.type === 'collectible') {
				food.push({ obj, dist });
			} else if (obj.type === 'player' || obj.type === 'ai_snake') {
				obstacles.push(obj);
				if (obj.score > this.score * 1.2) {
					threats.push({ obj, dist });
				} else if (this.score > obj.score * 1.1) {
					prey.push({ obj, dist });
				}
			}
		}

		if (threats.length > 0) {
			threats.sort((a, b) => a.dist - b.dist);
			const closestThreat = threats[0].obj;
			this.targetAngle = Math.atan2(this.y - closestThreat.y, this.x - closestThreat.x);
			this.isBoosting = true;
			this.isTurning = true;
			return;
		}

		if (prey.length > 0) {
			prey.sort((a, b) => a.dist - b.dist);
			const target = prey[0].obj;
			this.targetAngle = this.getSafeAngle(target.x, target.y, obstacles);
			this.isBoosting = true;
			this.isTurning = true;
			return;
		}

		this.isBoosting = false;
		if (food.length > 0) {
			food.sort((a, b) => a.dist - b.dist);
			for (const f of food) {
				const foodTarget = f.obj;
				let isPathSafe = true;
				for (const snake of obstacles) {
					if (getDistance(foodTarget.x, foodTarget.y, snake.x, snake.y) < 200) {
						isPathSafe = false;
						break;
					}
				}
				if (isPathSafe) {
					this.targetAngle = this.getSafeAngle(foodTarget.x, foodTarget.y, obstacles);
					this.isTurning = true;
					return;
				}
			}
		}

		if (Math.random() < 0.1) {
			this.targetAngle += (Math.random() - 0.5) * 2.0;
		}
		this.targetAngle = this.getSafeAngle(
			this.x + Math.cos(this.targetAngle) * 500,
			this.y + Math.sin(this.targetAngle) * 500,
			obstacles
		);
		this.isTurning = true;
	}

	getSafeAngle(targetX, targetY, obstacles) {
		let desiredAngle = Math.atan2(targetY - this.y, targetX - this.x);

		const checkDistance = 250;

		for (const snake of obstacles) {
			if (snake === this) continue;
			const bodyParts = [snake, ...snake.body];
			for (const segment of bodyParts) {
				const distToSegment = getDistance(this.x, this.y, segment.x, segment.y);

				if (distToSegment < 150) { 
					const projectedX = this.x + Math.cos(desiredAngle) * checkDistance;
					const projectedY = this.y + Math.sin(desiredAngle) * checkDistance;

					if (getDistance(projectedX, projectedY, segment.x, segment.y) < this.size + snake.size + 100) {
						const angleToSegment = Math.atan2(segment.y - this.y, segment.x - this.x);
						desiredAngle += (desiredAngle - angleToSegment) > 0 ? 0.5 : -0.5;
						break;
					}
				}
			}
		}
		return desiredAngle;
	}

	draw(ctx) {
		this.body.forEach((seg, i) => {
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.arc(seg.x, seg.y, this.currentSize, 0, Math.PI * 2);
			ctx.fill();
		});
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
		ctx.fill();
	}
}