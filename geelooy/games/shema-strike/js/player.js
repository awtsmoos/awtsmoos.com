//B"H

class Player {
    constructor(canvas, controls, world) {
        this.canvas = canvas;
        this.controls = controls;
        this.world = world;

        this.width = 80;
        this.height = 90;
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height - this.world.groundHeight - this.height;

        this.vx = 0;
        this.vy = 0;
        this.speed = 7;
        this.jumpPower = -18;
        this.gravity = 0.8;
        this.friction = 0.85;

        this.onGround = false;
        this.facing = 'right';
        
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.damageCooldown = 0;

        this.isAttacking = false;
        this.attackFrame = 0;
        this.attackDuration = 25;
        this.attackDamage = 15;
    }

    getBoundingBox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    // B"H - New Method
    heal(amount) {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }


    getSwordAngle() {
        const progress = this.attackFrame / this.attackDuration;
        const startAngle = -Math.PI / 3;
        const endAngle = Math.PI / 2;
        return startAngle + (endAngle - startAngle) * Math.sin(progress * Math.PI * 0.8);
    }
    
    attack(particles) {
        if (!this.isAttacking) {
            this.isAttacking = true;
            this.attackFrame = 0;
        }
    }

    takeDamage(amount) {
        if (this.damageCooldown > 0) return;

        this.health -= amount;
        this.damageCooldown = 60;
        triggerScreenShake(15, 12);
        if (this.health <= 0) {
            this.health = 0;
            console.log("Player defeated!"); 
        }
    }

    update(particles) {
        if (this.damageCooldown > 0) this.damageCooldown--;
        
        if (this.controls.left) {
            this.vx = -this.speed;
            this.facing = 'left';
        } else if (this.controls.right) {
            this.vx = this.speed;
            this.facing = 'right';
        }

        if (this.controls.jump && this.onGround) {
            this.vy = this.jumpPower;
            this.onGround = false;
        }

        if (this.controls.strikePressed) {
            this.attack(particles);
        }

        if (this.isAttacking) {
            this.attackFrame++;
            if (this.attackFrame >= this.attackDuration) {
                this.isAttacking = false;
            }
        }

        this.vy += this.gravity;
        this.vx *= this.friction;
        this.x += this.vx;
        this.y += this.vy;

        const groundLevel = this.canvas.height - this.world.groundHeight - this.height;
        if (this.y > groundLevel) {
            this.y = groundLevel;
            this.vy = 0;
            this.onGround = true;
        }

        if (this.x < 0) this.x = 0;
        if (this.x > this.world.width - this.width) this.x = this.world.width - this.width;
    }

    getAttackHitbox() {
        if (!this.isAttacking) return null;

        const swordLength = 100;
        const hitboxSize = 40;
        const angle = this.getSwordAngle();
        const direction = (this.facing === 'right' ? 1 : -1);

        const handX = (this.x + this.width / 2) + (20 * direction);
        const handY = (this.y + this.height / 2) + 10;
        
        const effectiveAngle = this.facing === 'right' ? angle : Math.PI - angle;
        
        const tipX = handX + Math.cos(effectiveAngle) * swordLength;
        const tipY = handY + Math.sin(effectiveAngle) * swordLength;

        return {
            x: tipX - hitboxSize / 2,
            y: tipY - hitboxSize / 2,
            width: hitboxSize,
            height: hitboxSize
        };
    }


    draw(ctx) {
        ctx.save();
        
        if (this.damageCooldown > 0 && Math.floor(this.damageCooldown / 4) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        const bodyX = this.x + this.width / 2;
        const bodyY = this.y + this.height / 2;
        const direction = this.facing === 'right' ? 1 : -1;
        
        // --- Draw Player Body ---
        // Head
        ctx.fillStyle = "#ffc87c";
        ctx.beginPath();
        ctx.arc(bodyX, bodyY - 15, 30, 0, Math.PI * 2);
        ctx.fill();

        // Face Details
        ctx.fillStyle = 'black';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;

        // Eye
        ctx.beginPath();
        ctx.arc(bodyX + (12 * direction), bodyY - 20, 4, 0, Math.PI * 2);
        ctx.fill();

        // Eyebrow
        ctx.beginPath();
        ctx.moveTo(bodyX + (5 * direction), bodyY - 30);
        ctx.lineTo(bodyX + (18 * direction), bodyY - 28);
        ctx.stroke();

        // Mouth
        ctx.beginPath();
        ctx.moveTo(bodyX + (8 * direction), bodyY - 8);
        ctx.lineTo(bodyX + (16 * direction), bodyY - 7);
        ctx.stroke();

        // Yarmulke
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(bodyX, bodyY - 42, 18, Math.PI, 0); 
        ctx.fill();

        // Robe
        ctx.fillStyle = "#5a2d0c";
        ctx.beginPath();
        ctx.moveTo(bodyX - 30, bodyY);
        ctx.lineTo(bodyX + 30, bodyY);
        ctx.lineTo(bodyX + 20, bodyY + 45);
        ctx.lineTo(bodyX - 20, bodyY + 45);
        ctx.closePath();
        ctx.fill();

        // Tzitzis
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Front-left
        ctx.moveTo(bodyX - 18, bodyY + 45);
        ctx.lineTo(bodyX - 18, bodyY + 60);
        // Front-right
        ctx.moveTo(bodyX + 18, bodyY + 45);
        ctx.lineTo(bodyX + 18, bodyY + 60);
        ctx.stroke();
        
        ctx.restore(); // Restore from player opacity change

        // --- Draw Sword ---
        ctx.save();
        
        const swingAngle = this.isAttacking ? this.getSwordAngle() : -Math.PI / 6;
        const handX = bodyX + (20 * direction);
        const handY = bodyY + 10;
        
        ctx.translate(handX, handY);

        if (this.facing === 'left') {
            ctx.scale(-1, 1);
        }
        
        const totalRotation = Math.PI + swingAngle;
        ctx.rotate(totalRotation);
        
        const handleOffsetX = -40;
        ctx.font = `120px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("🗡️", handleOffsetX, 0); 
        
        ctx.rotate(-totalRotation);
        
        ctx.font = "bold 24px 'Arial Black'";
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'center';
        
        const textX = handleOffsetX + 25;
        
        if (this.facing === 'left') {
            ctx.scale(-1, 1);
            ctx.fillText("שמע", -textX, 0);
        } else {
            ctx.fillText("שמע", textX, 0);
        }
        
        ctx.restore(); 
    }
}