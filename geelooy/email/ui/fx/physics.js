
// B"H
// Physics Engine
// Manages the state of all visual entities

const state = {
    particles: [],
    sonars: [],
    explosions: [],
    scrollOffset: 0
};

export const Physics = {
    init(w, h) {
        state.particles = [];
        for(let i=0; i<60; i++) {
            state.particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                speed: Math.random() * 2 + 0.5,
                size: Math.random() * 3 + 2
            });
        }
    },

    setScroll(y) {
        state.scrollOffset = y;
    },

    triggerSonar(x, y) {
        state.sonars.push({x, y, size: 10, alpha: 1.0});
    },

    explode(x, y) {
        for(let i=0; i<15; i++) {
            const angle = Math.random() * 6.28;
            const speed = Math.random() * 5 + 2;
            state.explosions.push({
                x, y, 
                vx: Math.cos(angle) * speed, 
                vy: Math.sin(angle) * speed,
                alpha: 1.0
            });
        }
    },

    // Returns a Float32Array-friendly array of data
    // Layout: [x, y, size, alpha, type]
    update(w, h) {
        const data = [];

        // 1. Rain
        state.particles.forEach(p => {
            p.y += p.speed;
            if(p.y > h) p.y = 0;
            data.push(p.x, p.y, p.size, 0.5, 0.0);
        });

        // 2. Sonar
        for(let i=state.sonars.length-1; i>=0; i--) {
            const s = state.sonars[i];
            s.size += 5;
            s.alpha -= 0.02;
            if(s.alpha <= 0) state.sonars.splice(i, 1);
            else data.push(s.x, s.y, s.size, s.alpha, 1.0);
        }

        // 3. Explosions
        for(let i=state.explosions.length-1; i>=0; i--) {
            const e = state.explosions[i];
            e.x += e.vx;
            e.y += e.vy;
            e.alpha -= 0.05;
            if(e.alpha <= 0) state.explosions.splice(i, 1);
            else data.push(e.x, e.y, 4.0, e.alpha, 2.0);
        }

        return { data, scroll: state.scrollOffset };
    }
};
