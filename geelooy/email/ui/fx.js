// B"H
// The FX Engine: WebGL2 Powered Kabbalah Particles & Physics
import { GLChain } from './gl.js';

export const FX = {
    glChain: null,
    particleCount: 3000,
    particles: null, // Float32Array
    audioCtx: null,
    analyser: null,
    dataArray: null,
    mouseX: 0,
    mouseY: 0,
    time: 0,
    scrollSpeed: 0,
    soundTheme: 'cyber',
    hudElement: null,
    
    init(canvas) {
        if(!canvas) return;
        this.glChain = new GLChain(canvas);
        if(!this.glChain.gl) return; // Fallback if no WebGL

        this.generateHebrewTexture();
        this.initParticles();
        this.initShaders();
        this.initAudio();
        this.initHUD();
        
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = window.innerHeight - e.clientY; // Invert Y for GL
        });

        this.loop();
    },

    initHUD() {
        this.hudElement = document.createElement('div');
        this.hudElement.className = 'holo-hud';
        document.body.appendChild(this.hudElement);
        this.updateHUD();
        setInterval(() => this.updateHUD(), 500);
    },

    updateHUD() {
        const fps = Math.floor(60 - Math.random() * 5);
        const stability = Math.floor(95 + Math.random() * 5);
        const mem = Math.floor(performance.memory ? performance.memory.usedJSHeapSize / 1048576 : 0);
        this.hudElement.innerHTML = `
            <div class="hud-line">SYS.GL: <span class="good">ONLINE</span></div>
            <div class="hud-line">QUANTUM.FLUX: <span class="warn">${this.scrollSpeed.toFixed(2)}</span></div>
            <div class="hud-line">NET.STABILITY: <span class="good">${stability}%</span></div>
            <div class="hud-line">MEM.ALLOC: ${mem}MB</div>
            <div class="hud-line">FPS: ${fps}</div>
            <div class="hud-scanline"></div>
        `;
    },

    generateHebrewTexture() {
        // Create an atlas of Hebrew letters
        const c = document.createElement('canvas');
        c.width = 1024; c.height = 64;
        const ctx = c.getContext('2d');
        ctx.font = 'bold 48px "Courier New", monospace, sans-serif'; 
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const letters = "אבגדהוזחטיכלמנסעפצקרשת";
        const step = 1024 / 22;
        
        for(let i=0; i<22; i++) {
            ctx.shadowColor = "rgba(255,255,255,0.8)";
            ctx.shadowBlur = 10;
            ctx.fillText(letters[i], i * step + step/2, 32);
        }
        
        this.glChain.createTextureFromCanvas('hebrew', c);
    },

    initParticles() {
        // 0: x, 1: y, 2: z, 3: size, 4: char, 5: life, 6: vx, 7: vy
        this.particles = new Float32Array(this.particleCount * 8); 
        for(let i=0; i<this.particleCount; i++) {
            this.resetParticle(i, true);
        }
        this.glChain.createBuffer('particles', this.particles, this.glChain.gl.DYNAMIC_DRAW);
    },

    resetParticle(i, randomY = false) {
        const off = i * 8;
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        this.particles[off] = (Math.random() * w); // x
        this.particles[off+1] = randomY ? (Math.random() * h) : -100; // y
        this.particles[off+2] = (Math.random() - 0.5) * 800; // z depth
        this.particles[off+3] = 12 + Math.random() * 24; // size
        this.particles[off+4] = Math.floor(Math.random() * 22); // char
        this.particles[off+5] = 1.0; // life
        
        // Drift velocity
        this.particles[off+6] = (Math.random() - 0.5) * 0.2; 
        this.particles[off+7] = (Math.random() * 1.5) + 0.2; 
    },

    initShaders() {
        const vert = `#version 300 es
        in vec2 a_position; 
        
        in vec3 i_pos; 
        in float i_size;
        in float i_char;
        in float i_life;

        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;
        uniform float u_scrollSpeed;

        out vec2 v_texCoord;
        out float v_life;
        out float v_char;
        out float v_depth;

        void main() {
            vec3 pos = i_pos;
            
            // 1. Scroll Warp
            float distCenter = distance(pos.xy, u_resolution * 0.5);
            pos.z += sin(distCenter * 0.005 + u_time) * u_scrollSpeed * 5.0;

            // 2. Black Hole Mouse Physics
            float distMouse = distance(pos.xy, u_mouse);
            float gravity = 300.0;
            if (distMouse < gravity) {
                vec2 dir = normalize(pos.xy - u_mouse);
                float force = (gravity - distMouse) / gravity;
                pos.xy -= dir * force * 50.0; 
                pos.z += force * 200.0; 
            }

            // 3. Perspective
            float fov = 1000.0;
            float scale = fov / (fov - pos.z);
            
            vec2 screenPos = (pos.xy - u_resolution * 0.5) * scale + u_resolution * 0.5;
            vec2 vertPos = (a_position - 0.5) * i_size * scale;
            vec2 clipPos = ((screenPos + vertPos) / u_resolution) * 2.0 - 1.0;
            
            gl_Position = vec4(clipPos, pos.z/2000.0, 1.0);
            
            v_texCoord = a_position;
            v_life = i_life;
            v_char = i_char;
            v_depth = pos.z;
        }`;

        const frag = `#version 300 es
        precision highp float;
        
        in vec2 v_texCoord;
        in float v_life;
        in float v_char;
        in float v_depth;
        
        uniform sampler2D u_texture;
        uniform float u_time;
        uniform float u_audioLevel;
        uniform vec2 u_resolution;

        out vec4 outColor;

        void main() {
            float charCount = 22.0;
            float charWidth = 1.0 / charCount;
            vec2 uv = v_texCoord;
            
            uv.x = (uv.x * charWidth) + (v_char * charWidth);
            vec4 texColor = texture(u_texture, uv);
            
            vec3 gold = vec3(1.0, 0.8, 0.2);
            vec3 cyan = vec3(0.0, 1.0, 1.0);
            vec3 fire = vec3(1.0, 0.3, 0.1);
            
            float mixVal = sin(v_char * 10.0 + u_time + u_audioLevel);
            vec3 finalColor = mix(cyan, gold, mixVal * 0.5 + 0.5);
            if (u_audioLevel > 0.5) finalColor = mix(finalColor, fire, u_audioLevel);

            float fogDensity = 0.0005;
            float fogFactor = 1.0 - exp(-fogDensity * abs(v_depth));
            finalColor = mix(finalColor, vec3(0.05, 0.05, 0.1), fogFactor);

            float alpha = texColor.a * v_life;
            alpha *= (1.0 - fogFactor);

            outColor = vec4(finalColor * alpha * (1.0 + u_audioLevel), alpha);
        }`;

        this.glChain.createProgram('particles', vert, frag);
        const quad = new Float32Array([0,0, 1,0, 0,1, 1,0, 1,1, 0,1]);
        this.glChain.createBuffer('quad', quad);
    },

    initAudio() {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (Ctx) {
                this.audioCtx = new Ctx();
                this.analyser = this.audioCtx.createAnalyser();
                this.analyser.fftSize = 64;
                this.analyser.smoothingTimeConstant = 0.8;
                this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            }
        } catch(e) {}
    },

    playTTS(text) {
        if('speechSynthesis' in window) {
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 1.2; u.pitch = 0.8;
            window.speechSynthesis.speak(u);
            
            // Hack to visualize TTS audio: simulate high energy
            const dur = text.length * 100;
            const start = Date.now();
            const animate = () => {
                if(Date.now() - start > dur) return;
                this.simulatedAudio = Math.random() * 0.8;
                requestAnimationFrame(animate);
            };
            animate();
        }
    },

    playSound(type) {
        if (!this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.analyser);
        gain.connect(this.audioCtx.destination);
        const now = this.audioCtx.currentTime;
        
        if(type === 'type') {
            osc.frequency.setValueAtTime(800 + Math.random()*400, now);
            osc.type = 'square';
            gain.gain.setValueAtTime(0.02, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now+0.05);
            osc.start(now); osc.stop(now+0.05);
        } else if (type === 'sent') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now+0.4);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now+0.4);
            osc.start(now); osc.stop(now+0.4);
        } else if (type === 'hover') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200, now);
            gain.gain.setValueAtTime(0.005, now);
            gain.gain.linearRampToValueAtTime(0, now+0.05);
            osc.start(now); osc.stop(now+0.05);
        }
    },

    updateParticles() {
        if(!this.glChain || !this.glChain.gl) return;
        const h = window.innerHeight;
        for(let i=0; i<this.particleCount; i++) {
            const off = i * 8;
            this.particles[off+1] += this.particles[off+7]; 
            this.particles[off] += this.particles[off+6];
            
            // Reset logic
            if (this.particles[off+1] > h + 100) {
                this.resetParticle(i);
            }
        }
        this.glChain.gl.bindBuffer(this.glChain.gl.ARRAY_BUFFER, this.glChain.buffers['particles']);
        this.glChain.gl.bufferSubData(this.glChain.gl.ARRAY_BUFFER, 0, this.particles);
    },

    explode(x, y, color) {
        const glY = window.innerHeight - y; 
        for(let i=0; i<64; i++) {
            const idx = Math.floor(Math.random() * this.particleCount);
            const off = idx * 8;
            this.particles[off] = x;
            this.particles[off+1] = glY; 
            this.particles[off+2] = 0; 
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.particles[off+6] = Math.cos(angle) * speed;
            this.particles[off+7] = Math.sin(angle) * speed;
        }
        this.playSound('sent');
    },

    // Bridges
    sparks(x, y) { this.explode(x, y); },
    kabbalahMolecule(x, y) { this.explode(x, y); },
    setTether() {}, clearTether() {},
    setScroll(y) { const diff = (y - (this.lastScroll||y)); this.scrollSpeed = diff * 0.1; this.lastScroll = y; },
    setTheme(n) { this.soundTheme = n; },
    dissolveScreen(el) { el.style.transition='1s'; el.style.opacity='0'; setTimeout(()=>el.style.opacity='1',1000); },
    triggerSonar(x,y) { this.explode(x,y); this.playSound('type'); },
    decryptText(el, txt) { 
        const chars = "אבגדהוזחטיכלמנסעפצקרשת0123456789";
        let iter = 0;
        const interval = setInterval(() => {
            el.innerText = txt.split('').map((c, i) => {
                if(i < iter) return c;
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');
            iter += 1/2; 
            if(iter >= txt.length) clearInterval(interval);
        }, 30);
    },

    loop() {
        if(!this.glChain || !this.glChain.gl) return;
        this.time += 0.01;
        
        let audioLevel = 0.0;
        if(this.analyser) {
            this.analyser.getByteFrequencyData(this.dataArray);
            let sum = 0;
            for(let i=0; i<10; i++) sum += this.dataArray[i];
            audioLevel = (sum / 10) / 255.0;
        }
        // Sim TTS level
        if(this.simulatedAudio > 0) {
            audioLevel = Math.max(audioLevel, this.simulatedAudio);
            this.simulatedAudio *= 0.9;
        }

        this.updateParticles();

        this.glChain.clear(0, 0, 0, 0)
            .use('particles')
            .setUniform('u_resolution', '2f', [window.innerWidth, window.innerHeight])
            .setUniform('u_time', '1f', this.time)
            .setUniform('u_mouse', '2f', [this.mouseX, this.mouseY])
            .setUniform('u_audioLevel', '1f', audioLevel)
            .setUniform('u_scrollSpeed', '1f', this.scrollSpeed)
            .bindTexture('hebrew', 0)
            .bindAttribute('a_position', 'quad', 2)
            .bindAttribute('i_pos', 'particles', 3, this.glChain.gl.FLOAT, false, 32, 0, 1)
            .bindAttribute('i_size', 'particles', 1, this.glChain.gl.FLOAT, false, 32, 12, 1)
            .bindAttribute('i_char', 'particles', 1, this.glChain.gl.FLOAT, false, 32, 16, 1)
            .bindAttribute('i_life', 'particles', 1, this.glChain.gl.FLOAT, false, 32, 20, 1)
            .drawInstanced(this.glChain.gl.TRIANGLES, 6, this.particleCount);

        this.scrollSpeed *= 0.9; 
        requestAnimationFrame(() => this.loop());
    }
};