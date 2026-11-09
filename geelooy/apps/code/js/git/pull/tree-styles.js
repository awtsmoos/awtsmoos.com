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
        #git-pull-tree.awts-git-pull-tree.awts-git-pull-tree {
            display: block;
            width: 100%;
            max-width: 100%;
            min-width: 0;
            max-height: 340px;
            overflow-y: auto;
            overflow-x: hidden;
            border: 1px solid var(--color-border);
            border-radius: 8px;
            padding: 10px;
            margin-top: 10px;
            box-sizing: border-box;
            white-space: normal;
        }
        #git-pull-tree#git-pull-tree .awts-pull-dir.awts-pull-dir {
            display: block;
            width: 100%;
            margin: 4px 0;
            min-width: 0;
        }
        #git-pull-tree#git-pull-tree .awts-pull-summary.awts-pull-summary {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            user-select: none;
            padding: 4px 0;
            white-space: normal;
            min-width: 0;
        }
        #git-pull-tree#git-pull-tree .awts-pull-children.awts-pull-children {
            display: block;
            margin-left: 20px;
            min-width: 0;
        }
        #git-pull-tree#git-pull-tree .awts-pull-file.awts-pull-file {
            display: flex;
            align-items: flex-start;
            gap: 7px;
            margin: 4px 0 4px 16px;
            min-width: 0;
            white-space: normal;
        }
        #git-pull-tree#git-pull-tree .awts-pull-name.awts-pull-name {
            flex: 1 1 auto;
            min-width: 0;
            overflow-wrap: anywhere;
            word-break: break-word;
            white-space: normal;
            line-height: 1.35;
        }
        #git-pull-tree#git-pull-tree input[type="checkbox"][type="checkbox"] {
            flex: 0 0 auto;
            margin-top: 2px;
        }
    `;
    document.head.appendChild(style);
}
