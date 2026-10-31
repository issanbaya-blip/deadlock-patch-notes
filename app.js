const data = window.PATCH_DATA;
const grid = document.querySelector('#hero-grid');
const detail = document.querySelector('#detail-panel');
const search = document.querySelector('#hero-search');
let selectedHero = null;
let selectedGlobal = 0;
const globals = [data.sections.find(s=>s.title==='一般'),data.sections.find(s=>s.title==='アイテム')].filter(Boolean);
const street = data.street;
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const totalChanges = data.heroes.reduce((n,h)=>n+h.changes.length,0) + globals.reduce((n,g)=>n+g.items.length,0) + street.length;
document.querySelector('#updated-count').textContent = data.heroes.filter(h=>h.changes.length).length;
document.querySelector('#hero-total').textContent = data.heroes.length;
document.querySelector('#roster-count').textContent = `${data.heroes.length} HEROES`;
function renderCards(){grid.innerHTML=data.heroes.filter(h=>h.active||h.changes.length).map(h=>{const changed=h.changes.length>0;return `<button class="hero-card ${changed?'':'disabled'} ${selectedHero?.id===h.id?'selected':''}" type="button" ${changed?'':'disabled'} data-id="${h.id}" aria-label="${esc(h.name)}${changed?`, ${h.changes.length}件の変更`:', 変更なし'}"><img src="${esc(h.card||'')}" alt="" loading="lazy"><span class="hero-name">${esc(h.name)}</span>${changed?`<span class="hero-count">${h.changes.length}</span>`:'<span class="no-change">変更なし</span>'}</button>`}).join('');grid.querySelectorAll('.hero-card:not(:disabled)').forEach(card=>card.addEventListener('click',()=>selectHero(data.heroes.find(h=>h.id===Number(card.dataset.id)))));document.querySelector('#roster-count').textContent=`${grid.querySelectorAll('.hero-card').length} / ${data.heroes.filter(h=>h.active||h.changes.length).length} HEROES`}
function selectHero(hero){if(!hero?.changes.length)return;selectedHero=hero;renderCards();detail.classList.add('has-hero');detail.innerHTML=`<div class="detail-hero"><img class="detail-hero-bg" src="${esc(hero.background||hero.card||'')}" alt="" onerror="this.remove()"><span class="patch-chip">${hero.changes.length} CHANGES</span><div class="detail-copy"><span class="detail-overline">HERO PATCH / ${String(hero.id).padStart(2,'0')}</span><h2>${esc(hero.name)}</h2><p>${esc(hero.role)}</p></div></div><div class="detail-body"><div class="change-title"><span class="date-mark"></span><h3>${esc(hero.name)}の変更内容</h3><span>${hero.changes.length} ITEMS</span></div><ul class="change-list">${hero.changes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;if(innerWidth<760)detail.scrollIntoView({behavior:'smooth',block:'start'})}
search.addEventListener('input',()=>{const q=search.value.trim().toLocaleLowerCase('ja');for(const card of grid.querySelectorAll('.hero-card')){const h=data.heroes.find(x=>x.id===Number(card.dataset.id));card.hidden=!!q&&!`${h.name} ${h.aliases}`.toLocaleLowerCase('ja').includes(q)}});
function renderGlobalTabs(){const tabs=document.querySelector('#global-tabs');const labels=[...globals.map(g=>g.title==='一般'?'ゲームプレイ':g.title),...(street.length?['ストリートブロール']:[])];tabs.innerHTML=labels.map((label,i)=>`<button type="button" class="global-tab ${i===selectedGlobal?'active':''}" data-index="${i}">${esc(label)}</button>`).join('');tabs.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{selectedGlobal=Number(b.dataset.index);renderGlobalTabs();renderGlobal()}))}
function renderGlobal(){const group=selectedGlobal<globals.length?globals[selectedGlobal]:{title:'ストリートブロール',items:street};document.querySelector('#global-content').innerHTML=`<div class="global-list">${group.items.map(item=>`<article class="global-item">${esc(item)}</article>`).join('')}</div>`}
renderCards();renderGlobalTabs();renderGlobal();

