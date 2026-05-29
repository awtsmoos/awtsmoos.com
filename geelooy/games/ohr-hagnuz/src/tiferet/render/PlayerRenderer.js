/**
 * B"H
 * PlayerRenderer.js
 * The Living Vessel — Complete Human Animation System
 * Handles 8-direction sprites, walk cycles, idle breathing, 
 * particles, shadows, and smooth interpolated movement.
 */
export class PlayerRenderer {
  static draw(ctx, x, y, size, state) {
    const { tick, dir, moving, hp, light } = state;
    
    // Smooth interpolation creates fluid sub-tile movement
    const smoothX = x + Math.sin(tick * 0.1) * 2;
    const smoothY = y + Math.cos(tick * 0.15) * 1;
    
    ctx.save();
    ctx.translate(smoothX + size / 2, smoothY + size / 2);
    
    // 1. GROUND SHADOW — Always beneath feet
    this._drawShadow(ctx, size);
    
    // 2. FOOTSTEP PARTICLES — When moving
    if (moving && tick % 8 === 0) {
      this._spawnFootstepParticle(ctx, size);
    }
    
    // 3. BODY ROTATION — Based on direction
    const rotation = this._getRotation(dir);
    ctx.rotate(rotation);
    
    // 4. WALK CYCLE — 4 frames per direction
    const frame = Math.floor(tick / 4) % 4;
    const phase = frame / 4 * Math.PI * 2;
    
    // 5. ARM SWING — Opposite to legs
    const armSwing = Math.sin(phase) * (size / 4);
    
    // 6. LEG ANIMATION — Walk cycle
    const legSwing = Math.cos(phase) * (size / 5);
    
    // 7. HEAD BOB — Vertical bounce while walking
    const headBob = Math.abs(Math.sin(phase)) * (size / 12);
    ctx.translate(0, -headBob);
    
    // 8. BREATHING — Idle animation (chest expansion)
    const breathScale = 1 + Math.sin(tick * 0.05) * 0.02;
    
    // DRAW LAYERS (Back to Front)
    this._drawBackArm(ctx, size, armSwing, dir);
    this._drawLegs(ctx, size, legSwing, dir);
    this._drawTorso(ctx, size, breathScale, dir);
    this._drawFrontArm(ctx, size, armSwing, dir);
    this._drawHead(ctx, size, dir, tick);
    
    // 9. GLOW AURA — When running fast
    if (moving && tick % 2 === 0) {
      this._drawGlowAura(ctx, size);
    }
    
    ctx.restore();
    
    // 10. LIGHT BAR — Above head shows remaining light
    this._drawLightBar(ctx, x, y, size, light);
  }
  
  static _getRotation(dir) {
    // 8-direction rotation mapping
    const angles = {
      'd': 0,      // Down (front)
      'l': -Math.PI / 2,  // Left
      'r': Math.PI / 2,   // Right
      'u': Math.PI,       // Up (back)
      'dl': -Math.PI / 4, // Down-Left
      'dr': Math.PI / 4,  // Down-Right
      'ul': -3 * Math.PI / 4,
      'ur': 3 * Math.PI / 4
    };
    return angles[dir] || 0;
  }
  
  static _drawShadow(ctx, size) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, size / 2.5, size / 3, size / 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  static _spawnFootstepParticle(ctx, size) {
    // Handled by ParticleEngine separately
    // This marks position for particle spawn
    window._lastFootstep = { x: ctx.x, y: ctx.y + size / 3 };
  }
  
  static _drawBackArm(ctx, size, swing, dir) {
    const isSide = dir === 'l' || dir === 'r';
    const shirt = '#1565c0';
    const skin = '#ffdbac';
    
    ctx.save();
    if (isSide) ctx.globalAlpha = 0.5;
    
    const armAngle = isSide ? -0.3 : -0.5 + swing * 0.05;
    ctx.rotate(armAngle);
    
    // Sleeve
    ctx.fillStyle = shirt;
    ctx.fillRect(-size/20, -size/4, size/10, size/3);
    
    // Arm
    ctx.fillStyle = skin;
    ctx.fillRect(-size/25, -size/8, size/12, size/4);
    
    ctx.restore();
  }
  
  static _drawLegs(ctx, size, swing, dir) {
    const isSide = dir === 'l' || dir === 'r';
    const pants = '#1e2430';
    
    ctx.fillStyle = pants;
    
    if (isSide) {
      // Profile view — overlapping legs
      ctx.fillRect(-size/8 + swing/2, size/8, size/6, size/3);
      ctx.globalAlpha = 0.6;
      ctx.fillRect(-size/8 - swing/2, size/10, size/6, size/3);
      ctx.globalAlpha = 1;
    } else {
      // Front/back view — two separate legs
      ctx.fillRect(-size/4 + swing/3, size/8, size/7, size/3);
      ctx.fillRect(size/10 - swing/3, size/8, size/7, size/3);
      
      // Shoes
      ctx.fillStyle = '#2d2d2d';
      ctx.fillRect(-size/4 + swing/3, size/2.5, size/6, size/10);
      ctx.fillRect(size/10 - swing/3, size/2.5, size/6, size/10);
    }
  }
  
  static _drawTorso(ctx, size, breathScale, dir) {
    const isSide = dir === 'l' || dir === 'r';
    const shirt = '#1565c0';
    
    ctx.save();
    ctx.scale(1, breathScale);
    
    // Main body
    ctx.fillStyle = shirt;
    const torsoW = isSide ? size / 3.5 : size / 2.2;
    ctx.beginPath();
    ctx.roundRect(-torsoW / 2, -size / 4, torsoW, size / 2, size / 12);
    ctx.fill();
    
    // Collar detail
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-size/10, -size/4);
    ctx.lineTo(0, -size/6);
    ctx.lineTo(size/10, -size/4);
    ctx.closePath();
    ctx.fill();
    
