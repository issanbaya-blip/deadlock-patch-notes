(()=>{
  const API="/api/hero-insights?hero_id=";
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const percent=n=>`${(n*100).toFixed(1)}%`;
  const heroName=id=>window.DEADLOCK_INFO?.heroes.find(h=>h.id===id)?.name||`ヒーロー ${id}`;
  const getRates=(rows,id,synergy=false)=>rows.map(row=>{
    if(synergy){const other=row.hero_id1===id?row.hero_id2:row.hero_id1;return {id:other,matches:row.matches_played,rate:row.matches_played?row.wins/row.matches_played:0}}
    const own=row.hero_id===id, other=own?row.enemy_hero_id:row.hero_id;
    return {id:other,matches:row.matches_played,rate:row.matches_played?(own?row.wins:row.matches_played-row.wins)/row.matches_played:0};
  }).sort((a,b)=>b.rate-a.rate);
  function rowsHtml(rows){return rows.map(row=>`<li><span>${esc(heroName(row.id))}</span><b>${percent(row.rate)}</b><small>${Number(row.matches).toLocaleString()} 試合</small></li>`).join("")||"<li>十分な試合データがありません。</li>"}
  window.loadHeroInsights=async hero=>{
    const body=document.querySelector("#hero-profile .profile-body");if(!body)return;
    let panel=body.querySelector(".hero-live-insights");if(!panel){panel=document.createElement("section");panel.className="hero-live-insights";panel.innerHTML='<h3>勝率・ビルド・相性</h3><p class="insight-status">公開試合データを取得中…</p><div class="insight-grid"></div>';body.append(panel)}
    const status=panel.querySelector(".insight-status"),grid=panel.querySelector(".insight-grid");grid.innerHTML="";
    try{
      const response=await fetch(API+encodeURIComponent(hero.id)+"&v=2");const data=await response.json();if(!response.ok)throw Error(data.error||"API error");
      const stats=data.hero,all=data.heroStats||[],totalGames=all.reduce((sum,x)=>sum+x.matches,0);
      const win=stats&&stats.matches?stats.wins/stats.matches:0,pick=totalGames?stats.matches/totalGames:0;
      const counters=getRates(data.counters||[],hero.id).filter(x=>x.matches>=100),synergies=getRates(data.synergies||[],hero.id,true).filter(x=>x.matches>=100);
      const matchupBest=[...counters].sort((a,b)=>b.rate-a.rate).slice(0,5),matchupWorst=[...counters].sort((a,b)=>a.rate-b.rate).slice(0,5),bestSynergy=synergies.slice(0,5);
      const statCard=`<article class="insight-card insight-summary"><h4>直近30日の戦績</h4><div class="insight-kpis"><span><b>${stats?percent(win):"—"}</b>勝率</span><span><b>${stats?percent(pick):"—"}</b>採用率</span><span><b>${Number(stats?.matches||0).toLocaleString()}</b>試合数</span></div><small>通常モード · 30日集計</small></article>`;
      const buildCards=(data.builds||[]).map(build=>{const groups=build.groups||[];const items=groups.flatMap(g=>g.items).slice(0,10);return `<article class="insight-card build-card"><div class="build-card-top"><span>COMMUNITY BUILD · ${Number(build.matches).toLocaleString()} 試合</span><b>${percent(build.winRate)}</b></div><h4>${esc(build.name)}</h4>${build.description?`<p>${esc(build.description.replace(/<[^>]*>/g," ").slice(0,180))}</p>`:""}<div class="build-items">${items.map(item=>`<span title="${esc(item.name)}"><img src="${esc(item.image)}" alt=""><small>${esc(item.name)}</small></span>`).join("")}</div><a href="${esc(build.url)}" target="_blank" rel="noopener">ビルド詳細 ↗</a></article>`}).join("")||'<article class="insight-card"><h4>ビルド</h4><p>現在表示できるビルドデータはありません。</p></article>';
      const matchCard=(title,sub,rows)=>`<article class="insight-card matchup-card"><h4>${title}</h4><p>${sub}</p><ol>${rowsHtml(rows)}</ol></article>`;
      grid.innerHTML=statCard+`<div class="insight-card build-list"><h4>人気ビルド</h4><p>試合データから集計した上位ビルド。勝率と採用試合数を併記しています。</p><div class="build-grid">${buildCards}</div></div>`+matchCard("相手にしやすいヒーロー","対面時の推定勝率が高い順",matchupBest)+matchCard("苦手な対面","対面時の推定勝率が低い順",matchupWorst)+matchCard("相性のよい味方","同じチームでの勝率が高い順",bestSynergy);
      const updated=new Intl.DateTimeFormat("ja-JP",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Tokyo"}).format(new Date(data.updatedAt));status.textContent=`${updated} 更新 · Deadlock API 公開試合データ`;
    }catch(error){status.textContent="戦績データを読み込めませんでした。少し時間をおいて再読み込みしてください。"}
  };
})();



