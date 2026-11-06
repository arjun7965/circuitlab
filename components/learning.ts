export type Result = {right:boolean; value:string};
export type Attempt = {lesson:string;question:number;right:boolean;at:number};
export type State = {history:Attempt[];done:string[];recent:string[];bookmarks:string[];checks:string[];quiz:Record<string,Record<string,Result>>;review:Record<string,number>;theme:"light"|"dark"};
export const empty:State={history:[],done:[],recent:[],bookmarks:[],checks:[],quiz:{},review:{},theme:"light"};
export function readState():State {
 try {
  const parsed=JSON.parse(localStorage.getItem("circuitlab.v1")||"{}");
  const next={...empty};
  for(const name of ["done","recent","bookmarks","checks"] as const) next[name]=Array.isArray(parsed[name])?parsed[name].filter((s:unknown)=>typeof s==="string"):[];
  for(const name of ["quiz","review"] as const) if(parsed[name] && typeof parsed[name]==="object") next[name]=parsed[name];
  next.history=Array.isArray(parsed.history)?parsed.history.filter((a:Attempt)=>a && typeof a.lesson==="string" && Number.isFinite(a.at)):[];
  next.theme=parsed.theme==="dark"?"dark":"light";return next;
 } catch{return {...empty}}
}
export function toggle(items:string[],id:string){return items.includes(id)?items.filter(item=>item!==id):[...items,id]}


