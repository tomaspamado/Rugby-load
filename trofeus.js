// ---------- Troféus: medalhas, séries e nível ----------
// Contam todas as sessões. Na Seleção compara-se com o grupo; nos Lusitanos, com a tua própria média. Semanas sem GPS (gpsGap) não quebram séries: são ignoradas.
(function(){
  const TIER = {gold:{n:'Ouro',c:'#C99A1E'}, silver:{n:'Prata',c:'#8D98A8'}, bronze:{n:'Bronze',c:'#A8693A'}, base:{n:'',c:'#1F3B63'}};
  const ICON = {
    speed:'<path d="M13 3L6 13h5l-1 8 7-10h-5z" fill="#fff"/>',
    four:'<g fill="#fff"><rect x="7" y="7" width="4" height="4" rx="1"/><rect x="13" y="7" width="4" height="4" rx="1"/><rect x="7" y="13" width="4" height="4" rx="1"/><rect x="13" y="13" width="4" height="4" rx="1"/></g>',
    nine:'<path d="M12 6l5 6h-3.2v6h-3.6v-6H7z" fill="#fff"/>',
    load:'<path d="M12 5l6 2.4v4.4c0 3.2-2.4 5.6-6 7-3.6-1.4-6-3.8-6-7V7.4z" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.2 12.2l2 2 3.6-3.8" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  const KINDS = [
    {k:'speed', t:'Meta de velocidade', d:'Chegar a 95% do teu máximo (31,7 km/h) numa semana. Prata: 97%. Ouro: novo recorde da época.', pts:{bronze:3,silver:5,gold:8}},
    {k:'four',  t:'Quatro de quatro', d:'Numa sessão, acima em distância, corrida rápida, acelerações e velocidade. Na Seleção, contra a média do grupo; nos Lusitanos, contra a tua própria média.', pts:{base:2}},
    {k:'nine',  t:'Número 1 dos 9', d:'Primeiro entre os scrum-halves em pelo menos 3 das 4 métricas da semana.', pts:{base:5}},
    {k:'load',  t:'Carga certa', d:'Semana fechada com a carga entre 0,8 e 1,3 do teu habitual (a zona segura).', pts:{base:2}}
  ];
  const LEVELS = [{n:'Bronze',min:0},{n:'Prata',min:20},{n:'Ouro',min:50},{n:'Elite',min:100}];
  const sel = SESSIONS.slice();
  const weeks = [...new Set(sel.map(s=>s.week))].sort((a,b)=>a-b);
  const medals = [];
  const add = (k,tier,date,week,note)=>medals.push({k,tier:tier||'base',date,week,note:note||''});

  weeks.forEach(w=>{
    const xs = sel.filter(s=>s.week===w), gap = xs.some(s=>s.gpsGap);
    // Meta de velocidade (semana)
    const best = xs.reduce((a,x)=>x.maxSpeed>a.maxSpeed?x:a, xs[0]);
    const before = SESSIONS.filter(s=>s.date<best.date).map(s=>s.maxSpeed), prevBest = before.length?Math.max(...before):0;
    const pct = best.maxSpeed/MAXREF;
    if(pct>=0.95){ const tier = best.maxSpeed>prevBest ? 'gold' : pct>=0.97 ? 'silver' : 'bronze'; add('speed',tier,best.date,w,best.maxSpeed.toFixed(1).replace('.',',')+' km/h ('+Math.round(pct*100)+'%)'); }
    // Quatro de quatro (sessão)
    xs.forEach(s=>{
      if(teamOf(s)==='Seleção'){ if(s.rd>s.avgRd && s.hsr>s.avgHsr && s.accel>s.avgAccel && s.maxPct>s.avgMaxPct) add('four','base',s.date,w,'Acima do grupo nas 4 métricas'); }
      else if(s.type!=='Match' && !s.shortSession){ // Lusitanos: contra a tua própria média (5 treinos anteriores)
        const pv = SESSIONS.slice(0,SESSIONS.indexOf(s)).filter(x=>x.type!=='Match'&&!x.combined&&!x.shortSession).slice(-5);
        if(pv.length>=3){ const m=k=>pv.reduce((a,x)=>a+x[k],0)/pv.length; if(s.rd>m('rd') && s.hsr>m('hsr') && s.accel>m('accel') && s.maxSpeed>m('maxSpeed')) add('four','base',s.date,w,'Acima da tua média nas 4 métricas'); }
      } });
    // Número 1 dos 9 (semana, só onde há relatório semanal)
    const P = w===45 ? POSWK : w===46 ? POSWK46 : null;
    if(P){ const me=P.rows.find(r=>r.me), shs=P.rows.filter(r=>r.sh&&!r.me); const wins=['rd','hsr','acc','sp'].filter(k=>shs.every(r=>me[k]>r[k])).length; if(wins>=3) add('nine','base',xs[xs.length-1].date,w,'#1 dos 9 em '+wins+' de 4'); }
    // Carga certa (semana fechada)
    if(!gap){ const lastS = xs[xs.length-1], n28 = SESSIONS.filter(x=>x.date<=lastS.date && (new Date(lastS.date)-new Date(x.date))/86400000<28).length, r = meanRd(7,lastS)/meanRd(28,lastS); if(n28>=6) if(r>=0.8 && r<=1.3) add('load','base',lastS.date,w,'Rácio '+r.toFixed(2).replace('.',',')); }
  });

  // séries (semanas seguidas); semanas com gpsGap são ignoradas
  const okW = weeks.filter(w=>!sel.some(s=>s.week===w&&s.gpsGap));
  const streak = k=>{ const has=new Set(medals.filter(m=>m.k===k).map(m=>m.week)); let cur=0,best=0,run=0; okW.forEach(w=>{ if(has.has(w)){run++;best=Math.max(best,run);}else run=0; }); for(let i=okW.length-1;i>=0&&has.has(okW[i]);i--) cur++; return {cur,best}; };
  const ST = {speed:streak('speed'), load:streak('load'), nine:streak('nine')};

  const pts = medals.reduce((a,m)=>a+(KINDS.find(x=>x.k===m.k).pts[m.tier]||0),0);
  let li = 0; LEVELS.forEach((l,i)=>{ if(pts>=l.min) li=i; });
  const lv = LEVELS[li], nx = LEVELS[li+1];
  const medal = (k,tier,locked)=>'<svg class="mdl'+(locked?' lk':'')+'" viewBox="0 0 24 28" aria-hidden="true"><path d="M7 1h4l1 7H8zM17 1h-4l-1 7h4z" fill="'+(locked?'#cfd6df':'#C8102E')+'"/><circle cx="12" cy="17" r="9" fill="'+(locked?'#dde3ea':TIER[tier||'base'].c)+'"/>'+(locked?'':ICON[k])+'</svg>';
  const fd = d=>dshort(d);

  const css = document.createElement('style');
  css.textContent = '.tro .lvl{background:var(--navy,#0E1A2E);color:#fff;border-radius:12px;padding:14px 16px}.tro .lvl small{opacity:.75;font-size:12px}.tro .lvl b{display:block;font-family:"Barlow Condensed",sans-serif;font-size:32px;font-weight:700;line-height:1.1}.tro .lbar{height:8px;border-radius:4px;background:rgba(255,255,255,.2);margin-top:10px;overflow:hidden}.tro .lbar i{display:block;height:100%;background:#D9981A;border-radius:4px}.tro .lvl span{display:block;font-size:12px;opacity:.8;margin-top:6px}'
   +'.tro .sk{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}.tro .sk div{background:var(--surface-2);border-radius:8px;padding:10px;min-width:0}.tro .sk b{display:block;font-family:"Barlow Condensed",sans-serif;font-size:26px;font-weight:600;line-height:1}.tro .sk small{display:block;font-size:12px;color:var(--ink-muted);margin-top:4px}'
   +'.tro .shelf{display:grid;gap:10px;margin-top:12px}.tro .md{display:grid;grid-template-columns:44px 1fr;gap:12px;align-items:start;padding:10px 0;border-top:1px solid var(--line)}.tro .md:first-child{border-top:0}.tro .mdl{width:40px;height:46px}.tro .md b{font-size:15px;font-weight:600}.tro .md p{margin:2px 0 0;font-size:13px;color:var(--ink-muted)}.tro .md .n{font-size:12px;margin-top:4px;color:var(--ink)}.tro .md.lk b,.tro .md.lk .n{color:var(--ink-muted)}.tro .tg{display:inline-block;font-size:11px;font-weight:600;padding:2px 8px;border-radius:99px;background:var(--surface-2);margin-left:6px;vertical-align:middle}.tro .tg.new{background:#D9981A;color:#0E1A2E}.tro .rec{margin-top:12px}.tro .rec div{display:flex;gap:10px;align-items:center;padding:6px 0;border-top:1px solid var(--line);font-size:13px}.tro .rec .mdl{width:22px;height:26px;flex:none}';
  document.head.appendChild(css);

  const latest = SESSIONS[SESSIONS.length-1].date;
  const recent = medals.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
  const shelf = KINDS.map(K=>{
    const ms = medals.filter(m=>m.k===K.k), top = ms.length ? ms.reduce((a,m)=>(['base','bronze','silver','gold'].indexOf(m.tier)>['base','bronze','silver','gold'].indexOf(a.tier)?m:a),ms[0]) : null;
    const isNew = ms.some(m=>m.date===latest);
    return '<div class="md'+(ms.length?'':' lk')+'">'+medal(K.k,top?top.tier:null,!ms.length)+'<div><b>'+K.t+'</b>'+(isNew?'<span class="tg new">Novo</span>':'')+(ms.length?'<span class="tg">'+ms.length+'×'+(top.tier!=='base'?' · '+TIER[top.tier].n:'')+'</span>':'')+'<p>'+K.d+'</p>'+(ms.length?'<div class="n">Última: '+fd(ms[ms.length-1].date)+' · '+ms[ms.length-1].note+'</div>':'<div class="n">Ainda por conquistar</div>')+'</div></div>';
  }).join('');
  const strk = (n,l,s)=>'<div><b>'+s.cur+'</b><small>'+l+(s.best>s.cur?' · melhor '+s.best:'')+'</small></div>';
  const html = '<h2>Troféus</h2><div class="card tro">'
   +'<div class="lvl"><small>O teu nível</small><b>'+lv.n+'</b><div class="lbar"><i style="width:'+(nx?Math.min(100,(pts-lv.min)/(nx.min-lv.min)*100):100).toFixed(0)+'%"></i></div><span>'+pts+' pontos'+(nx?' · faltam '+(nx.min-pts)+' para '+nx.n:' · nível máximo')+'</span></div>'
   +'<div class="sk">'+strk(0,'semanas seguidas com a meta de velocidade',ST.speed)+strk(0,'semanas seguidas com a carga certa',ST.load)+strk(0,'semanas seguidas como nº 1 dos 9',ST.nine)+'</div>'
   +'<div class="sub" style="margin-top:8px">Contam todas as sessões: na Seleção comparas com o grupo, nos Lusitanos contigo próprio. Semanas sem GPS não quebram as séries. Não há medalhas por correr mais: só pelo que interessa.</div>'
   +'<details class="fold"><summary><span>Medalhas ('+medals.length+')</span></summary><div class="shelf">'+shelf+'</div>'
   +(recent.length?'<div class="rec"><b style="font-size:13px">Mais recentes</b>'+recent.map(m=>'<div>'+medal(m.k,m.tier)+'<span>'+fd(m.date)+' · '+KINDS.find(x=>x.k===m.k).t+(m.tier!=='base'?' ('+TIER[m.tier].n+')':'')+'</span></div>').join('')+'</div>':'')
   +'</details></div>';
  const sec = document.createElement('section'); sec.id='s-trofeus'; sec.innerHTML = html;
  const anchor = document.getElementById('s-sessao'); anchor.parentNode.insertBefore(sec, anchor);
  window.TROFEUS = {medals, pts, level:lv.n, streaks:ST};
})();
