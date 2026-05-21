// B"H
/**
 * @file tree-styles.js
 * Chapter 10: the crushed tree receives breath, width, and vertical rivers.
 * This stylesheet is injected once so dialog/global CSS cannot flatten the tree.
 */

const STYLE_ID = 'awtsmoos-git-pull-tree-styles';

/**
 * B"H - Ensures strong CSS exists for the pull selection tree.
 */
export function ensurePullTreeStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        #git-pull-tree.awts-git-pull-tree {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            max-height: 340px !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            border: 1px solid var(--color-border) !important;
            border-radius: 8px !important;
            padding: 10px !important;
            margin-top: 10px !important;
            box-sizing: border-box !important;
            white-space: normal !important;
        }
        #git-pull-tree .awts-pull-dir {
            display: block !important;
            width: 100% !important;
            margin: 4px 0 !important;
            min-width: 0 !important;
        }
        #git-pull-tree .awts-pull-summary {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            cursor: pointer !important;
            user-select: none !important;
            padding: 4px 0 !important;
            white-space: normal !important;
            min-width: 0 !important;
        }
        #git-pull-tree .awts-pull-children {
            display: block !important;
            margin-left: 20px !important;
            min-width: 0 !important;
        }
        #git-pull-tree .awts-pull-file {
            display: flex !important;
            align-items: flex-start !important;
            gap: 7px !important;
            margin: 4px 0 4px 16px !important;
            min-width: 0 !important;
            white-space: normal !important;
        }
        #git-pull-tree .awts-pull-name {
            flex: 1 1 auto !important;
            min-width: 0 !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
            white-space: normal !important;
            line-height: 1.35 !important;
        }
        #git-pull-tree input[type="checkbox"] {
            flex: 0 0 auto !important;
            margin-top: 2px !important;
        }
    `;
    document.head.appendChild(style);
}
