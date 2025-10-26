//B"H

// Utility Functions
function getDistance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

function wrapPosition(obj) {
    const { width, height } = state;
    if (obj.x < -20) obj.x = width + 20;
    if (obj.x > width + 20) obj.x = -20;
    if (obj.y < -20) obj.y = height + 20;
    if (obj.y > height + 20) obj.y = -20;
}

function drawNebula(ctx, width, height) {
    const time = Date.now() * 0.00005;
    const grd = ctx.createRadialGradient(
        width / 2 + Math.sin(time * 1.1) * 100,
        height / 2 + Math.cos(time * 1.3) * 100,
        0,
        width / 2,
        height / 2,
        Math.max(width, height)
    );
    grd.addColorStop(0, `hsla(${time * 10 % 360}, 50%, 20%, 0.5)`);
    grd.addColorStop(0.5, `hsla(${(time * 10 + 120) % 360}, 60%, 10%, 0.5)`);
    grd.addColorStop(1, `hsla(${(time * 10 + 240) % 360}, 70%, 5%, 0.5)`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);
}

function drawGalacticCore(ctx, x, y) {
    const time = Date.now() * 0.001;
    for(let i = 5; i > 0; i--) {
        const radius = 20 + i * 10 + Math.sin(time + i) * 10;
        const alpha = 0.1 - i * 0.02 + Math.sin(time + i) * 0.05;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 220, ${alpha})`;
        ctx.fill();
    }
}

// Player Class
class Player {
    constructor(x, y, length) {
        this.x = x;
        this.y = y;
        this.size = 6;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 2;
        this.body = [];
        this.maxLength = length;
        this.isInvincible = false;
        this.invincibleTimer = 0;
        this.cometBoost = false;
        
        this.isTurning = false;
        this.targetAngle = this.angle;
        this.turnSpeed = 0.2; 
    }
    
    setTargetAngle(angle) {
        this.isTurning = true;
        this.targetAngle = angle;
    }

    stopTurning() {
        this.isTurning = false;
    }

    turn(amount) {
        this.angle += amount;
    }

    // In worker-helpers.js -> class Player -> update()

update() {
        // --- ADD THIS SMOOTH TURNING LOGIC AT THE TOP ---
        if (this.isTurning) {
            let angleDifference = this.targetAngle - this.angle;

            // This ensures the player takes the shortest path to the target angle
            while (angleDifference < -Math.PI) angleDifference += 2 * Math.PI;
            while (angleDifference > Math.PI) angleDifference -= 2 * Math.PI;

            this.angle += angleDifference * this.turnSpeed;
        }

    this.body.unshift({ x: this.x, y: this.y });
    if (this.body.length > this.maxLength) {
        this.body.pop();
    }

    const currentSpeed = this.cometBoost ? this.speed * 2.5 : this.speed;

    this.x += Math.cos(this.angle) * currentSpeed;
    this.y += Math.sin(this.angle) * currentSpeed;

    if (this.invincibleTimer > 0) {
        this.invincibleTimer -= 16;
        if (this.invincibleTimer <= 0) {
            this.isInvincible = false;
            this.cometBoost = false;
        }
    }
}



    draw(ctx) {
        // Comet boost effect
        if (this.cometBoost) {
            const grd = ctx.createRadialGradient(this.x, this.y, 5, this.x, this.y, 30);
            grd.addColorStop(0, 'rgba(255, 220, 180, 0.8)');
            grd.addColorStop(1, 'rgba(255, 100, 50, 0)');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
            ctx.fill();
        }

        // Body
        this.body.forEach((seg, index) => {
            const ratio = (this.body.length - index) / this.body.length;
            const hue = (180 + (Date.now() / 20) + index * 2) % 360;
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, ratio * this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
            ctx.fill();
        });

        // Head
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(60, 100%, 70%)';
        ctx.fill();
    }

    grow(amount) {
        this.maxLength += amount;
    }

    checkSelfCollision() {
        for(let i = 10; i < this.body.length; i++) {
            if (getDistance(this.x, this.y, this.body[i].x, this.body[i].y) < this.size) {
                return true;
            }
        }
        return false;
    }

    activateCometBoost(duration) {
        this.isInvincible = true;
        this.cometBoost = true;
        this.invincibleTimer = duration;
    }
}

// Other Game Object Classes
class Spark {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 4;
        this.angle = 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        const hue = (Date.now() / 10) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 75%)`;
        ctx.shadowColor = `hsl(${hue}, 100%, 75%)`;
        ctx.shadowBlur = 15;
        ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
        ctx.restore();
        ctx.shadowBlur = 0;
    }
}

