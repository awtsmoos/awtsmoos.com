//B"H
export default /*css*/`
/*B"H*/
.findWorlds {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a0b2e 0%, #474FFF 100%);
    overflow-y: auto;
    color: white;
    font-family: 'Fredoka', sans-serif;
}

.fw-header {
    padding: 20px;
    display: flex;
    align-items: center;
    background: rgba(0,0,0,0.3);
    backdrop-filter: blur(10px);
    border-bottom: 2px solid #FFD700;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    position: sticky;
    top: 0;
    z-index: 10;
}

.fw-back-btn {
    background: #ff4757;
    color: white;
    border: 2px solid #fff;
    border-radius: 50px;
    padding: 8px 20px;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s;
    margin-right: 20px;
}
.fw-back-btn:hover { transform: scale(1.05); }

.fw-title {
    font-family: 'Fredoka One', cursive;
    font-size: 32px;
    color: #FFD700;
    text-shadow: 2px 2px 0px #000;
    flex-grow: 1;
}

/* Search Section */
.fw-search-container {
    display: flex;
    padding: 20px;
    justify-content: center;
    gap: 10px;
}

.fw-input {
    padding: 15px 25px;
    border-radius: 50px;
    border: 2px solid #474FFF;
    background: rgba(255,255,255,0.9);
    font-size: 18px;
    width: 300px;
    font-family: 'Fredoka', sans-serif;
    outline: none;
    transition: width 0.3s;
}
.fw-input:focus { width: 400px; border-color: #FFD700; }

.fw-search-btn {
    padding: 12px 30px;
    border-radius: 50px;
    background: #474FFF;
    color: white;
    font-weight: bold;
    border: 2px solid #FFD700;
    cursor: pointer;
    font-size: 18px;
    box-shadow: 0 4px 0 #23144F;
    transition: all 0.1s;
}
.fw-search-btn:active { transform: translateY(4px); box-shadow: 0 0 0 #23144F; }

/* Sections */
.fw-content {
    padding: 20px 40px;
    display: flex;
    flex-direction: column;
    gap: 40px;
    max-width: 1200px;
    margin: 0 auto;
    
margin-top: 150px;
    width: 100%;
    box-sizing: border-box;
}

.fw-section {
    background: rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 25px;
    border: 1px solid rgba(255,255,255,0.2);
}

.fw-section-title {
    font-size: 24px;
    color: #FFD700;
    margin-bottom: 20px;
    font-weight: bold;
    border-bottom: 1px solid rgba(255,215,0,0.3);
    padding-bottom: 10px;
    display: inline-block;
}

.fw-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
}

/* Cards */
.fw-card {
    background: rgba(0,0,0,0.4);
    border-radius: 15px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.fw-card:hover {
    transform: translateY(-5px);
    border-color: #FFD700;
    background: rgba(71, 79, 255, 0.4);
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
}

.fw-card-icon {
    font-size: 40px;
    margin-bottom: 10px;
}

.fw-card-title {
    font-weight: bold;
    font-size: 18px;
    word-break: break-word;
}

.fw-card-sub {
    font-size: 12px;
    opacity: 0.7;
    margin-top: 5px;
}

/* Loading / Empty States */
.fw-message {
    text-align: center;
    font-size: 20px;
    padding: 40px;
    color: #aaa;
}

.hidden { display: none !important; }

`;