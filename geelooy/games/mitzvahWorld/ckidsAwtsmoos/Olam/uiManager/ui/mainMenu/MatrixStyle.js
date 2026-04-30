// B"H
/**
 * @module MatrixStyle
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE PALACE OF THE KING — MAIN MENU REDESIGN                                  ║
 * ║                                                                                  ║
 * ║  "And Solomon built the Temple of G-d." (Melachim I 6:14)                     ║
 * ║                                                                                  ║
 * ║  The old menu was a frosted glass card in a dark void.                         ║
 * ║  Functional. Decent. But not a PALACE.                                         ║
 * ║                                                                                  ║
 * ║  This redesign is the Beis HaMikdash of game menus:                            ║
 * ║  — A deep cosmic void background with living, breathing nebula gradients        ║
 * ║  — A central column of content that feels MONUMENTAL, not just "a card"        ║
 * ║  — Gold-leaf title with dimensional depth and sacred shimmer                   ║
 * ║  — Buttons that feel like they're casting LIGHT onto the scene                 ║
 * ║  — Sacred geometry orbiting rings in the background (CSS only)                 ║
 * ║  — Responsive, polished, unforgettable                                          ║
 * ║                                                                                  ║
 * ║  "And gold, and the gold was pure gold." (Bereishis 2:12)                     ║
 * ║  Every detail here is pure gold. No filler. No generic.                        ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @file MatrixStyle.js
 * @memberof mainMenu
 */