    // Tzitzit strings (if white shirt)
    if (shirt === '#fff') {
      ctx.strokeStyle = '#1565c0';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(size/8, size/10);
        ctx.quadraticCurveTo(
          size/6 + i * 2, size/6 + Math.sin(i) * 3,
          size/5 + i * 3, size/5 + Math.sin(i * 0.5) * 5
        );
        ctx.stroke();
      }
    }
    
    ctx.restore();
  }
  
  static _drawFrontArm(ctx, size, swing, dir) {
    const isSide = dir === 'l' || dir === 'r';
    const shirt = '#1565c0';
    const skin = '#ffdbac';
    
    ctx.save();
    
    const armAngle = isSide ? 0.3 : 0.5 - swing * 0.05;
    ctx.rotate(armAngle);
    
    // Sleeve
    ctx.fillStyle = shirt;
    ctx.fillRect(-size/20, -size/4, size/10, size/3);
    
    // Arm
    ctx.fillStyle = skin;
    ctx.fillRect(-size/25, -size/8, size/12, size/4);
    
    // Hand with fingers
    ctx.beginPath();
    ctx.arc(0, size / 5, size / 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  static _drawHead(ctx, size, dir, tick) {
    const isSide = dir === 'l' || dir === 'r';
    const skin = '#ffdbac';
    
    // Face direction offset
    const faceX = isSide ? (dir === 'l' ? -3 : 3) : 0;
    
    ctx.save();
    ctx.translate(faceX, -size / 2.5);
    
    // Head shape
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(0, 0, size / 5, size / 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Neck
    ctx.fillRect(-size/15, size/6, size/7.5, size/8);
    
    // Ears (visible from side)
    if (isSide) {
      ctx.fillStyle = skin;
      const earX = dir === 'l' ? -size/5 : size/5;
      ctx.beginPath();
      ctx.ellipse(earX, 0, size/20, size/12, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Kippah (yarmulke)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(0, -size/6, size/4.5, size/10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Face details
    if (dir === 'd' || isSide) {
      ctx.fillStyle = '#333';
      const eyeY = -size/30;
      const eyeSpacing = size/8;
      
      if (isSide) {
        // Single eye from side
        ctx.beginPath();
        ctx.ellipse(faceX + (dir === 'l' ? -size/7 : size/7), eyeY, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyebrow
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(faceX + (dir === 'l' ? -size/4 : size/10), eyeY - size/15);
        ctx.lineTo(faceX + (dir === 'l' ? -size/12 : size/5), eyeY - size/15);
        ctx.stroke();
      } else {
        // Two eyes from front/back
        ctx.fillRect(-eyeSpacing - 2, eyeY, 4, 3);
        ctx.fillRect(eyeSpacing - 2, eyeY, 4, 3);
        
        // Eyebrows
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-eyeSpacing - 4, eyeY - size/15);
        ctx.lineTo(-eyeSpacing + 4, eyeY - size/15);
        ctx.moveTo(eyeSpacing - 4, eyeY - size/15);
        ctx.lineTo(eyeSpacing + 4, eyeY - size/15);
        ctx.stroke();
      }
      
      // Nose
      ctx.fillStyle = '#e8c4a0';
      ctx.beginPath();
      ctx.ellipse(0, size/20, size/25, size/20, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Mouth (slight smile)
      ctx.strokeStyle = '#a67c52';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, size/10, size/15, 0.1, Math.PI - 0.1);
      ctx.stroke();
    }
    
    // Beard (if front view)
    if (dir === 'd') {
      ctx.fillStyle = '#2d2d2d';
      ctx.beginPath();
      ctx.moveTo(-size/6, size/15);
      ctx.quadraticCurveTo(-size/8, size/4, 0, size/3);
      ctx.quadraticCurveTo(size/8, size/4, size/6, size/15);
      ctx.quadraticCurveTo(0, size/8, -size/6, size/15);
      ctx.fill();
    }
    
    // Hair (sides, from back view)
    if (dir === 'u') {
      ctx.fillStyle = '#2d2d2d';
      ctx.beginPath();
      ctx.ellipse(-size/5, -size/10, size/15, size/10, -0.3, 0, Math.PI * 2);
      ctx.ellipse(size/5, -size/10, size/15, size/10, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  static _drawGlowAura(ctx, size) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  static _drawLightBar(ctx, x, y, size, light) {
    if (light === undefined) return;
    
    const barWidth = size * 0.8;
    const barHeight = 4;
    const barX = x + size / 2 - barWidth / 2;
    const barY = y - size / 3;
    
    ctx.save();
    
    // Background (dark)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Light fill (golden)
    const fillRatio = Math.min(1, Math.max(0, light / 100));
    const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth * fillRatio, barY);
    gradient.addColorStop(0, '#ffd700');
    gradient.addColorStop(1, '#ffaa00');
    ctx.fillStyle = gradient;
    ctx.fillRect(barX + 1, barY + 1, (barWidth - 2) * fillRatio, barHeight - 2);
    
    ctx.restore();
  }
}

// Particle system for footstep dust
export class FootstepParticle {
  static particles = [];
  
  static spawn(x, y) {
    this.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 2,
      life: 20,
      size: 3 + Math.random() * 3
    });
  }
  
  static update() {
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.life--;
      return p.life > 0;
    });
  }
  
  static draw(ctx) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life / 20;
      ctx.fillStyle = '#8b7355';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}