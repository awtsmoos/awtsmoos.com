
// B"H
import { NodeSearcher } from '../search/NodeSearcher.js';
import { PropFactory } from '../../../../world/entities/props/PropFactory.js';

/**
 * @file AttachmentEngine.js
 * @description
 * THE UNIFICATION OF VESSELS (Yichud HaKelim).
 * B"H
 * 
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 5: THE INFINITE MERKAVAH (The Infinite Chariot)
 * ═══════════════════════════════════════════════════════════════
 * "Make any object or any nested groups of objects able to be parented 
 *  to any joint or any other object at any time."
 * 
 * To achieve true infinite nesting (Wife holds Wagon, Wagon holds Chair, 
 * Chair holds Husband, Husband holds Sword), we must loop through the 
 * bindings iteratively until no more floating dependents exist.
 * 
 * @class AttachmentEngine
 */
export class AttachmentEngine {
  static bind(rootNode, state, time) {
    if (!rootNode || !rootNode.children) return;

    const scene = state.get('scene') || {};
    const chars = state.get('characters') || {};

    // ─── 1. BIND ALL DEPENDENT PROPS TO THE ROOT ──────────────────────
    if (scene.props) {
      scene.props.forEach(prop => {
        if (prop.parentId) {
          const transform = { x: prop.x || 0, y: prop.y || 0, rotation: prop.rotation || 0, scaleX: prop.scale || 1, scaleY: prop.scale || 1 };
          const propNode = PropFactory.build(prop, transform, time);
          
          propNode._targetParentId = prop.parentBone ? `${prop.parentId}_${prop.parentBone}` : prop.parentId;
          rootNode.children.push(propNode);
        }
      });
    }

    // ─── 2. TAG DEPENDENT CHARACTERS ──────────────────────────────────
    Object.values(chars).forEach(char => {
      if (char.parentId || char.mountedTo) {
        const charNode = NodeSearcher.find(rootNode, char.id);
        if (charNode) {
          const parentRef = char.parentId || char.mountedTo;
          charNode._targetParentId = char.parentBone ? `${parentRef}_${char.parentBone}` : parentRef;
          charNode.transform.x = char.mountOffsetX || 0;
          charNode.transform.y = char.mountOffsetY || 0;
        }
      }
    });

    // ─── 3. THE RECURSIVE GRAFTING ALGORITHM ──────────────────────────
    let resolvedAny = true;
    let iterations = 0;

    while (resolvedAny && iterations < 5) {
      resolvedAny = false;
      iterations++;

      const seekers = this._findAllSeekers(rootNode);

      seekers.forEach(childNode => {
        const targetId = childNode._targetParentId;
        const parentNode = NodeSearcher.find(rootNode, targetId);

        if (parentNode) {
          const severedNode = NodeSearcher.findAndRemove(rootNode, childNode.id);
          
          if (severedNode) {
             delete severedNode._targetParentId; 
             
             // Normalize scaling to prevent extreme distortion when parented to small props
             const inverseScaleX = 1.0 / (parentNode.transform?.scaleX || 1.0);
             const inverseScaleY = 1.0 / (parentNode.transform?.scaleY || 1.0);
             
             if (severedNode.transform) {
                 severedNode.transform.scaleX *= inverseScaleX;
                 severedNode.transform.scaleY *= inverseScaleY;
             }
             
             if (!parentNode.children) parentNode.children = [];
             parentNode.children.push(severedNode);
             
             resolvedAny = true; 
          }
        }
      });
    }
  }

  static _findAllSeekers(node, list = []) {
    if (!node) return list;
    if (node._targetParentId) list.push(node);
    
    if (node.children && Array.isArray(node.children)) {
      for (let i = 0; i < node.children.length; i++) {
        this._findAllSeekers(node.children[i], list);
      }
    }
    return list;
  }
}
