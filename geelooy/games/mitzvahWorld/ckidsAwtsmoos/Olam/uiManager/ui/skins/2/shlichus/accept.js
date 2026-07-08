
// B"H
import borderShadow from "../../../resources/borderShadow.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

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
`;
