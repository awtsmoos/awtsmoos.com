//B"H
// ui/effects.js

const CHARS = "אבגדהוזחטיכלמנסעפצקרשת0123456789";

export function enableHackerText(el, originalText) {
    el.addEventListener('mouseenter', () => {
        let iterations = 0;
        const interval = setInterval(() => {
            el.innerText = originalText
                .split("")
                .map((letter, index) => {
                    if (index < iterations) {
                        return originalText[index];
                    }
                    return CHARS[Math.floor(Math.random() * CHARS.length)];
                })
                .join("");

            if (iterations >= originalText.length) {
                clearInterval(interval);
            }
            iterations += 1 / 2;
        }, 30);
        
        el.dataset.interval = interval;
    });
}