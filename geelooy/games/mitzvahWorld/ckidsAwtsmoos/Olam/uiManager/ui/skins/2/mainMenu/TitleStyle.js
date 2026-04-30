
/**
 * @file TitleStyle.js
 * @description
 * 👑 THE CARVING OF THE NAME 👑
 * 
 * "And He called the name of the place Mitzvah World."
 * The text itself is a living golden gradient. We use the 'clamp' decree 
 * to ensure the letters perfectly scale within the boundaries of the firmament.
 * The 'borderTxt' acts as the Gevurah (Judgment/Constraint),
 * providing a thick, dark boundary that allows the light of the 'txt' to shine.
 */

export default /*css*/`
    .mainTitle {
        text-align: center;
        margin-bottom: 25px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        user-select: none;
    }

    .lns {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0px; 
        line-height: 0.9;
    }

    .line {
        position: relative;
        display: block;
    }

    .borderWrap {
        position: relative;
        display: inline-block;
    }

    .txt {
        font-family: 'Fredoka One', cursive, sans-serif;
        font-size: clamp(3.5rem, 12vw, 7.5rem);
        font-weight: 900;
        letter-spacing: 0.05em;
        display: block;

        /* THE HOLY GOLD GRADIENT */
        background: linear-gradient(
            175deg,
            #fff7cc 0%,
            #ffe566 20%,
            #ffd700 40%,
            #d4a017 60%,
            #ffd700 80%,
            #fffde0 100%
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;

        animation: goldPulseTitle 5s ease-in-out infinite;
        z-index: 2;
        position: relative;
    }

    .borderTxt {
        position: absolute;
        inset: 0;
        font-family: 'Fredoka One', cursive, sans-serif;
        font-size: clamp(3.5rem, 12vw, 7.5rem);
        font-weight: 900;
        letter-spacing: 0.05em;
        color: transparent;
        /* The dark Gevurah boundary */
        -webkit-text-stroke: clamp(4px, 1.5vw, 10px) rgba(0, 0, 0, 0.85);
        z-index: 1;
        pointer-events: none;
        filter: drop-shadow(0px 10px 15px rgba(0,0,0,0.9));
    }

    @keyframes goldPulseTitle {
        0%, 100% { filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.4)); }
        50% { filter: drop-shadow(0 0 35px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 70px rgba(255, 140, 0, 0.4)); }
    }

    /* Subtitle Tagline */
    .menuSubtitle {
        font-family: 'Fredoka', sans-serif;
        font-size: clamp(0.9rem, 2vw, 1.2rem);
        color: rgba(200, 220, 255, 0.8);
        text-align: center;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        font-weight: bold;
        margin-top: -10px;
        margin-bottom: 15px;
        animation: subtitleReveal 1.2s ease 0.5s both;
    }

    @keyframes subtitleReveal {
        from { opacity: 0; transform: translateY(15px); letter-spacing: 0.4em; }
        to   { opacity: 1; transform: translateY(0); letter-spacing: 0.2em; }
    }

    /* Clean up any weird duplicated div artifacts */
    .line > div:not(.borderWrap), 
    .mainTitle > div:not(.lns) {
        display: none !important;
    }
`;
