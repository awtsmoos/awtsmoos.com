// B"H
/**
 * @module MatrixStyle
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE PALACE OF THE KING — MAIN MENU REDESIGN                                  ║
 * ║                                                                                  ║
 * ║  "And Solomon built the Temple of G-d." (Melachim I 6:14)                     ║
 * ║                                                                                  ║
 * ║  This redesign is the Beis HaMikdash of game menus:                            ║
 * ║  — A deep cosmic void background with living, breathing nebula gradients        ║
 * ║  — Responsive, polished, unforgettable                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @file MatrixStyle.js
 * @memberof mainMenu
 */

export default /*css*/`

.menu {
    --gold-primary:   #ffd700;
    --gold-bright:    #ffe566;
    --gold-deep:      #b8860b;
    --gold-glow:      rgba(255, 215, 0, 0.55);
    --void-deep:      #020008;
    --glass-border:   rgba(255, 215, 0, 0.14);
    --glass-bg:       rgba(6, 4, 28, 0.72);
    --btn-green-a:    #1adc6e;
    --btn-green-b:    #0ea34c;
    --btn-green-c:    #086b30;
    --btn-glow:       rgba(26, 220, 110, 0.5);
    --text-soft:      rgba(200, 220, 255, 0.72);
}

@keyframes nebulaBreath {
    0%   { background-position: 0% 0%, 100% 100%, 50% 50%; }
    33%  { background-position: 100% 50%, 0% 50%, 100% 0%; }
    66%  { background-position: 50% 100%, 50% 0%, 0% 100%; }
    100% { background-position: 0% 0%, 100% 100%, 50% 50%; }
}

@keyframes goldPulse {
    0%, 100% { filter: drop-shadow(0 0 12px var(--gold-glow)); }
    50% { filter: drop-shadow(0 0 28px rgba(255,215,0,0.9)); }
}

@keyframes btnBreath {
    0%, 100% { box-shadow: 0 6px 28px var(--btn-glow); }
    50% { box-shadow: 0 10px 50px var(--btn-glow), 0 0 80px rgba(26,220,110,0.2); }
}

@keyframes menuEntrance {
    from { opacity: 0; transform: translateY(30px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
}

.menu {
    position: fixed;
    top: 0; left: 0;
    width: 100vw;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(10px, 4vh, 40px) 0;
    background-color: var(--void-deep);
    background-image:
        radial-gradient(ellipse 120% 80% at 15% 25%, #1a0540 0%, transparent 65%),
        radial-gradient(ellipse 100% 70% at 85% 75%, #001a3a 0%, transparent 60%),
        radial-gradient(ellipse 80%  90% at 50% 110%, #0d1f00 0%, transparent 55%),
        radial-gradient(ellipse 60%  60% at 72% 18%, #200030 0%, transparent 50%);
    background-size: 200% 200%, 180% 180%, 160% 160%, 140% 140%;
    animation: nebulaBreath 25s ease-in-out infinite;
    perspective: 900px;
}

.info {
    position: relative;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: clamp(10px, 3vh, 25px);
    width: min(92vw, 560px);
    margin: auto;
    background: linear-gradient(180deg, rgba(255,215,0,0.04) 0%, rgba(255,215,0,0) 30%), var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-top: 1px solid rgba(255,215,0,0.28);
    border-radius: 20px;
    padding: clamp(20px, 5vh, 45px) clamp(15px, 4vw, 40px);
    box-shadow: 0 20px 80px rgba(0,0,0,0.8);
    backdrop-filter: blur(24px) saturate(1.4);
    animation: menuEntrance 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.mainTitle {
    text-align: center;
    margin-bottom: 2px;
    width: 100%;
}

.txt {
    font-family: 'Fredoka One', 'Fredoka', cursive, sans-serif;
    font-size: clamp(1.8rem, 8vw, 4.2rem);
    font-weight: 900;
    line-height: 0.95;
    background: linear-gradient(175deg, #fff7cc, #ffe566, #ffd700, #d4a017, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: goldPulse 4s ease-in-out infinite;
}

.menuSubtitle {
    font-family: 'Fredoka', sans-serif;
    font-size: clamp(0.6rem, 1.5vw, 0.85rem);
    color: var(--text-soft);
    text-align: center;
    letter-spacing: clamp(0.08em, 1vw, 0.2em);
    text-transform: uppercase;
}

.awtsmoosBtn, .mitzvahBtn {
    font-family: 'Fredoka', sans-serif !important;
    font-size: clamp(0.8rem, 2.5vw, 1.05rem) !important;
    font-weight: 700 !important;
    padding: clamp(12px, 2.5vh, 16px) clamp(20px, 4vw, 40px) !important;
    border-radius: 60px !important;
    border: none !important;
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;
    background: linear-gradient(160deg, var(--btn-green-a) 0%, var(--btn-green-b) 45%, var(--btn-green-c) 100%) !important;
    color: #fff !important;
    animation: btnBreath 3s ease-in-out infinite;
    transition: transform 0.15s ease;
}

.awtsmoosBtn:hover, .mitzvahBtn:hover {
    transform: translateY(-3px) scale(1.02);
}

.loginHeader {
    position: fixed;
    top: clamp(8px, 2vw, 16px);
    right: clamp(8px, 2vw, 16px);
    z-index: 10000;
}

@media (max-width: 520px) {
    .info { padding: 25px 15px; width: 95vw; }
}

@media (max-height: 600px) {
    .menuSubtitle { display: none; }
    .txt { font-size: clamp(1.5rem, 8vh, 3rem); }
}
`;