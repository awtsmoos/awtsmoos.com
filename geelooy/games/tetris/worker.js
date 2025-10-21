// B"H

// --- Self-contained Seeded Random Number Generator ---
class SeededRandom {
    constructor(seedStr) { let h = 1779033703; for (let i = 0, l = seedStr.length; i < l; i++) { h = Math.imul(3432918353, h ^ seedStr.charCodeAt(i)); h = (h << 13) | (h >>> 19); } this.seed = h; }
    random() { this.seed = (this.seed * 1664525 + 1013904223) % 4294967296; return this.seed / 4294967296; }
}

// --- Game Constants ---
const COLORS = { 1: '#F07', 2: '#0CF', 3: '#0F9', 4: '#F80', 5: '#FFD700', 6: '#93F', 7: '#FFF' };
const SHAPES = { 1: [[1, 1, 1, 1]], 2: [[1, 1, 1], [0, 1, 0]], 3: [[1, 1, 0], [0, 1, 1]], 4: [[0, 1, 1], [1, 1, 0]], 5: [[1, 1, 1], [1, 0, 0]], 6: [[1, 1, 1], [0, 0, 1]], 7: [[1, 1], [1, 1]] };
const COLS = 10;
const LOGICAL_ROWS = 40;
const VIEWPORT_ROWS = 18;

let gameInstances = [];
let animationFrameId;

// *** PURE CALCULATOR AI ENGINE V3 ***
class AIEngine {
    constructor(game) { this.game = game; this.isThinking = false; this.thinkDelay = 100; this.lastThinkTime = 0; }

    update(timestamp) {
        if (this.game.gameOver || !this.game.piece || this.isThinking) return;
        if (timestamp - this.lastThinkTime > this.thinkDelay) {
            this.isThinking = true;
            this.lastThinkTime = timestamp;
            const bestMove = this.findBestMove();
            if (bestMove) { this.game.applyAIMove(bestMove); } 
            else { this.game.hardDrop(); }
            this.isThinking = false;
        }
    }

    findBestMove() {
        if (!this.game.piece || !this.game.piece.matrix) return null;
        let bestScore = -Infinity, bestMove = null;
        for (let rot = 0; rot < 4; rot++) {
            let currentMatrix = this.game.piece.matrix;
            for (let i = 0; i < rot; i++) { currentMatrix = currentMatrix[0].map((_, c) => currentMatrix.map(row => row[c]).reverse()); }
            for (let x = -2; x < COLS; x++) {
                const moveCandidate = { x, y: 0, matrix: currentMatrix };
                if (this._collides(moveCandidate, this.game.board, {})) continue;
                let tempBoard = this.game.board.map(r => [...r]); let finalY = 0;
                while (!this._collides({ ...moveCandidate, y: finalY }, tempBoard, { y: 1 })) { finalY++; }
                moveCandidate.matrix.forEach((r, my) => r.forEach((v, mx) => { if (v !== 0) { const bY = finalY + my, bX = moveCandidate.x + mx; if (bY >= 0 && bX >= 0 && bY < LOGICAL_ROWS && bX < COLS) { tempBoard[bY][bX] = 1; } } }));
                const score = this.scoreBoard(tempBoard);
                if (score > bestScore) { bestScore = score; bestMove = { x: moveCandidate.x, matrix: moveCandidate.matrix }; }
            }
        }
        return bestMove;
    }
    
    _collides(piece, board, offset) { /* ... unchanged ... */ }
    scoreBoard(board) { /* ... unchanged ... */ }
}

// *** UNBREAKABLE RE-ARCHITECTURE OF THE GAME INSTANCE V2 ***
class GameInstance {
    constructor(id, isAI, canvas) {
        this.id = id; this.isAI = isAI; this.canvas = canvas; this.ctx = canvas.getContext('2d');
        this.pieceGenerator = new SeededRandom(Math.random().toString());
    }

    init() {
        this.board = Array.from({ length: LOGICAL_ROWS }, () => Array(COLS).fill(0));
        this.score = 0; this.lines = 0; this.level = 1; this.gameOver = false;
        this.dropCounter = 0; this.dropInterval = 1000; this.lastTime = 0; this.isSoftDropping = false;
        this.piece = null;
        this.nextPiece = this.createNewPiece();
        this.viewportY = LOGICAL_ROWS - VIEWPORT_ROWS; this.targetViewportY = this.viewportY;
        if (this.isAI) { this.ai = new AIEngine(this); }
        this.resize();
        this.spawnNewPiece();
    }
    
