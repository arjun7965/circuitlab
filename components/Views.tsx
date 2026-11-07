"use client";
import {useState} from "react";
import {ArrowRight,ArrowUpRight,BookOpen,Bookmark,Check,ChevronDown,ChevronRight,Clock3,GraduationCap,Layers3,Lightbulb,Search,Activity,CircuitBoard,ListChecks,RotateCcw} from "lucide-react";
import katex from "katex";
import {Button} from "./ui/button";
import {Lesson,lessons} from "../content/lessons";
import {checks,modules,refs} from "../content/library";
import {MiniDiagram,WorkArt} from "./Drawings";
import {Blueprint} from "./Academy";
import {Experiment} from "./Experiments";
import {State,toggle} from "./learning";
import {matchesSearch} from "./search";
export type Props={s:State; update:(fn:(s:State)=>State)=>void};
const topicIcons=[Activity,CircuitBoard,BookOpen];
export const destinations=[
 ["playground","Circuit Playground","Adjust component values and see circuits respond in real time.","11 experiments"],
 ["academy","Schematic Academy","Trace real circuits and discover what each component does.","2 walkthroughs"],
 ["reference","Quick Reference","Find formulas, symbols, and patterns for your next review.","15 references"]
];
export function Head({title,desc,children}:{title:string;desc?:string;children?:React.ReactNode}){
 return <header className="pagehead"><div><h1>{title}</h1>{desc&&<p>{desc}</p>}</div>{children}</header>
}
function Row({lesson,done=false}:{lesson:Lesson;done?:boolean}){
 return <a className="lessonrow" href={"#lesson/"+lesson.slug}><span className="rowicon">{done?<Check size={18}/>:<BookOpen size={17}/>}</span><span><b>{lesson.title}</b><small>{modules[lesson.module-1][0]}</small></span><span className="rowend">{lesson.minutes} min <ChevronRight size={15}/></span></a>
}
export function Dashboard({s}:{s:State}){
 const feature=lessons.find(l=>l.slug==="voltage-dividers")!;
 const last=lessons.find(l=>l.slug===s.recent[0]);
 const concept=refs[Math.floor(Date.now()/86400000)%refs.length];
 return <><Head title="Learning dashboard" desc="Your workspace for electronics fundamentals and schematic review."/>
 <article className="feature">
 <div className="featurecopy"><span className="kicker featuretag"><span/> Featured lesson</span>
 <h2>Voltage dividers</h2><p>Learn how two resistors set a voltage, then explore what happens when you connect a load.</p>
 <div className="featuremeta"><span><Layers3 size={14}/> Circuit analysis</span><i/> <span><Clock3 size={14}/>{feature.minutes} min</span></div>
 <Button variant="featured" asChild><a href="#lesson/voltage-dividers">{s.recent.includes(feature.slug)?"Revisit lesson":"Start lesson"} <ArrowRight size={16}/></a></Button>
 </div><div className="herofigure"><Blueprint/></div></article>
 {last&&<a href={"#lesson/"+last.slug} className="resume"><BookOpen size={17}/><span>Continue learning</span><b>{last.title}</b><ArrowRight size={16}/></a>}
 <div className="sectionhead"><h2>Your workbench</h2></div>
 <div className="workcards">{destinations.map(([id,title,desc,count],i)=>{const I=topicIcons[i];return <a className="workcard" href={"#"+id} key={id}><WorkArt kind={id}/><div className="workbody"><div className={"workmeta w"+i}><I size={13}/>{count}</div><h3>{title}<ArrowUpRight size={17}/></h3><p>{desc}</p></div></a>})}</div>
 <div className="lowergrid"><section><div className="sectionhead"><h2>{s.recent.length?"Recently viewed":"Learning path"}</h2><a href="#path">View path <ArrowRight size={14}/></a></div><div className="paper">{(s.recent.length?s.recent.map(id=>lessons.find(l=>l.slug===id)).filter((l):l is Lesson=>!!l):lessons).slice(0,3).map(l=><Row key={l.slug} lesson={l} done={s.done.includes(l.slug)}/>)}</div></section>
 <section><div className="sectionhead"><h2>Concept of the day</h2></div><div className="daily"><span className="kicker"><Lightbulb size={15}/> Field note</span><h3>{concept[0]}</h3><p>{concept[3]}</p><a href={"#reference/"+refs.indexOf(concept)}>Open reference <ArrowRight size={14}/></a></div></section></div></>
}
export function Path({s}:{s:State}){
 const [track,setTrack]=useState("All tracks");
 return <><Head title="Learning path" desc="Work from electrical fundamentals toward a board-level schematic review."/><div className="tabs">{["All tracks","Beginner","Intermediate","Advanced"].map(x=><button aria-pressed={track===x} key={x} onClick={()=>setTrack(x)}>{x}</button>)}</div><div className="modulelist">{modules.map(([name,desc],i)=>{
 const level=i<4?"Beginner":i<8?"Intermediate":"Advanced";if(track!=="All tracks"&&track!==level)return null;
 const members=lessons.filter(l=>l.module===i+1);
 return <details className="module paper" key={name} open={i===0||undefined}><summary><span className="moduleindex">{String(i+1).padStart(2,"0")}</span><div><small>{level} track</small><h3>{name}</h3></div><span className="statustag">{members.length?members.length+(members.length===1?" lesson":" lessons"):"Planned"}</span><ChevronDown size={17}/></summary><div className="modulecontent"><p>Module scope · {desc}</p>{members.length?members.map(l=><Row key={l.slug} lesson={l} done={s.done.includes(l.slug)}/>):<p>Lessons for this module are planned.</p>}</div></details>})}</div></>
}
function Quiz({lesson,s,update}:{lesson:Lesson}&Props){
 const [values,input]=useState<Record<number,string>>({});
 const answers=s.quiz[lesson.slug]||{};
 function submit(i:number,value:string){const q=lesson.quiz[i];const right=q.options?value===q.answer:value.trim()!==""&&Number.isFinite(Number(value))&&Math.abs(Number(value)-Number(q.answer))<=Math.max(1e-9,Math.abs(Number(q.answer))*0.005);
 update(st=>({...st,history:[...st.history,{lesson:lesson.slug,question:i,right,at:Date.now()}].slice(-1000),quiz:{...st.quiz,[lesson.slug]:{...st.quiz[lesson.slug],[i]:{value,right}}},review:{...st.review,[lesson.slug]:Date.now()+(right?3:1)*86400000}}))}
 return <section className="paper reading"><h2>Knowledge check</h2>{lesson.quiz.map((q,i)=><div className="question" key={q.question}><h3>{i+1}. {q.question}</h3>{q.options?<div className="answers">{q.options.map(o=><button key={o} aria-pressed={answers[i]?.value===o} onClick={()=>submit(i,o)}>{o}</button>)}</div>:<form onSubmit={e=>{e.preventDefault();submit(i,values[i]??answers[i]?.value??"")}}><input type="number" step="any" required aria-label={"Answer for question "+(i+1)} value={values[i]??answers[i]?.value??""} onChange={e=>input({...values,[i]:e.target.value})}/><button className="btn outline">Check answer</button></form>}{answers[i]&&<p className={"feedback "+(answers[i].right?"correct":"retry")} role="status"><b>{answers[i].right?"Correct. ":"Review this. "}</b>{q.explanation}</p>}</div>)}</section>
}
export function Learn({id,s,update}:{id:string}&Props){
 const l=lessons.find(v=>v.slug===id);
 if(!l)return <Head title="Lesson unavailable"><a href="#path">Return to learning path</a></Head>;
 const bookmark="lesson/"+id,done=s.done.includes(id);
 return <><div className="kicker sectionlabel">{modules[l.module-1][0]} <span>·</span> {l.minutes} min</div>
 <Head title={l.title} desc={l.intro}><button className="iconbtn" aria-label={s.bookmarks.includes(bookmark)?"Remove bookmark":"Bookmark lesson"} onClick={()=>update(st=>({...st,bookmarks:toggle(st.bookmarks,bookmark)}))}><Bookmark fill={s.bookmarks.includes(bookmark)?"currentColor":"none"} size={20}/></button></Head>
 <section className="paper reading"><h2>How it works</h2><p>{l.flow}</p><div className="equation" dangerouslySetInnerHTML={{__html:katex.renderToString(l.formula,{throwOnError:false,displayMode:true})}}/><p>{l.worked}</p></section>
 <div className="sectionhead"><h2>Try the circuit</h2></div><p className="introline">{l.experimentTask}</p><Experiment id={l.experiment}/>
 <section className="paper reading"><h2>In firmware</h2><p>{l.firmware}</p><h3>What to check on a schematic</h3><p>{l.mistake}</p></section>
 <Quiz key={id} lesson={l} s={s} update={update}/><section className="paper reading"><h2>Bench notes</h2><p>{l.summary}</p><h3>Sources</h3><div className="sources">{l.sources.map(link=><a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.title} <ArrowUpRight size={13}/></a>)}</div></section><button className="btn primary" onClick={()=>update(st=>({...st,done:toggle(st.done,id)}))}><Check size={16}/>{done?"Completed · undo":"Mark lesson complete"}</button> <a className="btn outline" href="#path">Learning path <ArrowRight size={15}/></a></>
}
export function Reference({id}:{id?:string}){
 const [query,setQuery]=useState(""),[category,setCategory]=useState("All");
 const filtered=refs.map((r,i)=>({r,i})).filter(({r})=>(category==="All"||r[1]===category)&&matchesSearch(r.join(" "),query));
 return <><Head title="Quick Reference" desc="Formulas, symbols, and circuit patterns to keep beside a schematic."/>
 <label className="fieldsearch"><Search size={18}/><input aria-label="Search the reference library" placeholder="Search the reference library…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
 <div className="tabs">{["All","Formulas","Schematic patterns","Terminology","Symbols"].map(x=><button key={x} aria-pressed={x===category} onClick={()=>setCategory(x)}>{x}</button>)}</div><div className="refgrid">{filtered.length===0&&<p>No matching references.</p>}{[...filtered].sort((a,b)=>Number(String(b.i)===id)-Number(String(a.i)===id)).map(({r,i})=><article className={"paper refcard "+(String(i)===id?"selectedref":"")} key={r[0]}><div className="refhead"><small>{r[1]}</small><MiniDiagram kind={r[5]}/></div><h3>{r[0]}</h3><b className="refeq">{r[2]}</b><p>{r[3]}</p><a href={"#"+r[4]}>Open {r[4].startsWith("academy")?"walkthrough":"lesson"} <ArrowRight size={15}/></a></article>)}</div></>
}
export function Checklist({s,update}:Props){
 const count=Object.values(checks).flat().length;
 return <><Head title="Review checklist" desc="Work through a design review and keep your checks on this device."/><div className="checkbar"><ListChecks size={20}/><strong>{s.checks.length} of {count} checked</strong><progress max={count} value={s.checks.length}/></div><div className="refgrid">{Object.entries(checks).map(([group,items])=><section className="paper checkgroup" key={group}><h3>{group}</h3>{items.map(([q,why])=><label key={q}><input type="checkbox" checked={s.checks.includes(q)} onChange={()=>update(st=>({...st,checks:toggle(st.checks,q)}))}/><span><b>{q}</b><small>{why}</small></span></label>)}</section>)}</div><section className="paper reading"><h2>From schematic to layout</h2><p>The schematic establishes connectivity, component values and electrical limits. Review the PCB artwork and stackup separately to verify physical placement, return paths, routing impedance, spacing and trace lengths.</p></section></>
}
export function Personal({s,update,bookmarks=false}:Props&{bookmarks?:boolean}){
 const answers=Object.values(s.quiz).flatMap(Object.values);
 const review=lessons.filter(l=>Object.values(s.quiz[l.slug]||{}).some(a=>!a.right)||(s.review[l.slug]||Infinity)<=Date.now());
 return bookmarks?<><Head title="Bookmarks" desc="Lessons and schematics you’ve saved for your next board review."/><div className="paper">{s.bookmarks.length?s.bookmarks.map(id=><div className="savedrow" key={id}><a href={"#"+id}><Bookmark size={16}/>{lessons.find(l=>"lesson/"+l.slug===id)?.title??(id==="academy/reset"?"MCU reset circuit":"I²C interface")}</a><button className="textbtn" onClick={()=>update(st=>({...st,bookmarks:toggle(st.bookmarks,id)}))}>Remove</button></div>):<div className="empty"><Bookmark/><h3>Your saved references live here</h3><p>Use the bookmark button in a lesson or schematic walkthrough.</p><a href="#path">Browse lessons <ArrowRight size={15}/></a></div>}</div></>:<>
 <Head title="Learning progress" desc="Your completed lessons, knowledge checks, and topics to revisit."/><div className="stats">{[[s.done.length+"/7","Lessons completed"],[answers.filter(a=>a.right).length+"/"+answers.length,"Correct answers"],[review.length,"Lessons to revisit"]].map(([v,t])=><div className="paper" key={t}><strong>{v}</strong><small>{t}</small></div>)}</div>
 <div className="sectionhead"><h2>Review queue</h2></div><div className="paper">{review.length?review.map(l=><Row key={l.slug} lesson={l}/>):<p className="pad">Answer a knowledge check to schedule a review. Missed questions appear here immediately, and studied lessons return after three days.</p>}</div>{s.history.length>0&&<><div className="sectionhead"><h2>Recent practice</h2></div><div className="paper">{s.history.slice(-5).reverse().map((a,i)=><div key={i} className="savedrow"><a href={"#lesson/"+a.lesson}>{lessons.find(l=>l.slug===a.lesson)?.title} · Question {a.question+1}</a><small>{a.right?"Correct":"Needs review"}</small></div>)}</div></>}<div className="sectionhead"><h2>Lesson progress</h2></div><div className="paper">{lessons.map(l=><Row key={l.slug} lesson={l} done={s.done.includes(l.slug)}/>)}</div></>
}


