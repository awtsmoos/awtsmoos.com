// B"H

import { playNote, playNextNote, playVictoryFanfare } from './audio.js';
import { createParticle, createHebrewExplosion } from './particle.js';
import { BALL_SPEED, BALL_RADIUS } from './constants.js';

/**
 * The Physics Sage is a repository of divine law. It takes the state of the world at one moment
 * and mutates it to reveal its state in the next, according to the immutable laws of motion and collision.
 * Now imbued with the power of Raycasting to see the path of every particle, ensuring none stray from their bounds.
 * 
 * @param {object} state The current state of the game world, which will be mutated.
 * @param {HTMLCanvasElement} canvas The canvas, representing the boundaries of existence.
 * @param {number} perutaMagnetLevel The pre-loaded level of the Peruta Magnet upgrade.
 * @param {number} criticalStrikeLevel The level of the Critical Strike upgrade.
 * @returns {{turnEnded: boolean, perutasEarned: number, levelComplete: boolean, snitchCaptured: boolean}} The result of the Sage's calculations.
 */
export function updatePhysics(state, canvas, perutaMagnetLevel, criticalStrikeLevel = 0) {
    let turnEnded = false;
    let perutasEarned = 0;
    let levelComplete = false;
    let snitchCaptured = false;

    // Update Particles
    state.particles.forEach(p => p.update());
    state.particles = state.particles.filter(p => p.lifespan > 0);

    // Golem AI
    if (state.golem) {
        const threats = state.balls.filter(b => b.vy > 0);
        if (threats.length > 0) {
            const avgX = threats.reduce((sum, b) => sum + b.x, 0) / threats.length;
            const golemSpeed = 7; 
            if (state.golem.x < avgX) state.golem.x += golemSpeed;
            if (state.golem.x > avgX) state.golem.x -= golemSpeed;
        }
        state.golem.x = Math.max(state.golem.width / 2, Math.min(canvas.width - state.golem.width / 2, state.golem.x));
    }

    if (!state.isShooting) {
        return { turnEnded, perutasEarned, levelComplete, snitchCaptured };
    }

    let firstBallLandedPos = state.firstBallLandedPos;
    const remainingBalls = [];
    const newBalls = []; // For prism splits
    const perutaBonusPerBrick = perutaMagnetLevel * 5;
    const critChance = criticalStrikeLevel * 0.05;

    // --- BOMB LOGIC ---
    const explodeBrick = (brick) => {
        if (brick.type !== 'bomb') return;
        
        // Bomb radius (approx 2.5 cells)
        const radius = brick.width * 2.5;
        const centerX = brick.x + brick.width / 2;
        const centerY = brick.y + brick.height / 2;
        
        // Visuals
        for(let i=0; i<15; i++) state.particles.push(createParticle(centerX, centerY));

        // Find neighbors
        const neighbors = state.bricks.filter(b => {
             if (b === brick) return false;
             const bCx = b.x + b.width/2;
             const bCy = b.y + b.height/2;
             const dist = Math.hypot(bCx - centerX, bCy - centerY);
             return dist <= radius;
        });
        
        neighbors.forEach(n => {
            const dmg = 50; // Bomb damage
            n.health -= dmg;
            state.score += dmg;
            n.updateColor();
            
            state.particles.push(createParticle(n.x + n.width/2, n.y + n.height/2));
        });
    };

    // --- RAYCASTING (Swept AABB) HELPERS ---

    // Intersects a ray (origin + dir * t) with an AABB (min, max).
    // Returns tNear (entry time) and tFar (exit time).
    // If no intersection, returns null.
    function intersectAABB(origin, dir, box) {
        let tMin = 0.0;
        let tMax = 1.0;

        // Check X axis
        if (Math.abs(dir.x) < 1e-8) {
            // Ray is parallel to X planes. If origin is outside, no hit.
            if (origin.x < box.minX || origin.x > box.maxX) return null;
        } else {
            const invDir = 1.0 / dir.x;
            let t1 = (box.minX - origin.x) * invDir;
            let t2 = (box.maxX - origin.x) * invDir;
            if (t1 > t2) [t1, t2] = [t2, t1];
            tMin = Math.max(tMin, t1);
            tMax = Math.min(tMax, t2);
            if (tMin > tMax) return null;
        }

        // Check Y axis
        if (Math.abs(dir.y) < 1e-8) {
            if (origin.y < box.minY || origin.y > box.maxY) return null;
        } else {
            const invDir = 1.0 / dir.y;
            let t1 = (box.minY - origin.y) * invDir;
            let t2 = (box.maxY - origin.y) * invDir;
            if (t1 > t2) [t1, t2] = [t2, t1];
            tMin = Math.max(tMin, t1);
            tMax = Math.min(tMax, t2);
            if (tMin > tMax) return null;
        }

        return { tMin, tMax };
    }


    // --- MAIN PHYSICS LOOP ---

    for (const ball of state.balls) {
        
        // 0. Golden Snitch Check (Circle-Circle)
        if (state.goldenSnitch) {
             const dx = ball.x - state.goldenSnitch.x;
             const dy = ball.y - state.goldenSnitch.y;
             const dist = Math.sqrt(dx*dx + dy*dy);
             if (dist < ball.radius + 15) { // Snitch radius approx 15
                 state.goldenSnitch = null;
                 perutasEarned += 500; // Base value
                 snitchCaptured = true;
                 // Play high pitch ping, but do not interrupt the melody
                 playNote(10); 
                 // Sparkle effect
                 for(let i=0; i<20; i++) state.particles.push(createParticle(ball.x, ball.y));
             }
        }
        
        // 0.5 Ohr Makif (Surrounding Light) Aura Damage
        if (state.ohrMakifActive) {
            const auraRadius = ball.radius * 3;
            // Iterate all bricks to check distance
            // Optimization: could filter by rough grid pos, but brute force fine for <100 bricks
            state.bricks.forEach(brick => {
                if (brick.health <= 0 || brick.type.startsWith('portal')) return;
                
                // Closest point on AABB to ball center
                const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
                const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));
                
                const dx = ball.x - closestX;
                const dy = ball.y - closestY;
                const distSq = dx*dx + dy*dy;
                
                if (distSq < auraRadius * auraRadius) {
                    // It is within the aura!
                    // Apply continuous low damage (it burns)
                    // We only apply if we haven't hit it "physically" this frame to prevent double counting too much
                    // But here we just reduce health.
                    brick.health -= 0.2; // Small continuous damage
                    if(Math.random() < 0.1) {
                        state.particles.push(createParticle(closestX, closestY));
                    }
                    brick.updateColor();
                }
            });
        }

        // 1. Apply Forces
        if (state.gravityMultiplier !== 1) {
             ball.vy += 0.15 * state.gravityMultiplier;
        }

        let timeLeft = 1.0; // We simulate the frame in chunks (bounces)
        
        // Safety: Limit bounces per frame to prevent infinite loops in tight spots
        let bounces = 0;
        const MAX_BOUNCES = 3; 

        // Teleport cooldown handling (decremented if present)
        if (ball.teleportCooldown > 0) ball.teleportCooldown--;

        while (timeLeft > 0.0001 && bounces < MAX_BOUNCES) {
            const dx = ball.vx * timeLeft;
            const dy = ball.vy * timeLeft;
            
            let minT = 1.0;
            let normal = { x: 0, y: 0 };
            let hitType = 'none'; // 'wall', 'brick', 'paddle', 'portal'
            let hitObj = null;

            // -- A. Check Walls --
            // Left
            if (ball.x + dx < ball.radius) {
                const t = (ball.radius - ball.x) / (dx || -1e-8);
                if (t >= 0 && t < minT) { minT = t; normal = {x: 1, y: 0}; hitType = 'wall'; }
            }
            // Right
            else if (ball.x + dx > canvas.width - ball.radius) {
                const t = (canvas.width - ball.radius - ball.x) / (dx || 1e-8);
                if (t >= 0 && t < minT) { minT = t; normal = {x: -1, y: 0}; hitType = 'wall'; }
            }
            // Top
            if (ball.y + dy < ball.radius) {
                const t = (ball.radius - ball.y) / (dy || -1e-8);
                if (t >= 0 && t < minT) { minT = t; normal = {x: 0, y: 1}; hitType = 'wall'; }
            }
            
            // -- B. Check Bricks --
            for (const brick of state.bricks) {
                // Skip collision check if we just teleported out of this portal
                if (ball.teleportCooldown > 0 && brick.type.startsWith('portal')) continue;

                const box = {
                    minX: brick.x - ball.radius,
                    maxX: brick.x + brick.width + ball.radius,
                    minY: brick.y - ball.radius,
                    maxY: brick.y + brick.height + ball.radius
                };
                
                const intersection = intersectAABB({x: ball.x, y: ball.y}, {x: dx, y: dy}, box);
                
                if (intersection && intersection.tMin >= 0 && intersection.tMin < minT) {
                    minT = intersection.tMin;
                    hitObj = brick;
                    
                    if (brick.type.startsWith('portal')) {
                        hitType = 'portal';
                    } else if (brick.type === 'prism') {
                        hitType = 'prism';
                        normal = {x: -Math.sign(dx), y: -Math.sign(dy)}; // Reflect mostly
                    } else {
                        hitType = 'brick';
                        // Normal calculation
                        const impactX = ball.x + dx * minT;
                        const impactY = ball.y + dy * minT;
                        const brickCx = brick.x + brick.width / 2;
                        const brickCy = brick.y + brick.height / 2;
                        const dxRel = (impactX - brickCx) / (brick.width / 2);
                        const dyRel = (impactY - brickCy) / (brick.height / 2);
                        if (Math.abs(dxRel) > Math.abs(dyRel)) {
                            normal = { x: Math.sign(dxRel), y: 0 };
                        } else {
                            normal = { x: 0, y: Math.sign(dyRel) };
                        }
                    }
                }
            }

            // -- C. Check Paddle/Rebound/Golem --
            const paddleTop = state.shooterPos.y - state.paddle.height / 2;
            const paddleLeft = state.shooterPos.x - state.paddle.width / 2;
            const paddleRight = state.shooterPos.x + state.paddle.width / 2;

            if (ball.vy > 0 && ball.y < paddleTop - ball.radius && ball.y + dy > paddleTop - ball.radius) {
                // Ball is crossing the paddle line
                const t = (paddleTop - ball.radius - ball.y) / dy;
                const intersectX = ball.x + dx * t;
                
                // Check Main Paddle Rebound
                if (t < minT && state.reboundCharges > 0 && intersectX >= paddleLeft && intersectX <= paddleRight) {
                     minT = t;
                     normal = {x: 0, y: -1}; // Bounce UP
                     hitType = 'paddle_rebound';
                }
                
                // Check Golem
                if (state.golem && state.golem.bouncesLeft > 0) {
                     const gLeft = state.golem.x - state.golem.width / 2;
                     const gRight = state.golem.x + state.golem.width / 2;
                     if (t < minT && intersectX >= gLeft && intersectX <= gRight) {
                         minT = t;
                         normal = {x: 0, y: -1};
                         hitType = 'golem';
                     }
                }
            }

            // -- Move to Collision Point --
            ball.x += dx * minT;
            ball.y += dy * minT;
            timeLeft -= (timeLeft * minT); // Reduce remaining time

            // -- Resolve Collision --
            if (hitType !== 'none') {
                if (hitType === 'portal') {
                    // Find the sibling portal
                    const siblingType = hitObj.type === 'portal_a' ? 'portal_b' : 'portal_a';
                    const sibling = state.bricks.find(b => b.type === siblingType);
                    
                    if (sibling) {
                        // Teleport!
                        ball.x = sibling.x + sibling.width / 2;
                        ball.y = sibling.y + sibling.height / 2;
                        ball.teleportCooldown = 10; // Frames to ignore portal collisions
                        playNote(8); 
                        for(let p=0; p<5; p++) state.particles.push(createParticle(ball.x, ball.y));
                    } else {
                        // No sibling? Treat as wall
                        ball.vx *= -1;
                        ball.vy *= -1;
                    }
                } else if (hitType === 'prism') {
                    // Prism Logic: Split ball
                    ball.vx *= -1;
                    ball.vy *= -1;
                    hitObj.health = 0; // Destroy Prism
                    playNote(16); // High C#
                    
                    // Create split ball
                    const splitAngle = Math.atan2(ball.vy, ball.vx) + (Math.random() * 0.5 + 0.5);
                    newBalls.push({
                        x: ball.x,
                        y: ball.y,
                        vx: Math.cos(splitAngle) * BALL_SPEED,
                        vy: Math.sin(splitAngle) * BALL_SPEED,
                        radius: BALL_RADIUS,
                        id: `ball-split-${Date.now()}-${Math.random()}`
                    });
                    for(let p=0; p<10; p++) state.particles.push(createParticle(ball.x, ball.y));

                } else {
                    // Standard Physics
                    ball.x += normal.x * 0.1;
                    ball.y += normal.y * 0.1;

                    if (hitType === 'wall') {
                        if (normal.x !== 0) ball.vx *= -1;
                        if (normal.y !== 0) ball.vy *= -1;
                    } else if (hitType === 'brick') {
                        // Logic
                        let damage = 1;
                        if (Math.random() < critChance) damage = 2;
                        hitObj.health -= damage;
                        
                        // Score & Divine Echo Logic
                        const prevScore = state.score;
                        state.score += damage;
                        if (Math.floor(state.score / 500) > Math.floor(prevScore / 500)) {
                            // Divine Echo!
                            playVictoryFanfare();
                            state.particles.push(...createHebrewExplosion(ball.x, ball.y));
                        }
                        
                        perutasEarned += damage;
                        
                        // --- PLAY THE SONG ---
                        playNextNote();
                        
                        if (!state.isGhostTurn) {
                            if (normal.x !== 0) ball.vx *= -1;
                            if (normal.y !== 0) ball.vy *= -1;
                        }

                        if (hitObj.type === 'bomb' && hitObj.health <= 0) {
                             explodeBrick(hitObj);
                        }
                        for(let p=0; p<3; p++) state.particles.push(createParticle(ball.x, ball.y));

                    } else if (hitType === 'paddle_rebound') {
                        ball.vy *= -1;
                        state.reboundCharges--;
                        playNote(7);
                    } else if (hitType === 'golem') {
                        ball.vy *= -1;
                        state.golem.bouncesLeft--;
                        playNote(11);
                    }
                }
                bounces++;
            } else {
                // No hit, moved full distance
                timeLeft = 0; 
            }
        }
        
        // Check Out of Bounds (Bottom)
        if (ball.y - ball.radius > canvas.height) {
            if (firstBallLandedPos === null) firstBallLandedPos = ball.x;
        } else {
            remainingBalls.push(ball);
        }
    }
    
    // Add split balls
    remainingBalls.push(...newBalls);
    
    // Cleanup dead bricks
    const deadBricks = state.bricks.filter(b => b.health <= 0 && !b.type.startsWith('portal')); // Portals don't die
    deadBricks.forEach(b => {
        if (b.type === 'bomb') explodeBrick(b);
        
        state.score += 10;
        perutasEarned += 10 + perutaBonusPerBrick;
        state.particles.push(...createHebrewExplosion(b.x + b.width/2, b.y + b.height/2));
    });
    
    // Remove dead bricks
    state.bricks = state.bricks.filter(b => b.health > 0 || b.type.startsWith('portal'));
    
    state.balls = remainingBalls;
    
    if (state.balls.length === 0 && state.ballsToLaunch === 0 && state.isShooting) {
        // If only portals remain, level is complete? No, portals shouldn't block win.
        const activeBricks = state.bricks.filter(b => !b.type.startsWith('portal'));
        
        if (activeBricks.length === 0) {
            levelComplete = true;
        } else {
            if (firstBallLandedPos !== null) {
                state.shooterPos.x = Math.max(state.paddle.width / 2, Math.min(canvas.width - state.paddle.width / 2, firstBallLandedPos));
            }
            turnEnded = true;
            state.firstBallLandedPos = null;
        }
    } else {
        state.firstBallLandedPos = firstBallLandedPos;
    }

    return { turnEnded, perutasEarned, levelComplete, snitchCaptured };
}