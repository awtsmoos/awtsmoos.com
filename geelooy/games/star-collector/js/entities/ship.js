// B"H
// Star Collector — the ship: moves with input, clamped to the field.
window.SC = window.SC || {};

function createShip(state) {
	return {
		x: state.width / 2,
		y: state.height - 52,
		radius: 16,
		update: function (dt, input, cfg) {
			var vx = 0, vy = 0;
			var target = input.target ? input.target() : null;
			if (target) {
				// Pointer steering: head toward the held pointer position.
				var dx = target.x - this.x, dy = target.y - this.y;
				var dist = Math.sqrt(dx * dx + dy * dy);
				if (dist > 6) { vx = dx / dist; vy = dy / dist; }
			} else {
				if (input.left()) vx -= 1;
				if (input.right()) vx += 1;
				if (input.up()) vy -= 1;
				if (input.down()) vy += 1;
			}
			if (vx !== 0 && vy !== 0) { vx *= 0.7071; vy *= 0.7071; }
			this.x += vx * cfg.shipSpeed * dt;
			this.y += vy * cfg.shipSpeed * dt;
			this.x = Math.max(this.radius, Math.min(state.width - this.radius, this.x));
			this.y = Math.max(state.height / 2, Math.min(state.height - this.radius, this.y));
		},
		draw: function (ctx) {
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.fillStyle = "#ffd94d";
			ctx.beginPath();
			ctx.moveTo(0, -18);
			ctx.lineTo(13, 12);
			ctx.lineTo(4, 8);
			ctx.lineTo(-4, 8);
			ctx.lineTo(-13, 12);
			ctx.closePath();
			ctx.fill();
			ctx.fillStyle = "#57c7ff";
			ctx.beginPath();
			ctx.arc(0, -4, 4.5, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "#ff8a3c";
			ctx.beginPath();
			ctx.moveTo(-4, 12);
			ctx.lineTo(0, 21 + Math.random() * 5);
			ctx.lineTo(4, 12);
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
	};
}

SC.createShip = createShip;
