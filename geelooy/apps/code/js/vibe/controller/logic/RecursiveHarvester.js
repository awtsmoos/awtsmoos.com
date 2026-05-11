
// B"H
/**
 * @file RecursiveHarvester.js
 * @brief The Automator of Self-Improvement.
 * 
 * THE POEM OF THE TIRELESS WORKER:
 * When the master is sleeping, the Golem must toil,
 * Testing the logic and tilling the soil!
 * It runs the UI test, it looks for the flaw,
 * And rewrites the code to align with the Law.
 * Until the loop counter reaches its end,
 * The AI acts as its own strictest friend.
 */

export const RecursiveHarvester = {
    /**
     * B"H - Checks if the configuration demands another cycle of refinement.
     * @returns {boolean} True if a recursive loop was triggered.
     */
    checkAndTrigger(tab, controller) {
        const sess = tab.vibeSession;
        
        // If config is missing or disabled, rest.
        if (!sess.recursiveConfig || !sess.recursiveConfig.enabled) {
            return false;
        }
        
        // If we have hit the maximum allowed refinement loops, rest.
        if (sess.recursiveConfig.currentLoop >= sess.recursiveConfig.maxLoops) {
            console.log(`[RecursiveHarvester] B"H - Maximum recursive loops (${sess.recursiveConfig.maxLoops}) reached.`);
            // Reset for the next MANUAL invocation
            sess.recursiveConfig.currentLoop = 0; 
            return false;
        }

        sess.recursiveConfig.currentLoop++;
        const prompt = sess.recursiveConfig.prompt || "Review your changes, run tests, and recursively improve the code.";

        console.log(`[RecursiveHarvester] B"H - Triggering Recursive Loop ${sess.recursiveConfig.currentLoop}/${sess.recursiveConfig.maxLoops}`);

        // Inject the prompt as a user message
        sess.history.push({ role: 'user', content: `[B"H Auto-Refinement Loop ${sess.recursiveConfig.currentLoop}/${sess.recursiveConfig.maxLoops}]\n${prompt}` });
        
        // Save state before triggering
        import('../../db.js').then(m => m.VibeDB.saveSession(sess.id, sess));
        
        // Signal that the loop should continue
        return true;
    }
};
