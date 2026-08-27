// B"H
import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/** Rich screen-room details that support the actors instead of burying them. */
export class NarrativeRoomComposer {
  static compose(plan = {}, safe = {}) {
    if (!plan.enabled) return null;
    const w = safe.width || 800;
    const h = safe.height || 600;
    return G.group('narrative_room_composer', null, [
      this.bookWall(w * 0.08, h * 0.16, w * 0.34),
      this.bookWall(w * 0.58, h * 0.13, w * 0.34),
      this.frame(w * 0.72, h * 0.31, w * 0.16, h * 0.09, 'דרך ארץ'),
      this.plant(w * 0.16, h * 0.36),
      this.lamp(w * 0.86, h * 0.43),
      this.tableGlow(w, h)
    ]);
  }

  static bookWall(x, y, width) {
    const books = [];
    for (let i = 0; i < 9; i += 1) {
      const bx = x + 10 + i * (width / 11);
      const bh = 24 + (i % 3) * 10;
      books.push(G.rect(`room_book_${x}_${i}`, bx, y + 30 - bh, 14, bh, { fill: ['#8b2d2d', '#2f7542', '#d7b34a'][i % 3] }));
    }
    return G.group(`room_shelf_${x}`, null, [
      G.rect(`room_shelf_line_${x}`, x, y + 34, width, 9, { fill: '#7a421f' }),
      ...books
    ]);
  }

  static frame(x, y, w, h, text) {
    return G.group(`room_frame_${x}`, null, [
      G.rect(`room_frame_back_${x}`, x, y, w, h, { fill: '#7a421f' }),
      G.rect(`room_frame_page_${x}`, x + 7, y + 7, w - 14, h - 14, { fill: '#f6e1aa' }),
      G.text(`room_frame_text_${x}`, text, x + w * 0.2, y + h * 0.58, { fill: '#4a2812', font: '18px serif' })
    ]);
  }

  static plant(x, y) {
    return G.group(`room_plant_${x}`, null, [
      G.rect(`room_pot_${x}`, x - 12, y + 22, 24, 20, { fill: '#8a4b2b' }),
      G.ellipse(`room_leaf_a_${x}`, x - 10, y + 14, 8, 22, -0.5, { fill: '#437a3b' }),
      G.ellipse(`room_leaf_b_${x}`, x + 8, y + 12, 8, 24, 0.45, { fill: '#4e8b45' })
    ]);
  }

  static lamp(x, y) {
    return G.group(`room_lamp_${x}`, null, [
      G.rect(`lamp_stem_${x}`, x, y, 5, 42, { fill: '#6a3a1f' }),
      G.rect(`lamp_shade_${x}`, x - 28, y - 20, 62, 32, { fill: '#f0c66a', stroke: '#6a3a1f', lineWidth: 3 })
    ]);
  }

  static tableGlow(w, h) {
    return G.ellipse('cinematic_table_attention_glow', w * 0.5, h * 0.58, w * 0.28, h * 0.035, 0, { fill: 'rgba(90,45,15,.16)' });
  }
}
