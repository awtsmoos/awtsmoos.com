
/**
 * B"H
 */
import borderShadow from "../../resources/borderShadow.js";
import congratsStyle from "./congratsStyle.js";

var progressItemSize = 36;
var progressBarWidth = 300;
var maxProgressDetailsSize = 400;
var CONGRATS_BORDER = 1.6;

export default /*css*/`
    .shlichusAcceptBody {
        border-radius: 52px;
        box-shadow: inset 0 0 0 12px #4435B2;
        background: #2B2175;
        display: flex;
        padding: 52px 32px;
        flex-direction: column;
        align-items: center;
        gap: 40px;
        flex-shrink: 0;
    }

    .sa .details {
        color: #FFF; text-align: center; font-family: Fredoka One;
        font-size: 36px; font-weight: 500; letter-spacing: 0.96px;
        max-width:770px; text-shadow: ${borderShadow(CONGRATS_BORDER)}
    }

    .sa .shlichusName {
        color: #FFF; text-align: center; font-family: Fredoka;
        font-size: 45px; font-weight: 613; letter-spacing: 1.2px;
        text-shadow: ${borderShadow(CONGRATS_BORDER)}
    }
    .sa .mainTxt {
        align-self: stretch; color: #FFF; text-align: center;
        text-shadow: 0px 3.38px 0px #170F4F, ${borderShadow(CONGRATS_BORDER)};
        font-family: Fredoka; font-size: 48px; font-weight: 700; letter-spacing: 1.623px;
    }

    .shlichusDescriptionProgress { max-width: ${maxProgressDetailsSize}px; }
    .shlichusSidebar::-webkit-scrollbar { display:none; }

    .shlichusSidebar {
        left: 5px; display: flex; top: 60px; flex-direction: column;
        height: 600px; border-radius: 5%; overflow-y: scroll; padding: 4px;
    }
    .shlichusProgress:hover { cursor:pointer }
    .shlichusProgress .selected { background: rgba(200, 211, 180, 0.50); color:#000; }

    .infoIcon { width:60px; }

    .shlichusProgress {
        color: #FFF; text-align: center; font-family: 'Fredoka'; font-size: 32px;
        font-weight: 500; letter-spacing: 0.72px; border-radius: 12px;
        background: rgba(36, 21, 80, 0.50); display: inline-flex;
        padding: 12px 16px; flex-direction: column; justify-content: center;
        align-items: center; gap: 12px; backdrop-filter: blur(4px);
    }

    .gap20 { display: flex; justify-content: center; align-items: center; gap: 20px; }
    .shlichusProgress .iconAndNum { display:flex; justify-content:left; gap:20px; }
    .shlichusProgress .iconAndNum .icon { width: ${progressItemSize}px; }

    .shlichusProgress .iconAndNum .num {
        color: #FECB39; font-family: Fredoka; font-size: ${progressItemSize}px;
        font-weight: 500; letter-spacing: 0.72px;
    }

    .shlichusProgress .shlichusProgressInfo { display: flex; justify-content: left; gap:20px; }   

    .shlichusProgress .siProgress {
        display: flex; justify-content: left; gap: 10px;
        flex-shrink: 0; width: ${progressBarWidth}px;
    }

    .shlichusProgress .siProgress .frnt {
        width:40%; display: flex; justify-content: center; align-items: center;
        gap: 10px; flex-shrink: 0; height:${progressItemSize}px; position:absolute;
        border-radius: 50px; background: linear-gradient(270deg, #FFEE37 30%, #F78A3B 100%);
    }

    .shlichusProgress .siProgress .bck {
        position:absolute; height:${progressItemSize}px; width:${progressBarWidth}px;
        display: flex; justify-content: left; align-items: center; gap: 10px;
        flex-shrink: 0; border-radius: 50px; background: #241550;
        box-shadow: 0px 2px 0px 2px rgba(0, 0, 0, 0.10), 0px 0px 0px 2px #FFF;
    }

    ${congratsStyle}
`;
