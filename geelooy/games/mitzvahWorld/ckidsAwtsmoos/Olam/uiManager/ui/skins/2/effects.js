// B"H

export default /*css*/`
@keyframes floatUp {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
    20% { transform: translate(-50%, -80%) scale(1.2); opacity: 1; }
    100% { transform: translate(-50%, -150%) scale(1); opacity: 0; }
}

.floating-text {
    position: fixed;
    font-family: 'Fredoka One', cursive;
    font-size: 32px;
    text-shadow: 2px 2px 0 #000;
    pointer-events: none;
    z-index: 5000;
    animation: floatUp 1.5s ease-out forwards;
}

@keyframes explodeParticle {
    0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
    100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}

.hebrew-particle {
    position: fixed;
    font-family: 'Fredoka One', sans-serif;
    font-size: 24px;
    pointer-events: none;
    z-index: 4999;
    animation: explodeParticle 1s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
    font-weight: bold;
}
`;