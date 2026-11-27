const DATA_URL = "../data/faq.json";
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
let db = null, currentView = "category", activeCategory = "all", activeScenario = null, query = "";

function esc(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function sourceMarkup(sources=[]){
  if(!sources.length) return "";
  return `<details class="source-list"><summary>參考資料與延伸來源</summary>${sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)} ↗</a>`).join("")}</details>`;
}
function interactionMarkup(item){
  const x=item.interaction||{}; if(!x.type)return "";
  let body="";
  if(x.steps) body=`<ol>${x.steps.map(v=>`<li>${esc(v)}</li>`).join("")}</ol>`;
  else if(x.items) body=x.items.map(v=>`<div class="myth-item"><b>${esc(v.myth||v.title||"重點")}</b>${esc(v.fact||v.description||"")}</div>`).join("");
  else if(x.cards) body=x.cards.map(v=>`<div class="mini-card"><b>${esc(v.title)}</b>${esc(v.description||v.prompt||"")}${v.examples?`<ul>${v.examples.map(e=>`<li>${esc(e)}</li>`).join("")}</ul>`:""}</div>`).join("");
  else if(x.scenario) body=`<p>${esc(x.scenario)}</p>${(x.choices||[]).map(c=>`<div class="mini-card"><b>${esc(c.text)}</b>${esc(c.feedback)}</div>`).join("")}`;
  else if(x.routes) body=x.routes.map(r=>`<div class="mini-card"><b>${esc(r.trigger)}</b>${esc(r.action)}</div>`).join("");
  else if(x.dimensions) body=`<p>和醫療團隊討論時，可以逐項比較：</p><ul>${x.dimensions.map(d=>`<li>${esc(d)}</li>`).join("")}</ul>`;
  else if(x.scenarios) body=x.scenarios.map(v=>`<div class="mini-card"><b>${esc(v.title)}</b>${esc(v.learning)}</div>`).join("");
  else if(x.labels) body=`<p>認識示意圖中的重點：${x.labels.map(esc).join("、")}</p><p class="review-label">示意圖素材待醫療專業人員確認。</p>`;
  if(!body)return "";
  return `<div class="interaction-box"><p class="interaction-title">一起看重點</p>${body}</div>`;
}
function cardMarkup(item,index){
  const a=item.answer||{};
  const points=(a.key_points||[]).map(p=>`<li>${esc(p)}</li>`).join("");
  const review=item.clinical_review?.required ? `<div class="review-label">內容狀態：臨床審核流程中｜正式上線前由專業腹膜透析護理師確認</div>` : "";
  return `<article class="faq-card" id="${esc(item.id)}" data-id="${esc(item.id)}">
    <button class="faq-question" type="button" aria-expanded="false">
      <span class="faq-number">${String(index+1).padStart(2,"0")}</span><strong>${esc(item.question)}</strong><span class="chevron">＋</span>
    </button>
    <div class="faq-answer" hidden>
      ${item.emotion?`<p class="emotion">${esc(item.emotion)}</p>`:""}
      ${a.summary?`<p class="answer-summary">${esc(a.summary)}</p>`:""}
      ${points?`<ul class="answer-points">${points}</ul>`:""}
      ${a.action?`<div class="action-note"><b>你可以這樣做：</b>${esc(a.action)}</div>`:""}
      ${interactionMarkup(item)}
      ${sourceMarkup(item.sources)}
      ${review}
      <div class="feedback-row"><span>這個回答對你有幫助嗎？</span><button class="feedback-btn" type="button" data-feedback="yes">有幫助</button><button class="feedback-btn" type="button" data-feedback="more">還需要更多說明</button><span class="feedback-msg" aria-live="polite"></span></div>
    </div>
  </article>`;
}
function matches(item){
  if(!query)return true;
  const hay=[item.question,item.emotion,...(item.tags||[]),item.answer?.summary,...(item.answer?.key_points||[])].join(" ").toLowerCase();
  return hay.includes(query.toLowerCase());
}
function renderPopular(){
  const ids=db.ui_features?.popular_questions?.initial_order||[];
  $("#popularList").innerHTML=ids.map(id=>db.faq.find(x=>x.id===id)).filter(Boolean).map(x=>`<button type="button" class="popular-chip" data-open="${esc(x.id)}">${esc(x.question)}</button>`).join("");
}
function renderTabs(){
  const tabs=[{id:"all",title:"全部主題"},...db.categories.map(c=>({id:c.id,title:c.title}))];
  $("#categoryTabs").innerHTML=tabs.map(t=>`<button type="button" class="category-tab ${activeCategory===t.id?"active":""}" data-category="${esc(t.id)}">${esc(t.title)}</button>`).join("");
}
function renderQuestions(){
  let list=db.faq.filter(matches);
  if(activeScenario){const s=db.patient_scenarios.find(x=>x.id===activeScenario);if(s)list=list.filter(x=>s.faq_ids.includes(x.id));}
  if(currentView==="category" && activeCategory!=="all")list=list.filter(x=>x.category_id===activeCategory);
  const root=$("#faqContent");root.innerHTML="";
  if(!list.length){$("#emptyState").hidden=false;return;}
  $("#emptyState").hidden=true;
  if(currentView==="all" || activeScenario || query || activeCategory!=="all"){
    const wrap=document.createElement("div");wrap.className="question-list";
    wrap.innerHTML=list.map((x,i)=>cardMarkup(x,i)).join("");root.append(wrap);
  }else{
    db.categories.forEach(cat=>{
      const items=list.filter(x=>x.category_id===cat.id);if(!items.length)return;
      const block=document.createElement("section");block.className="category-block";block.id=`cat-${cat.id}`;
      block.innerHTML=`<div class="category-title"><h3>${esc(cat.title)}</h3><span>${items.length} 個問題</span></div><p class="category-description">${esc(cat.description||"")}</p><div class="question-list">${items.map((x,i)=>cardMarkup(x,i)).join("")}</div>`;
      root.append(block);
    });
  }
}
function setLargeText(on){
  document.documentElement.classList.toggle("large-text",on);
  const b=$("#largeTextToggle");b.setAttribute("aria-pressed",String(on));b.innerHTML=on?"<span>Aa</span> 關閉大字模式":"<span>Aa</span> 大字模式";
  try{localStorage.setItem("alwaysCheckLargeText",on?"on":"off")}catch(e){}
}
function update(){
  renderTabs();renderQuestions();
  $("#searchStatus").textContent=query?`搜尋「${query}」：找到 ${$$("#faqContent .faq-card").length} 個相關問題。`:"可輸入生活用語或醫療關鍵字，不確定專有名詞也沒關係。";
}
async function init(){
  try{
    const res=await fetch(DATA_URL);if(!res.ok)throw new Error("FAQ 資料讀取失敗");
    db=await res.json();
  }catch(err){
    $("#faqContent").innerHTML=`<div class="empty-state"><h3>FAQ 資料暫時無法載入</h3><p>請確認 data/faq.json 路徑正確，並透過網站伺服器或 GitHub Pages 開啟，不要直接以 file:// 開啟。</p></div>`;
    return;
  }
  renderPopular();update();
  $("#searchForm").addEventListener("submit",e=>{e.preventDefault();query=$("#searchInput").value.trim();activeScenario=null;activeCategory="all";update();$("#questions").scrollIntoView({behavior:"smooth"});});
  $("#searchInput").addEventListener("input",()=>{if(!$("#searchInput").value.trim()){query="";activeScenario=null;activeCategory="all";update();}});
  $("#clearSearch").addEventListener("click",()=>{$("#searchInput").value="";query="";activeScenario=null;activeCategory="all";update();});
  $("#scenarioGrid").addEventListener("click",e=>{const b=e.target.closest("[data-scenario]");if(!b)return;activeScenario=b.dataset.scenario;activeCategory="all";currentView="all";$$(".view-btn").forEach(x=>{let on=x.dataset.view==="all";x.classList.toggle("active",on);x.setAttribute("aria-pressed",String(on));});query="";$("#searchInput").value="";update();$("#questions").scrollIntoView({behavior:"smooth"});});
  $("#categoryTabs").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;activeScenario=null;currentView="category";$$(".view-btn").forEach(x=>{let on=x.dataset.view==="category";x.classList.toggle("active",on);x.setAttribute("aria-pressed",String(on));});update();});
  $$(".view-btn").forEach(b=>b.addEventListener("click",()=>{currentView=b.dataset.view;activeScenario=null;activeCategory="all";$$(".view-btn").forEach(x=>{let on=x===b;x.classList.toggle("active",on);x.setAttribute("aria-pressed",String(on));});update();}));
  $("#popularList").addEventListener("click",e=>{const b=e.target.closest("[data-open]");if(!b)return;currentView="all";activeCategory="all";activeScenario=null;query="";$("#searchInput").value="";$$(".view-btn").forEach(x=>{let on=x.dataset.view==="all";x.classList.toggle("active",on);x.setAttribute("aria-pressed",String(on));});update();setTimeout(()=>{const card=document.getElementById(b.dataset.open);if(card){card.scrollIntoView({behavior:"smooth",block:"center"});card.querySelector(".faq-question").click();}},30);});
  $("#faqContent").addEventListener("click",e=>{
    const q=e.target.closest(".faq-question");if(q){const card=q.closest(".faq-card"),panel=$(".faq-answer",card),open=card.classList.toggle("open");q.setAttribute("aria-expanded",String(open));panel.hidden=!open;return;}
    const fb=e.target.closest("[data-feedback]");if(fb){const row=fb.closest(".feedback-row");$$("button",row).forEach(x=>x.disabled=true);$(".feedback-msg",row).textContent="謝謝你的回饋！目前此回饋僅保存在這台裝置。";try{const key="alwaysCheckFaqFeedback";const old=JSON.parse(localStorage.getItem(key)||"[]");old.push({id:fb.closest(".faq-card").dataset.id,value:fb.dataset.feedback,at:new Date().toISOString()});localStorage.setItem(key,JSON.stringify(old));}catch(e){}}
  });
  $("#resetFilters").addEventListener("click",()=>{query="";$("#searchInput").value="";activeScenario=null;activeCategory="all";currentView="category";$$(".view-btn").forEach(x=>{let on=x.dataset.view==="category";x.classList.toggle("active",on);x.setAttribute("aria-pressed",String(on));});update();});
}
$("#largeTextToggle").addEventListener("click",()=>setLargeText(!document.documentElement.classList.contains("large-text")));
try{setLargeText(localStorage.getItem("alwaysCheckLargeText")==="on")}catch(e){setLargeText(false)}
$("#menuToggle").addEventListener("click",()=>{const nav=$("#mobileNav"),open=nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open));$("#menuToggle").textContent=open?"×":"☰";});
init();
