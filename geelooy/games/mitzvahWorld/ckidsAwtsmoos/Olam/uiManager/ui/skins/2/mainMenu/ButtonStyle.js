
/**
 * @file ButtonStyle.js
 * @description
 * * Chapter 22: The Act of Choice (Bechirah)
 * A button is the physical gateway through which the soul's intent 
 * passes into the world of action. If the vessel is broken or off-center, 
 * the intent becomes scattered! 
 * * We have rebuilt the Mitzvah Buttons to be sturdy, beautiful, 
 * and perfectly balanced. No longer shall the text be small 
 * and adrift! It is now centered, bold, and wrapped in the Light.
 */

export default /*css*/`
    .mitzvahBtn {
        position: relative;
        background: #44C300; /* Deep Mitzvah Green, the color of growth */
        border: 6px solid #ffde40; /* Golden Boundary of Value */
        border-radius: 80px;
        /* Responsive padding and width scaling */
        padding: 0 !important; /* Managed by children centering */
        width: 100%;
        max-width: 550px;
        height: auto;
        min-height: 100px;
        box-sizing: border-box;
        cursor: pointer;
        
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-shadow: 
            0 10px 0 0 #3C9F00, /* The heavy base of the physical matter */
            0 15px 30px rgba(0,0,0,0.6);
        margin-bottom: 4vh;
        overflow: hidden;
    }

    .mitzvahBtn:hover {
        transform: scale(1.05) translateY(-8px);
        background: #4de100;
        box-shadow: 
            0 18px 0 0 #3C9F00,
            0 25px 50px rgba(0,255,100,0.3);
    }

    .mitzvahBtn:active {
        transform: scale(0.95) translateY(12px);
        box-shadow: 0 0px 0 0 #3C9F00;
    }

    .mitzvahBtnTxt {
        font-family: 'Fredoka One', cursive;
        /* B"H: Balanced text scaling. Large and legible. */
        font-size: clamp(18px, 3vw, 32px);
        color: #fff;
        text-transform: uppercase;
        letter-spacing: 2px;
        z-index: 2;
        text-align: center;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px 40px;
        box-sizing: border-box;
        /* Sharp stroke to keep it legible against the bright green */
        text-shadow: 3px 3px 0 #3C9F00;
        white-space: normal; /* Allow wrap for long world names */
        pointer-events: none;
    }

    .svgHolder {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        z-index: 1;
    }

    /* The shiny bubble inside the button - the Or Makif */
    .svgHolder svg {
        width: 100%; 
        height: 100%;
        opacity: 0.5;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    }

    @media (max-width: 768px) {
        .mitzvahBtn {
            min-height: 80px;
        }
        .mitzvahBtnTxt {
            padding: 10px 20px;
        }
    }
`;
