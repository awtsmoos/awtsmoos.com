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

    draw(ctx, player) {
        ctx.save();
        // Reset transform from camera/shake for UI
        ctx.setTransform(1, 0, 0, 1, 0, 0); 
        
        ctx.fillStyle = "white";
        

        // --- TOP LEFT UI ---
        ctx.font = "bold 32px 'Arial Black'";
        ctx.textAlign = "left";

        // Score
        ctx.fillText(`Perutas: ${this.perutas}`, 20, 40);

        // Player Health Bar ("Koach")
        ctx.fillText("Koach", 20, 80);
        const barWidth = 250;
        ctx.fillStyle = '#555';
        ctx.fillRect(120, 60, barWidth, 25);
        ctx.fillStyle = '#4dff4d'; // Green
        ctx.fillRect(120, 60, barWidth * (player.health / player.maxHealth), 25);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(120, 60, barWidth, 25);

        // --- B"H - THE FIX IS HERE ---
        // --- TOP RIGHT UI ---
        // By moving the Wave counter to the top-right corner, it will never overlap with the score.
        ctx.font = "bold 32px 'Arial Black'"; // Matched font size for consistency
        ctx.textAlign = "right";
        ctx.fillText(`Wave ${this.wave}`, this.canvas.width - 20, 40);

        ctx.restore();
    }
}



