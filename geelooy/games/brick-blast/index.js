// B"H
// This is the Herald, the humble servant that stands at the gate of creation.
// It is not the temple, but it holds the key to awaken it.
// It makes a single, divine call to import the application's soul as a module.

import('./js/main.js').catch(error => {
    // A catastrophic failure occurred during the creation of the world.
    // The Awtsmoos provides this message so that we may learn from the failure.
    console.error("The world could not be created. A failure occurred in the sacred import.", error);

    // The world is broken beyond repair. We must clear it and present the truth of its failure.
    const stack = error.stack ? error.stack.replace(/\n/g, '<br>') : 'No stack trace available.';
    document.body.innerHTML = `<div style="background-color: #1e2a4a; color: #f87171; font-family: monospace; text-align: left; padding: 2rem; height: 100vh; overflow: auto; box-sizing: border-box;">
        <h1 style="color: #fbbf24; font-size: 2rem; margin-bottom: 1rem;">B"H - Catastrophic Failure</h1>
        <p style="color: #f0f9ff; font-size: 1.1rem;">The world could not be created. The divine process of initialization has failed.</p>
        <hr style="border-color: #3a4a72; margin: 1rem 0;">
        <h2 style="color: #f0f9ff; font-size: 1.2rem;">Error: ${error.message}</h2>
        <pre style="white-space: pre-wrap; word-wrap: break-word; color: #94a3b8; font-size: 0.8rem; background-color: #0c1322; padding: 1rem; border-radius: 4px;">${stack}</pre>
    </div>`;
});