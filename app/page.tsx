"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {Activity,ArrowRight,BookMarked,BookOpen,Bookmark,ChartNoAxesColumnIncreasing,Check,ChevronRight,CircuitBoard,Command,FlaskConical,FolderOpen,House,Layers3,LayoutDashboard,ListChecks,Menu,Moon,PanelLeft,Route,Search,Sun,X} from "lucide-react";
import {lessons} from "../content/lessons";
import {refs} from "../content/library";
import {Experiments} from "../components/Experiments";
import {Academy} from "../components/Academy";
import {Checklist,Dashboard,Head,Learn,Path,Personal,Reference} from "../components/Views";
import {empty,readState,State,toggle} from "../components/learning";
import {matchesSearch} from "../components/search";
const nav=[
 {id:"dashboard",title:"Dashboard",icon:LayoutDashboard},{id:"path",title:"Learning Path",icon:Route},{id:"playground",title:"Circuit Playground",icon:Activity},{id:"academy",title:"Schematic Academy",icon:CircuitBoard},{id:"reference",title:"Quick Reference",icon:BookOpen},{id:"checklist",title:"Review Checklist",icon:ListChecks},{id:"bookmarks",title:"Bookmarks",icon:Bookmark},{id:"progress",title:"Progress",icon:ChartNoAxesColumnIncreasing}
];
const searchItems=[...lessons.map(l=>({label:l.title,to:"lesson/"+l.slug,tag:"Lesson",keywords:l.intro})),...refs.map((r,i)=>({label:r[0],to:"reference/"+i,tag:"Reference",keywords:r.slice(1,4).join(" ")})),...nav.map(n=>({label:n.title,to:n.id,tag:"Workspace",keywords:""})),{label:"MCU reset circuit",to:"academy/reset",tag:"Walkthrough",keywords:"capacitor button reset network"},{label:"I²C interface",to:"academy/i2c",tag:"Walkthrough",keywords:"I2C SDA SCL bus open drain"}];
export default function App(){
 const [s,setState]=useState<State>(empty),[loaded,ready]=useState(false),[route,setRoute]=useState("dashboard"),[mobile,setMobile]=useState(false),[query,search]=useState(""),[warning,warn]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null);
 const [view,id]=route.split("/");const current=nav.find(n=>n.id===view)?.title||(view==="lesson"?"Learning Path":"Dashboard");
 useEffect(()=>{setState(readState());ready(true);const change=()=>{setRoute(window.location.hash.slice(1)||"dashboard");setMobile(false);dialog.current?.close();window.scrollTo(0,0)};change();window.addEventListener("hashchange",change); return ()=>window.removeEventListener("hashchange",change)},[]);
 useEffect(()=>{if(loaded){document.documentElement.dataset.theme=s.theme;try{localStorage.setItem("circuitlab.v1",JSON.stringify(s))}catch{warn(true)}}},[s,loaded]);
 useEffect(()=>{if(loaded&&view==="lesson"&&lessons.some(l=>l.slug===id))setState(prev=>({...prev,recent:[id,...prev.recent.filter(x=>x!==id)].slice(0,7)}))},[loaded,id,view]);
 const openSearch=useCallback(()=>{search("");if(!dialog.current?.open)dialog.current?.showModal()},[]);
 useEffect(()=>{function key(e:KeyboardEvent){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openSearch()}if(e.key==="Escape")setMobile(false)}window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[openSearch]);
 const update=(fn:(st:State)=>State)=>setState(fn);
 const filtered=searchItems.filter(item=>matchesSearch(item.label+" "+item.keywords,query)).slice(0,18);
 const props={s,update};const percent=Math.round(s.done.length/lessons.length*100);
 return <div className="shell"><a className="skip" href="#content" onClick={e=>{e.preventDefault();document.getElementById("content")?.focus()}}>Skip to content</a>
 {mobile&&<button className="scrim" onClick={()=>setMobile(false)} aria-label="Close navigation"/>}
 <aside className={"sidebar "+(mobile?"mobileopen":"")}><a className="brand" href="#dashboard" onClick={()=>setMobile(false)}><img src="/icon.svg" alt=""/><span>CircuitLab</span></a>
 <nav aria-label="Main navigation">{[["Workspace",nav.slice(0,6)],["Personal",nav.slice(6)]] .map(([label,items])=><div className="navgroup" key={String(label)}><div className="navlabel">{String(label)}</div>{(items as typeof nav).map(n=><a href={"#"+n.id} key={n.id} className={current===n.title?"active":""} aria-current={current===n.title?"page":undefined} onClick={()=>setMobile(false)}><n.icon size={18} strokeWidth={1.7}/>{n.title}</a>)}</div>)}</nav>
 <a href="#progress" className="sideprogress"><span><span className="indicator"/>Curriculum progress</span><div className="progressline"><i style={{width:percent+"%"}}/></div><small>{s.done.length} of {lessons.length} lessons complete</small></a>
 </aside>
 <div className="main"><header className="topbar"><button className="mobilemenu iconbtn" onClick={()=>setMobile(true)} aria-label="Open navigation"><Menu size={20}/></button><div className="crumb"><PanelLeft size={16}/><span>Workspace</span><ChevronRight size={13}/><a href={view==="lesson"?"#path":"#"+view}>{current}</a></div>
 <div className="tools"><button className="searchbtn" onClick={openSearch}><Search size={16}/><span>Search workspace…</span><kbd>Ctrl K</kbd></button><button className="themebtn" aria-label={"Use "+(s.theme==="light"?"dark":"light")+" theme"} onClick={()=>update(st=>({...st,theme:st.theme==="light"?"dark":"light"}))}>{s.theme==="light"?<Sun size={19}/>:<Moon size={19}/>}</button></div></header>
 <main id="content" tabIndex={-1} className="content">{warning&&<p role="alert">Browser storage is unavailable. Progress will last for this session.</p>}
 {view==="dashboard"?<Dashboard s={s}/>:view==="path"?<Path s={s}/>:view==="lesson"?<Learn key={id} id={id} {...props}/>:view==="playground"?<><Head title="Circuit Playground" desc="Change a component, follow the signal, and test your intuition."/><Experiments initial={id}/></>:view==="academy"?<><Head title="Schematic Reading Academy" desc="Explore each connection and inspect the design decisions behind it."/><Academy initial={id} saved={s.bookmarks.filter(x=>x.startsWith("academy/")).map(x=>x.split("/")[1])} onBookmark={v=>update(st=>({...st,bookmarks:toggle(st.bookmarks,"academy/"+v)}))}/></>:view==="reference"?<Reference key={id} id={id}/>:view==="checklist"?<Checklist {...props}/>:view==="bookmarks"||view==="progress"?<Personal {...props} bookmarks={view==="bookmarks"}/>:<Head title="Page unavailable"><a href="#dashboard">Back to dashboard</a></Head>}
 </main></div>
 <dialog ref={dialog} className="searchdialog" onClick={e=>{if(e.target===dialog.current)dialog.current.close()}}><div><label><Search size={20}/><input autoFocus placeholder="Search lessons, schematics, and references…" aria-label="Search workspace" value={query} onChange={e=>search(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&filtered[0]){window.location.hash=filtered[0].to;dialog.current?.close()}}}/><button onClick={()=>dialog.current?.close()} aria-label="Close search"><X size={17}/></button></label><div className="searchresults">{filtered.length?filtered.map(item=><a key={item.to} href={"#"+item.to} onClick={()=>dialog.current?.close()}><span>{item.label}</span><small>{item.tag}</small><ArrowRight size={13}/></a>):<p>No matching lessons or references.</p>}</div></div></dialog>
 </div>
}

