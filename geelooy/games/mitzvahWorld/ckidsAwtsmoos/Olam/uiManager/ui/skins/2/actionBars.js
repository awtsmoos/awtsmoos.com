
//B"H
/**
 * @file actionBars.js
 * @description
 * B"H - THE RIGHT HAND OF ACTION
 * 
 * The Action Bar lives on the RIGHT side of the screen,
 * a vertical column of tools anchored to the edge of perception.
 * Below the canvas sits a thin golden status strip — the
 * "bottom bar" — which provides XP, health, and quick info.
 * 
 * Glassmorphism + Gold accents = premium aesthetic.
 */
export default /*css*/`
        
        /* ═══════════════════════════════════════════ */
        /* B"H: RIGHT-SIDE VERTICAL ACTION BAR        */
        /* ═══════════════════════════════════════════ */
        .awtsmoosAction {
            right: 10px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: absolute !important;
            display: flex !important;
            flex-direction: column;
            align-items: center;
            
            background: rgba(10, 10, 30, 0.65) !important;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 222, 64, 0.25) !important;
            border-left: 2px solid var(--mitzvah-gold, #ffd700) !important;
            border-radius: 16px 0 0 16px;
            padding: 14px 10px;
            
            pointer-events: none !important; 
            z-index: 10000 !important;
            min-width: 74px;
            box-shadow: -4px 0 20px rgba(0,0,0,0.4), 0 0 15px rgba(255, 222, 64, 0.08);
        }

        .awtsmoosAction .slots .slotBtn {
        	width: 100%;
        	height: 100%;
            background-position: center;
        	background-size: contain;
        	background-repeat: no-repeat;
            transition: transform 0.25s ease;
            transform: scale(1);
        }
        
        .awtsmoosAction .slots {
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none !important;
        }

        .awtsmoosAction.minimized {
            transform: translate(calc(100% - 12px), -50%) !important;
        }

        .awtsmoosAction.onscreen {
            left: auto !important;
            right: 10px !important;
            opacity: 1 !important;
            pointer-events: none !important;
        }

        .awtsmoosAction.offscreen {
            left: auto !important;
            right: -120px !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }

        /* ═══════════════════════════════════════════ */
        /* B"H: INDIVIDUAL ACTION SLOTS               */
        /* ═══════════════════════════════════════════ */
        .slots .actionSlot {
            width: 56px;
            height: 56px;
            background: radial-gradient(circle at center, #2a2a4e 0%, #0a0a1e 100%);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            
            pointer-events: auto !important; 
            box-shadow: 0 3px 10px rgba(0,0,0,0.5), inset 0 0 8px rgba(0,0,0,0.3);
            transition: all 0.25s ease;
            overflow: hidden;
            position: relative;
        }

        .slots .actionSlot:hover {
            border-color: var(--mitzvah-gold, #ffde40);
            box-shadow: 0 0 15px rgba(255, 222, 64, 0.35), inset 0 0 8px rgba(255, 222, 64, 0.1);
            transform: scale(1.08);
            background: radial-gradient(circle at center, #3d3d6d 0%, #0a0a1e 100%);
        }

        .slots .actionSlot.occupied:hover .slotBtn {
            transform: scale(1.2) rotate(15deg);
        }
        
        .slots .actionSlot.occupied .innerSlot {
             background-color: transparent;
        }

        .slots .innerSlot {
            width: 85%;
        	height: 85%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .slots .actionSlot.occupied .slotBtn {
             filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.25));
        }

        /* ═══════════════════════════════════════════ */
        /* B"H: MINIMIZE TOGGLE                       */
        /* ═══════════════════════════════════════════ */
        .awtsmoosAction .minimize {
            width: 28px;
            height: 28px;
            background-color: rgba(13, 4, 52, 0.85);
            border: 1px solid var(--mitzvah-gold, #ffd700);
            border-right: none;
            border-radius: 50% 0 0 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            position: absolute;
            left: -29px;
            top: 50%;
            transform: translateY(-50%);
            box-shadow: -3px 0 12px rgba(255, 222, 64, 0.2);
            
            pointer-events: auto !important;
            transition: all 0.25s ease;
            z-index: 10001;
        }

        .awtsmoosAction .minimize:hover {
            transform: translateY(-50%) scale(1.15);
            background-color: #23144F;
        }

        .minimize.opened::after {
            content: '\\25B6';
            font-size: 11px;
            color: var(--mitzvah-gold, #ffd700);
        }

        .minimize.closed::after {
            content: '\\25C0';
            font-size: 11px;
            color: var(--mitzvah-gold, #ffd700);
        }

        /* ═══════════════════════════════════════════ */
        /* B"H: TOOLTIP                               */
        /* ═══════════════════════════════════════════ */
        .awtsmoos.tooltip {
            background: rgba(5, 5, 20, 0.92);
            color: #eee;
            border: 1px solid var(--mitzvah-gold, #ffd700);
            border-radius: 8px;
            padding: 10px 14px;
            pointer-events: none;
            position: fixed; 
            z-index: 20000; 
            backdrop-filter: blur(6px);
            box-shadow: 0 4px 18px rgba(0,0,0,0.7);
            max-width: 250px;
        }

        .awtsmoos.tooltip .header {
            font-size: 1.05em;
            font-weight: 700;
            color: var(--mitzvah-gold, #ffd700);
            margin-bottom: 4px;
            border-bottom: 1px solid rgba(255, 222, 64, 0.25);
            padding-bottom: 3px;
        }
        
        .awtsmoos.tooltip .description {
            font-size: 0.85em;
            opacity: 0.8;
            line-height: 1.35;
        }
`;
