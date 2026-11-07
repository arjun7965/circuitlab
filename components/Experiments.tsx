"use client";

import { useId, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import katex from "katex";
import { ExperimentDiagram } from "./ExperimentDiagram";
import { evaluate, format, models, type Model, type Values } from "./experimentModels";
import { rcVoltage } from "./math";
import "./experiments.css";

function ResponsePlot({v,discharge}:{v:Values;discharge:boolean}) {
  const tauMs=v.r*v.c;
  const initial=discharge?v.vs:0;
  const final=discharge?0:v.vs;
  const samples=Array.from({length:101},(_,n)=>{
    const ms=n*tauMs/20;
    return {ms,voltage:rcVoltage(initial,final,ms,tauMs)};
  });
  return <figure className="ex-plot">
    <figcaption>Capacitor voltage over time</figcaption>
    <div className="ex-plot-area">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={samples} margin={{top:6,right:24,bottom:24,left:12}}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 4"/>
          <XAxis dataKey="ms" type="number" domain={[0,5*tauMs]} ticks={[0,1,2,3,4,5].map(n=>n*tauMs)} tickFormatter={n=>format(n)} stroke="var(--muted)" tick={{fontSize:11}} label={{value:"Time (ms)",position:"insideBottom",offset:-15,fill:"var(--muted)",fontSize:12}}/>
          <YAxis domain={[0,v.vs]} tickFormatter={n=>format(n)} stroke="var(--muted)" tick={{fontSize:11}} width={42} label={{value:"Voltage (V)",angle:-90,position:"insideLeft",fill:"var(--muted)",fontSize:12}}/>
          <Tooltip labelFormatter={n=>format(Number(n),"ms")} formatter={n=>[format(Number(n),"V"),"Capacitor"]} contentStyle={{background:"var(--panel)",border:"1px solid var(--line)",borderRadius:6,color:"var(--ink)"}}/>
          <Line type="linear" dataKey="voltage" stroke="var(--teal)" strokeWidth={2.5} dot={false} isAnimationActive={false}/>
          <ReferenceDot x={v.probe*tauMs} y={rcVoltage(initial,final,v.probe,1)} r={5} fill="var(--teal)" stroke="var(--panel)" strokeWidth={2}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  </figure>;
}
function initialFields(model:Model) {
  return Object.fromEntries(model.fields.map(f=>[f.key,String(f.initial)]));
}
function Workbench({model}:{model:Model}) {
  const [fields,setFields]=useState<Record<string,string>>(()=>initialFields(model));
  const [alternate,setAlternate]=useState(false);
  const prefix=useId();
  const v:Values=Object.fromEntries(Object.entries(fields).map(([key,val])=>[key,val.trim()?Number(val):NaN]));
  const result=evaluate(model,v,alternate);
  function reset() { setFields(initialFields(model)); setAlternate(false); }
  function update(key:string,value:string) { setFields(previous=>({...previous,[key]:value})); }
  return <section className="ex-panel" aria-label={model.title+" experiment"}>
    <header className="ex-head"><div><h2>{model.title}</h2><p>{model.description}</p></div><button type="button" onClick={reset} className="ex-reset" aria-label={"Reset "+model.title+" parameters"} title="Restore starting values"><RotateCcw size={16}/><span>Reset</span></button></header>
    <div className="ex-workarea">
      <div className="ex-visual">
        {result.issue?<div className="ex-invalid" role="status">{result.issue}</div>:<>
          <ExperimentDiagram id={model.id} v={v} alt={alternate}/>
          <dl className="ex-metrics" aria-live="polite">{result.metrics.map(([label,val])=><div key={label}><dt>{label}</dt><dd>{val}</dd></div>)}</dl>
        </>}
      </div>
      <div className="ex-controls">
        {model.modes&&<div className="ex-modes" aria-label="Circuit operating mode">{model.modes.map((mode,i)=><button type="button" key={mode} aria-pressed={alternate===Boolean(i)} onClick={()=>setAlternate(Boolean(i))}>{mode}</button>)}</div>}
        {model.fields.filter(f=>!f.alternateOnly||alternate).map(f=>{
          const fieldId=prefix+"-"+f.key;
          const invalid=!Number.isFinite(v[f.key])||v[f.key]<f.min||v[f.key]>f.max;
          return <div className="ex-field" key={f.key}>
            <div><label htmlFor={fieldId}>{f.label}</label><span className="ex-number"><input id={fieldId} type="number" min={f.min} max={f.max} step="any" value={fields[f.key]} aria-invalid={invalid} onChange={e=>update(f.key,e.target.value)}/><small>{f.unit}</small></span></div>
            <input type="range" min={f.min} max={f.max} step={f.step} value={invalid?f.initial:v[f.key]} aria-label={f.label+" slider in "+f.unit} onChange={e=>update(f.key,e.target.value)}/>
          </div>;
        })}
      </div>
    </div>
    {model.id==="rc"&&!result.issue&&<ResponsePlot v={v} discharge={alternate}/>}
    <div className="ex-notes"><div className="ex-eq" dangerouslySetInnerHTML={{__html:katex.renderToString(alternate && model.alternateEquation || model.equation,{throwOnError:false})}}/><p>{model.observation}</p><details><summary>Model assumptions &amp; source</summary><p>{model.limits}</p><a href={model.source[1]} target="_blank" rel="noreferrer">{model.source[0]} ↗</a></details></div>
  </section>;
}
export function Experiment({id}:{id:string}) {
  const model=models.find(m=>m.id===id);
  return model?<Workbench key={model.id} model={model}/>:null;
}
function Explorer({initial}:{initial:string}) {
  const id=models.some(m=>m.id===initial)?initial:"divider";
  const selectId=useId();
  return <div className="ex-explorer"><div className="ex-picker"><label htmlFor={selectId}><SlidersHorizontal size={17}/> Select experiment</label>
    <select id={selectId} value={id} onChange={e=>{window.location.hash="playground/"+e.target.value;}}>{models.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select>
  </div><Experiment id={id}/></div>;
}
export function Experiments({initial="divider"}:{initial?:string}) {
  return <Explorer initial={initial}/>;
}
