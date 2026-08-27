
// B"H
import { LoopEngineController } from './loop/LoopEngineController.js';
export const LoopEngine = {
    apply: async (list, wsid, ssid, skip, prog) => LoopEngineController.executeBatch(list, wsid, ssid, skip, prog)
};
