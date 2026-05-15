
// B"H

import { createSecretToken } from "./secretToken.js";

/**
 * B"H
 * Masks visible API keys in text nodes.
 *
 * @param {ParentNode} root Root node.
 * @returns {void}
 */
export function maskVisibleSecrets(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!/ak_[A-Za-z0-9_-]{12,}/.test(node.nodeValue || "")) {
        return NodeFilter.FILTER_REJECT;
      }

      if (node.parentElement?.closest(".awt-secret-wrap,script,style,textarea,input")) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];

  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const node of nodes) replaceSecretNode(node);
}

/**
 * B"H
 * Replaces a text node containing keys.
 *
 * @param {Text} textNode Text node.
 * @returns {void}
 */
function replaceSecretNode(textNode) {
  const text = textNode.nodeValue || "";
  const pattern = /ak_[A-Za-z0-9_-]{12,}/g;
  const frag = document.createDocumentFragment();
  let last = 0;
  let match;

  while ((match = pattern.exec(text))) {
    if (match.index > last) frag.append(text.slice(last, match.index));
    frag.append(createSecretToken(match[0]));
    last = match.index + match[0].length;
  }

  if (last < text.length) frag.append(text.slice(last));
  textNode.replaceWith(frag);
}
