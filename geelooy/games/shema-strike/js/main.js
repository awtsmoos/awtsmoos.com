//B"H

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');

    let gameRunning = false;

    // Set canvas size
    const container = document.getElementById('game-container');
    function resizeCanvas() {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Game Objects
    const isTouchDevice = 'ontouchstart' in window;
    const controls = new Controls(isTouchDevice);
    const world = new World(canvas);
    const player = new Player(canvas, controls, world);
    const ui = new UI(canvas);
    
    let enemies = [];
    let particles = [];
    let wave = 0;
    let waveCooldown = 180; // 3 seconds
    let cameraX = 0;

    function spawnWave() {
        wave++;
        ui.updateWave(wave);
        const numEnemies = 2 + Math.floor(wave * 1.5);
        for (let i = 0; i < numEnemies; i++) {
            setTimeout(() => {
                const spawnX = Math.random() * world.width;
                // Pass the world object to the new enemy
                enemies.push(new Enemy(canvas, player, world, spawnX));
            }, i * 500);
        }
    }

    function gameLoop() {
        if (!gameRunning || player.health <= 0) return;

        // --- Camera Logic ---
        // Lerp camera for smoother movement
        const targetCameraX = player.x - canvas.width / 2;
        cameraX += (targetCameraX - cameraX) * 0.1;
        // Clamp camera to world bounds
        cameraX = Math.max(0, Math.min(world.width - canvas.width, cameraX));

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        // Translate the entire world based on camera position FIRST
        ctx.translate(-cameraX, 0);

        updateScreenShake(ctx); // Apply screen shake relative to the camera

        // Draw World (now positioned by camera)
        world.update();
        world.draw(ctx);

        // Update & Draw Player
        player.update(particles);
        player.draw(ctx);

        // Update & Draw Enemies
        const attackHitbox = player.getAttackHitbox();
        enemies.forEach((enemy, enemyIndex) => {
            enemy.update();
            enemy.draw(ctx);

            if (attackHitbox && isColliding(attackHitbox, enemy.getBoundingBox())) {
                enemy.takeDamage(player.attackDamage, particles);
            }

            if (enemy.health <= 0) {
                for (let i = 0; i < 20; i++) {
                    particles.push(new Particle(enemy.x, enemy.y, getRandomFrom(HEBREW_LETTERS), Math.random() * 20 + 15, 80));
                }
                triggerScreenShake(15, 10);
                ui.updateScore(enemy.perutas);
                enemies.splice(enemyIndex, 1);
            }
        });
        
        particles.forEach((p, index) => {
            p.update();
            p.draw(ctx);
            if (p.life <= 0) {
                particles.splice(index, 1);
            }
        });

        if (enemies.length === 0) {
            waveCooldown--;
            if (waveCooldown <= 0) {
                spawnWave();
                waveCooldown = 180;
            }
        }
        
        // This restores from BOTH camera translation and screen shake
        ctx.restore();

        // Draw UI last, unaffected by camera or shake
        ui.draw(ctx, player);

        controls.resetPress();
        requestAnimationFrame(gameLoop);
    }

    startButton.addEventListener('click', () => {
        startScreen.style.display = 'none';
        gameRunning = true;
        spawnWave();
        requestAnimationFrame(gameLoop);
    });
});