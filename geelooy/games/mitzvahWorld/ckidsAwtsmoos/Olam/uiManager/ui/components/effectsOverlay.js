
// B"H
// Effects Overlay Component - Enhanced to bridge Audio synthesis!

export default {
    shaym: "effectsOverlay",
    className: "effects-overlay",
    style: { pointerEvents: "none", position: "absolute", top:0, left:0, width:"100%", height:"100%", zIndex: 2000 },
    on: {
        awtsmoosRevealed(e, $, ui) {
            const data = e.detail;
            
            // 1. Text Popups
            if (data.text) {
                const el = document.createElement("div");
                el.className = "floating-text";
                el.textContent = data.text;
                el.style.color = data.color || "white";
                el.style.left = (window.innerWidth/2) + "px";
                el.style.top = (window.innerHeight/2) + "px";
                e.target.appendChild(el);
                setTimeout(() => el.remove(), 2000);
            }
            
            // 2. Visual Effects
            if (data.effect === 'transaction') {
                for(let i=0; i<20; i++) {
                    const letter = document.createElement("div");
                    letter.className = "hebrew-particle";
                    letter.textContent =["א","ב","ג","ד","ה","ו","ז","ח","ט","י"][Math.floor(Math.random()*10)];
                    letter.style.left = (window.innerWidth/2) + "px";
                    letter.style.top = (window.innerHeight/2) + "px";
                    letter.style.setProperty('--tx', (Math.random()*400 - 200) + "px");
                    letter.style.setProperty('--ty', (Math.random()*400 - 200) + "px");
                    letter.style.color = `hsl(${Math.random()*360}, 100%, 50%)`;
                    e.target.appendChild(letter);
                    setTimeout(() => letter.remove(), 1500);
                }
            }

            // 3. Audio Bridge - Standard Play
            if (data.playProceduralSound) {
                 import("../../../../systems/audio/AudioEngine.js").then(m => {
                     m.default.play(data.playProceduralSound.key, data.playProceduralSound.options);
                 }).catch(err => console.warn("B\"H Audio failed to bridge:", err));
            }

            // 4. Dynamic Audio Bridge - Jump
            if (data.triggerDynamicJump !== undefined) {
                 import("../../../../systems/audio/DynamicAudio.js").then(m => {
                     m.default.triggerJump(data.triggerDynamicJump);
                 }).catch(err => console.warn("B\"H Audio failed to bridge:", err));
            }

            // 5. Dynamic Audio Bridge - Impact
            if (data.triggerDynamicImpact !== undefined) {
                 import("../../../../systems/audio/DynamicAudio.js").then(m => {
                     m.default.triggerImpact(data.triggerDynamicImpact);
                 }).catch(err => console.warn("B\"H Audio failed to bridge:", err));
            }

            // 6. Dynamic Audio Bridge - Step
            if (data.triggerDynamicStep) {
                 import("../../../../systems/audio/DynamicAudio.js").then(m => {
                     m.default.triggerStep();
                 }).catch(err => console.warn("B\"H Audio failed to bridge:", err));
            }
        }
    }
};
