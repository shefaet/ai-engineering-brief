const $=(s,r=document)=>r.querySelector(s);
const el=(tag,cls="",txt=null)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==null)n.textContent=String(txt);return n};
const dateText=s=>new Date(s+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const linkFor=(date,id)=>"story.html?id="+encodeURIComponent(id);
async function json(path){const r=await fetch(path,{cache:"no-store"});if(!r.ok)throw Error("Cannot retrieve "+path+" ("+r.status+")");return r.json()}
function appendP(node,paras){for(const p of paras||[])node.append(el("p","",p))}
function appendBullets(node,items){
 if(!Array.isArray(items)||!items.length)return;
 const list=el("ul","insight-list");
 for(const item of items){
  const li=el("li");
  if(typeof item==="string"){li.textContent=item}
  else if(item&&typeof item==="object"){
   if(item.lead)li.append(el("strong","",item.lead+(String(item.lead).endsWith(":")?"":":")));
   if(item.detail)li.append(document.createTextNode((item.lead?" ":"")+item.detail));
  }
  list.append(li);
 }
 node.append(list);
}
function renderExample(where,spec){
 if(!spec||spec.type!=="code-comparison"||!Array.isArray(spec.variants)||spec.variants.length!==2)return;
 const figure=el("figure","code-comparison");
 if(spec.caption)figure.append(el("figcaption","comparison-caption",spec.caption));
 const grid=el("div","comparison-grid");
 for(const variant of spec.variants){
  const panel=el("div","comparison-panel");
  panel.append(el("div","comparison-label",variant.label||"Example"));
  const pre=el("pre","comparison-code");
  const code=el("code","",variant.code||"");
  pre.append(code);panel.append(pre);grid.append(panel);
 }
 figure.append(grid);
 if(spec.takeaway)figure.append(el("p","comparison-takeaway",spec.takeaway));
 if(spec.note)figure.append(el("p","comparison-note",spec.note));
 where.append(figure);
}
function error(node,msg){node.replaceChildren(el("div","empty",msg))}
async function home(){
 const root=$("#article-list");
 try {
  const archive=await json("data/archive.json");
  if(archive.schemaVersion!==2||!Array.isArray(archive.stories))throw Error("Unsupported index");
  const entries=[...archive.stories].sort((a,b)=>b.date.localeCompare(a.date));
  const tags=[...new Set(entries.flatMap(s=>s.tags||[]))].sort();
  const params=new URLSearchParams(location.search);
  const input=$("#search");
  input.value=params.get("q")||"";
  let tag=tags.includes(params.get("tag"))?params.get("tag"):"";
  const filter=$("#tag-filters"),buttons=new Map();
  filter.replaceChildren();
  for(const t of ["",...tags]) {
   const b=el("button","tag-filter",t||"All");
   b.type="button";b.addEventListener("click",()=>{tag=t;render()});
   filter.append(b);buttons.set(t,b);
  }
  $("#edition-count").textContent=entries.length+" stories";
  if(entries.length){
   $("#latest-link").href=linkFor(entries[0].date,entries[0].id);
   $("#latest-date").textContent="· "+dateText(entries[0].date);
  }
  function render(){
   const terms=input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
   const found=entries.filter(s=>(!tag||(s.tags||[]).includes(tag))&&terms.every(t=>(s.title+" "+(s.summary||"")+" "+(s.searchText||"")+" "+(s.tags||[]).join(" ")+" "+s.date).toLowerCase().includes(t)));
   const u=new URL(location.href);
   input.value.trim()?u.searchParams.set("q",input.value.trim()):u.searchParams.delete("q");
   tag?u.searchParams.set("tag",tag):u.searchParams.delete("tag");
   history.replaceState(null,"",u);
   for(const [value,b]of buttons){b.classList.toggle("selected",value===tag);b.setAttribute("aria-pressed",String(value===tag))}
   $("#result-count").textContent=found.length+" found";
   root.replaceChildren();
   if(!found.length){error(root,"No matching stories.");return}
   for(const s of found){
    const card=el("article","article-card"),meta=el("div","card-top");
    meta.append(el("span","card-date",dateText(s.date)),el("span","card-category",s.category));
    card.append(meta);
    const h=el("h2","card-title"),a=el("a","",s.title);a.href=linkFor(s.date,s.id);h.append(a);card.append(h);
    if(s.summary&&s.summary.trim().toLowerCase()!==s.title.trim().toLowerCase())card.append(el("p","card-summary",s.summary));
    if(s.paperSlug){
     const deep=el("a","paper-deep-link","Interactive explainer ↗");
     deep.href="paper.html?slug="+encodeURIComponent(s.paperSlug);card.append(deep);
    }
    root.append(card);
   }
  }
  input.addEventListener("input",render);
  $("#clear").addEventListener("click",()=>{input.value="";tag="";render();input.focus()});
  document.addEventListener("keydown",e=>{if(e.key==="/"&&!["INPUT","TEXTAREA"].includes(document.activeElement?.tagName)){e.preventDefault();input.focus()}});
  render();
 }catch(e){console.error(e);error(root,"Story index unavailable.");}
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

function renderStoryContent(article,story){
 if(story.paperSlug){
  const dive=el("a","paper-callout");
  dive.href="paper.html?slug="+encodeURIComponent(story.paperSlug);
  dive.append(el("strong","","Explore this paper interactively →"));article.append(dive);
 }
 for(const section of story.sections||[]){
  const box=el("section","story-section");
  if(section.title)box.append(el("h3","",section.title));
  appendBullets(box,section.bullets);
  if(!(section.bullets||[]).length)appendP(box,section.paragraphs);
  if(section.example)renderExample(box,section.example);
  if(section.interactive==="anthropic-chart")interactiveChart(box,section.chartData||{});
  if(section.interactive==="eval-loop")interactiveCycle(box);
  article.append(box);
 }
 const src=el("details","source-detail"),label=el("summary","","Sources & evidence"),links=el("div","source-detail-inner");
 if(story.evidence)links.append(el("p","source-evidence",story.evidence));
 for(const item of story.sources||[]){
  const a=el("a","",item.name+" ↗");
  a.href=/^https:\/\//.test(item.url)?item.url:"#";a.target="_blank";a.rel="noopener noreferrer";
  links.append(a);
 }
 src.append(label,links);article.append(src);
 if(story.related?.length){
  const related=el("div","related-minimal");
  for(const item of story.related){
   const a=el("a","",item.label+" →");a.href=linkFor(item.date,item.id);related.append(a);
  }
  article.append(related);
 }
}
async function storyPage(){
 const root=$("#issue");
 try{
  const id=new URLSearchParams(location.search).get("id");
  if(!/^[a-z0-9-]{1,90}$/.test(id||""))throw Error("Invalid story ID");
  const archive=await json("data/archive.json");
  const entries=[...archive.stories].sort((a,b)=>b.date.localeCompare(a.date));
  const meta=entries.find(s=>s.id===id);if(!meta)throw Error("Story not indexed");
  const s=await json("data/stories/"+id+".json");
  if(s.id!==id||s.date!==meta.date)throw Error("Story index mismatch");
  document.title=s.title+" | AI Engineering Brief";
  const issueCode=$("#issue-code");if(issueCode)issueCode.textContent=dateText(s.date);
  root.replaceChildren();
  const header=el("header","issue-header");
  header.append(el("div","story-kicker",s.category+" · "+dateText(s.date)),el("h1","",s.title));
  root.append(header,el("div","issue-rule"));
  const article=el("article","story");article.id=id;
  renderStoryContent(article,s);root.append(article);
  const at=entries.findIndex(x=>x.id===id),nav=el("nav","previous-editions");
  if(entries[at+1]){const other=entries[at+1],a=el("a","","← "+other.title);a.href=linkFor(other.date,other.id);nav.append(a)}
  if(at>0){const other=entries[at-1],a=el("a","",other.title+" →");a.href=linkFor(other.date,other.id);nav.append(a)}
  root.append(nav);
 }catch(e){console.error(e);error(root,"Story unavailable. Return to the archive.");}
}
async function legacyEdition(){
 const root=$("#issue");
 try{
  const qs=new URLSearchParams(location.search);
  const date=qs.get("date"),id=decodeURIComponent(location.hash.slice(1));
  const archive=await json("data/archive.json");
  if(id&&archive.stories.some(s=>s.id===id&&(!date||s.date===date))){
   location.replace(linkFor(date,id));return;
  }
  const matches=archive.stories.filter(s=>!date||s.date===date);
  if(!matches.length)throw Error("No stories found");
  root.replaceChildren(el("header","issue-header", ""));
  const heading=el("h1","",date?dateText(date):"Stories");
  root.firstChild.append(heading);
  for(const s of matches){
   const card=el("article","article-card"),h=el("h2","card-title");
   const a=el("a","",s.title);a.href=linkFor(s.date,s.id);h.append(a);
   card.append(el("div","card-date",dateText(s.date)),h);
   root.append(card);
  }
 }catch(e){console.error(e);error(root,"Archive unavailable.");}
}
if(document.body.dataset.page==="home")home();
if(document.body.dataset.page==="story")storyPage();
if(document.body.dataset.page==="post")legacyEdition();
