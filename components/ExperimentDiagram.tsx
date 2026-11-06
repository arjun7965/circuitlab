import type { ReactNode } from "react";
import { dividerModel, ledResistor } from "./math";
import { format, type Values } from "./experimentModels";

function Label({x,y,children,anchor="middle",accent=false}:{x:number;y:number;children:ReactNode;anchor?:"start"|"end"|"middle";accent?:boolean}) {
  return <text x={x} y={y} textAnchor={anchor} className={accent?"ex-annotation":""}>{children}</text>;
}
function Wire({d}:{d:string}) { return <path d={d} />; }
function Dot({x,y}:{x:number;y:number}) { return <circle cx={x} cy={y} r="3.8" fill="currentColor"/>; }
function Terminal({x,y}:{x:number;y:number}) { return <circle cx={x} cy={y} r="4.5" className="ex-terminal"/>; }
function Ground({x,y}:{x:number;y:number}) {
  return <g transform={`translate(${x} ${y})`}><path d="M0 0v8m-13 0h26m-21 5h16m-11 5h6"/></g>;
}
function R({x,y,vertical=false}:{x:number;y:number;vertical?:boolean}) {
  return <g transform={`translate(${x} ${y}) rotate(${vertical?90:0})`}><path d="M0 0h8l3 -7 6 14 6 -14 6 14 6 -14 6 14 3 -7h6"/></g>;
}
function C({x,y}:{x:number;y:number}) {
  return <g transform={`translate(${x} ${y})`}><path d="M0 0v14m-15 0h30m-30 8h30m-15 0v14"/></g>;
}
function Rail({x=230,y=42,label}:{x?:number;y?:number;label:string}) {
  return <><Wire d={`M${x-12} ${y}h24`}/><Label x={x} y={y-12}>{label}</Label></>;
}
function Divider({v,loaded}:{v:Values;loaded:boolean}) {
  const {tap}=dividerModel(v.vs,v.r1,v.r2,loaded?v.rl:undefined);
  return <><Rail label={format(v.vs,"V")}/><Wire d="M230 42v10"/><R x={230} y={52} vertical/><Wire d="M230 102v23h93m-93 0v8"/><R x={230} y={133} vertical/><Wire d="M230 183v8"/><Ground x={230} y={191}/><Dot x={230} y={125}/><Terminal x={326} y={125}/><Label x={207} y={82} anchor="end">R1 · {format(v.r1,"kΩ")}</Label><Label x={207} y={162} anchor="end">R2 · {format(v.r2,"kΩ")}</Label><Label x={338} y={130} anchor="start" accent>Vout {format(tap,"V")}</Label>
    {loaded&&<><Dot x={303} y={125}/><Wire d="M303 125v8"/><R x={303} y={133} vertical/><Wire d="M303 183v8"/><Ground x={303} y={191}/><Label x={324} y={164} anchor="start">RL · {format(v.rl,"kΩ")}</Label></>}
  </>;
}
function Rc({v,alt}:{v:Values;alt:boolean}) {
  const high = format(v.vs, "V");
  return <><Terminal x={95} y={95}/>
    <Label x={95} y={49}>Input step</Label>
    <Label x={95} y={71}>{alt ? high + " → 0 V" : "0 V → " + high}</Label>
    <Wire d="M100 95h81"/><R x={181} y={95}/><Label x={217} y={71}>R1 · {format(v.r,"kΩ")}</Label><Wire d="M231 95h126m-55 0v22"/><Dot x={302} y={95}/><C x={302} y={117}/><Wire d="M302 153v23"/><Ground x={302} y={176}/><Label x={326} y={141} anchor="start">C1 · {format(v.c,"µF")}</Label><Terminal x={362} y={95}/><Label x={378} y={99} anchor="start" accent>Vc(t)</Label></>;
}
function Loop({v,id}:{v:Values;id:string}) {
  const value = id==="power" ? format(v.ohms,"Ω") : format(v.r,"kΩ");
  return <><Rail x={250} label={format(v.vs,"V")}/><Wire d="M250 42v44"/><R x={250} y={86} vertical/><Wire d="M250 136v37"/><Ground x={250} y={173}/><Label x={278} y={118} anchor="start">R1 · {value}</Label><path className="ex-marker" d="M201 75v59m-5 -6 5 6 5 -6"/><Label x={188} y={112} anchor="end" accent>I</Label></>;
}
function Resistors({v,alt}:{v:Values;alt:boolean}) {
  return <><Terminal x={65} y={114}/><Terminal x={432} y={114}/><Label x={65} y={139}>A</Label><Label x={432} y={139}>B</Label>{alt?<><Wire d="M70 114h65m0 0V77h81m-81 37v39h81m50 -76h80v76h-80m80 -39h81"/><R x={216} y={77}/><R x={216} y={153}/><Dot x={135} y={114}/><Dot x={346} y={114}/><Label x={242} y={57}>R1 · {format(v.r1,"kΩ")}</Label><Label x={242} y={184}>R2 · {format(v.r2,"kΩ")}</Label></>:<><Wire d="M70 114h75m50 0h101m50 0h81"/><R x={145} y={114}/><R x={296} y={114}/><Label x={171} y={87}>R1 · {format(v.r1,"kΩ")}</Label><Label x={322} y={87}>R2 · {format(v.r2,"kΩ")}</Label></>}</>;
}
function Driver({id,v,alt}:{id:string;v:Values;alt:boolean}) {
  const fet=id==="mosfet", bus=id==="i2c";
  const resistor=fet?format(v.load,"Ω"):format(v.r,"kΩ");
  return <><Rail label={format(bus?3.3:v.vs,"V")}/><Wire d="M230 42v7"/><R x={230} y={49} vertical/><Label x={249} y={79} anchor="start">{fet?"Load":"Rp"} · {resistor}</Label><Wire d="M230 99v14h75m-75 0v14"/><Dot x={230} y={113}/><Label x={322} y={118} anchor="start" accent>{fet?"Drain":"Bus"}</Label>
  {fet?<><Wire d="M230 127v12h-15m0 -6v9m0 4v9m0 4v9m0 -7h15v25m-23 -52v32m-58 -16h58"/><Terminal x={145} y={150}/><Label x={139} y={177}>{alt?"Gate low":"Gate high"}</Label><Label x={246} y={157} anchor="start">Q1 · NMOS</Label></>:<><Terminal x={230} y={131}/><Terminal x={230} y={174}/><Wire d={alt&&!bus?"M230 136v34":"M230 170l-24 -31"}/><Wire d="M230 179v7"/><Label x={210} y={158} anchor="end">{alt&&!bus?"Closed":"Released"}</Label></>}
  <Ground x={230} y={186}/>{bus?<><Wire d="M305 113v17"/><C x={305} y={130}/><Wire d="M305 166v20"/><Ground x={305} y={186}/><Label x={329} y={154} anchor="start">{format(v.cb,"pF")}</Label></>:<Terminal x={310} y={113}/>}</>;
}
function Led({v}:{v:Values}) {
  const r=ledResistor(v.vs,v.vf,v.ma/1000);
  return <><Rail x={240} label={format(v.vs,"V")}/><Wire d="M240 42v10"/><R x={240} y={52} vertical/><Label x={265} y={84} anchor="start">R1 · {r===null?"—":format(r,"Ω")}</Label><Wire d="M240 102v21m-10 0h20l-10 17zM228 141h24m-12 0v37M256 127l15 -13m-7 1 7 -1 -1 7m-12 14 16 -13m-7 1 7 -1 -1 7"/><Ground x={240} y={178}/><Label x={289} y={145} anchor="start">D1 · {format(v.vf,"V")}</Label></>;
}
function Regulator({v}:{v:Values}) {
  return <><Terminal x={74} y={105}/><Wire d="M79 105h98m112 0h99"/><rect x={177} y={74} width={112} height={65} rx={3}/><Label x={233} y={112}>LDO</Label><Wire d="M233 139v40"/><Ground x={233} y={179}/><Terminal x={393} y={105}/><Label x={92} y={84}>Vin {format(v.vs,"V")}</Label><Label x={396} y={84}>Target {format(v.out,"V")}</Label><Label x={394} y={138} accent>{format(v.ma,"mA")} load</Label></>;
}
function Decoupling({v}:{v:Values}) {
  return <>
    <Label x={112} y={35}>Upstream supply</Label><Label x={112} y={54}>high Z during step</Label>
    <Terminal x={76} y={76}/><Wire d="M81 76h35l29 -16"/><Terminal x={152} y={76}/>
    <Wire d="M157 76h203v41M222 76v5"/><Dot x={222} y={76}/><Label x={346} y={60} accent>Rail V(t)</Label>
    <R x={222} y={81} vertical/><Label x={206} y={112} anchor="end">ESR · {format(v.esr,"mΩ")}</Label>
    <Wire d="M222 131v5"/><C x={222} y={136}/><Wire d="M222 172v14"/><Ground x={222} y={186}/>
    <Label x={199} y={155} anchor="end">C1 · {format(v.c,"µF")}</Label><Label x={199} y={174} anchor="end">Vinitial = 3.3 V</Label>
    <circle cx={360} cy={138} r={21}/><Wire d="M360 127v22m-5 -5 5 5 5 -5M360 159v27"/><Ground x={360} y={186}/>
    <Label x={390} y={142} anchor="start">ΔI {format(v.ma,"mA")}</Label>
  </>;
}
export function ExperimentDiagram({id,v,alt}:{id:string;v:Values;alt:boolean}) {
  let circuit:ReactNode;
  switch(id){
    case "divider": circuit=<Divider v={v} loaded={alt}/>;break;
    case "rc": circuit=<Rc v={v} alt={alt}/>;break;
    case "resistors": circuit=<Resistors v={v} alt={alt}/>;break;
    case "led": circuit=<Led v={v}/>;break;
    case "mosfet": case "i2c": case "drain": circuit=<Driver id={id} v={v} alt={alt}/>;break;
    case "ldo": circuit=<Regulator v={v}/>;break;
    case "decoupling": circuit=<Decoupling v={v}/>;break;
    default: circuit=<Loop v={v} id={id}/>;
  }
  return <div className="ex-board"><svg viewBox="0 0 520 230" role="img" aria-label={id+" circuit with selected component values"} className="ex-svg">
    <g fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinejoin="round" strokeLinecap="round">{circuit}</g>
  </svg></div>;
}
