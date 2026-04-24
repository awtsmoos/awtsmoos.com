
/**
 * B"H
 */
export default /*css*/`
    .loading {
        z-index: 9999;
        position: absolute; left: 0; top: 0; width: 100%; height: 100%;
        background: radial-gradient(circle at center, #1a0033 0%, #000000 100%);
        display: flex; align-items: center; justify-content: center;
        overflow: hidden;
    }

    @keyframes ainSofSpin {
        0% { transform: rotate(0deg) scale(1); filter: hue-rotate(0deg); }
        50% { transform: rotate(180deg) scale(1.1); filter: hue-rotate(180deg); }
        100% { transform: rotate(360deg) scale(1); filter: hue-rotate(360deg); }
    }

    @keyframes ainSofSpinReverse {
        0% { transform: rotate(360deg) scale(1); filter: hue-rotate(0deg); }
        50% { transform: rotate(180deg) scale(0.9); filter: hue-rotate(-180deg); }
        100% { transform: rotate(0deg) scale(1); filter: hue-rotate(-360deg); }
    }

    .kabbalah-vortex {
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        width: 100vh; height: 100vh; pointer-events: none; opacity: 0.4;
    }

    .sefirot-ring {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        border: 4px dashed transparent; border-radius: 50%;
        box-shadow: 0 0 50px #ff00ff, inset 0 0 50px #00ffff;
    }

    .ring-1 { animation: ainSofSpin 10s linear infinite; border-color: #ffd700; }
    .ring-2 { animation: ainSofSpinReverse 15s linear infinite; width: 80%; height: 80%; top: 10%; left: 10%; border-color: #ff00ff; }
    .ring-3 { animation: ainSofSpin 20s linear infinite; width: 60%; height: 60%; top: 20%; left: 20%; border-color: #00ffff; }

    .loadingContent { position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; }

    .awtsmoos-title-glow {
        font-family: 'Fredoka One', cursive; font-size: 64px; color: #fff;
        text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 80px #ff00ff;
        margin-bottom: 40px; animation: pulseGlow 2s infinite alternate;
        text-transform: uppercase; letter-spacing: 5px;
    }

    @keyframes pulseGlow {
        0% { text-shadow: 0 0 10px #00ffff, 0 0 20px #ff00ff; transform: scale(1); }
        100% { text-shadow: 0 0 30px #00ffff, 0 0 60px #ff00ff, 0 0 100px #fff; transform: scale(1.05); }
    }

    .barLoading .bck {
        width: 400px; height: 30px; background: rgba(255,255,255,0.1);
        border: 2px solid #00ffff; border-radius: 15px; overflow: hidden;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    }

    .barMitzvah {
        height: 100%; width: 0%; background: linear-gradient(90deg, #ff00ff, #00ffff, #fff);
        transition: width 0.3s ease; position: relative;
        box-shadow: 0 0 20px #fff;
    }

    .light-spark {
        position: absolute; right: 0; top: 0; width: 20px; height: 100%;
        background: #fff; filter: blur(5px); box-shadow: 0 0 20px #fff;
        animation: sparkPulse 0.5s infinite alternate;
    }

    @keyframes sparkPulse {
        0% { opacity: 0.5; width: 10px; }
        100% { opacity: 1; width: 30px; }
    }

    .txtLoad { font-family: 'Fredoka', sans-serif; color: #fff; text-shadow: 0 0 10px #00ffff; margin-top: 20px; text-align: center; }
    .txtLoad.secondary { font-size: 18px; color: #ffd700; opacity: 0.8; }
`;
