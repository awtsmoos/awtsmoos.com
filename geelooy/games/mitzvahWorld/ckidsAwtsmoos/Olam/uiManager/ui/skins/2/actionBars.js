
//B"H
var rightAmount = 7;
export default /*css*/`
        
        .awtsmoosAction {
            right: ${rightAmount}px !important;
            right: 7px;
            top: 50% !important;
            transform: translate(0, -50%) !important;
            transition: transform 0.4s ease-in-out;
            position: absolute !important;
            display: flex !important;
            flex-direction: column;
            align-items: flex-end;
            
            /* B"H: Visual reinforcement! */
            background: rgba(10, 10, 30, 0.7) !important;
            border-left: 2px solid var(--mitzvah-gold, #ffd700) !important;
            border-radius: 15px 0 0 15px;
            padding: 10px;
            
            /* Allow the overall container to let clicks through where it is empty */
            pointer-events: none !important; 
            z-index: 10000 !important;
            min-width: 80px;
            min-height: 100px;
        }

        .awtsmoosAction .slots .slotBtn {
        	width: 100%;
        	height: 100%;
            background-position: center;
        	background-size: contain;
        	background-repeat: no-repeat;
            transition:transform 1s ease;
            transform: scale(1);
        }
        
        .awtsmoosAction .slots {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .awtsmoosAction.minimized {
            transform: translate(calc(100% - 10px), -50%) !important;
        }

        /* B"H: Correcting the Veil of Conflict! 
           The global .onscreen class tries to force everything to the left. 
           We decree that the Action Bar remains steadfast on the Right.
        */
        .awtsmoosAction.onscreen {
            left: auto !important;
            right: ${rightAmount}px !important;
            opacity: 1 !important;
            pointer-events: none !important;
        }

        .awtsmoosAction.offscreen {
            left: auto !important;
            right: -100px !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }

        
        .slots .actionSlot.occupied:hover {
        	background: #00ffed;
        	cursor: pointer;
        }

        
        .slots .actionSlot.occupied:hover .innerSlot {
        	background: #79fff6;
        }

        .slots .actionSlot.occupied:hover .innerSlot .slotBtn {
            transform:scale(1.3) rotate(25deg);
        }


        .slots .actionSlot {
            width: 64px; /* Slot width */
            height: 64px; /* Slot height */
            background: radial-gradient(circle, #2a2a4e 0%, #0a0a1e 100%); /* Depth! */
            border: 2px solid #555; /* Slot border */
            border-radius: 12px; /* Smoother rounded corners */
            display: flex;
            justify-content: center;
            align-items: center;
            
            /* B"H: ABSOLUTELY ESSENTIAL! Bring slots to life, piercing the UI transparency veil! */
            pointer-events: auto !important; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.8), inset 0 0 10px rgba(0,0,0,0.5);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
            position: relative;
        }

        .slots .actionSlot:hover {
            border-color: #00f3ff;
            box-shadow: 0 0 20px rgba(0, 243, 255, 0.5), inset 0 0 10px rgba(0, 243, 255, 0.2);
            transform: scale(1.05);
        }

        .slots .actionSlot.occupied .innerSlot {
             background-color: rgba(255, 255, 255, 0.05);
        }


        .slots .innerSlot {
            width: 90%;
        	height: 90%;
            background-color: #777; /* Inner design background */
            border-radius: 4px; /* Inner design rounded corners */
        }

        .awtsmoosAction .minimize {
            width: 32px;
            height: 32px;
            background-color: #0d0434;
            border: 2px solid #00f3ff;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            position: absolute;
            left: -45px;
            top: 50%;
            transform: translateY(-50%);
            box-shadow: 0 0 15px rgba(0, 243, 255, 0.6);
            
            /* B"H: THE TIKKUN! Allowing this specific div (which acts as a button) to accept touches and clicks natively */
            pointer-events: auto !important;
            opacity: 1 !important; 
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            z-index: 10001;
        }

        .awtsmoosAction .minimize:hover {
            transform: translateY(-50%) scale(1.2);
            box-shadow: 0 0 25px rgba(0, 243, 255, 1);
            background-color: #23144F;
        }


        .minimize.opened::after {
            content: '\\25B6'; /* Right-pointing arrow */
            font-size: 14px;
            color: #00f3ff;
            text-shadow: 0 0 5px #fff;
        }

        .minimize.closed::after {
            content: '\\25C0'; /* Left-pointing arrow */
            font-size: 14px;
            color: #00f3ff;
            text-shadow: 0 0 5px #fff;
        }

    .awtsmoos.tooltip {
        background: black;
        color: #00ff00;
        border: 1px solid white;
        border-radius: 5px;
        padding:10px;
        pointer-events: none;
        position: fixed; 
        z-index: 9999; 
        white-space: nowrap; 
        transform-origin: top left;
        box-shadow: 0 0 10px rgba(0,0,0,0.8);
    }

    .awtsmoos.tooltip .header {
        font-weight: bold;
    }
`;