    resize() { if (this.canvas.width > 0) this.BLOCK_SIZE = this.canvas.width / COLS; }

    update(timestamp) {
        if (this.gameOver) return;
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime; this.lastTime = timestamp;
        if (this.isAI) { this.ai.update(timestamp); }
        if (!this.isAI) { // Gravity only applies to human players
            this.dropCounter += deltaTime;
            const interval = this.isSoftDropping ? 50 : this.dropInterval;
            if (this.dropCounter > interval) { this.drop(); }
        }
        this.updateViewport();
    }
    
    updateViewport() { if (Math.abs(this.targetViewportY - this.viewportY) > 0.01) { this.viewportY += (this.targetViewportY - this.viewportY) * 0.1; } }

    draw() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#000'; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const startRow = Math.floor(this.viewportY); const endRow = Math.ceil(this.viewportY + VIEWPORT_ROWS);
        for(let y = startRow; y < endRow && y < LOGICAL_ROWS; y++) { for(let x = 0; x < COLS; x++) { if(this.board[y]?.[x] !== 0) { this.drawBrick(this.ctx, x, y, this.board[y][x]); } } }
        if (this.piece && this.piece.matrix) {
            this.drawMatrix(this.piece);
            if (this.piece.y + this.piece.matrix.length > this.viewportY + VIEWPORT_ROWS) { this.drawIndicator(); }
        }
    }
    
    drawIndicator() { /* ... unchanged ... */ }
    drawBrick(ctx, logicalX, logicalY, t) { /* ... unchanged ... */ }
    drawMatrix(p) { if (!p || !p.matrix) return; p.matrix.forEach((r, y) => r.forEach((v, x) => { if (v !== 0) this.drawBrick(this.ctx, p.x + x, p.y + y, p.typeId); })); }
    
    spawnNewPiece() {
        if (this.gameOver) return;
        const newPiece = this.nextPiece;
        this.nextPiece = this.createNewPiece();
        if (!newPiece || !newPiece.matrix || !newPiece.matrix[0]) { this.setGameOver(); return; }
        newPiece.x = Math.floor(COLS / 2) - Math.floor(newPiece.matrix[0].length / 2);
        newPiece.y = Math.floor(this.targetViewportY) - 2;
        let attempts = 0;
        while (this.collides(newPiece, {})) {
            newPiece.y--; attempts++;
            if (attempts > 5) { this.setGameOver(); return; }
        }
        this.piece = newPiece;
    }

    createNewPiece() { const t = Math.floor(this.pieceGenerator.random() * 7) + 1; return { x: 0, y: 0, matrix: SHAPES[t], typeId: t }; }

    collides(piece, offset) {
        if (!piece || !piece.matrix) return true;
        for (let y = 0; y < piece.matrix.length; y++) { for (let x = 0; x < piece.matrix[y].length; x++) { if (piece.matrix[y][x] !== 0) { const nX = piece.x + x + (offset.x || 0); const nY = piece.y + y + (offset.y || 0); if (nX < 0 || nX >= COLS || nY >= LOGICAL_ROWS || this.board[nY]?.[nX] !== 0) return true; } } }
        return false;
    }

    lockPiece() {
        if (!this.piece) return;
        this.piece.matrix.forEach((r, y) => r.forEach((v, x) => { if (v !== 0) { const bY = this.piece.y + y; if (bY >= 0 && bY < LOGICAL_ROWS) this.board[bY][this.piece.x + x] = this.piece.typeId; } }));
        this.piece = null;
        this.sweepLines();
        this.updateCameraTarget();
        if (!this.gameOver) { this.spawnNewPiece(); }
    }

    updateCameraTarget() { /* ... unchanged ... */ }
    setGameOver() { if(!this.gameOver) { this.gameOver = true; postMessage({ type: 'game_over', payload: { id: this.id } }); } }
    
    move(d) { if (!this.piece) return; if (!this.collides(this.piece, { x: d })) { this.piece.x += d; } }
    
    rotate() {
        if (!this.piece) return;
        const originalMatrix = this.piece.matrix;
        let newMatrix = originalMatrix[0].map((_, i) => originalMatrix.map(row => row[i]).reverse());
        const tempPiece = { ...this.piece, matrix: newMatrix };
        
        // Wall kick logic
        let offset = 0;
        if (this.collides(tempPiece, {})) {
            offset = tempPiece.x < COLS / 2 ? 1 : -1;
            if (this.collides(tempPiece, { x: offset })) {
                offset *= -1;
                if (this.collides(tempPiece, { x: offset })) {
                    offset = 0; // Can't kick
                }
            }
        }
        if (offset !== 0 || !this.collides(tempPiece, {})) {
            this.piece.x += offset;
            this.piece.matrix = newMatrix;
        }
    }

    drop() { if (!this.piece) return; if (!this.collides(this.piece, { y: 1 })) { this.piece.y++; } else { this.lockPiece(); } this.dropCounter = 0; }
    hardDrop() { if (!this.piece) return; while (!this.collides(this.piece, { y: 1 })) { this.piece.y++; } this.lockPiece(); }
    
    applyAIMove(move) {
        if (!this.piece || !move) return;
        this.piece.matrix = move.matrix;
        this.piece.x = move.x;
        this.hardDrop();
    }

    sweepLines() { /* ... unchanged ... */ }
}


