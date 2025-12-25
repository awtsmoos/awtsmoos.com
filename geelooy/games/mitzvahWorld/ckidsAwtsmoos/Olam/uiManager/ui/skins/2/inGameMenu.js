// B"H
/**
 * B"H
 */

export default /*css*/`

/**minimap */
    .mapParent { top:15px; right:15px; position:absolute; display:none; }
    .rightBtns { float:right; }
    .fullScreenBtn { background: white; }
    .fullScreenBtn:hover { cursor:pointer; background: rgb(244,244,244) }
    .leftBtns { float:left; }
    .biggerMap { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); right: unset !important; width: 770px !important; height: 770px !important; }
    .mapAvBasic { width:100%; height:100%; }
    .mapParent .overlaysOfMap { top: 0px; left: 0px; width: 100%; display: block; height: 100%; position: absolute; }
    .invisible { visibility: hidden; }
    .centered { position: absolute; left: 50% !important; top: 50% !important; }

    .mapLabel { pointer-events:none; position: absolute; left: 0px; white-space: pre-wrap; width: 100px; top: 0px; padding: 15px; background: black; border: 1px solid white; color: white; }
    .overlayItem { position: absolute; top: 0px; z-index:50; width:25px; height:25px; left: 0px; }
    .overlayItem:hover { cursor: pointer }

    .mapParent .button { padding: 12px 24px; font-size: 26px; font-family: 'Arial', sans-serif; text-align: center; color: white; background-color: #007bff; border: none; border-radius: 5px; cursor: pointer; outline: none; transition: background-color 0.3s ease-in-out, box-shadow 0.2s ease-in-out, transform 0.1s; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); user-select: none; }
    .mapParent .button:hover, .mapParent .button:focus { background-color: #0056b3; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); }
    .mapParent .button:active { transform: translateY(2px); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); }
    .mapParent .button:disabled { background-color: #ccc; color: #666; cursor: not-allowed; box-shadow: none; }
    .mapRaw { position: relative; }
    .map { width: inherit; height: inherit; overflow: hidden; border: 2px solid black; z-index: 5; }
    .mapControls { width: inherit; position: relative; z-index: 8; }
    .filled { width: 100%; height: 100%; }
	.allInclusiveParent { position:absolute; left:0;top:0; width:100%;height:100%; display:flex; justify-content:center; align-items:center; pointer-events:none; }
    .menu { color:white; background: linear-gradient(180deg, #23144F 0%, #474FFF 100%) }
    .menu button { z-index:4; }
    .menuBtn:hover { cursor: pointer }
    .menuBtnRect { z-index:3; stroke:#fff; fill:#fff; fill-opacity:0; stroke-opacity:0; }
    .gameUi { overflow: visible; width:100%; height:100%; }
    .menuBtn { background:none; }
    .menuTop .titleTxt { color: #FFF; font-family: Fredoka One; font-size: 1em; font-style: normal; font-weight: 700; line-height: 32px; letter-spacing: 1.28px; }
    .menuTop .titleTxt .mtz { color: #FECB39; font-family: Fredoka One; font-size: 1.2em; font-style: normal; font-weight: 700; line-height: 32px; letter-spacing: 1.28px; }
    .menuTop { background: rgba(36, 21, 80, 0.50); backdrop-filter: blur(4px); display: flex; width: 100%; height:10px; padding: 12px 7px; align-items: center; gap: 28px; position: absolute; z-index: 3000; }
    .menuItm { margin:0; text-align:center; position:absolute; width:80%; height:80%; top:50%; left:50%; transform: translate(-50%,-50%); opacity:95%; z-index:4; transition: 0.4s all ease-in-out; }
    .menu .info { position:absolute; top:50%; text-align: center; left:50%; transform: translate(-50%,-50%); }

    /* B"H: Sefirotic Block Selector Menu */
    .blockSelected {
        position: absolute;
        left: 50%;
        top: 50%;
        display: flex;
        gap: 20px;
        transform: translate(-50%, -50%);
        pointer-events: auto;
    }
    .blockSelected > div {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: 'Fredoka One', cursive;
        font-size: 16px;
        background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), rgba(0,0,0,0.8));
        color: white;
        border: 2px solid #4cc9f0;
        box-shadow: 0 0 15px #4cc9f0;
        cursor: pointer;
        transition: all 0.3s;
        text-transform: uppercase;
    }
    .blockSelected > div:hover {
        transform: scale(1.2) rotate(15deg);
        background: #4cc9f0;
        color: black;
        box-shadow: 0 0 30px #4cc9f0;
    }
    .blockSelected > div.Delete { border-color: #ff4757; box-shadow: 0 0 15px #ff4757; }
    .blockSelected > div.Delete:hover { background: #ff4757; box-shadow: 0 0 30px #ff4757; }
    .blockSelected > div.Grab { border-color: #ffd700; box-shadow: 0 0 15px #ffd700; }
    .blockSelected > div.Grab:hover { background: #ffd700; box-shadow: 0 0 30px #ffd700; }
`;