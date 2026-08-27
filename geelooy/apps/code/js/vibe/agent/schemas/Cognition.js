// B"H
/**
 * @file Cognition.js
 * @brief AI-native testing, architecture, runtime cognition, and shell-replacement tool schemas.
 */
import { cognitiveToolNames } from '../cognitionToolNames.js';

function schemaFor(name) {
    return {
        function: {
            name,
            description: `B"H. ${name} is an AI-native cognition/testing/runtime tool. It returns structured JSON and avoids shell scripting when possible.`,
            parameters: {
                type: "object",
                properties: {
                    target: { type: "string", description: "Optional project path, preview id, URL, concept, branch, or runtime target." },
                    goal: { type: "string", description: "Optional semantic goal or desired outcome." },
                    args: { type: "object", description: "Tool-specific structured arguments." },
                    options: { type: "object", description: "Execution options." }
                }
            }
        }
    };
}
export const CognitionSchemas = cognitiveToolNames.map(schemaFor);
export { cognitiveToolNames };
