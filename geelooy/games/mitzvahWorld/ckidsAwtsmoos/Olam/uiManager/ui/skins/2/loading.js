
/**
 * B"H
 * @file loading.js (CSS)
 * 🌀 THE VORTEX OF EMANATION (LOADING SCREEN) CSS 🌀
 */
export default /*css*/`
    .loading {
        z-index: 99999;
        position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
        background: radial-gradient(circle at center, #0a0a1e 0%, #000000 100%);
        display: flex; align-items: center; justify-content: center;
        overflow: hidden;
        pointer-events: auto; 
        perspective: 1000px;
        opacity: 1;
        transition: opacity 0.5s ease;
    }

    /* B"H: ABSOLUTE CONCEALMENT - Prevents blocking Main Menu! */
    .loading.hidden {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
    }

    .kabbalah-vortex {
        position: absolute;
        width: 100vw; height: 100vh;
        display: flex; align-items: center; justify-content: center;
        pointer-events: none;
        transform-style: preserve-3d;
        animation: pulseVortex 4s ease-in-out infinite alternate;
    }

    .sefirot-ring {
        position: absolute;
        border: 4px solid rgba(0, 243, 255, 0.3);
        border-radius: 50%;
        box-sizing: border-box;
        box-shadow: 0 0 20px rgba(0, 243, 255, 0.4), inset 0 0 20px rgba(188, 19, 254, 0.4);
        opacity: 0.7;
    }

    .ring-1 { width: 110vmin; height: 110vmin; animation: spin3D 8s linear infinite; border-color: rgba(255, 215, 0, 0.5); }
    .ring-2 { width: 95vmin; height: 95vmin; animation: spin3DRev 7s linear infinite; border-style: dashed; }
    .ring-3 { width: 80vmin; height: 80vmin; animation: spin3D 6s linear infinite; border-color: #bc13fe; }
    .ring-4 { width: 65vmin; height: 65vmin; animation: spin3DRev 5s linear infinite; border-style: dotted; }
    .ring-5 { width: 50vmin; height: 50vmin; animation: spin3D 4s linear infinite; border-color: #00ffed; }

    @keyframes spin3D {
        0% { transform: rotateX(70deg) rotateY(0deg) rotateZ(0deg); }
        100% { transform: rotateX(70deg) rotateY(360deg) rotateZ(360deg); }
    }
    @keyframes spin3DRev {
        0% { transform: rotateX(-60deg) rotateY(0deg) rotateZ(360deg); }
        100% { transform: rotateX(-60deg) rotateY(-360deg) rotateZ(0deg); }
    }
    @keyframes pulseVortex {
        0% { transform: scale(1); }
        100% { transform: scale(1.1); }
    }

    .loadingContent {
        z-index: 100;
        display: flex; flex-direction: column; align-items: center;
        width: 80vw; max-width: 800px;
        text-align: center;
        pointer-events: none;
    }

    .awtsmoos-title-glow {
        font-family: 'Fredoka One', cursive;
        font-size: clamp(3rem, 12vw, 100px);
        color: #fff;
        text-transform: uppercase;
        letter-spacing: 0.5rem;
        margin-bottom: 5vh;
        text-shadow: 0 0 30px rgba(0, 243, 255, 1), 0 0 60px rgba(188, 19, 254, 0.8);
        position: relative;
    }

    .glitch-effect::before, .glitch-effect::after {
        content: attr(data-text);
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        opacity: 0.8;
    }
    .glitch-effect::before {
        left: 3px;
        text-shadow: -2px 0 #ff00ea;
        animation: glitch-anim-1 2s infinite linear alternate-reverse;
    }
    .glitch-effect::after {
        left: -3px;
        text-shadow: -2px 0 #00ffed;
        animation: glitch-anim-2 3s infinite linear alternate-reverse;
    }

    @keyframes glitch-anim-1 {
        0% { clip-path: inset(20% 0 80% 0); }
        20% { clip-path: inset(60% 0 10% 0); }
        40% { clip-path: inset(40% 0 50% 0); }
        60% { clip-path: inset(80% 0 5% 0); }
        80% { clip-path: inset(10% 0 70% 0); }
        100% { clip-path: inset(30% 0 20% 0); }
    }
    @keyframes glitch-anim-2 {
        0% { clip-path: inset(10% 0 60% 0); }
        20% { clip-path: inset(80% 0 5% 0); }
        40% { clip-path: inset(30% 0 20% 0); }
        60% { clip-path: inset(70% 0 15% 0); }
        80% { clip-path: inset(20% 0 50% 0); }
        100% { clip-path: inset(50% 0 30% 0); }
    }

    .barLoading {
        width: 100%; height: 30px;
        background: rgba(0,0,0,0.8);
        border: 3px solid #00f3ff;
        border-radius: 30px;
        overflow: hidden;
        position: relative;
        box-shadow: 0 0 20px rgba(0, 243, 255, 0.5), inset 0 0 10px rgba(0, 243, 255, 0.5);
    }

    .bck {
        width: 100%; height: 100%;
        position: relative;
    }

    .barMitzvah {
        height: 100%; width: 0%;
        background: linear-gradient(90deg, #1b2064, #bc13fe, #00f3ff, #ffffff);
        background-size: 300% 100%;
        transition: width 0.1s linear; 
        box-shadow: 0 0 30px #00f3ff;
        position: absolute; top: 0; left: 0;
        animation: flowGlow 2s linear infinite;
    }

    @keyframes flowGlow {
        0% { background-position: 100% 0; }
        100% { background-position: 0 0; }
    }

    .txtLoad {
        font-family: 'Fredoka', sans-serif;
        font-size: clamp(1.2rem, 3vw, 2rem);
        color: #00ffed;
        margin-top: 4vh;
        letter-spacing: 3px;
        text-shadow: 0 0 10px #00ffed;
    }

    .pulse-text { animation: textPulse 1.5s infinite alternate; }

    @keyframes textPulse {
        0% { opacity: 0.6; transform: scale(0.98); }
        100% { opacity: 1; transform: scale(1.02); text-shadow: 0 0 20px #00ffed, 0 0 40px #bc13fe; }
    }

    .txtLoad.info {
        color: #ffde40;
        font-weight: bold;
        margin-top: 1vh;
        font-size: clamp(1rem, 2vw, 1.5rem);
        text-shadow: 0 0 15px #ffde40;
    }
`;
