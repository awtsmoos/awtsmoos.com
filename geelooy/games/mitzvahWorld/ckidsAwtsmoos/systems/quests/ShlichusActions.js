
/**
 * @file ShlichusActions.js
 * @description
 * Chapter 55: THE VOICE OF THE HERALD
 * 
 * "Make your voice heard on high." (Yeshayahu 58:4)
 * This class coordinates the communication between the quest logic 
 * in the worker and the HTML interface in the main thread.
 * It formats mission text, updates progress bars, and triggers alerts.
 */

export default class ShlichusActions {
    /**
     * @function notifyProgress
     * @description Sends a UI packet to update the quest log and HUD.
     */
    static notifyProgress(olam, quest) {
        const percent = quest.totalCollectedObjects > 0 ? (quest.collected / quest.totalCollectedObjects) * 100 : 0;
        
        olam.ayshPeula("ui event", "questLog", {
            updateQuests: {
                active: Array.from(olam.shlichusHandler.activeQuests.values()).map(q => ({
                    id: q.id, title: q.title, description: q.description,
                    progress: (q.collected / q.totalCollectedObjects) * 100,
                    state: q.state
                }))
            }
        });

        // Trigger floating text if a specific milestone was hit
        if (quest.collected > 0) {
            olam.ayshPeula("ui event", "effectsOverlay", { 
                text: `${quest.title}: ${quest.collected}/${quest.totalCollectedObjects}`,
                color: "#ffd700" 
            });
        }
    }

    /**
     * @function showAlert
     * @description Displays the major mission start/end screens.
     */
    static showAlert(olam, type, quest) {
        const shaym = type === 'ACCEPT' ? "shlichus accept" : "congrats shlichus";
        
        olam.htmlAction({
            shaym,
            methods: { classList: { remove: "hidden" } },
            properties: {
                // Binding data directly to the HTML element's context
                contextData: { id: quest.id, title: quest.title, description: quest.description }
            }
        });
    }
}
