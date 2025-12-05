// B"H
// Effects Overlay Component

export default {
    shaym: "effectsOverlay",
    className: "effects-overlay",
    style: { pointerEvents: "none", position: "absolute", top:0, left:0, width:"100%", height:"100%", zIndex: 2000 },
    on: {
        awtsmoosRevealed(e, $, ui) {
            const data = e.detail;
            
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
            
            if (data.effect === 'transaction') {
                // Intense Hebrew Letter Explosion
                for(let i=0; i<20; i++) {
                    const letter = document.createElement("div");
                    letter.className = "hebrew-particle";
                    letter.textContent = ["א","ב","ג","ד","ה","ו","ז","ח","ט","י"][Math.floor(Math.random()*10)];
                    letter.style.left = (window.innerWidth/2) + "px";
                    letter.style.top = (window.innerHeight/2) + "px";
                    letter.style.setProperty('--tx', (Math.random()*400 - 200) + "px");
                    letter.style.setProperty('--ty', (Math.random()*400 - 200) + "px");
                    letter.style.color = `hsl(${Math.random()*360}, 100%, 50%)`;
                    e.target.appendChild(letter);
                    setTimeout(() => letter.remove(), 1500);
                }
            }
        }
    }
};