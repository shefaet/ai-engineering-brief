const $=(s,r=document)=>r.querySelector(s);
const el=(tag,cls="",txt=null)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==null)n.textContent=String(txt);return n};
const dateText=s=>new Date(s+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const linkFor=(date,id)=>"post.html?date="+encodeURIComponent(date)+(id?"#"+encodeURIComponent(id):"");
async function json(path){const r=await fetch(path,{cache:"no-store"});if(!r.ok)throw Error("Cannot retrieve "+path+" ("+r.status+")");return r.json()}
function appendP(node,paras){for(const p of paras||[])node.append(el("p","",p))}
function error(node,msg){node.replaceChildren(el("div","empty",msg))}
async function home(){
 const root=$("#article-list");
 try{
  const archive=await json("data/archive.json");
  const entries=archive.editions.flatMap(e=>e.stories.map(s=>({...s,date:e.date,issue:e.issue})));
  const tags=[...new Set(entries.flatMap(s=>s.tags||[]))].sort();
  const url=new URL(location.href);
  let tag=tags.includes(url.searchParams.get("tag"))?url.searchParams.get("tag"):"";
  const input=$("#search");input.value=url.searchParams.get("q")||"";
  const filter=$("#tag-filters");filter.replaceChildren();
  const buttons=new Map();
  for(const t of ["",...tags]){const b=el("button","tag-filter",t||"All");b.type="button";b.onclick=()=>{tag=t;render()};filter.append(b);buttons.set(t,b)}
  const latest=archive.editions[0];if(latest){$("#latest-date").textContent="· "+dateText(latest.date);$("#latest-link").href=linkFor(latest.date)}
  $("#edition-count").textContent=archive.editions.length+" editions";
  function render(){
   const terms=input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
   const found=entries.filter(s=>(!tag||(s.tags||[]).includes(tag))&&terms.every(t=>(s.title+" "+s.summary+" "+(s.tags||[]).join(" ")+" "+(s.searchText||"")+" "+s.date).toLowerCase().includes(t)));
   const u=new URL(location.href);input.value.trim()?u.searchParams.set("q",input.value.trim()):u.searchParams.delete("q");tag?u.searchParams.set("tag",tag):u.searchParams.delete("tag");history.replaceState(null,"",u);
   for(const [t,b]of buttons){b.classList.toggle("selected",t===tag);b.setAttribute("aria-pressed",String(t===tag))}
   $("#result-count").textContent=found.length+" found";
   root.replaceChildren();if(!found.length){error(root,"No matches.");return}
   for(const s of found){
    const card=el("article","article-card");
    const top=el("div","card-top");top.append(el("span","card-date",dateText(s.date)),el("span","card-category",s.category));card.append(top);
    const h=el("h2","card-title"),a=el("a","",s.title);a.href=linkFor(s.date,s.id);h.append(a);card.append(h);
    if(s.summary&&s.summary.trim().toLowerCase()!==s.title.trim().toLowerCase())card.append(el("p","card-summary",s.summary));
    if(s.paperSlug){const link=el("a","paper-deep-link","Interactive explainer ↗");link.href="paper.html?slug="+encodeURIComponent(s.paperSlug);card.append(link)}
    root.append(card)
   }
  }
  input.addEventListener("input",render);
  $("#clear").onclick=()=>{input.value="";tag="";render();input.focus()};
  document.addEventListener("keydown",e=>{if(e.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)){e.preventDefault();input.focus()}});
  render()
 }catch(e){console.error(e);error(root,"Archive unavailable.")}
}
function interactiveCycle(where){
 const steps=[
 ["Generate","Execute a fixed dataset and store the complete agent and tool-call traces."],
 ["Grade","Score results and intermediate actions using explicit task-specific criteria."],
 ["Compare","Diff each test case against a previous run instead of relying on a mean score."],
 ["Analyze","Cluster repeated errors, including tool failures and policy violations."],
 ["Optimize","Change the prompt or system configuration, then rerun the same tests."]
 ];
 const viz=el("div","visual"),title=el("div","visual-head");title.append(el("strong","","Explore the agent evaluation cycle"),el("span","","Interactive process"));viz.append(title);
 const controls=el("div","eval-stepper"),panel=el("div","eval-panel"),buttons=[];
 function activate(i){buttons.forEach((b,j)=>b.setAttribute("aria-pressed",String(j===i)));panel.replaceChildren(el("strong","",(i+1)+". "+steps[i][0]),el("p","",steps[i][1]))}
 steps.forEach((item,i)=>{const b=el("button","",item[0]);b.type="button";b.onclick=()=>activate(i);buttons.push(b);controls.append(b)});
 viz.append(controls,panel,el("p","viz-note","Conceptual illustration of the Agents CLI evaluation loop, adapted from the linked Google technical article."));where.append(viz);activate(0)
}
function bars(where,points,note){
 where.replaceChildren();
 if(window.d3){
  const d3=window.d3,width=640,height=points.length*55+48,left=170,right=45;
  const svg=d3.select(where).append("svg").attr("viewBox","0 0 "+width+" "+height).attr("role","img").attr("aria-label",points.map(p=>p.label+" "+p.value+" percent").join(", "));
  const x=d3.scaleLinear().domain([0,100]).range([left,width-right]);
  const y=d3.scaleBand().domain(points.map(p=>p.label)).range([10,height-32]).padding(.35);
  const axis=d3.axisBottom(x).tickValues([0,25,50,75,100]).tickFormat(v=>v+"%");
  svg.append("g").attr("transform","translate(0,"+(height-32)+")").call(axis).call(g=>g.selectAll("text").attr("fill","#647778"));
  svg.selectAll(".bar-label").data(points).enter().append("text").attr("x",left-9).attr("y",p=>y(p.label)+y.bandwidth()/2+4).attr("text-anchor","end").attr("font-size",12).attr("fill","#304b53").text(p=>p.label);
  svg.selectAll(".bar").data(points).enter().append("rect").attr("x",left).attr("y",p=>y(p.label)).attr("height",y.bandwidth()).attr("width",p=>x(p.value)-left).attr("fill","#146e72").on("mouseenter",(event,p)=>{d3.select(event.currentTarget).attr("fill","#de8b63");note.textContent=p.label+": "+p.value+"%"}).on("mouseleave",event=>{d3.select(event.currentTarget).attr("fill","#146e72")});
  svg.selectAll(".bar-value").data(points).enter().append("text").attr("x",p=>x(p.value)+7).attr("y",p=>y(p.label)+y.bandwidth()/2+4).attr("font-size",12).attr("fill","#173239").text(p=>p.value+"%");
 }else{
  for(const p of points){const item=el("div","fallback-bar");item.append(el("span","",p.label+" - "+p.value+"%"));const track=el("div","fallback-track"),fill=el("div","fallback-fill");fill.style.width=p.value+"%";track.append(fill);item.append(track);where.append(item)}
 }
}
function interactiveChart(where,data){
 const viz=el("div","visual"),heading=el("div","visual-head");heading.append(el("strong","","Agent influence on analyst decisions"),el("span","","Anthropic / Oct 2026"));viz.append(heading);
 const tools=el("div","viz-tools"),target=el("div","viz-target"),note=el("div","chart-tooltip"),buttons=[];
 for(const [mode,label] of [["decisions","Method choices"],["recommendation","Final recommendation"]]){
  const b=el("button","",label);b.type="button";buttons.push([mode,b]);b.onclick=()=>draw(mode);tools.append(b)
 }
 function draw(mode){buttons.forEach(([key,b])=>b.setAttribute("aria-pressed",String(key===mode)));note.textContent=mode==="decisions"?"Agreement with randomized agent preference by methodological choice.":"Percent recommending rollout under each agent preference.";bars(target,data[mode]||[],note)}
 viz.append(tools,target,note,el("p","viz-note","Research sample: 50 analysts using Claude Code. Method-choice agreement and final recommendations measure different outcomes. Source: Anthropic Research, October 27, 2026."));where.append(viz);draw("decisions")
}