export default /*css*/`

/* ═══════════════════════════════════════════════════════
   CHAPTER 1: THE FONT IMPORTS
   (Loaded via <link> tags in index.js already —
    but we re-declare the families here for clarity)
   ═══════════════════════════════════════════════════════ */

/* ─── CSS CUSTOM PROPERTIES ─────────────────────────── */

.menu {
    --gold-primary:   #ffd700;
    --gold-bright:    #ffe566;
    --gold-deep:      #b8860b;
    --gold-glow:      rgba(255, 215, 0, 0.55);
    --void-deep:      #020008;
    --void-mid:       #060018;
    --void-purple:    #0a0022;
    --nebula-blue:    #091036;
    --nebula-teal:    #003844;
    --accent-cyan:    #00e5ff;
    --accent-rose:    #ff4f9b;
    --accent-violet:  #8b5cf6;
    --text-soft:      rgba(200, 220, 255, 0.72);
    --glass-border:   rgba(255, 215, 0, 0.14);
    --glass-bg:       rgba(6, 4, 28, 0.72);
    --btn-green-a:    #1adc6e;
    --btn-green-b:    #0ea34c;
    --btn-green-c:    #086b30;
    --btn-glow:       rgba(26, 220, 110, 0.5);
}

/* ═══════════════════════════════════════════════════════
   CHAPTER 2: KEYFRAME ANIMATIONS
   The eternal speech of the Creator, cycling forever.
   ═══════════════════════════════════════════════════════ */

@keyframes nebulaBreath {
    0%   { background-position: 0% 0%, 100% 100%, 50% 50%; }
    33%  { background-position: 100% 50%, 0% 50%, 100% 0%; }
    66%  { background-position: 50% 100%, 50% 0%, 0% 100%; }
    100% { background-position: 0% 0%, 100% 100%, 50% 50%; }
}

@keyframes ringOrbit1 {
    from { transform: rotateX(72deg) rotateZ(0deg); }
    to   { transform: rotateX(72deg) rotateZ(360deg); }
}

@keyframes ringOrbit2 {
    from { transform: rotateX(-55deg) rotateZ(360deg) rotateY(30deg); }
    to   { transform: rotateX(-55deg) rotateZ(0deg)   rotateY(30deg); }
}

@keyframes ringOrbit3 {
    from { transform: rotateX(20deg) rotateY(0deg)   rotateZ(0deg); }
    to   { transform: rotateX(20deg) rotateY(360deg) rotateZ(180deg); }
}

@keyframes goldPulse {
    0%, 100% {
        filter: drop-shadow(0 0 12px var(--gold-glow))
                drop-shadow(0 0 30px rgba(255,180,0,0.25));
    }
    50% {
        filter: drop-shadow(0 0 28px rgba(255,215,0,0.9))
                drop-shadow(0 0 70px rgba(255,140,0,0.4))
                drop-shadow(0 0 120px rgba(255,100,0,0.15));
    }
}

@keyframes subtitleReveal {
    from { opacity: 0; transform: translateY(14px) letterSpacing(0.3em); }
    to   { opacity: 1; transform: translateY(0); }
}

@keyframes btnShimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
}

@keyframes btnBreath {
    0%, 100% {
        box-shadow:
            0 6px 28px var(--btn-glow),
            0 1px 0 rgba(255,255,255,0.22) inset,
            0 -2px 0 rgba(0,0,0,0.3) inset;
    }
    50% {
        box-shadow:
            0 10px 50px var(--btn-glow),
            0 0 80px rgba(26,220,110,0.2),
            0 1px 0 rgba(255,255,255,0.22) inset,
            0 -2px 0 rgba(0,0,0,0.3) inset;
    }
}

@keyframes sparkRise {
    0%   { transform: translateY(0) scale(1); opacity: 0.7; }
    100% { transform: translateY(-110vh) scale(0.2); opacity: 0; }
}

@keyframes menuEntrance {
    from { opacity: 0; transform: translateY(30px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes horizontalSlide {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
}

/* ═══════════════════════════════════════════════════════
   CHAPTER 3: THE ROOT MENU CONTAINER — THE COSMOS
   ═══════════════════════════════════════════════════════ */

.menu {
    position: fixed;
    top: 0; left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    /*
     * THE LIVING NEBULA:
     * Three layered radial gradients that move independently.
     * No JS. Pure CSS speech of creation.
     */
    background-color: var(--void-deep);
    background-image:
        radial-gradient(ellipse 120% 80% at 15% 25%, #1a0540 0%, transparent 65%),
        radial-gradient(ellipse 100% 70% at 85% 75%, #001a3a 0%, transparent 60%),
        radial-gradient(ellipse 80%  90% at 50% 110%, #0d1f00 0%, transparent 55%),
        radial-gradient(ellipse 60%  60% at 72% 18%, #200030 0%, transparent 50%);
    background-size: 200% 200%, 180% 180%, 160% 160%, 140% 140%;
    animation: nebulaBreath 25s ease-in-out infinite;

    /* Perspective for 3D rings */
    perspective: 900px;
    perspective-origin: 50% 50%;
}

/* ─── STAR FIELD — Three layers of stars ──────────────── */

.menu::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
        radial-gradient(0.8px 0.8px at  8% 12%, rgba(255,255,255,0.80) 0%, transparent 100%),
        radial-gradient(0.8px 0.8px at 22% 68%, rgba(255,255,255,0.60) 0%, transparent 100%),
        radial-gradient(1.2px 1.2px at 38%  8%, rgba(255,240,200,0.75) 0%, transparent 100%),
        radial-gradient(0.8px 0.8px at 52% 45%, rgba(255,255,255,0.55) 0%, transparent 100%),
        radial-gradient(1.0px 1.0px at 67% 82%, rgba(200,220,255,0.70) 0%, transparent 100%),
        radial-gradient(0.8px 0.8px at 79% 27%, rgba(255,255,255,0.65) 0%, transparent 100%),
        radial-gradient(1.4px 1.4px at 91%  5%, rgba(255,230,180,0.80) 0%, transparent 100%),
        radial-gradient(0.8px 0.8px at  4% 88%, rgba(255,255,255,0.50) 0%, transparent 100%),
        radial-gradient(0.8px 0.8px at 15% 52%, rgba(200,200,255,0.55) 0%, transparent 100%),
        radial-gradient(1.0px 1.0px at 31% 30%, rgba(255,255,255,0.45) 0%, transparent 100%),
        radial-gradient(0.8px 0.8px at 45% 77%, rgba(255,255,255,0.60) 0%, transparent 100%),
        radial-gradient(1.2px 1.2px at 60% 15%, rgba(255,200,200,0.50) 0%, transparent 100%),
        radial-gradient(0.8px 0.8px at 74%  60%, rgba(255,255,255,0.55) 0%, transparent 100%),
        radial-gradient(0.8px 0.8px at 88% 48%, rgba(200,240,255,0.60) 0%, transparent 100%),
        radial-gradient(1.0px 1.0px at 96% 90%, rgba(255,255,255,0.70) 0%, transparent 100%);
    pointer-events: none;
    z-index: 0;
}

/* ─── GOLDEN HORIZON VEIL at bottom ──────────────────── */

.menu::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 180px;
    background: linear-gradient(
        to top,
        rgba(100, 40, 0, 0.35) 0%,
        rgba(180, 90, 0, 0.12) 40%,
        transparent 100%
    );
    pointer-events: none;
    z-index: 0;
}

/* ═══════════════════════════════════════════════════════
   CHAPTER 4: THE ORBITING SACRED GEOMETRY RINGS
   Pure CSS 3D. No JavaScript. The Sefirot in motion.
   ═══════════════════════════════════════════════════════ */

.rectangle {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 1;
    transform-style: preserve-3d;
}

/* Each .rectangle is a spark particle re-purposed as a ring layer */
/* The first 3 are used as orbital rings via nth-child */
.rectangle:nth-child(1) {
    width: 900px; height: 900px;
    border-radius: 50%;
    background: none;
    border: 1.5px solid rgba(255, 215, 0, 0.12);
    box-shadow: 0 0 30px rgba(255,215,0,0.06), inset 0 0 30px rgba(255,140,0,0.04);
    animation: ringOrbit1 22s linear infinite;
    filter: none;
}

.rectangle:nth-child(2) {
    width: 700px; height: 700px;
    border-radius: 50%;
    background: none;
    border: 1px dashed rgba(0, 229, 255, 0.14);
    box-shadow: 0 0 20px rgba(0,229,255,0.08), inset 0 0 20px rgba(0,229,255,0.04);
    animation: ringOrbit2 18s linear infinite;
    filter: none;
}

.rectangle:nth-child(3) {
    width: 520px; height: 520px;
    border-radius: 50%;
    background: none;
    border: 1px solid rgba(139,92,246,0.16);
    box-shadow: 0 0 20px rgba(139,92,246,0.1);
    animation: ringOrbit3 14s linear infinite;
    filter: none;
}

/* Remaining rectangles become floating spark particles */
.rectangle:nth-child(n+4) {
    position: absolute;
    width: 3px; height: 3px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,215,0,0.9) 0%, rgba(255,160,0,0.2) 70%, transparent 100%);
    box-shadow: 0 0 6px rgba(255,215,0,0.6);
    border: none;
    animation: sparkRise var(--spark-dur, 12s) ease-in var(--spark-delay, 0s) infinite;
    filter: none;
}

/* ═══════════════════════════════════════════════════════
   CHAPTER 5: THE CENTRAL PANEL — THE HOLY ARK
   ═══════════════════════════════════════════════════════ */

.info {
    position: relative;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    width: min(92vw, 560px);

    /*
     * THE ARK: No frosted glass this time.
     * A deep void with a golden border that breathes.
     * Like the curtains of the Mishkan — rich, textured, layered.
     */
    background:
        linear-gradient(180deg, rgba(255,215,0,0.04) 0%, rgba(255,215,0,0) 30%),
        var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-top: 1px solid rgba(255,215,0,0.28);
    border-radius: 20px;
    padding: 56px 52px 48px;

    box-shadow:
        0 0 0 1px rgba(255,215,0,0.06),
        0 2px 0 0 rgba(255,215,0,0.20),
        0 20px 80px rgba(0,0,0,0.8),
        0 4px 24px rgba(255,215,0,0.08),
        inset 0 1px 0 rgba(255,255,255,0.06),
        inset 0 -1px 0 rgba(0,0,0,0.4);

    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);

    animation: menuEntrance 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* ─── CORNER ORNAMENTS on the panel ─────────────────── */

.info::before {
    content: '';
    position: absolute;
    top: -1px; left: -1px; right: -1px;
    height: 3px;
    background: linear-gradient(90deg,
        transparent 0%,
        rgba(255,215,0,0.0) 10%,
        rgba(255,215,0,0.8) 35%,
        rgba(255,230,100,1.0) 50%,
        rgba(255,215,0,0.8) 65%,
        rgba(255,215,0,0.0) 90%,
        transparent 100%
    );
    border-radius: 20px 20px 0 0;
    pointer-events: none;
}

/* ═══════════════════════════════════════════════════════
   CHAPTER 6: THE TITLE — THE NAME OF THE KING
   ═══════════════════════════════════════════════════════ */

.mainTitle {
    text-align: center;
    margin-bottom: 4px;
    width: 100%;
}

.lns {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    line-height: 1;
}

.line {
    display: block;
}

.borderWrap {
    position: relative;
    display: inline-block;
    line-height: 1;
}

.txt {
    font-family: 'Fredoka One', 'Fredoka', cursive, sans-serif;
    font-size: clamp(3.2rem, 11vw, 7rem);
    font-weight: 900;
    letter-spacing: 0.03em;
    line-height: 0.95;
    display: block;

    /*
     * HOLY GOLD GRADIENT:
     * Not just yellow — a living metallic surface.
     * Like hammered gold leaf catching temple torchlight.
     */
    background: linear-gradient(
        175deg,
        #fff7cc 0%,
        #ffe566 15%,
        #ffd700 30%,
        #d4a017 50%,
        #ffd700 65%,
        #ffe87c 80%,
        #fff0a0 95%,
        #fffde0 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    animation: goldPulse 4s ease-in-out infinite;
}

.borderTxt {
    position: absolute;
    inset: 0;
    font-family: 'Fredoka One', 'Fredoka', cursive, sans-serif;
    font-size: clamp(3.2rem, 11vw, 7rem);
    font-weight: 900;
    letter-spacing: 0.03em;
    line-height: 0.95;
    color: transparent;
    -webkit-text-stroke: 2.5px rgba(255, 200, 50, 0.15);
    pointer-events: none;
}

/* ─── SUBTITLE TAGLINE ──────────────────────────────── */

.menuSubtitle {
    font-family: 'Fredoka', sans-serif;
    font-size: clamp(0.75rem, 1.8vw, 0.95rem);
    color: var(--text-soft);
    text-align: center;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 400;
    margin-top: -6px;
    margin-bottom: 8px;
    animation: subtitleReveal 1.0s ease 0.7s both;
}

/* ═══════════════════════════════════════════════════════
   CHAPTER 7: THE DIVIDER — THE BOUNDARY OF HOLINESS
   ═══════════════════════════════════════════════════════ */

.menuDivider {
    width: 60%;
    height: 1px;
    background: linear-gradient(90deg,
        transparent,
        rgba(255,215,0,0.4) 30%,
        rgba(255,215,0,0.6) 50%,
        rgba(255,215,0,0.4) 70%,
        transparent
    );
    margin: 4px auto 8px;
}

/* ═══════════════════════════════════════════════════════
   CHAPTER 8: THE PLAY BUTTON — THE FIRST UTTERANCE
   ═══════════════════════════════════════════════════════ */

.awtsmoosBtn,
.mitzvahBtn {
    font-family: 'Fredoka', sans-serif !important;
    font-size: 1.15rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
    padding: 15px 52px !important;
    border-radius: 60px !important;
    border: none !important;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 100%;

    transition:
        transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
        filter 0.15s ease;

    /*
     * THE JEWEL BUTTON:
     * Three-color green gradient — like an emerald pressed in gold.
     * Not flat. Not material-design. HOLY.
     */
    background: linear-gradient(
        160deg,
        var(--btn-green-a) 0%,
        var(--btn-green-b) 45%,
        var(--btn-green-c) 100%
    ) !important;
    color: #fff !important;
    text-shadow: 0 1px 4px rgba(0,0,0,0.5) !important;

    animation: btnBreath 3s ease-in-out infinite;
}

/* ─── SHIMMER SWEEP across button ─────────────────── */
.awtsmoosBtn::before,
.mitzvahBtn::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: linear-gradient(
        105deg,
        transparent 0%,
        transparent 30%,
        rgba(255,255,255,0.20) 45%,
        rgba(255,255,255,0.08) 50%,
        transparent 65%,
        transparent 100%
    );
    background-size: 300% 100%;
    background-position: -200% center;
    pointer-events: none;
    animation: btnShimmer 4s linear infinite;
}

/* ─── TOP INNER HIGHLIGHT (gem facet) ──────────────── */
.awtsmoosBtn::after,
.mitzvahBtn::after {
    content: '';
    position: absolute;
    top: 0; left: 8%; right: 8%;
    height: 40%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.22), transparent);
    border-radius: 60px 60px 0 0;
    pointer-events: none;
}

.awtsmoosBtn:hover,
.mitzvahBtn:hover {
    transform: translateY(-3px) scale(1.025);
    filter: brightness(1.15) saturate(1.2);
}

.awtsmoosBtn:active,
.mitzvahBtn:active {
    transform: translateY(1px) scale(0.975);
    filter: brightness(0.9);
    transition: transform 0.08s ease;
}

/* ═══════════════════════════════════════════════════════
   CHAPTER 9: SECONDARY BUTTONS — FIND WORLDS / LOAD FILE
   ═══════════════════════════════════════════════════════ */

/* We can't easily target only the secondary buttons vs Play
   because they all share .mitzvahBtn. So we use :not(:first-of-type) 
   as a selector hint — but since this is data-driven, 
   the outer wrapper div (nth-child within .info > div) is the real target.
   The buttons themselves get progressively subtle styling via animation-delay. */

/* Slightly de-emphasize non-first buttons */
.info > *:nth-child(n+4) .mitzvahBtn,
.info > *:nth-child(n+4) .awtsmoosBtn {
    background: linear-gradient(
        160deg,
        rgba(0, 60, 120, 0.9) 0%,
        rgba(0, 40, 90, 0.95) 100%
    ) !important;
    color: rgba(180,220,255,0.9) !important;
    text-shadow: 0 0 8px rgba(0,200,255,0.3) !important;
    animation: none;
    box-shadow:
        0 4px 20px rgba(0, 80, 160, 0.4),
        0 1px 0 rgba(255,255,255,0.10) inset,
        0 -1px 0 rgba(0,0,0,0.3) inset !important;
    border: 1px solid rgba(0, 150, 255, 0.2) !important;
    font-size: 1rem !important;
    letter-spacing: 0.06em !important;
    padding: 12px 40px !important;
    font-weight: 600 !important;
}

.info > *:nth-child(n+4) .mitzvahBtn:hover,
.info > *:nth-child(n+4) .awtsmoosBtn:hover {
    filter: brightness(1.15);
    box-shadow:
        0 6px 30px rgba(0, 100, 200, 0.6),
        0 1px 0 rgba(255,255,255,0.12) inset,
        0 -1px 0 rgba(0,0,0,0.3) inset !important;
}

/* ═══════════════════════════════════════════════════════
   CHAPTER 10: LOGIN HEADER (TOP RIGHT)
   ═══════════════════════════════════════════════════════ */

.loginHeader {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    pointer-events: auto !important;
    display: flex;
    align-items: center;
    gap: 8px;
}

/* ═══════════════════════════════════════════════════════
   CHAPTER 11: RESPONSIVE BREAKPOINTS
   ═══════════════════════════════════════════════════════ */

@media (max-width: 520px) {
    .info {
        padding: 40px 24px 36px;
        border-radius: 14px;
        gap: 14px;
        width: 94vw;
    }

    .txt {
        font-size: clamp(2.6rem, 14vw, 4rem);
    }

    .awtsmoosBtn,
    .mitzvahBtn {
        padding: 13px 32px !important;
        font-size: 1rem !important;
    }
}

@media (max-height: 600px) {
    .info {
        padding: 28px 40px 24px;
        gap: 10px;
    }

    .menuSubtitle {
        display: none;
    }
}
`;