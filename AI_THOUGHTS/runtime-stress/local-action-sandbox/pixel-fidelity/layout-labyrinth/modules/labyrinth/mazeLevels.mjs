// B"H
/**
 * Maze levels: final cleanup removes long labels from tight cells. The
 * Awtsmoos keeps semantics in row labels and leaves the pixels uncluttered.
 */
export function levels() {
  return [level0(), level1(), level2(), level3(), level4(), level5()].join('');
}

export function cell(id, cls = '') {
  return `<div class="cell ${cls}"><canvas id="${id}" width="112" height="44"></canvas></div>`;
}

function shell(depth, label, body, cls = '') {
  return `<section class="level ${cls}"><div class="label">D${depth}<br><small>${label}</small></div>${body}</section>`;
}

function level0() {
  return shell(0, 'GRID 3', `<div class="grid3">${cell('l0a')}${cell('l0b')}${cell('l0c')}</div>`);
}

function level1() {
  return shell(1, 'WRAP', `<div class="wrapRow">${cell('wr0')}${cell('wr1')}${cell('wr2')}${cell('wr3')}</div>`);
}

function level2() {
  return shell(2, 'MINMAX', `<div class="gridMinmax">${cell('mm0')}${cell('mm1')}${cell('mm2')}${cell('mm3')}</div>`);
}

function level3() {
  return shell(3, 'SCROLL', `<div class="flexRow overflowRow"><div class="cell clipper"><canvas id="ov0" width="112" height="30"></canvas><div class="slab"></div></div><div class="cell scrollY"><canvas id="ov1" width="112" height="30"></canvas><div class="slab"></div></div><div class="cell scrollX"><canvas id="ov2" width="112" height="30"></canvas><div class="slab"></div></div><div class="cell autoBoth"><canvas id="ov3" width="112" height="30"></canvas><div class="slab"></div></div></div>`);
}

function level4() {
  return shell(4, 'ALIGN', `<div class="alignGrid">${alignCell('al0', 'S')}${alignCell('al1', 'C')}${alignCell('al2', 'E')}${alignCell('al3', 'B')}</div>`);
}

function level5() {
  return shell(5, 'Z ABS', `<div class="zAbs"><div class="zWin za">A</div><div class="zWin zb">B</div><div class="zWin zc">C</div><canvas id="abs0" width="220" height="40"></canvas></div>`);
}

function alignCell(id, label) {
  return `<div class="cell alignCell"><b>${label}</b><canvas id="${id}" width="112" height="30"></canvas></div>`;
}
