// B"H
/**
 * @file styles.mjs
 * @description
 * Final-stretch certification CSS. The Awtsmoos widens the smallest witness
 * halls, seals alignment labels inside their boxes, and keeps z-index windows
 * inside the visible viewport so MiniMax can judge the actual renderer, not
 * accidental clipping.
 */
export function labyrinthCss() {
  return `${base()}${shell()}${maze()}${cells()}${witnesses()}${advanced()}`;
}

function base() {
  return `body{margin:0;background:#030710;color:white;font-family:system-ui,sans-serif}.lab{width:960px;height:640px;overflow:hidden;box-sizing:border-box;padding:8px;background:linear-gradient(135deg,#061226,#102b57);display:grid;grid-template-rows:52px 1fr;grid-template-columns:428px 500px;gap:8px}.panel{border:2px solid #2de3ff;background:#071326;padding:6px;overflow:hidden}.bar{grid-column:1/3;border:2px solid #2de3ff;background:#0a1831;padding:7px;display:grid;grid-template-columns:168px 1fr;gap:10px;align-items:center}.bar b{font-size:17px}.bar span{font-size:11px}`;
}

function shell() {
  return `.side{grid-column:1;display:grid;grid-template-rows:150px 126px 86px 68px 1fr;gap:6px}.maze{grid-column:2;display:grid;grid-template-rows:78px 80px 78px 76px 86px 78px;gap:5px}.level{border:2px solid #8090ff;background:#08162a;padding:4px;display:grid;grid-template-columns:70px 1fr;gap:5px;overflow:hidden}.label{border:1px solid white;background:#101d39;padding:5px;font-weight:900;font-size:12px}.label small{font-size:9px}`;
}

function maze() {
  return `.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px}.grid4{display:grid;grid-template-columns:.7fr minmax(78px,1.35fr) 1fr .8fr;gap:5px}.gridMinmax{display:grid;grid-template-columns:minmax(64px,1fr) 1.3fr .8fr fit-content(72px);gap:5px}.flexRow{display:flex;gap:5px}.wrapRow{display:grid;grid-template-columns:1fr 1fr;gap:4px;flex-wrap:wrap}.wrapRow>.cell{height:31px}.flexRow>.cell{flex:1}.flexCol{display:flex;flex-direction:column;gap:3px}.deep{display:grid;grid-template-columns:1fr 1fr;gap:4px;height:100%}`;
}

function cells() {
  return `.cell{border:2px solid #00d9ff;background:#06101f;padding:2px;overflow:hidden;min-width:0}.cell canvas{width:100%;height:38px}.wrapRow .cell canvas{height:27px}.deep .cell canvas{height:28px}.overflowRow .cell canvas{height:30px}.alignGrid{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:5px}.alignCell{position:relative;display:grid;grid-template-rows:16px 1fr}.alignCell b{font-size:8px;line-height:12px;color:white;padding-left:3px;white-space:nowrap}.alignCell canvas{height:26px}.imageChain{border:2px solid #8090ff;background:#06101f;padding:5px}.imageChain b{font-size:10px}.imageChain canvas{height:38px}`;
}

function witnesses() {
  return `.web{border:2px solid #00d9ff;background:#06101f;padding:5px}.web b,.svgbox b{font-size:10px}.web canvas{width:100%;height:118px}.svgbox{border:2px solid #8090ff;background:#06101f;padding:5px}.svgbox svg{width:100%;height:92px}.matrix{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px}.matrix div{border:2px solid white;height:48px;background:#071326;font-size:12px;font-weight:900;padding:5px;box-sizing:border-box}.r{background:#f40070!important;transform:rotate(-4deg)}.c{background:#00d9ff!important;color:#06101f;transform:scale(1.03)}.y{background:#ffe14a!important;color:#06101f;transform:translate(1px,1px) rotate(2deg)}.clipper{overflow:hidden;position:relative}.scrollY{overflow:scroll;--scroll-y:.66;--scroll-y-ratio:.30;scrollbar-color:#00e5ff #10213b}.scrollX{overflow-x:scroll;overflow-y:hidden;--scroll-x:.56;--scroll-x-ratio:.28;scrollbar-color:#ffdf3a #30142a}.autoBoth{overflow:auto;--scroll-y:.33;--scroll-x:.42;--scroll-y-ratio:.38;--scroll-x-ratio:.38;scrollbar-color:#ff00a8 #06101f}.slab{width:108px;height:12px;background:linear-gradient(90deg,red,yellow,lime,cyan,blue,magenta);border:2px solid white;margin-top:0}`;
}

function advanced() {
  return `.zAbs{position:relative;border:2px solid #00d9ff;background:#06101f;overflow:hidden}.zAbs canvas{position:absolute;left:126px;top:16px;width:196px;height:34px}.zWin{position:absolute;border:2px solid white;width:58px;height:20px;font-size:12px;font-weight:900;text-align:center;padding-top:5px}.za{left:8px;top:7px;background:#f40070;z-index:1}.zb{left:28px;top:23px;background:#00d9ff;color:#06101f;z-index:2}.zc{left:48px;top:39px;background:#ffe14a;color:#06101f;z-index:3}.corpus{height:62px}.realUi{display:grid;grid-template-columns:72px 1fr;gap:5px}.sidebar{border:2px solid #00d9ff;background:#06101f}.cards{display:grid;grid-template-columns:1fr 1fr;gap:4px}.cards div{border:1px solid white;background:linear-gradient(90deg,#f40070,#00d9ff);height:24px}`;
}
