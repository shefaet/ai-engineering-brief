// Source-driven interactive explainers. No generated HTML or executable content in article JSON.
const $=(s,r=document)=>r.querySelector(s);
const E=(tag,cls="",text=null)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==null)node.textContent=String(text);return node;};
const external=(label,url)=>{const a=E("a","",label);a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a;};
async function getJSON(path){const r=await fetch(path,{cache:"no-store"});if(!r.ok)throw Error("Request failed: "+r.status);return r.json();}
function heading(tag,txt,cls=""){return E(tag,cls,txt);}
function paragraph(text){return E("p","",text);}
function renderBullets(parent,items){
 if(!Array.isArray(items)||!items.length)return false;
 const list=E("ul","paper-insight-list");
 for(const item of items){
  const li=E("li");
  if(typeof item==="string")li.textContent=item;
  else if(item&&typeof item==="object"){
   if(item.lead)li.append(E("strong","",item.lead+(String(item.lead).endsWith(":")?"":":")));
   if(item.detail)li.append(document.createTextNode((item.lead?" ":"")+item.detail));
  }
  list.append(li);
 }
 parent.append(list);return true;
}
function chooseButton(label,onClick){const b=E("button","",label);b.type="button";b.addEventListener("click",onClick);return b;}
function createFigure(spec,ordinal){
 const box=E("section","paper-figure");box.setAttribute("aria-label",spec.title||"Interactive figure");
 const head=E("header"),h=heading("h3",spec.title||"Explore");head.append(h);box.append(head);
 if(spec.description)box.append(E("p","figure-description",spec.description));
 switch(spec.type){
  case "decision-path":renderDecisions(box,spec);break;
  case "study-flow":renderFlow(box,spec);break;
  case "result-bars":renderResults(box,spec);break;
  case "toy-adherence":renderToy(box,spec);break;
  default:box.append(paragraph("This explainer is unavailable in the current site version."));
 }
 if(spec.note)box.append(E("p","figure-note",spec.note));
 return box;
}
function renderDecisions(box,spec){
 const tabs=E("div","paper-tabs"),question=E("p","paper-question"),choices=E("div","paper-choice"),consequence=E("p","paper-consequence");
 tabs.setAttribute("role","group");tabs.setAttribute("aria-label","Choose a methodology");
 const buttons=[];
 function select(i){
  const s=spec.options[i];buttons.forEach((b,n)=>b.setAttribute("aria-pressed",String(n===i)));
  question.textContent=s.prompt;
  choices.replaceChildren(E("div","paper-option",s.alternatives[0]),E("span","","OR"),E("div","paper-option",s.alternatives[1]));
  consequence.textContent=s.consequence;
 }
 for(const [i,opt] of spec.options.entries()){const b=chooseButton(opt.name,()=>select(i));b.setAttribute("aria-pressed","false");buttons.push(b);tabs.append(b);}
 box.append(tabs,question,choices,consequence);select(0);
}
function renderFlow(box,spec){
 let index=0,timer=null;
 const progress=E("div","flow-progress"),markers=spec.steps.map(()=>E("span"));
 progress.setAttribute("role","img");progress.setAttribute("aria-label","Step progress");
 markers.forEach(m=>progress.append(m));
 const body=E("div","flow-body");body.setAttribute("aria-live","polite");
 const controls=E("div","flow-controls"),back=chooseButton("Previous",()=>{stop();show(index-1)}),next=chooseButton("Next",()=>{stop();show(index+1)}),play=chooseButton("Play steps",togglePlay),number=E("span","");
 next.className="primary";
 const buttons=E("div","flow-controls");buttons.style.marginTop="0";buttons.append(back,next);
 controls.append(play,number,buttons);
 function show(i){
  index=Math.max(0,Math.min(spec.steps.length-1,i));
  const s=spec.steps[index];body.replaceChildren(E("strong","",s.title),paragraph(s.detail),E("small","",s.hint));
  markers.forEach((m,k)=>m.classList.toggle("active",k<=index));
  progress.setAttribute("aria-label","Step "+(index+1)+" of "+spec.steps.length);
  back.disabled=index===0;next.disabled=index===spec.steps.length-1;
  number.textContent=(index+1)+" / "+spec.steps.length;
 }
 function stop(){if(timer!==null){clearInterval(timer);timer=null;}play.textContent="Play steps";play.setAttribute("aria-pressed","false");}
 function togglePlay(){
  if(timer!==null){stop();return;}
  if(index===spec.steps.length-1)show(0);
  play.textContent="Pause";play.setAttribute("aria-pressed","true");
  timer=setInterval(()=>{if(!document.contains(box)){stop();return;}if(index===spec.steps.length-1){stop();return;}show(index+1);},2300);
 }
 document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();});
 box.append(progress,body,controls);show(0);
}
function renderResults(box,spec){
 const tabs=E("div","paper-tabs"),plot=E("div","result-bars"),summary=E("p","result-summary");tabs.setAttribute("role","group");tabs.setAttribute("aria-label","Select observed outcomes");
 const buttons=[];
 function draw(i){
  buttons.forEach((b,n)=>b.setAttribute("aria-pressed",String(n===i)));
  plot.replaceChildren();
  const selected=spec.datasets[i];summary.textContent=selected.note;
  for(const p of selected.items){
   const row=E("div","result-bar-row"),head=E("div","result-bar-head");
   head.append(E("span","",p.label),E("strong","",p.value+"%"));
   const track=E("div","result-track"),fill=E("span");fill.setAttribute("role","img");fill.setAttribute("aria-label",p.label+": "+p.value+" percent");
   track.append(fill);row.append(head,track);plot.append(row);
   requestAnimationFrame(()=>{fill.style.width=(p.value/selected.max*100)+"%";});
  }
 }
 spec.datasets.forEach((set,i)=>{const b=chooseButton(set.name,()=>draw(i));buttons.push(b);tabs.append(b);});
 box.append(tabs,plot,summary);draw(0);
}
function renderToy(box,spec){
 const headline=E("div","lab-value"),result=E("strong"),sub=E("span","","Expected matches / 100 choices");
 headline.append(result,sub);
 const input=E("input","lab-slider");input.type="range";input.min=String(spec.minimum);input.max=String(spec.maximum);input.step="1";input.value=String(spec.initial);input.setAttribute("aria-label","Hypothetical agent following probability");
 const labels=E("div","lab-labels");labels.append(E("span","","Never follow"),E("span","","Always follow"));
 const grid=E("div","dot-matrix");grid.setAttribute("role","img");
 const dots=Array.from({length:100},()=>E("i"));dots.forEach(d=>grid.append(d));
 const expl=E("div","lab-summary"),expHead=E("strong"),description=E("p");expl.append(expHead,description);
 const follow=E("p","figure-note","Hypothetical mechanism only. The observed 86% agreement is not generated by this simulation; it is shown for comparison.");
 function paint(){
  const p=Number(input.value)/100,expected=spec.baseline+(100-spec.baseline)*p,n=Math.round(expected);
  result.textContent=expected.toFixed(1)+"%";
  expHead.textContent="Assumed following: "+input.value+"%";
  description.textContent="Expected match rate = 50% independent agreement + 50% x following probability. Observed study match rate: "+spec.observed+"%.";
  dots.forEach((d,i)=>d.classList.toggle("active",i<n));
  grid.setAttribute("aria-label",n+" shaded cells out of 100 expected matching decisions");
 }
 input.addEventListener("input",paint);
 box.append(headline,input,labels,grid,expl,follow);paint();
}
async function main(){
 const root=$("#paper-root");
 try{
  const slug=new URLSearchParams(location.search).get("slug")||"agent-judgment";
  if(!/^[a-z0-9-]{1,70}$/.test(slug))throw Error("Invalid paper id");
  const data=await getJSON("data/papers/"+slug+".json");
  document.title=data.title+" | Interactive paper | AI Engineering Brief";
  root.replaceChildren();
  const intro=E("header","paper-header");
  intro.append(E("div","overline",data.category.toUpperCase()),heading("h1",data.title));
  root.append(intro);
  const layout=E("div","paper-layout"),body=E("div","paper-body"),toc=E("aside","paper-toc"),tocDetails=E("details","paper-toc-details"),tocTitle=E("summary","","Sections"),nav=E("nav");nav.setAttribute("aria-label","Explainer chapters");
  let figure=0;
  for(const c of data.chapters){
   const section=E("section","paper-chapter");section.id=c.id;
   section.append(E("div","overline",c.eyebrow),heading("h2",c.title));
   const prose=E("div","paper-prose");if(!renderBullets(prose,c.bullets))(c.paragraphs||[]).forEach(p=>prose.append(paragraph(p)));section.append(prose);
   if(c.explainer)section.append(createFigure(c.explainer,++figure));
   body.append(section);
   const a=E("a","",c.title);a.href="#"+c.id;nav.append(a);
  }
  tocDetails.append(tocTitle,nav);toc.append(tocDetails);layout.append(body,toc);root.append(layout);
  const source=E("section","paper-citation");source.append(external("Original research ↗",data.source.url));root.append(source);
  const back=E("a","paper-return","← Daily briefing");back.href="story.html?id="+encodeURIComponent(data.storyId);root.append(back);
  if(location.hash)requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());
 }catch(err){console.error(err);root.replaceChildren(E("p","", "This explainer could not load. Return to the research archive."));}
}
main();
