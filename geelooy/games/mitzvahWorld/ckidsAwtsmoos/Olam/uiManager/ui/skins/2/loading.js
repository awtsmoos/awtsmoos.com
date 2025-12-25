
/**
 * B"H
 */
export default /*css*/`
    .loading {
        z-index: 99999;
        color: white;
        margin: 0;
        position: fixed;
        left: 0; top: 0;
        width: 100%; height: 100%;
        background: radial-gradient(circle at center, #241550 0%, #000000 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Fredoka One', sans-serif;
    }

    .loadingContent {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
    }

    /* RADIAL LOADER */
    .radial-loader-container {
        position: relative;
        width: 200px;
        height: 200px;
    }

    .radial-progress {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: conic-gradient(
            #00f3ff 0%,
            #bc13fe 0%,
            rgba(255, 255, 255, 0.1) 0%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 50px rgba(188, 19, 254, 0.5), inset 0 0 20px rgba(0, 243, 255, 0.3);
        position: relative;
        animation: pulseGlow 2s infinite alternate;
    }

    /* Inner circle to make it a ring */
    .radial-inner {
        position: absolute;
        width: 180px;
        height: 180px;
        background: #0f0518;
        border-radius: 50%;
        z-index: 1;
    }

    .radial-text-container {
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .loading-aleph {
        font-size: 60px;
        background: linear-gradient(180deg, #ffd700, #ffaa00);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));
        animation: floatAleph 3s ease-in-out infinite;
    }

    .loading-percent {
        font-size: 24px;
        color: #00f3ff;
        text-shadow: 0 0 5px #00f3ff;
        margin-top: 5px;
    }

    .loading-info-container {
        text-align: center;
        z-index: 2;
    }

    .loading-title {
        color: #ffffff;
        font-size: 28px;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin: 0;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    .loading-subtitle {
        color: #bc13fe;
        font-size: 14px;
        margin-top: 10px;
        font-weight: normal;
        text-transform: uppercase;
        letter-spacing: 1px;
        max-width: 300px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    /* B"H: ERROR MODAL STYLES */
    .loading-error-modal {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100000;
        backdrop-filter: blur(5px);
    }
    
    .loading-error-modal.hidden {
        display: none;
    }

    .error-content {
        background: linear-gradient(135deg, #3a0000 0%, #1a0000 100%);
        border: 4px solid #ff4757;
        box-shadow: 0 0 50px #ff4757;
        padding: 40px;
        border-radius: 20px;
        max-width: 600px;
        width: 90%;
        text-align: center;
        color: white;
        user-select: text; /* B"H: Allow copying error text */
        -webkit-user-select: text;
    }
    
    .error-content h2 {
        color: #ff4757;
        font-size: 32px;
        margin-bottom: 20px;
        text-transform: uppercase;
    }
    
    .error-content p {
        font-size: 18px;
        margin-bottom: 20px;
    }
    
    .error-content pre {
        background: rgba(0,0,0,0.5);
        padding: 15px;
        border-radius: 10px;
        text-align: left;
        overflow-x: auto;
        color: #ffcccc;
        margin-bottom: 25px;
        font-family: monospace;
        font-size: 14px;
        user-select: text; /* B"H: Allow copying error details */
    }
    
    .error-actions {
        display: flex;
        justify-content: center;
        gap: 20px;
    }
    
    .error-actions button {
        padding: 12px 25px;
        border: none;
        border-radius: 50px;
        font-family: 'Fredoka One', sans-serif;
        font-size: 16px;
        cursor: pointer;
        transition: transform 0.2s;
    }
    
    .error-actions button:hover {
        transform: scale(1.05);
    }
    
    .error-actions button:first-child {
        background: #555;
        color: white;
    }
    
    .error-actions button:last-child {
        background: #ff4757;
        color: white;
        box-shadow: 0 0 15px #ff4757;
    }

    @keyframes pulseGlow {
        0% { box-shadow: 0 0 30px rgba(188, 19, 254, 0.3); }
        100% { box-shadow: 0 0 60px rgba(188, 19, 254, 0.7); }
    }

    @keyframes floatAleph {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }
`;
