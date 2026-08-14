// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos lets human attention bend the stellar field gently, smoothing every gesture before it touches the GPU sky.

function approach(currentValue, targetValue, strength) {
	return currentValue + (targetValue - currentValue) * strength;
}

export class ParticlePointer {
	constructor(options = {}) {
		this.isInteractive = options.isInteractive ?? matchMedia("(hover: hover) and (pointer: fine)").matches;
		this.state = {
			x: 0,
			y: 0,
			velocityX: 0,
			velocityY: 0,
			strength: 0,
			scroll: 0
		};
		this.target = { ...this.state };
	}

	connect() {
		if (this.isInteractive) {
			addEventListener("pointermove", event => this.handlePointerMove(event), { passive: true });
			addEventListener("pointerleave", () => this.handlePointerLeave(), { passive: true });
		}

		addEventListener("scroll", () => this.handleScroll(), { passive: true });
		this.handleScroll();
		return this;
	}

	handlePointerMove(event) {
		const nextX = event.clientX / innerWidth * 2 - 1;
		const nextY = 1 - event.clientY / innerHeight * 2;
		this.target.velocityX = nextX - this.target.x;
		this.target.velocityY = nextY - this.target.y;
		this.target.x = nextX;
		this.target.y = nextY;
		this.target.strength = 1;
	}

	handlePointerLeave() {
		this.target.strength = 0;
		this.target.velocityX = 0;
		this.target.velocityY = 0;
	}

	handleScroll() {
		const scrollRange = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
		this.target.scroll = scrollY / scrollRange;
	}

	step() {
		this.state.x = approach(this.state.x, this.target.x, .075);
		this.state.y = approach(this.state.y, this.target.y, .075);
		this.state.velocityX = approach(this.state.velocityX, this.target.velocityX, .1);
		this.state.velocityY = approach(this.state.velocityY, this.target.velocityY, .1);
		this.state.strength = approach(this.state.strength, this.target.strength, .065);
		this.state.scroll = approach(this.state.scroll, this.target.scroll, .04);
		this.target.velocityX *= .88;
		this.target.velocityY *= .88;
		return this.state;
	}
}