class Particle {
    constructor(x, y, color, text = null) {
        this.x = x;
        this.y = y;
        this.vx = Math.random() * 4 - 2;
        this.vy = Math.random() * 4 - 2;
        this.life = 100;
        this.color = color;
        this.text = text;
        this.size = this.text ? 20 : Math.random() * 3 + 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.1 - 0.05;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // gravity
        this.rotation += this.rotationSpeed;
        this.life--;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life / 100;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        if (this.text) {
            ctx.font = `bold ${this.size * (this.life/100)}px 'Cormorant Garamond'`;
            ctx.fillStyle = this.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fillText(this.text, 0, 0);
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

class Drone {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.size = 8;
        this.angle = angle;
        this.speed = 1.5;
    }

    update() {
        // Simple seeking behavior
        const dx = state.player.x - this.x;
        const dy = state.player.y - this.y;
        const targetAngle = Math.atan2(dy, dx);
        let angleDiff = targetAngle - this.angle;
        while(angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while(angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        this.angle += angleDiff * 0.02;

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI / 2);
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size, this.size);
        ctx.lineTo(-this.size, this.size);
        ctx.closePath();
        ctx.fill();
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

class Debris {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 15 + 5;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.02 - 0.01;
        const speed = 0.2;
        this.vx = Math.cos(this.angle) * speed;
        this.vy = Math.sin(this.angle) * speed;
        // Generate a random shape
        this.shape = [];
        const corners = 5 + Math.floor(Math.random() * 5);
        for(let i=0; i < corners; i++) {
            const angle = (i / corners) * Math.PI * 2;
            const radius = this.size * (0.7 + Math.random() * 0.6);
            this.shape.push({x: Math.cos(angle) * radius, y: Math.sin(angle) * radius});
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = '#6a6a7a';
        ctx.strokeStyle = '#8a8a9a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.shape[0].x, this.shape[0].y);
        for(let i=1; i < this.shape.length; i++) {
            ctx.lineTo(this.shape[i].x, this.shape[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

class Wormhole {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 30;
        this.life = 10000; // 10 seconds
        this.linked = null;
        this.canTeleport = true;
        this.teleportCooldown = 0;
    }

    link(other) {
        this.linked = other;
    }

    update() {
        this.life -= 16;
        if (this.teleportCooldown > 0) {
            this.teleportCooldown -= 16;
            if(this.teleportCooldown <= 0) this.canTeleport = true;
        }
    }

    draw(ctx) {
        const alpha = this.life > 1000 ? 1 : this.life / 1000;
        const time = Date.now() * 0.005;
        ctx.save();
        ctx.globalAlpha = alpha;
        for(let i = 0; i < 5; i++) {
            const r = this.radius * (1 - i*0.2) + Math.sin(time + i) * 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
            ctx.strokeStyle = `hsl(${(time * 10 + i * 40) % 360}, 100%, 70%)`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();
    }

    teleport(obj) {
        if(this.linked && this.canTeleport) {
            obj.x = this.linked.x;
            obj.y = this.linked.y;
            this.canTeleport = false;
            this.linked.canTeleport = false;
            this.teleportCooldown = 2000;
            this.linked.teleportCooldown = 2000;
        }
    }
}

class Comet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 5;
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    draw(ctx) {
        const grd = ctx.createLinearGradient(0, 0, -100, 0);
        grd.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grd.addColorStop(0.8, 'rgba(255, 220, 180, 0.8)');
        grd.addColorStop(1, 'rgba(255, 255, 255, 1)');

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(15,0);
        ctx.lineTo(-100, -15);
        ctx.lineTo(-100, 15);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(15, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}