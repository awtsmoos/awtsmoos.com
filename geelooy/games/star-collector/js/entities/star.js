// B"H
// Star Collector — falling stars: collect for +10 points.
window.SC = window.SC || {};

var STAR_POINTS = 10;

function createStar(x, speed) {
	return {
		kind: "star",
		x: x,
		y: -16,
		radius: 11,
		speed: speed,
		spin: Math.random() * Math.PI * 2,
		update: function (dt) {
			this.y += this.speed * dt;
			this.spin += dt * 2.4;
		},
		draw: function (ctx) {
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(this.spin);
			ctx.fillStyle = "#ffd94d";
			ctx.beginPath();
			for (var i = 0; i < 10; i++) {
				var r = i % 2 === 0 ? 12 : 5;
				var a = (Math.PI / 5) * i - Math.PI / 2;
				if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
				else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
			}
			ctx.closePath();
			ctx.fill();
			ctx.restore();
		}
	};
}

SC.createStar = createStar;
SC.STAR_POINTS = STAR_POINTS;
