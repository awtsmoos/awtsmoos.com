// B"H
// FILE: test-worker.js

console.log('[WORKER_MAIN] test-worker.js is executing its top-level code.');

// Let's prove the worker's own global scope is working.
self.WORKER_ID = 'Alpha-77';

console.log('[WORKER_MAIN] About to synchronously import "test-utils.js" to get the "multiply" function...');

// This is the critical call that your interceptor will handle.
importScripts('test-utils.js');

console.log('[WORKER_MAIN] Successfully returned from importScripts. The "multiply" function should now exist.');

// Verify that the imported script has populated the global scope.
if (typeof self.multiply !== 'function') {
    throw new Error('[WORKER_MAIN] CRITICAL FAILURE: self.multiply was not defined after importScripts returned.');
}

// Set up the listener for messages from the main page.
self.onmessage = (e) => {
    console.log('[WORKER_MAIN] Received message from test.html:', e.data);
    const { a, b } = e.data;

    console.log('[WORKER_MAIN] Calling the imported multiply() function...');
    const product = self.multiply(a, b); // This function comes from test-utils.js
    console.log('[WORKER_MAIN] multiply() returned:', product);

    // Send the final result back.
    const result = {
        calculation: `${a} * ${b} = ${product}`,
        workerId: self.WORKER_ID,
        message: 'Test completed successfully!'
    };

    console.log('[WORKER_MAIN] Sending final result to test.html:', result);
    self.postMessage(result);
};

console.log('[WORKER_MAIN] test-worker.js is fully loaded and ready for messages.');