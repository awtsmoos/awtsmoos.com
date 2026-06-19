// B"H
import { HeadAssembler } from '../factory/HeadAssembler.js';
import { PerspectiveManager } from '../anatomy/PerspectiveManager.js';

/**
 * HeadBuilder is a small covenant adapter: old callers ask for a head, and the
 * restored face assembler answers with skull, eyes, mouth, hair, hat, and neck.
 */
export class HeadBuilder {
  static build(data) {
    const profile = data.partzufProfile || PerspectiveManager.get(data.view);
    return HeadAssembler.build(data, profile);
  }
}
