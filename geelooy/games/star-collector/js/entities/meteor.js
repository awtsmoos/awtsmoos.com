// B"H
// Star Collector — meteors: touching one costs a life.
window.SC = window.SC || {};

function createMeteor(x, speed) {
	return {
		kind: "meteor",
		x: x,
		baseX: x,
		y: -20,
		radius: 14,
		speed: speed,
		swayPhase: Math.random() * Math.PI * 2,
		spin: Math.random() * Math.PI * 2,
		update: function (dt, elapsed) {
			this.y += this.speed * dt;
			this.spin += dt * 1.6;
			this.x = this.baseX + Math.sin(elapsed * 2 + this.swayPhase) * 22;
		},
		draw: function (ctx) {
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(this.spin);
			ctx.fillStyle = "#8a5a3c";
			ctx.beginPath();
			ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "#6e452c";
			ctx.beginPath();
			ctx.arc(-4, -3, 4, 0, Math.PI * 2);
			ctx.arc(5, 4, 3, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
	};
}

SC.createMeteor = createMeteor;
