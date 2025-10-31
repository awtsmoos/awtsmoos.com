//B"H

class UI {
    constructor(canvas) {
        this.canvas = canvas;
        this.perutas = 0;
        this.wave = 0;
    }

    updateScore(amount) {
        this.perutas += amount;
    }

    updateWave(wave) {
        this.wave = wave;
    }

    // In js/ui.js

    draw(ctx, player) {
        ctx.save();
        // Reset transform from camera/shake for UI
        ctx.setTransform(1, 0, 0, 1, 0, 0); 
        
        ctx.fillStyle = "white";
        ctx.shadowColor = "black";
        ctx.shadowBlur = 5;

        // Score
        ctx.font = "bold 32px 'Arial Black'";
        ctx.textAlign = "left";
        ctx.fillText(`Perutas: ${this.perutas}`, 20, 40);

        // Player Health Bar ("Koach")
        ctx.textAlign = "left";
        ctx.fillText("Koach", 20, 80);
        const barWidth = 250;
        ctx.fillStyle = '#555';
        ctx.fillRect(120, 60, barWidth, 25);
        ctx.fillStyle = '#4dff4d'; // Green
        ctx.fillRect(120, 60, barWidth * (player.health / player.maxHealth), 25);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(120, 60, barWidth, 25);

        // Wave
        ctx.fillStyle = "white"; // <-- ADD THIS LINE to reset color
        ctx.font = "bold 40px 'Arial Black'";
        ctx.textAlign = "center";
        ctx.fillText(`Wave ${this.wave}`, this.canvas.width / 2, 50);

        ctx.restore();
    }
}