
/**
 * B"H
 * Style for gima found at 
 * https://www.figma.com/file/QZERI89t767tpWJ3cJmls4/Mitzvah-world?node-id=3%3A2&mode=dev
 * 
 */

export default /*css*/`
:root {
    /* Define a base font-size. Change this to scale everything else. */
    --base-font-size: 75px;
    --stroke: 15px; /* Adjust this for border thickness */
}





.gameMenu {
    display: flex;
    justify-content: start;
    flex-direction: column;
    top: 0;
    padding: 20px;
    height: 100%;
    background-color: #333;
    position: absolute;
    z-index: 7;
    transition: all 0.5s ease;
}

.onscreen {
    opacity:100;
    left: 0px !important;
}
.offscreen {
    padding: 0px !important;
    left: -500px;
    opacity:0;
}

/*For main menu*/
.menu {
    overflow:hidden;
    background: var(
        --Gradiente-azul, 
        linear-gradient(
            180deg, 
            #23144F 0%, 
            #474FFF 100%
        )
    );
    width: 100%;
    height: 100%;
    position: absolute;
            left:0;
    top: 0;

    display: flex;
    align-items: center;
    justify-content: center;

}

.info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 90%; /* Set a maximum width here */
    
    
}

.mainTitle .lns {
    display:flex;
    flex-direction:column;
    align-items: center;
    text-align: center; /* For multi-line title texts */

    
}

.mainTitle .lns > div {
    margin-bottom:calc(var(--stroke) / 2)
}

.line {
    display: block;
    position: relative;
    
    text-align:center;
}

.borderWrap {
    display:flex;
    position:relative;
    
    overflow:visible;
   padding:0 calc(var(--stroke) * 4);
}

.txt, .borderTxt {
    
    position: absolute;
    display:block;
    font-family: Fredoka One;
    font-size: var(--base-font-size);
    font-weight: 700;
    letter-spacing: calc(var(--base-font-size) * 0.04);
    color: transparent;
    line-height: 1;
    padding:5 calc(var(--stroke) *1.5);
    -webkit-text-stroke-width:var(--stroke); /* Control stroke width */
    -webkit-text-stroke-color: transparent;
}

.mainTitle .lns .txt {
    z-index: 3; /* Ensures .txt is over .borderTxt */
    color: transparent; /* Setting color to transparent */
    -webkit-text-stroke-width: 0px;
}

.borderTxt {
    z-index: 2;
    position: relative;
    background: linear-gradient(180deg, #23144F 0%, #474FFF 100%);
    -webkit-background-clip: text;
    background-clip: text;

}






.mainTitle .lns  .line:first-child .txt {
    color: #FECB39;
}

.mainTitle .lns  .line:last-child .txt {
    color: #FFF;
    width: calc(var(--base-font-size) * 2.73);
    height: calc(var(--base-font-size) * 1.21);
    flex-shrink: 0;
}
    
    

.mitzvahBtn {
    margin-bottom: 25px;
    border-radius: 50px;
    border-bottom: 6px solid #3C9F00;
    background: #44C300;
    box-shadow: 0px 8px 0px 6px rgba(0, 0, 0, 0.10), 0px 0px 0px 8px #FECB39;
    display: inline-flex;
    padding: 8px 32px 14px 32px;
    justify-content: center;
    align-items: center;
    gap: 10px;
}



.mitzvahBtn .mitzvahBtnTxt {
    color: white;
    text-shadow: 0px 0px 1px rgba(0, 0, 0, 0.20);

    font-family: Fredoka One;
    font-size: 24px;
    font-style: normal;
    
    line-height: normal;
    letter-spacing: 1.12px;
    text-transform: uppercase;
}

.mitzvahBtn:active {
    border-bottom: 2px solid #1c3d08;
    background: #2c630e;
}

.svgHolder {
    pointer-events: none;
    position:absolute;
    transform:translate(8%,4%)
}

.rectangle {
    background: #FFF;
    filter: blur(5.5px);
    position: absolute;
    bottom: 0;
    pointer-events:none;
}



.errorScr {
    word-break: break-all;
    text-align: center;
    font-size: 30px;
    color: red;
    border: 1px solid black;
    position: absolute;
    white-space: pre-line;
    left: 50%;
    width: 50%;
    top: 50%;
    z-index: 5000;
    transform: translate( -50%, -50% );
}

.menuTop {
    background: rgba(36, 21, 80, 0.50);
    backdrop-filter: blur(4px);
    display: flex;
    width: 100%;
    height: 10px;
    padding: 12px 7px;
    align-items: center;
    gap: 28px;
    /* B"H: Fix Z-Index to be above everything else (EffectsOverlay is 2000) */
    position: absolute;
    z-index: 3000;
}

.menuTop .titleTxt {
    color: #FFF;
    font-family: Fredoka One;
    font-size: 1em;
    font-style: normal;
    font-weight: 700;
    line-height: 32px;
    letter-spacing: 1.28px;
}

.menuTop .titleTxt .mtz {
    color: #FECB39;

    font-family: Fredoka One;
    font-size: 1.2em;
    font-style: normal;
    font-weight: 700;
    line-height: 32px; /* 100% */
    letter-spacing: 1.28px;
}
`;
