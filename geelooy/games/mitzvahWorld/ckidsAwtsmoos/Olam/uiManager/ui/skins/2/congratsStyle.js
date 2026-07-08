
// B"H
import borderShadow from "../../resources/borderShadow.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
var congratsScreenWidth=532;
var CONGRATS_BORDER = 1.6;
var ribbonWidth = 147;
var ribbonHeight = 107;
var csPaddingX = 52;
var csPaddingY = 32;

export default /*css*/`
    .alertScreen {
        position: relative;
        display: flex;
        width: ${congratsScreenWidth}px;
        padding: ${csPaddingY}px ${csPaddingX}px;
        flex-direction: column;
        align-items: center;
        gap: 40px;
        border-radius: 52px;
        box-shadow: inset 0 0 0 12px #4435B2;
        background: #2B2175;
    }

    .csIllustration {
        position:relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top:52px;
        align-self: stretch;
    }

    .lightRays {
        width: 355px; height: 172px; transform: rotate(2.695deg);
        position: absolute; top: -44px;
    }
    
    .coinPile { width: 140px; height: 140px; z-index:5; }
    .csRibbonRight svg, .csRibbonLeft svg { width: 100%; }

    .csRibbonRight {
        width: ${ribbonWidth}px; height: ${ribbonHeight}px;
        transform: rotate(10.297deg); flex-shrink: 0; fill: #9E018F;
        position:absolute; left: ${(congratsScreenWidth) + ribbonWidth * 1/4}px;
        top: ${ribbonHeight/2}px; z-index:-1;
    }

    .csRibbonLeft {
        width: ${ribbonWidth}px; height:${ribbonHeight}px;
        transform: rotate(-10.297deg); flex-shrink: 0; fill: #9E018F;
        position:absolute; left:-${ribbonWidth/2}px;
        top: ${ribbonHeight/2}px; z-index:-1;
    }

    .csMidRib {
        position:absolute; width: ${congratsScreenWidth + csPaddingX * 2}px; height:${ribbonHeight};
    }
    .csMidRib svg { width:100%; }

    .csCongratsRibbon {
        width: ${congratsScreenWidth + csPaddingX * 2}px; height: 112px;
        flex-shrink: 0; fill: #CE01B9; position:relative;
    }

    .csAlertMessage {
        align-self: stretch; color: #FFF; text-align: center;
        font-family: Fredoka; font-size: 42px; font-style: normal;
        font-weight: 500; letter-spacing: 0.96px;
    }

    .csSuccessText {
        color: #FFF; fill:#FFF; text-align: center;
        text-shadow: 0px 3.38px 0px #5E0075, ${borderShadow(CONGRATS_BORDER)};
        font-family: Fredoka; font-size: 48px; font-style: normal;
        font-weight: 700; letter-spacing: 1.623px;
    }

    .timer { display: flex; padding: 12px 16px; align-items: center; gap: 12px; }
    .alertScreen .btns { display: flex; padding: 8px; align-items: flex-start; gap: 32px; }
`;