// --- MAIN WORKER LOGIC WITH ERROR BOUNDARIES V2 ---
self.onmessage = ({ data }) => {
    try {
        switch (data.type) {
            case 'init':
                // ... setup logic ...
                break;
            case 'input':
                // ... input logic ...
                break;
        }
    } catch (e) { console.error("UNHANDLED WORKER ERROR:", e); }
};

function gameLoop(timestamp) {
    try {
        gameInstances.forEach(inst => { inst.update(timestamp); inst.draw(); });
        animationFrameId = requestAnimationFrame(gameLoop);
    } catch(e) { console.error("FATAL ERROR IN GAME LOOP:", e); if (animationFrameId) cancelAnimationFrame(animationFrameId); }
}

// Full function stubs for copy-paste replacement
AIEngine.prototype._collides = function(piece, board, offset) { if (!piece || !piece.matrix) return true; for (let y = 0; y < piece.matrix.length; y++) { for (let x = 0; x < piece.matrix[y].length; x++) { if (piece.matrix[y][x] !== 0) { const nX = piece.x + x + (offset.x || 0), nY = piece.y + y + (offset.y || 0); if (nX < 0 || nX >= COLS || nY >= LOGICAL_ROWS || board[nY]?.[nX] !== 0) return true; } } } return false; };
AIEngine.prototype.scoreBoard = function(board) { let a=0,h=0,l=0,b=0;const cH=Array(COLS).fill(0);for(let x=0;x<COLS;x++){for(let y=0;y<LOGICAL_ROWS;y++){if(board[y][x]!==0){cH[x]=LOGICAL_ROWS-y;break;}}}a=cH.reduce((sum,h)=>sum+h,0);for(let x=0;x<COLS;x++){for(let y=LOGICAL_ROWS-cH[x];y<LOGICAL_ROWS;y++){if(board[y][x]===0)h++;}}for(let i=0;i<COLS-1;i++){b+=Math.abs(cH[i]-cH[i+1]);}for(let y=0;y<LOGICAL_ROWS;y++){if(board[y].every(c=>c!==0))l++;}return(l*0.76)-(a*0.51)-(h*0.35)-(b*0.18);};
GameInstance.prototype.drawIndicator = function() { if (!this.piece || !this.piece.matrix) return; const s = this.BLOCK_SIZE, x = this.piece.x * s, y = this.canvas.height - s * 0.5, c = COLORS[this.piece.typeId]; this.ctx.fillStyle = c; this.ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 150) * 0.25; this.ctx.beginPath(); this.ctx.moveTo(x, y); this.ctx.lineTo(x + s * this.piece.matrix[0].length, y); this.ctx.lineTo(x + s * this.piece.matrix[0].length / 2, y + s * 0.4); this.ctx.closePath(); this.ctx.fill(); this.ctx.globalAlpha = 1.0; };
GameInstance.prototype.drawBrick = function(ctx, logicalX, logicalY, t) { const screenY = (logicalY - this.viewportY) * this.BLOCK_SIZE; if (screenY < -this.BLOCK_SIZE || screenY > this.canvas.height || !this.BLOCK_SIZE) return; const c = COLORS[t], s = this.BLOCK_SIZE, bX = logicalX * s, p = s * 0.1; const grad = ctx.createLinearGradient(bX, screenY, bX + s, screenY + s); grad.addColorStop(0, c); grad.addColorStop(1, 'black'); ctx.fillStyle = grad; ctx.fillRect(bX, screenY, s, s); ctx.fillStyle = c; ctx.fillRect(bX + p, screenY + p, s - p * 2, s - p * 2); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = p / 2; ctx.strokeRect(bX + p, screenY + p, s - p * 2, s - p * 2); };
GameInstance.prototype.updateCameraTarget = function() { let hY=LOGICAL_ROWS;for(let y=0;y<LOGICAL_ROWS;y++){if(this.board[y].some(c=>c!==0)){hY=y;break;}}let cT=this.targetViewportY;if(hY<cT+4){let t=hY-(VIEWPORT_ROWS*0.75);this.targetViewportY=Math.max(0,Math.min(LOGICAL_ROWS-VIEWPORT_ROWS,t));}else if(hY>cT+VIEWPORT_ROWS*0.6){let t=hY-(VIEWPORT_ROWS*0.75);this.targetViewportY=Math.min(LOGICAL_ROWS-VIEWPORT_ROWS,t);}};
GameInstance.prototype.sweepLines = function() { let c=0;for(let y=LOGICAL_ROWS-1;y>=0;y--){if(this.board[y]&&this.board[y].every(v=>v!==0)){c++;this.board.splice(y,1);this.board.unshift(Array(COLS).fill(0));y++;}}if(c>0){this.lines+=c;this.score+=(10*c*c)*this.level;this.level=Math.floor(this.lines/10)+1;this.dropInterval=1000*Math.pow(0.85,this.level-1);postMessage({type:'ui_update',payload:{id:this.id,score:this.score,level:this.level,lines:this.lines}});}};
self.onmessage = ({ data }) => { try { switch (data.type) { case 'init': const { bgCanvas, p1Canvas, p2Canvas, mode } = data.payload; let bgCtx = bgCanvas.getContext('2d'); let stars = []; function rBg(){bgCanvas.width=1920;bgCanvas.height=1080;stars=[];for(let i=0;i<200;i++){stars.push({x:Math.random()*bgCanvas.width,y:Math.random()*bgCanvas.height,r:Math.random()*1.5,vx:Math.floor(Math.random()*50)-25,vy:Math.floor(Math.random()*50)-25});}} function dBg(){if(!bgCtx)return;bgCtx.clearRect(0,0,bgCanvas.width,bgCanvas.height);bgCtx.globalCompositeOperation="lighter";for(let i=0,x=stars.length;i<x;i++){let s=stars[i];bgCtx.fillStyle="#111";bgCtx.beginPath();bgCtx.arc(s.x,s.y,s.r,0,2*Math.PI);bgCtx.fill();bgCtx.fillStyle="#222";bgCtx.beginPath();bgCtx.arc(s.x,s.y,s.r/1.5,0,2*Math.PI);bgCtx.fill();s.x+=s.vx/500;s.y+=s.vy/500;if(s.x<0||s.x>bgCanvas.width)s.vx=-s.vx;if(s.y<0||s.y>bgCanvas.height)s.vy=-s.vy;}requestAnimationFrame(dBg);} rBg();dBg(); gameInstances=[];if(p1Canvas){const p1=new GameInstance(1,mode==='aivai',p1Canvas);gameInstances.push(p1);}if(mode!=='single'&&p2Canvas){const p2=new GameInstance(2,true,p2Canvas);gameInstances.push(p2);} gameInstances.forEach(i=>i.init());if(animationFrameId)cancelAnimationFrame(animationFrameId);gameLoop();break; case 'input': const p1=gameInstances.find(i=>i.id===1&&!i.isAI);if(p1){const{action,value}=data.payload;switch(action){case 'move':p1.move(value);break;case 'rotate':p1.rotate();break;case 'hard_drop':p1.hardDrop();break;case 'soft_drop_start':p1.isSoftDropping=true;break;case 'soft_drop_end':p1.isSoftDropping=false;break;}} break; } } catch (e) { console.error("UNHANDLED WORKER ERROR:", e); } };