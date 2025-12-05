
// B"H
// Chat State Management
export const chatState = {
    ui: null, // Global UI reference
    timeInterval: null,
    activeThreadId: null,
    isSpotlightActive: false,
    scrollSpeed: 0,
    lastScrollTop: 0,
    lastScrollTime: 0
};

export function setUiRef(ui) {
    chatState.ui = ui;
}

export function getUiRef() {
    return chatState.ui;
}
