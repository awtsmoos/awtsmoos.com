
/**
 * @file TitleStyle.js
 * @description
 * * Chapter 11: The Carving of the Name
 * "And He called the name of the place Mitzvah World."
 * In the beginning, the name was formless, floating in the CSS void.
 * But we have spoken the words of alignment! 
 * We use the 'clamp' decree to ensure the letters are never too small
 * to be seen, nor too large to fit within the boundaries of the firmament.
 * * The 'borderTxt' acts as the Gevurah (Judgment/Constraint),
 * providing a thick, dark boundary that allows the white light 
 * of the 'txt' to shine with unmistakable clarity.
 */

export default /*css*/`
    .mainTitle {
        text-align: center;
        margin-top: 5vh;
        margin-bottom: 8vh;
        user-select: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        position: relative;
        z-index: 10;
    }

    .lns {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        /* Prevents the 'clashing of worlds' (overlapping lines) */
        gap: 2vh; 
    }

    .line {
        position: relative;
        display: block;
        width: auto;
    }

    .borderWrap {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .txt {
        font-family: 'Fredoka One', cursive;
        /* B"H: The Breath of Scaling. Min: 50px, Ideal: 15vw, Max: 180px */
        font-size: clamp(50px, 15vw, 180px);
        color: #fff;
        line-height: 1;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin: 0;
        padding: 0;
        /* Divine Radiance pulsates from the center */
        text-shadow: 
            0 5px 15px rgba(0,0,0,0.8),
            0 0 20px rgba(255,255,255,0.3);
        position: relative;
        z-index: 2;
    }

    .line:first-child .txt {
        color: #ffde40; /* The Mitzvah Gold, the light of the Sun */
        text-shadow: 
            0 5px 15px rgba(0,0,0,0.8),
            0 0 30px rgba(254, 203, 57, 0.5);
    }

    /* B"H: Eliminating the Duality (Hidden text below lines) */
    /* This targets the extra div artifacts seen in the screenshot */
    .line > div:not(.borderWrap), 
    .mainTitle > div:not(.lns) {
        display: none !important;
        visibility: hidden !important;
    }

    .borderTxt {
        position: absolute;
        top: 0;
        left: 0;
        color: transparent;
        /* The Gevurah (Boundary) of the letter, thick and solid */
        -webkit-text-stroke: 2.5vmin #000;
        z-index: 1;
        opacity: 0.9;
        pointer-events: none;
        width: 100%;
        text-align: center;
        font-family: 'Fredoka One', cursive;
        font-size: clamp(50px, 15vw, 180px);
        text-transform: uppercase;
        line-height: 1;
    }
`;
