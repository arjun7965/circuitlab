export function WorkArt({kind}:{kind:string}){
 const ink=kind==="playground"?"#26695a":kind==="academy"?"#9a582d":"#64568c";
 return <svg className={"workart "+kind} viewBox="0 0 300 104" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
 <defs><pattern id={"dots"+kind} width="11" height="11" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill={ink} opacity=".27"/></pattern></defs>
 <rect width="300" height="104" fill={"url(#dots"+kind+")"}/>
 <g stroke={ink} fill="none" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
 {kind==="playground"?<>
 <path opacity=".32" d="M24 52h252M150 14v76" strokeDasharray="3 4"/>
 <path opacity=".22" d="M18 70c15 0 17-40 34-40s19 40 35 40 18-40 35-40 19 40 35 40 18-40 35-40 19 40 35 40 18-40 35-40"/>
 <path strokeWidth="2.7" d="M19 54h19c8 0 9-26 19-26s12 53 23 53 12-53 23-53 12 53 23 53 12-53 23-53 12 53 23 53 12-53 23-53 11 26 20 26h66"/>
 <circle cx="19" cy="54" r="3" fill={ink}/><circle cx="281" cy="54" r="3" fill={ink}/>
 </>:kind==="academy"?<>
 <path d="M19 63h51l16-16h36m-98-8h37l16-16h31l11 11h7M18 82h60l13-13h32m52-25h35l14-14h56m-106 26h25l14 14h37m-76-34h17l12-14h31"/><rect x="123" y="26" width="51" height="51" rx="3" strokeWidth="2.5"/><rect x="131" y="34" width="35" height="35" rx="2"/><circle cx="136" cy="39" r="1.5" fill={ink}/>
 {Array.from({length:6},(_,i)=><path key={i} d={`M${130+i*7} 20v6m0 51v7M117 ${34+i*7}h6m51 0h7`}/>)}
 {[19,24,18,280,250,234].map((x,i)=><circle key={i} cx={x} cy={[63,39,82,30,70,22][i]} r="3"/>)}
 </>:<>
 <path opacity=".42" d="M18 55h33m198 0h34" strokeDasharray="3 4"/>
 <path d="M49 54h17l4-8 7 16 7-16 7 16 7-16 5 8h17m8 0h17m0-14v28m7-28v28m0-14h17m11 0h16m0-13 20 13-20 13zm20 0v26m0-13h28"/>
 <g stroke="none" fill={ink} textAnchor="middle" fontFamily="monospace" fontSize="9"><text x="85" y="84">R</text><text x="149" y="84">C</text><text x="210" y="84">D</text></g>
 </>}</g></svg>
}
function MiniLabel({x,y,text,anchor="middle"}:{x:number;y:number;text:string;anchor?:"start"|"middle"|"end"}) {
  return <text x={x} y={y} textAnchor={anchor} fill="currentColor" stroke="none" fontFamily="var(--mono), monospace" fontSize="12">{text}</text>;
}
function MiniResistor({x,y,vertical=false}:{x:number;y:number;vertical?:boolean}) {
  return <path transform={`translate(${x} ${y}) rotate(${vertical?90:0})`} d="M0 0h4l3-5 5 10 5-10 5 10 3-5h4" />;
}
function MiniGround({x,y}:{x:number;y:number}) {
  return <path transform={`translate(${x} ${y})`} d="M0 0v4m-8 0H8m-13 4H5m-7 4h4" />;
}
function MiniFet({x,y}:{x:number;y:number}) {
  return <g transform={`translate(${x} ${y})`}>
    <path d="M0 14h12m0-9v18m5-22v5m0 5v5m0 5v5m0-23h11V-3m-11 27h11v8" />
  </g>;
}
function Junction({x,y}:{x:number;y:number}) {
  return <circle cx={x} cy={y} r="2.5" fill="currentColor" stroke="none"/>;
}
const diagramLabels:Record<string,string> = {
  rc:"A step voltage drives resistor R. The output node connects to capacitor C, whose other terminal is grounded.",
  divider:"Resistors R1 and R2 in series. The output taps the junction, with R2 returning to ground.",
  adc:"Resistors R1 and R2 in series. The ADC input taps their junction, and R2 returns to ground.",
  decoupling:"Capacitor C1 is connected between VDD and ground, in parallel with the microcontroller U1 supply pins.",
  flyback:"A diode lies across the relay coil. Its cathode K connects to V+, and its anode to the low-side switch node SW.",
  pullup:"A resistor connects VDD to SDA, the shared open-drain bus.",
  mosfet:"Insulated gate G beside an enhancement-mode channel, with drain D at top and source S at bottom.",
  symbols:"Four schematic symbols. R is a resistor, C a capacitor, D a diode and Q a MOSFET.",
  gpio:"A series resistor connects a GPIO output to its load.",
  ohm:"A resistor with the reference voltage positive on the left and negative on the right.",
};
export function MiniDiagram({kind}:{kind:string}) {
  const title=diagramLabels[kind];
  if (!title) return null;
  let drawing;
  switch (kind) {
    case "decoupling":
      drawing=<>
        <path d="M42 18h107v10M60 18v21m-12 0h24m-24 7h24m-12 0v20h89V57M42 66h18" />
        <rect x="127" y="28" width="44" height="29" rx="2" />
        <Junction x={60} y={18}/><Junction x={60} y={66}/>
        <MiniLabel x={37} y={22} text="VDD" anchor="end"/><MiniLabel x={37} y={70} text="GND" anchor="end"/>
        <MiniLabel x={82} y={46} text="C1" anchor="start"/><MiniLabel x={149} y={47} text="U1"/>
      </>;break;
    case "flyback":
      drawing=<>
        <path d="M44 16h94v15m-8 0h16m-8 0-9 18h18l-9-18m0 18v17H66V56M66 16v8c12 0 12 8 0 8 12 0 12 8 0 8 12 0 12 8 0 8 12 0 12 8 0 8M138 66h16" />
        <Junction x={66} y={16}/><Junction x={138} y={66}/>
        <MiniLabel x={39} y={20} text="V+" anchor="end"/><MiniLabel x={54} y={45} text="Coil" anchor="end"/>
        <MiniLabel x={155} y={34} text="K" anchor="start"/><MiniLabel x={155} y={52} text="D1" anchor="start"/>
        <MiniLabel x={159} y={70} text="SW" anchor="start"/>
      </>;break;
    case "symbols":
      drawing=<>
        <MiniResistor x={9} y={34}/><path d="M55 34h12m0-10v20m7-20v20m0-10h12M102 34h9m0-9v18l15-9-15-9m15 0v18m0-9h11" />
        <MiniFet x={155} y={21}/>
        <MiniLabel x={23} y={68} text="R"/><MiniLabel x={71} y={68} text="C"/><MiniLabel x={120} y={68} text="D"/><MiniLabel x={171} y={68} text="Q"/>
      </>;break;
    case "rc":
      drawing=<>
        <path d="M40 32h13m29 0h64m-37 0v15m-11 0h22m-22 6h22m-11 0v8" /><MiniResistor x={53} y={32}/><Junction x={109} y={32}/><MiniGround x={109} y={61}/>
        <MiniLabel x={35} y={36} text="Vin" anchor="end"/><MiniLabel x={68} y={20} text="R"/><MiniLabel x={128} y={56} text="C"/><MiniLabel x={150} y={36} text="Vout" anchor="start"/>
      </>;break;
    case "divider":
    case "adc":
      drawing=<>
        <path d="M31 47h18m29 0h43m29 0h20v9M99 47V27" /><MiniResistor x={49} y={47}/><MiniResistor x={121} y={47}/><MiniGround x={170} y={56}/><Junction x={99} y={47}/>
        <MiniLabel x={29} y={51} text="Vin" anchor="end"/><MiniLabel x={64} y={69} text="R1"/><MiniLabel x={136} y={69} text="R2"/><MiniLabel x={99} y={22} text={kind==="adc"?"ADC":"Vout"}/>
      </>;break;
    case "pullup":
      drawing=<>
        <path d="M78 18h18m-9 0v6m0 29v8m-47 0h94"/><MiniResistor x={87} y={24} vertical/><Junction x={87} y={61}/>
        <MiniLabel x={87} y={13} text="VDD"/><MiniLabel x={110} y={42} text="Rp"/><MiniLabel x={140} y={65} text="SDA" anchor="start"/>
      </>;break;
    case "mosfet":
      drawing=<>
        <g transform="translate(51 3) scale(1.5)"><MiniFet x={8} y={8}/></g>
        <MiniLabel x={56} y={39} text="G" anchor="end"/><MiniLabel x={119} y={16} text="D" anchor="start"/><MiniLabel x={119} y={65} text="S" anchor="start"/>
      </>;break;
    default:
      drawing=<>
        <path d="M52 43h32m29 0h32"/><MiniResistor x={84} y={43}/>
        <MiniLabel x={99} y={29} text="R"/>
        <MiniLabel x={48} y={47} text={kind==="gpio"?"GPIO":"+"} anchor="end"/><MiniLabel x={149} y={47} text={kind==="gpio"?"Load":"−"} anchor="start"/>
      </>;
  }
  return <svg className="minid" viewBox="0 0 200 84" role="img" aria-label={title}>
    <title>{title}</title><g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{drawing}</g>
  </svg>;
}
