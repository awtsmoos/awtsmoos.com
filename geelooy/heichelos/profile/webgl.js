// B"H - WebGL Particle Overlay for Alias Profiles
// Magical floating particles, insane visual effects

(function() {
  const canvas = document.getElementById('webgl-overlay');
  if (!canvas) return;
  
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.log('WebGL not supported, skipping particles');
    return;
  }
  
  // Resize
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();
  
  // Simple particle system using 2D canvas fallback for insane effect
  // Using 2D for reliability, WebGL for future enhancement
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const particles = [];
  const PARTICLE_COUNT = 80;
  
  // Get accent color from theme
  function getAccentColor() {
    const theme = document.body.dataset.theme || 'royal-gold';
    const colors = {
      'royal-gold': '#ffd700',
      'mystic-blue': '#4da6ff',
      'eternal-fire': '#ff6b35'
    };
    return colors[theme] || '#ffd700';
  }
  
  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5 - 0.2;
      this.size = Math.random() * 3 + 1;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.life = Math.random() * 100 + 50;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life--;
      if (this.life <= 0 || this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
        this.reset();
        this.y = canvas.height + 10;
      }
    }
    draw() {
      ctx.globalAlpha = this.opacity * (this.life / 100);
      ctx.fillStyle = getAccentColor();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Glow
      ctx.globalAlpha = this.opacity * 0.3 * (this.life / 100);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  
  animate();
  
  // Update on theme change
  const observer = new MutationObserver(() => {
    // Particles will pick up new color automatically
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
})();
