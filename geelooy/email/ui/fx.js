
// B"H
// FX Orchestrator
import { GL } from './fx/gl.js';
import { SHADERS } from './fx/shaders.js';
import { Physics } from './fx/physics.js';

let gl = null;
let canvas = null;
let program = null;
let buffer = null;
let animationFrame = null;
let resizeHandler = null;

export const FX = {
    init(cvs) {
        if(animationFrame) this.stop();
        
        canvas = cvs;
        
        // Listener Management
        if(resizeHandler) window.removeEventListener('resize', resizeHandler);
        resizeHandler = this.resize.bind(this);
        window.addEventListener('resize', resizeHandler);
        
        // GL Init
        gl = GL.createContext(canvas);
        if(!gl) return;
        
        program = GL.createProgram(gl, SHADERS.VS, SHADERS.FS);
        buffer = GL.createBuffer(gl);
        
        this.resize();
        Physics.init(canvas.width, canvas.height);
        
        this.loop();
    },

    resize() {
        GL.resize(gl);
    },

    stop() {
        if(animationFrame) cancelAnimationFrame(animationFrame);
        if(resizeHandler && window) window.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
        animationFrame = null;
    },

    // --- API Delegation to Physics ---
    setScroll(y) { Physics.setScroll(y); },
    triggerSonar(x, y) { Physics.triggerSonar(x, y); },
    explode(x, y, color) { Physics.explode(x, y); }, // Color currently unused in shader v1, kept for API compat

    // --- CSS/DOM Effects (Kept in Engine) ---
    setTheme(name) {
        document.body.dataset.theme = name;
        if(name === 'zen') document.body.style.setProperty('--mail-accent', '#0f766e');
    },

    dissolveScreen(el) {
        el.style.transition = 'opacity 0.12s ease';
        el.style.opacity = '0.35';
        el.style.opacity = '0';
        setTimeout(() => {
            el.style.opacity = '';
            el.style.opacity = '1';
        }, 500);
    },

    playTTS(text) {
        if('speechSynthesis' in window) {
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 1.1; u.pitch = 0.9;
            window.speechSynthesis.speak(u);
        }
    },

    playSound(type) { /* Audio placeholder */ },

    // --- Main Loop ---
    loop() {
        if(!gl || !canvas) return;
        
        // 1. Logic Update
        const { data, scroll } = Physics.update(canvas.width, canvas.height);
        
        // 2. Uniforms
        gl.useProgram(program);
        const uRes = gl.getUniformLocation(program, "u_resolution");
        const uScroll = gl.getUniformLocation(program, "u_scroll");
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uScroll, scroll);

        // 3. Draw
        GL.drawPoints(gl, program, buffer, data, [
            { name: 'a_position', size: 2 },
            { name: 'a_size', size: 1 },
            { name: 'a_alpha', size: 1 },
            { name: 'a_type', size: 1 }
        ]);
        
        animationFrame = requestAnimationFrame(() => this.loop());
    }
};
