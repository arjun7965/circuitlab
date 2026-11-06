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
export function MiniDiagram({kind}:{kind:string}) {
 const wire="M15 38h15l4-7 6 14 6-14 6 14 5-7h16"; 
 return <svg className="minid" viewBox="0 0 180 76" aria-label={kind+" reference diagram"} role="img"><g fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
 {kind==="rc"?<><path d={wire+"h32v10m-11 0h22m-22 6h22m-11 0v9m-9 0h18"}/><path d="M105 38h50"/><circle cx="105" cy="38" r="2"/></>:kind==="divider"?<><path d={wire+"h12l4-7 6 14 6-14 6 14 5-7h17v8m-8 0h16m-13 4h10m-8 4h6"}/><path d="M74 38v-16h23"/></>:kind==="diode"?<path d="M20 38h50V25l24 13-24 13V38m24-14v28m0-14h50"/>:kind==="pullup"?<path d="M68 10h18m-9 0v8l-4 3 8 4-8 4 8 4-4 3v13m-55 0h117"/>:kind==="mosfet"?<path d="M20 41h49m0-18v32m7-33v7m0 5v8m0 5v8m0-30h26V8m-26 44h26v15"/>:kind==="symbols"?<><path d={wire}/><path d="M88 38h18m0-10v20m7-20v20m0-10h17"/></>:<path d={wire+"h37"}/>}
 </g></svg>
}