async function post(){
 const root=$("#issue");
 try{
  const archive=await json("data/archive.json");const requested=new URLSearchParams(location.search).get("date");const date=requested||archive.editions[0].date;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!archive.editions.some(e=>e.date===date))throw Error("Unknown date");
  const data=await json("data/posts/"+date+".json");document.title=dateText(date)+" | AI Engineering Brief";$("#issue-code").textContent="Issue "+data.issue;
  const header=el("header","issue-header");header.append(el("h1","",dateText(date)));
  header.append(el("p","issue-meta",data.stories.length+" developments"));root.append(header,el("div","issue-rule"));
  const layout=el("div","issue-layout"),body=el("div","issue-body"),aside=el("aside","issue-side");
  if(data.stories.length>2){
   const details=el("details","contents-details"),summary=el("summary","","Jump to a story"),nav=el("nav");
   for(const s of data.stories){const a=el("a","",s.title);a.href="#"+s.id;nav.append(a)}
   details.append(summary,nav);aside.append(details);
   layout.append(body,aside)
  } else layout.append(body);
  for(const s of data.stories){
   const article=el("article","story");article.id=s.id;
   article.append(el("div","story-kicker",s.category),el("h2","",s.title));
   if(s.takeaway) article.append(el("p","story-lead",s.takeaway));
   if(s.paperSlug){const dive=el("a","paper-callout");dive.href="paper.html?slug="+encodeURIComponent(s.paperSlug);dive.append(el("strong","","Explore the paper interactively →"));article.append(dive)}
   for(const section of s.sections||[]){
    const box=el("section","story-section");box.append(el("h3","",section.title));appendP(box,section.paragraphs);
    if(section.interactive==="anthropic-chart")interactiveChart(box,section.chartData||{});
    if(section.interactive==="eval-loop")interactiveCycle(box);
    article.append(box)
   }
   const src=el("details","source-detail"),summary=el("summary","","Sources & evidence"),links=el("div","source-detail-inner");
   if(s.evidence)links.append(el("p","source-evidence",s.evidence));
   for(const s0 of s.sources||[]){const a=el("a","",s0.name+" ↗");a.href=/^https:\/\//.test(s0.url)?s0.url:"#";a.target="_blank";a.rel="noopener noreferrer";links.append(a)}
   src.append(summary,links);article.append(src);
   if(s.related?.length){const related=el("div","related-minimal");for(const item of s.related){const a=el("a","",item.label+" →");a.href=linkFor(item.date,item.id);related.append(a)}article.append(related)}
   body.append(article)
  }
  root.append(layout);
  const position=archive.editions.findIndex(e=>e.date===date),nav=el("nav","previous-editions");
  if(archive.editions[position+1]){const d=archive.editions[position+1].date,a=el("a","","← "+dateText(d));a.href=linkFor(d);nav.append(a)}
  if(position>0){const d=archive.editions[position-1].date,a=el("a","",dateText(d)+" →");a.href=linkFor(d);nav.append(a)}
  root.append(nav);
  if(location.hash)requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView())
 }catch(e){console.error(e);error(root,"Edition unavailable. Select a date from the archive.")}
}
if(document.body.dataset.page==="home")home();
if(document.body.dataset.page==="post")post();
