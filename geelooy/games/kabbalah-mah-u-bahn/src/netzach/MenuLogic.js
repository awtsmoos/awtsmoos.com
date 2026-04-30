
import { StateRegister } from '../binah/StateRegister.js';
import { ControllerOfWill } from '../keter/ControllerOfWill.js';

/**
 * B"H
 * MenuLogic: The internal circuitry of choice.
 * Manages Settings selections and speed multipliers.
 */
export class MenuLogic {
    
    static digestTick() {
        // Toggle the Setting overlay
        if (ControllerOfWill.isFreshAwakening('MENU_TOGGLE')) {
            ControllerOfWill.consumeIntent('MENU_TOGGLE');
            StateRegister.IsSettingsMenuOpen = !StateRegister.IsSettingsMenuOpen;
            StateRegister.ActiveRealm = StateRegister.IsSettingsMenuOpen ? 'SETTINGS_MENU' : 'OVERWORLD';
        }

        if (StateRegister.ActiveRealm === 'SETTINGS_MENU') {
            if (ControllerOfWill.isFreshAwakening('U')) StateRegister.SettingsSelectionIdx = 0;
            if (ControllerOfWill.isFreshAwakening('D')) StateRegister.SettingsSelectionIdx = 1;
            
            if (ControllerOfWill.isFreshAwakening('A')) {
                ControllerOfWill.consumeIntent('A');
                // Toggles based on specific indices mapping intentions
                if (StateRegister.SettingsSelectionIdx === 0) {
                    StateRegister.GameSpeedMultiplier = StateRegister.GameSpeedMultiplier === 1 ? 2 : 1;
                }
            }
        }
    }
}
