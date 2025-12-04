//B"H
export default /*css*/`
.characterDesigner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    height: 90vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 20px;
    border: 3px solid #0f3460;
    box-shadow: 0 0 50px rgba(0,0,0,0.8);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    color: white;
    font-family: 'Fredoka', sans-serif;
    z-index: 5000;
}

.characterDesigner.hidden {
    display: none !important;
}

.cd-header {
    background: rgba(0,0,0,0.5);
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #e94560;
}

.cd-title {
    font-size: 28px;
    font-weight: bold;
    color: #e94560;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.cd-close {
    background: #e94560;
    border: none;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s;
}
.cd-close:hover { transform: scale(1.1); }

.cd-body {
    flex: 1;
    display: flex;
    overflow: hidden;
}

.cd-sidebar {
    width: 300px;
    background: rgba(0,0,0,0.3);
    padding: 20px;
    border-right: 1px solid #0f3460;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.cd-input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.cd-label {
    color: #4cc9f0;
    font-size: 14px;
    text-transform: uppercase;
    font-weight: bold;
}

.cd-input {
    background: rgba(255,255,255,0.1);
    border: 1px solid #4cc9f0;
    padding: 10px;
    border-radius: 5px;
    color: white;
    font-family: inherit;
}

textarea.cd-input {
    min-height: 80px;
    resize: vertical;
}

.cd-btn {
    background: #4cc9f0;
    border: none;
    padding: 12px;
    border-radius: 5px;
    color: #1a1a2e;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    text-transform: uppercase;
}
.cd-btn:hover { background: #fff; box-shadow: 0 0 15px #4cc9f0; }
.cd-btn.secondary { background: transparent; border: 2px solid #4cc9f0; color: #4cc9f0; }
.cd-btn.secondary:hover { background: rgba(76, 201, 240, 0.1); }

.cd-main {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: radial-gradient(circle at center, #1f233a 0%, #16213e 100%);
    position: relative;
}

.cd-tree-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.cd-node {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 15px;
    position: relative;
}

.cd-node-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    color: #ffd700;
    font-size: 14px;
}

.cd-response-list {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-left: 20px;
    border-left: 2px solid rgba(255,255,255,0.1);
}

.cd-response {
    background: rgba(0,0,0,0.3);
    padding: 10px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.cd-row {
    display: flex;
    gap: 10px;
}

.cd-create-btn {
    margin-top: auto;
    background: linear-gradient(90deg, #e94560, #ff0099);
    color: white;
    font-size: 20px;
    padding: 20px;
    border: none;
    cursor: pointer;
}
.cd-create-btn:hover { filter: brightness(1.2); }

.cd-select {
    background: #1a1a2e;
    color: white;
    border: 1px solid #4cc9f0;
    padding: 5px;
    border-radius: 3px;
}

`;