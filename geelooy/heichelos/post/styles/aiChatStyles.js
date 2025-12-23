//B"H
export function injectAIChatCSS() {
    const id = "BH-aiChatStyles";
    if (document.getElementById(id)) return;
    
    const style = document.createElement("style");
    style.id = id;
    style.textContent = /*css*/`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

        /* --- Animations & Keyframes --- */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes messageSlideIn {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        @keyframes pulseBorder {
            0% { box-shadow: 0 0 0 0 rgba(167, 119, 227, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(167, 119, 227, 0); }
            100% { box-shadow: 0 0 0 0 rgba(167, 119, 227, 0); }
        }

        /* --- Main Container --- */
        .ai-chat-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            font-family: 'Quicksand', sans-serif;
            background: #ffffff;
            /* Cyber-Spiritual Background */
            background: radial-gradient(circle at top left, #f8f9ff 0%, #ffffff 50%, #fdfbfb 100%);
            position: relative;
            overflow: hidden;
        }
        
        .ai-chat-container::before {
            content: '';
            position: absolute;
            top: -50px; right: -50px;
            width: 300px; height: 300px;
            background: radial-gradient(circle, rgba(167, 119, 227, 0.1) 0%, rgba(0,0,0,0) 70%);
            border-radius: 50%;
            z-index: 0;
            pointer-events: none;
        }

        /* --- Header Controls --- */
        .ai-controls {
            padding: 15px 20px;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(0,0,0,0.06);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
            z-index: 10;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }

        .ai-controls-left {
            display: flex;
            align-items: center;
            gap: 15px;
            flex: 1;
        }

        .ai-title-input {
            background: transparent !important;
            border: none !important;
            border-bottom: 2px solid rgba(0,0,0,0.1) !important;
            border-radius: 0 !important;
            padding: 5px 0;
            font-size: 16px;
            font-weight: 700;
            color: #333 !important;
            width: 180px;
            transition: all 0.3s ease;
        }
        
        .ai-title-input:focus {
            border-bottom-color: #a777e3 !important;
            width: 220px;
            outline: none;
        }

        .ai-save-btn {
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            border: none;
            color: white;
            border-radius: 30px;
            padding: 8px 20px;
            font-size: 13px;
            cursor: pointer;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            box-shadow: 0 4px 15px rgba(110, 142, 251, 0.4);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
        }
        
        .ai-save-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(167, 119, 227, 0.5);
        }
        
        .ai-save-btn::after {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0));
            opacity: 0;
            transition: opacity 0.3s;
        }
        .ai-save-btn:hover::after { opacity: 1; }

        /* --- Messages Area --- */
        .ai-messages {
            flex: 1;
            overflow-y: auto;
            padding: 25px;
            display: flex;
            flex-direction: column;
            gap: 25px;
            z-index: 1;
            scroll-behavior: smooth;
        }

        .ai-message {
            max-width: 85%;
            padding: 20px 25px;
            border-radius: 24px;
            font-size: 15px;
            line-height: 1.7;
            position: relative;
            word-wrap: break-word;
            animation: messageSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 5px 20px rgba(0,0,0,0.05);
            transition: transform 0.2s;
        }
        
        .ai-message:hover {
            transform: translateY(-1px);
        }

        /* User Message Style */
        .ai-message.user {
            align-self: flex-end;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom-right-radius: 4px;
            box-shadow: 0 8px 25px rgba(118, 75, 162, 0.35);
        }

        /* AI Message Style */
        .ai-message.ai, .ai-message.model {
            align-self: flex-start;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(5px);
            color: #2d3748;
            border-bottom-left-radius: 4px;
            border: 1px solid rgba(255,255,255,0.8);
            box-shadow: 0 5px 25px rgba(0,0,0,0.04);
        }
        
        /* Markdown in AI Messages */
        .ai-message.ai strong { color: #553c9a; }
        .ai-message.ai em { color: #805ad5; }
        
        .ai-message.ai code { 
            background: #2d3748; 
            color: #81e6d9; 
            padding: 3px 6px; 
            border-radius: 6px; 
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9em;
        }
        
        .ai-message.ai pre { 
            background: #1a202c; 
            color: #e2e8f0; 
            padding: 15px; 
            border-radius: 12px; 
            overflow-x: auto; 
            margin: 15px 0;
            border: 1px solid #4a5568;
        }

        /* --- Input Area --- */
        .ai-input-area {
            padding: 20px 25px;
            background: rgba(255,255,255,0.9);
            backdrop-filter: blur(20px);
            border-top: 1px solid rgba(0,0,0,0.05);
            display: flex;
            gap: 15px;
            align-items: flex-end;
            z-index: 20;
            box-shadow: 0 -5px 25px rgba(0,0,0,0.03);
        }

        .ai-input-box {
            flex: 1;
            min-height: 50px;
            max-height: 180px;
            border: 2px solid #e2e8f0;
            background: #f8f9fa;
            border-radius: 25px;
            padding: 14px 20px;
            font-size: 16px;
            resize: none;
            outline: none;
            font-family: inherit;
            transition: all 0.3s ease;
        }
        
        .ai-input-box:focus {
            background: #fff;
            border-color: #a777e3;
            box-shadow: 0 0 0 4px rgba(167, 119, 227, 0.1);
        }

        .ai-send-btn {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            background-size: 200% 200%;
            animation: bgGradient 5s ease infinite;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-size: 20px;
            box-shadow: 0 5px 15px rgba(167, 119, 227, 0.4);
        }

        .ai-send-btn:hover {
            transform: scale(1.15) rotate(-5deg);
        }
        
        .ai-send-btn:active {
            transform: scale(0.95);
        }

        /* --- Embedded View Adjustment --- */
        .ai-chat-embedded {
            border: 2px solid rgba(167, 119, 227, 0.1);
            border-radius: 16px;
            overflow: hidden;
            background: #fff;
        }
        
        .ai-chat-embedded .ai-messages {
            padding: 15px;
        }
        
        .ai-chat-embedded .ai-message {
            font-size: 14px;
            padding: 12px 16px;
        }

        /* Typing Indicator */
        .typing-indicator span {
            background: linear-gradient(135deg, #6e8efb, #a777e3);
        }
    `;
    document.head.appendChild(style);
}
