// B"H
import { AwtsmoosConstants } from "../themes/AwtsmoosConstants.js";

/** @file ExtremeMainMenuStyles.js @description Large readable generated menu styles. */
export const ExtremeMainMenuStyles = {
  ".olam-menu-vessel":{ position:"fixed", inset:"0", backgroundColor:"#05070b", backgroundImage:`radial-gradient(circle at center, ${AwtsmoosConstants.colors.voidMidtone} 0%, #05070b 80%)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:AwtsmoosConstants.typology.ancientMono, zIndex:"100", overflow:"hidden", padding:"24px", boxSizing:"border-box" },
  ".main-divine-title":{ fontSize:"clamp(3rem, 10vw, 6rem)", fontFamily:AwtsmoosConstants.typology.epicTitles, color:"#fff8d5", letterSpacing:"0", margin:"0 0 28px", textTransform:"uppercase", textAlign:"center" },
  ".sefirotic-btn-group":{ display:"flex", flexDirection:"column", gap:"14px", width:"min(94vw, 540px)" },
  ".mitzvah-btn-extreme":{ width:"100%", minHeight:"72px", padding:"18px 24px", backgroundColor:"#1d4ed8", border:"3px solid #ffe27a", borderRadius:"8px", color:"#fff8d5", fontSize:"clamp(1rem, 3vw, 1.35rem)", fontWeight:"900", textTransform:"uppercase", letterSpacing:"0", cursor:"pointer", boxShadow:"0 12px 30px rgba(0,0,0,.55)", transition:"transform .12s ease, filter .12s ease" },
  ".footer-sig":{ position:"absolute", bottom:"18px", color:"#d9e3ff", fontSize:"1rem", opacity:".78" }
};
