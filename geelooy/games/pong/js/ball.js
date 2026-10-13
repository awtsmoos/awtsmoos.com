//B"H
// js/ball.js

function createBall(canvas, initialEmoji) {
	return {
		x: canvas.width / 2,
		y: canvas.height / 2,
		size: 24,
		speed: 5, // Start a little faster
		dx: 5,
		dy: -5,
		slowTimer: 0, // slow-mo power-up frames remaining
		trail: [],
		currentEmoji: initialEmoji,
		rotation: 0,
		rotationSpeed: 0, // Will be changed on hit

		reset(newEmoji) {
			this.x = canvas.width / 2;
			this.y = canvas.height / 2;

			this.dx = this.dx > 0 ? -this.speed : this.speed; // Keep direction
			this.dy = this.speed * (Math.random() > 0.5 ? 1 : -1);
			this.currentEmoji = newEmoji;
			this.rotation = 0;
			this.rotationSpeed = 0;
			this.trail.length = 0;
			this.slowTimer = 0;
		},

		update(canvas) {
			const scale = this.slowTimer > 0 ? 0.55 : 1;
			if (this.slowTimer > 0) this.slowTimer -= 1;
			this.x += this.dx * scale;
			this.y += this.dy * scale;
			this.rotation += this.rotationSpeed; // Apply spin
			// Light trail
			this.trail.push({ x: this.x, y: this.y });
			if (this.trail.length > 14) this.trail.shift();

			// Bounce off top and bottom walls
			if (this.y - this.size / 2 < 0 || this.y + this.size / 2 > canvas.height) {
				this.dy *= -1;
				// Add spin on wall bounce for extra flair
				this.rotationSpeed += (this.dx > 0 ? -0.05 : 0.05);
				window.AwtsmoosFx?.sfx('wall');
			}
		},

		draw(context) {
			// Light trail
			for (let i = 0; i < this.trail.length; i += 1) {
				const t = this.trail[i];
				const k = i / this.trail.length;
				context.save();
				context.globalAlpha = k * 0.35;
				context.fillStyle = '#ffd75e';
				context.beginPath();
				context.arc(t.x, t.y, (this.size / 2) * k, 0, Math.PI * 2);
				context.fill();
				context.restore();
			}
			// Radiant orb
			const r = this.size / 2;
			context.save();
			const g = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 2.2);
			g.addColorStop(0, 'rgba(255,255,255,0.95)');
			g.addColorStop(0.35, 'rgba(255,215,94,0.85)');
			g.addColorStop(1, 'rgba(255,150,40,0)');
			context.fillStyle = g;
			context.beginPath();
			context.arc(this.x, this.y, r * 2.2, 0, Math.PI * 2);
			context.fill();
			// Emoji core, gently spinning
			context.translate(this.x, this.y);
			context.rotate(this.rotation);
			context.font = `${this.size}px Arial`;
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText(this.currentEmoji, 0, 0);
			context.restore();
		}
	};
}
