/* B"H */

// --- UI Elements ---
const fenInput = document.getElementById('fenInput');
const sanInput = document.getElementById('sanInput');
const runTestButton = document.getElementById('runTestButton');
const output = document.getElementById('output');

// --- Set Initial State from the Error Screenshot ---
fenInput.value = "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1";
sanInput.value = "d5";

// --- Worker Communication ---
let debugWorker;

function initializeWorker() {
    output.innerHTML = '';
    logToScreen('Creating a new consciousness (Worker) for diagnosis...', 'info');
    
    // Terminate any old worker to ensure a clean slate
    if (debugWorker) {
        debugWorker.terminate();
    }
    
    debugWorker = new Worker('debug_worker.js?s=5');
    
    // Listen for messages (logs) from the worker
    debugWorker.onmessage = function(e) {
        const { type, message, className } = e.data;
        
        if (type === 'log') {
            logToScreen(message, className);
        } else if (type === 'complete') {
            logToScreen('\n--- DIAGNOSIS COMPLETE ---', 'header');
            runTestButton.disabled = false;
        }
    };
    
    debugWorker.onerror = function(e) {
        logToScreen(`A fatal error occurred in the worker: ${e.message}`, 'error');
        runTestButton.disabled = false;
    };
}

function logToScreen(message, className = '') {
    // Sanitize message to prevent HTML injection
    const sanitizedMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    output.innerHTML += `<span class="${className}">${sanitizedMessage}\n</span>`;
    output.scrollTop = output.scrollHeight; // Auto-scroll
}

runTestButton.addEventListener('click', () => {
    // Start a new, clean test
    initializeWorker();
    runTestButton.disabled = true;

    const fen = fenInput.value;
    const targetSan = sanInput.value;

    // Send the test parameters to the worker
    setTimeout(() => {
         debugWorker.postMessage({
            command: 'run_diagnostic',
            fen: fen,
            targetSan: targetSan
        });
    }, 100); // Give the worker a moment to initialize
});