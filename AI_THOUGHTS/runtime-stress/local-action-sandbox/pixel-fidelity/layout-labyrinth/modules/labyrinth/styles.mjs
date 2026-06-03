// B"H
/**
 * @file styles.mjs
 * @description
 * The labyrinth is widened into auditable halls. The Awtsmoos does not merely
 * prove that boxes exist; it lets every witness stand large enough for a human,
 * MiniMax, and future agents to recognize grid, flex, SVG, WebGL, overflow,
 * transforms, and real UI corpus without squinting.
 */
export function labyrinthCss() {
  return `${base()}${shell()}${maze()}${cells()}${witnesses()}`;
}

function base() {
  return `body{margin:0;background:#030710;color:white;font-family:system-ui,sans-serif}.lab{width:960px;height:640px;overflow:hidden;box-sizing:border-box;padding:8px;background:linear-gradient(135deg,#061226,#102b57);display:grid;grid-template-rows:52px 1fr;grid-template-columns:500px 428px;gap:8px}.panel{border:2px solid #2de3ff;background:#071326;padding:6px;overflow:hidden}.bar{grid-column:1/3;border:2px solid #2de3ff;background:#0a1831;padding:7px;display:grid;grid-template-columns:170px 1fr;gap:12px;align-items:center}.bar b{font-size:17px}.bar span{font-size:12px}`;
}

function shell() {
  return `.side{display:grid;grid-template-rows:166px 142px 74px 1fr;gap:7px}.maze{display:grid;grid-template-rows:104px 104px 104px 104px 1fr;gap:6px}.level{border:2px solid #8090ff;background:#08162a;padding:4px;display:grid;grid-template-columns:72px 1fr;gap:5px;overflow:hidden}.label{border:1px solid white;background:#101d39;padding:6px;font-weight:900;font-size:12px}.label small{font-size:9px}`;
}

function maze() {
  return `.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px}.grid4{display:grid;grid-template-columns:1fr 1.3fr 1fr 1fr;gap:5px}.flexRow{display:flex;gap:5px}.flexRow>.cell{width:25%}.flexCol{display:flex;flex-direction:column;gap:4px}.deep{display:grid;grid-template-columns:1fr 1fr;gap:4px;height:100%}.realUi{display:grid;grid-template-columns:74px 1fr;gap:5px}.sidebar{border:2px solid #00d9ff;background:#06101f}.cards{display:grid;grid-template-columns:1fr 1fr;gap:4px}.cards div{border:1px solid white;background:linear-gradient(90deg,#f40070,#00d9ff);height:28px}`;
}

function cells() {
  return `.cell{flex:1;border:2px solid #00d9ff;background:#06101f;padding:2px;overflow:hidden;min-width:0}.cell canvas{width:100%;height:56px}.deep .cell canvas{height:46px}.overflowRow .cell canvas{height:34px}.svgDense{display:grid;grid-template-columns:1fr 1fr;gap:4px}.tinyGrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;height:100%}.tinyGrid span{border:1px solid #00d9ff;background:#08162a}`;
}

function witnesses() {
  return `.web{border:2px solid #00d9ff;background:#06101f;padding:5px}.web canvas{width:100%;height:132px}.svgbox{border:2px solid #8090ff;background:#06101f;padding:5px}.svgbox svg{width:100%;height:108px}.matrix{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px}.matrix div{border:2px solid white;height:52px;background:#071326}.r{background:#f40070!important;transform:rotate(-7deg)}.c{background:#00d9ff!important;color:#06101f;transform:scale(1.08)}.y{background:#ffe14a!important;color:#06101f;transform:translate(3px,2px) rotate(4deg)}.clipper{overflow:hidden;position:relative}.scrollY{overflow:scroll;--scroll-y:.66;--scroll-y-ratio:.30;scrollbar-color:#00e5ff #10213b}.scrollX{overflow-x:scroll;overflow-y:hidden;--scroll-x:.56;--scroll-x-ratio:.28;scrollbar-color:#ffdf3a #30142a}.autoBoth{overflow:auto;--scroll-y:.33;--scroll-x:.42;--scroll-y-ratio:.44;--scroll-x-ratio:.38;scrollbar-color:#ff00a8 #06101f}.slab{width:128px;height:18px;background:linear-gradient(90deg,red,yellow,lime,cyan,blue,magenta);border:2px solid white;transform:rotate(6deg);margin-top:1px}`;
}
