//B"H
function createBall(canvas) {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 10,
        speed: 4,
        dx: 4,
        dy: -4,
        acceleration: 0.1,
        color: '#fff',

        reset() {
            this.x = canvas.width / 2;
            this.y = canvas.height / 2;
            this.speed = 4;
            this.dx = -this.dx;
            this.dy = this.speed * (Math.random() > 0.5 ? 1 : -1);
        },

        update(canvas) {
            this.x += this.dx;
            this.y += this.dy;

            // Ball collision with top and bottom walls
            if (this.y < 0 || this.y + this.size > canvas.height) {
                this.dy *= -1;
            }
        },

        draw(context) {
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.size, this.size);
        }
    };
}
