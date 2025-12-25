
//B"H
export function injectAIChatCSS() {
    const id = "BH-aiChatStyles-Tree-V12-Insane";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        /* --- MAIN WRAPPER --- */
        .ai-thread-wrapper {
            background: #ffffff;
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            position: relative;
            font-family: var(--font-ui);
            font-size: 1rem; /* Base size */
            overflow: hidden;
        }
        
        /* Global Minimize */
        .ai-thread-wrapper.minimized .ai-thread-timeline,
        .ai-thread-wrapper.minimized .ai-inline-terminal {
            display: none !important;
        }

        /* --- HEADER --- */
        .ai-thread-header {
            background: #1a1a1a;
            color: #fff;
            padding: 12px 16px;
            font-weight: 700;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.9em;
            cursor: pointer;
            letter-spacing: 0.5px;
        }
        
        .ai-icon { margin-right: 8px; }

        .ai-header-btn {
            background: rgba(255,255,255,0.1);
            color: #fff;
            border: 1px solid transparent;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            cursor: pointer;
            margin-left: 8px;
            transition: all 0.2s;
        }
        .ai-header-btn:hover { background: #fff; color: #000; }

        /* --- TIMELINE (The Tree Trunk) --- */
        .ai-thread-timeline {
            padding: 24px 16px 24px 40px; /* Left padding for the rail */
            position: relative;
            background-color: #fbfbfb;
        }
        
        /* Main Rail Line */
        .ai-thread-timeline::before {
            content: '';
            position: absolute;
            top: 24px; bottom: 24px; left: 20px;
            width: 3px;
            background: #e0e0e0;
            z-index: 0;
            border-radius: 2px;
        }

        /* --- MESSAGE BLOCK (Node) --- */
        .ai-thread-block {
            position: relative;
            margin-bottom: 24px;
            font-size: 1em; /* Inherit */
        }

        /* Dot Connector on Rail */
        .ai-thread-block::before {
            content: '';
            position: absolute;
            left: -26px; /* Align with rail center */
            top: 20px; /* Vertical center of header */
            width: 14px; height: 14px;
            background: #fff;
            border: 3px solid #ccc;
            border-radius: 50%;
            z-index: 1;
            box-shadow: 0 0 0 3px #fbfbfb; /* Mask line */
        }
        
        /* Model specific dot */
        .ai-thread-block.model::before { 
            border-color: #00d2ff; 
            background: #00d2ff;
        }
        .ai-thread-block.user::before {
            border-color: #333;
            background: #333;
        }
        
        /* Loading Dot */
        .ai-thread-block.loading::before {
            background: #ffd700;
            border-color: #ffd700;
            animation: pulse 1s infinite;
        }

        /* --- BUBBLE CONTENT --- */
        .ai-block-content {
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.03);
            position: relative;
            z-index: 2;
            overflow: hidden;
            transition: transform 0.2s;
        }
        .ai-block-content:hover {
            box-shadow: 0 4px 10px rgba(0,0,0,0.06);
            transform: translateX(2px);
        }

        /* Colored Border Indicators */
        .ai-thread-block.model .ai-block-content { border-left: 4px solid #00d2ff; }
        .ai-thread-block.user .ai-block-content { border-left: 4px solid #333; }
        .ai-thread-block.loading .ai-block-content { border-left: 4px solid #ffd700; }

        .ai-msg-meta {
            padding: 8px 16px;
            background: #fcfcfc;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.75em;
            font-weight: 700;
            color: #888;
            text-transform: uppercase;
        }
        
        .ai-content-text { 
            padding: 16px; 
            line-height: 1.6; 
            font-size: 1em; /* Important: keeps text readable */
            color: #222;
        }
        
        .ai-content-text p { margin-top: 0; margin-bottom: 1em; }
        .ai-content-text code { background: #eee; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 0.9em; }

        .ai-msg-actions {
            padding: 8px 16px;
            text-align: right;
            background: #fcfcfc;
            border-top: 1px solid #f0f0f0;
            opacity: 0.4;
            transition: opacity 0.2s;
        }
        .ai-block-content:hover .ai-msg-actions { opacity: 1; }

        .ai-action-btn {
            background: #fff;
            border: 1px solid #ddd;
            font-size: 0.75em;
            font-weight: 700;
            color: #444;
            cursor: pointer;
            padding: 4px 10px;
            border-radius: 4px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .ai-action-btn:hover { 
            background: #333; color: #fff; border-color: #333;
        }

        /* --- FORK SLOT --- */
        .ai-forks-slot {
            margin-left: -20px; /* Pull back to align nicely */
            padding-left: 20px;
            position: relative;
            margin-top: 12px;
            display: block !important; /* Forces visibility even if parent style tries to hide */
        }
        
        /* --- COLLAPSED STATE (FIXED FOR NESTING) --- */
        /* Use direct child combinator so nested threads in forks-slot aren't hidden */
        .ai-thread-block.collapsed > .ai-block-content > .ai-content-text,
        .ai-thread-block.collapsed > .ai-block-content > .ai-msg-actions {
            display: none !important;
        }
        
        /* --- NESTED THREAD (Branch) --- */
        .ai-nested-thread {
            position: relative;
            margin-top: 12px;
            margin-left: 20px;
        }
        
        /* Connector Line for Branch */
        .ai-nested-thread::before {
            content: '';
            position: absolute;
            left: -28px; top: 15px;
            width: 25px; height: 2px;
            background: #aaa;
            border-radius: 2px;
        }
        .ai-nested-thread::after {
            content: '';
            position: absolute;
            left: -28px; top: -15px; bottom: 15px;
            width: 2px;
            background: #e0e0e0; /* Vertical connector from parent rail */
        }
        
        /* Branch Trigger Button */
        .ai-branch-trigger {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 16px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9em;
            font-weight: 600;
            color: #444;
            transition: all 0.2s;
            width: fit-content;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            position: relative;
            z-index: 2;
        }

        .ai-branch-trigger:hover {
            border-color: #aaa;
            transform: translateX(2px);
            color: #000;
        }
        
        .ai-branch-trigger.active {
            background: #333;
            color: #fff;
            border-color: #333;
        }

        .ai-branch-icon { font-size: 1.1em; color: #00d2ff; }

        .ai-branch-content {
            margin-top: 15px;
            padding-left: 10px;
            animation: slideDown 0.3s ease-out;
            border-left: 3px solid rgba(0, 210, 255, 0.2); /* Subtle guide line */
        }

        /* --- INPUTS --- */
        .ai-branch-input-area {
            background: #fff;
            border: 2px solid #00d2ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            box-shadow: 0 4px 12px rgba(0, 210, 255, 0.1);
            position: relative;
        }
        
        .ai-branch-input-area textarea {
            width: 100%;
            border: 1px solid #ddd;
            padding: 12px;
            font-family: inherit;
            border-radius: 4px;
            resize: vertical;
            min-height: 80px;
        }
        .ai-branch-input-area textarea:focus { border-color: #00d2ff; }
        
        .ai-input-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 10px;
        }
        
        .ai-btn {
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: 700;
            cursor: pointer;
            font-size: 0.85em;
            border: none;
            text-transform: uppercase;
        }
        .ai-btn-primary { background: #00d2ff; color: #fff; box-shadow: 0 2px 5px rgba(0, 210, 255, 0.3); }
        .ai-btn-primary:hover { background: #00b8e6; }
        .ai-btn-secondary { background: #eee; color: #333; }
        .ai-btn-secondary:hover { background: #ddd; }

        /* Terminal Input */
        .ai-inline-terminal {
            display: flex;
            border-top: 1px solid #ddd;
            background: #fff;
            padding: 10px;
            font-size: 1rem;
        }
        .ai-inline-terminal textarea {
            flex: 1;
            border: 1px solid transparent;
            padding: 12px;
            resize: none;
            font-family: inherit;
            outline: none;
            background: #f9f9f9;
            border-radius: 20px;
            transition: all 0.2s;
            font-size: inherit;
        }
        .ai-inline-terminal textarea:focus {
            background: #fff;
            box-shadow: 0 0 0 2px #00d2ff;
        }
        .ai-send-icon-btn {
            background: #1a1a1a;
            color: #00d2ff;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-left: 10px;
            cursor: pointer;
            font-size: 1.2em;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }
        .ai-send-icon-btn:hover { transform: scale(1.1); }
        
        .ai-btn-mini { border:none; background:none; cursor:pointer; font-weight:bold; color: #aaa; }
        .ai-btn-mini:hover { color: #333; }
        
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }
    `;
    document.head.appendChild(style);
}
