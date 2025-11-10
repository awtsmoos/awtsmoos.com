// B"H
/**
 * Centralized keybindings for the application.
 * This allows for easier customization in the future.
 * Uses `event.code` for layout-independent key mapping.
 */
export const Keybindings = {
    // -- App Modes --
    TOGGLE_EDIT_MODE: { code: 'Tab', description: 'Toggle between Object and Edit Mode' },

    // -- Transform --
    TRANSFORM_MODE_TRANSLATE: { code: 'KeyG', description: 'Set transform mode to Move (Translate)' },
    TRANSFORM_MODE_ROTATE:    { code: 'KeyR', description: 'Set transform mode to Rotate' },
    TRANSFORM_MODE_SCALE:     { code: 'KeyS', description: 'Set transform mode to Scale' },

    // -- Viewport Navigation --
    VIEW_FOCUS_SELECTED: { code: 'NumpadDecimal', description: 'Focus view on selected object(s)' },
    VIEW_FOCUS_SELECTED_ALT: { code: 'Period', description: 'Focus view on selected object(s) (for laptops)' },

    // -- Object Manipulation --
    OBJECT_DELETE:        { code: 'Delete', description: 'Delete selected object(s)' },
    OBJECT_DELETE_ALT:    { code: 'Backspace', description: 'Delete selected object(s)' },
    OBJECT_ADD_PRIMITIVE: { code: 'KeyA', shiftKey: true, description: 'Add a new primitive object' },

    // -- Selection --
    SELECTION_ALL:     { code: 'KeyA', ctrlKey: true, description: 'Select all objects' },
    SELECTION_NONE:    { code: 'KeyA', altKey: true, description: 'Deselect all objects' },
    EDIT_SELECT_ALL:   { code: 'KeyA', description: 'Select/Deselect All (In Edit Mode)' },
    
    // B"H: New keybindings for edit mode selection type
    EDIT_MODE_SELECT_VERTEX: { code: 'Digit1', description: 'Switch to Vertex Select Mode' },
    EDIT_MODE_SELECT_EDGE:   { code: 'Digit2', description: 'Switch to Edge Select Mode' },
    EDIT_MODE_SELECT_FACE:   { code: 'Digit3', description: 'Switch to Face Select Mode' },


    // -- History --
    HISTORY_UNDO: { code: 'KeyZ', ctrlKey: true, description: 'Undo last action' },
    HISTORY_REDO: { code: 'KeyY', ctrlKey: true, description: 'Redo last action' },
    HISTORY_REDO_ALT: { code: 'KeyZ', ctrlKey: true, shiftKey: true, description: 'Redo last action (alternative)' },

    // -- Parenting --
    PARENT_SET: { code: 'KeyP', ctrlKey: true, description: 'Parent selected to active object' },
    PARENT_CLEAR: { code: 'KeyP', altKey: true, description: 'Unparent selected objects' },
};