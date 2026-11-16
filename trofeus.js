// ---------- Troféus: medalhas, séries e nível (calculados a partir das sessões da Seleção) ----------
// Contam todas as sessões. Na Seleção compara-se com o grupo; nos Lusitanos, com a tua própria média. Semanas sem GPS (gpsGap) não quebram séries: são ignoradas.
(function(){
  const {en: EN, t: T} = I18N;
  const SP = spdPct(), SPP = Math.round(SP*100);
  const TG0 = (()=>{ const d = {rd:9500, hsr:2500, accel:160}; try{ const o = JSON.parse(localStorage.getItem('targets')||'{}'); ['rd','hsr','accel'].forEach(k=>{ const v = +o[k]; if(v>0) d[k] = v; }); }catch(e){} return d; })();
  const TIER = {gold:{n:'Ouro',c:'#C99A1E'}, silver:{n:'Prata',c:'#8D98A8'}, bronze:{n:'Bronze',c:'#A8693A'}, base:{n:'',c:'#1F3B63'}};
  const ICON = {
    speed:'<path d="M13 3L6 13h5l-1 8 7-10h-5z" fill="#fff"/>',
    four:'<g fill="#fff"><rect x="7" y="7" width="4" height="4" rx="1"/><rect x="13" y="7" width="4" height="4" rx="1"/><rect x="7" y="13" width="4" height="4" rx="1"/><rect x="13" y="13" width="4" height="4" rx="1"/></g>',
    nine:'<path d="M12 6l5 6h-3.2v6h-3.6v-6H7z" fill="#fff"/>',
    load:'<path d="M12 5l6 2.4v4.4c0 3.2-2.4 5.6-6 7-3.6-1.4-6-3.8-6-7V7.4z" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.2 12.2l2 2 3.6-3.8" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  ICON.targets = '<circle cx="12" cy="12" r="5.5" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="12" cy="12" r="1.9" fill="#fff"/>';
  ICON.full = '<circle cx="12" cy="12" r="5.5" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M12 9v3.4l2.2 1.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>';
  ICON.pace = '<path d="M7 8l4 4-4 4M12 8l4 4-4 4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
  const KINDS = [
    {k:'speed', t:T('Alvo de velocidade','Speed target'), d:T('Chegar a '+SPP+'% do teu máximo ('+(MAXREF*SP).toFixed(1).replace('.',',')+' km/h) numa semana: é o alvo que defines nas Definições. Prata: 2 pontos percentuais acima. Ouro: novo recorde da época.','Reach '+SPP+'% of your max ('+(MAXREF*SP).toFixed(1)+' km/h) in a week: the target you set in Settings. Silver: 2 percentage points above. Gold: a new season record.'), pts:{bronze:3,silver:5,gold:8}},
    {k:'targets', t:T('Alvos da semana','Weekly targets'), d:T('Semana fechada com os alvos de distância, corrida rápida, acelerações e velocidade cumpridos. Prata: 3 de 4. Ouro: 4 de 4. Semanas sem GPS completo não contam.','A closed week with the distance, fast running, accelerations and speed targets met. Silver: 3 of 4. Gold: 4 of 4. Weeks with incomplete GPS do not count.'), pts:{silver:3,gold:6}},
    {k:'four',  t:'Quatro de quatro', d:'Numa sessão, acima em distância, corrida rápida, acelerações e velocidade. Na Seleção, contra a média do grupo; nos Lusitanos, contra a tua própria média.', pts:{base:2}},
    {k:'nine',  t:'Número 1 dos 9', d:'Primeiro entre os scrum-halves em pelo menos 3 das 4 métricas da semana.', pts:{base:5}},
    {k:'load',  t:T('Zona segura','Safe zone'), d:T('Semana fechada com a carga vs. habitual entre 0,8 e 1,3.','A closed week with load vs. usual between 0.8 and 1.3.'), pts:{base:2}},
    {k:'full',  t:T('Jogo completo','Full match'), d:T('Jogar 80 minutos ou mais num jogo.','Play 80 minutes or more in a match.'), pts:{base:3}},
    {k:'pace',  t:T('Ritmo de jogo','Match pace'), d:T('Num jogo, mais metros por minuto e mais corrida rápida por minuto do que a tua média dos jogos anteriores. Precisa de 2 jogos anteriores e de 30 minutos em campo.','In a match, more metres per minute and more fast running per minute than your average of previous matches. Needs 2 earlier matches and 30 minutes on the pitch.'), pts:{base:3}}
  ];
  // Estrada de níveis (ao estilo da estrada de troféus): do mais baixo para o mais alto
  const LEVELS = [
    {n:T('Estreante','Rookie'),min:0,c:'#A8693A'}, {n:T('Aspirante','Hopeful'),min:12,c:'#A8693A'},
    {n:T('Júnior','Junior'),min:28,c:'#A8693A'}, {n:T('Promessa','Prospect'),min:45,c:'#8D98A8'},
    {n:T('Reserva','Reserve'),min:60,c:'#8D98A8'}, {n:T('Suplente','Bench'),min:85,c:'#8D98A8'},
    {n:T('Titular','Starter'),min:110,c:'#C99A1E'}, {n:T('Motor','Engine'),min:140,c:'#C99A1E'},
    {n:T('Faísca','Spark'),min:175,c:'#C99A1E'}, {n:T('Internacional','International'),min:215,c:'#2E7D5B'},
    {n:T('Capitão','Captain'),min:260,c:'#2E7D5B'}, {n:T('Lenda','Legend'),min:310,c:'#2E7D5B'},
    {n:T('Imortal','Immortal'),min:370,c:'#C8102E'}, {n:T('Mito','Myth'),min:440,c:'#C8102E'}
  ];
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
    if(pct>=SP){ const tier = best.maxSpeed>prevBest ? 'gold' : pct>=SP+0.02 ? 'silver' : 'bronze'; add('speed',tier,best.date,w,best.maxSpeed.toFixed(1).replace('.',',')+' km/h ('+Math.round(pct*100)+'%)'); }
    // Quatro de quatro (sessão)
    xs.forEach(s=>{
      if(teamOf(s)==='Seleção'){ if(s.rd>s.avgRd && s.hsr>s.avgHsr && s.accel>s.avgAccel && s.maxPct>s.avgMaxPct) add('four','base',s.date,w,'Acima do grupo nas 4 métricas'); }
      else if(s.type!=='Match' && !s.shortSession){ // Lusitanos: contra a tua própria média (5 treinos anteriores)
        const pv = SESSIONS.slice(0,SESSIONS.indexOf(s)).filter(x=>x.type!=='Match'&&!x.combined&&!x.shortSession).slice(-5);
        if(pv.length>=3){ const m=k=>pv.reduce((a,x)=>a+x[k],0)/pv.length; if(s.rd>m('rd') && s.hsr>m('hsr') && s.accel>m('accel') && s.maxSpeed>m('maxSpeed')) add('four','base',s.date,w,'Acima da tua média nas 4 métricas'); }
      } });
    // Número 1 dos 9 (semana, só onde há relatório semanal)
    const P = posWeek(w);
    if(P){ const me=P.rows.find(r=>r.me), shs=P.rows.filter(r=>r.sh&&!r.me); const wins=['rd','hsr','acc','sp'].filter(k=>shs.every(r=>me[k]>r[k])).length; if(wins>=3) add('nine','base',xs[xs.length-1].date,w,'#1 dos 9 em '+wins+' de 4'); }
    // Alvos da semana (semana fechada, com GPS completo)
    if(!gap && (w<last.week || dow(xs[xs.length-1].date)>=6)){ const t = wkTot(w), acc = xs.reduce((a,x)=>a+x.accel,0), hit = [t.rd>=TG0.rd, t.hsr>=TG0.hsr, acc>=TG0.accel, t.sp>=MAXREF*SP].filter(Boolean).length; if(hit>=3) add('targets', hit===4?'gold':'silver', xs[xs.length-1].date, w, T(hit+' de 4 alvos cumpridos',hit+' of 4 targets met')); }
    // Carga certa (semana fechada)
    if(!gap && (w<last.week || dow(xs[xs.length-1].date)>=6)){ const lastS = xs[xs.length-1], n28 = SESSIONS.filter(x=>x.date<=lastS.date && (new Date(lastS.date)-new Date(x.date))/86400000<28).length, r = meanRd(7,lastS)/meanRd(28,lastS); if(n28>=6) if(r>=0.8 && r<=1.3) add('load','base',lastS.date,w,T('Carga vs. habitual ','Load vs. usual ')+r.toFixed(2).replace('.',EN?'.':',')); }
  });

  // jogos: jogo completo e ritmo de jogo (contra a tua própria média dos jogos anteriores)
  const gm = SESSIONS.filter(s=>s.type==='Match' && s.fieldTimeMin);
  gm.forEach((s,i)=>{
    if(s.fieldTimeMin>=80) add('full','base',s.date,s.week,T(Math.floor(s.fieldTimeMin)+' min em campo',Math.floor(s.fieldTimeMin)+' min on the pitch'));
    const pv = gm.slice(0,i);
    if(pv.length>=2 && s.fieldTimeMin>=30){ const a = k=>pv.reduce((t,x)=>t+x[k]/x.fieldTimeMin,0)/pv.length; if(s.rd/s.fieldTimeMin>a('rd') && s.hsr/s.fieldTimeMin>a('hsr')) add('pace','base',s.date,s.week,Math.round(s.rd/s.fieldTimeMin)+' m/min · '+(s.hsr/s.fieldTimeMin).toFixed(1).replace('.',',')+' m/min '+T('rápidos','fast')); }
  });

  // Coach: semanas com o prehab, o mental e as skills cumpridos, e cada novo peso na prancha (lê o que o Coach guarda no telemóvel)
  const CL = (()=>{ try{ return JSON.parse(localStorage.getItem('coach_log'))||{}; }catch(e){ return {}; } })();
  const CT = Object.assign({p:3, r:2, m:4, box:2, pass:4, def:2}, (()=>{ try{ return JSON.parse(localStorage.getItem('coach_target'))||{}; }catch(e){ return {}; } })());
  const cDone = (e,k) => !!e && (e.min>0 || (k==='p' ? (e.done||[]).includes('plank') : (e.done||[]).length>0));
  const isoOf = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const today0 = new Date(); today0.setHours(0,0,0,0);
  const cdays = Object.keys(CL).sort();
  if(cdays.length){
    const mon = d => { const x = new Date(d+'T00:00:00'); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x; };
    for(let m = mon(cdays[0]); m <= today0; m.setDate(m.getDate()+7)){
      const ds = [...Array(7)].map((_,i)=>{ const x = new Date(m); x.setDate(x.getDate()+i); return isoOf(x); });
      const end = ds[6], closed = new Date(end+'T00:00:00') < today0, cnt = k => ds.filter(d=>cDone(CL[d]&&CL[d][k],k)).length;
      const lastDay = ds.filter(d=>CL[d]).pop() || end, wn = REG ? REG.isoWeek(ds[0]) : 0;
      if(CT.p>0 && cnt('p')>=CT.p) add('cprehab','base',lastDay,wn,cnt('p')+T(' dias de prehab',' prehab days'));
      if(CT.m>0 && cnt('m')>=CT.m) add('cmental','base',lastDay,wn,cnt('m')+T(' dias de mental',' mental days'));
      const sk = ['box','pass','def'].filter(k=>CT[k]>0), hit = sk.filter(k=>cnt(k)>=CT[k]).length;
      if(closed && sk.length && hit===sk.length) add('cskills','base',lastDay,wn,T('Box kick, passe e defesa','Box kick, passing and defence'));
    }
    let top = 0; cdays.forEach(d => { const pk = CL[d].p && CL[d].p.plank; if(pk && pk.kg>top){ if(top>0 || pk.kg>0) add('cplank','base',d,REG?REG.isoWeek(d):0,pk.kg+' kg'); top = pk.kg; } });
  }
  KINDS.push(
    {k:'cprehab', t:T('Semana de prehab','Prehab week'), d:T('Cumprir o teu alvo de dias de prehab numa semana (Coach).','Hit your weekly prehab target (Coach).'), pts:{base:2}},
    {k:'cmental', t:T('Cabeça no sítio','Mind on it'), d:T('Cumprir o teu alvo de dias de mental numa semana (Coach).','Hit your weekly mental target (Coach).'), pts:{base:2}},
    {k:'cskills', t:T('Skills em dia','Skills on track'), d:T('Semana fechada com box kick, passe e defesa no alvo (Coach).','A closed week with box kick, passing and defence on target (Coach).'), pts:{base:3}},
    {k:'cplank', t:T('Prancha mais pesada','Heavier plank'), d:T('Registar a prancha com um peso novo (Coach).','Log the plank with a new weight (Coach).'), pts:{base:2}});
  ICON.cprehab = '<path d="M8 16l8-8M9.5 7.5l7 7M6.5 10.5l7 7" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>';
  ICON.cmental = '<circle cx="12" cy="12" r="5.5" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M9.5 12h5" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>';
  ICON.cskills = '<ellipse cx="12" cy="12" rx="6.5" ry="4.2" transform="rotate(-35 12 12)" fill="none" stroke="#fff" stroke-width="1.8"/>';
  ICON.cplank = '<path d="M6 14h12M8 10v8M16 10v8" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>';
  const okWc = [...new Set(medals.filter(m=>m.k==='cprehab').map(m=>m.week))];

  // séries (semanas seguidas); semanas com gpsGap são ignoradas
  const okW = weeks.filter(w=>!sel.some(s=>s.week===w&&s.gpsGap));
  const streak = k=>{ const has=new Set(medals.filter(m=>m.k===k).map(m=>m.week)); let cur=0,best=0,run=0; okW.forEach(w=>{ if(has.has(w)){run++;best=Math.max(best,run);}else run=0; }); for(let i=okW.length-1;i>=0&&has.has(okW[i]);i--) cur++; return {cur,best}; };
  const ST = {speed:streak('speed'), load:streak('load'), nine:streak('nine'), targets:streak('targets')};
  ST.prehab = (()=>{ let cur=0; const m0 = new Date(today0); m0.setDate(m0.getDate()-((m0.getDay()+6)%7)); const has = new Set(okWc); let w = REG?REG.isoWeek(isoOf(m0)):0; if(!has.has(w)) w--; while(has.has(w)){ cur++; w--; } return {cur, best:cur}; })();

  const pts = medals.reduce((a,m)=>a+(KINDS.find(x=>x.k===m.k).pts[m.tier]||0),0);
  let li = 0; LEVELS.forEach((l,i)=>{ if(pts>=l.min) li=i; });
  const lv = LEVELS[li], nx = LEVELS[li+1];
  const LIGAS = [T('Liga Bronze','Bronze league'),T('Liga Prata','Silver league'),T('Liga Ouro','Gold league'),T('Liga Seleção','National league'),T('Liga das Lendas','Legends league')];
  const emb = (i,st)=>{ const L = LEVELS[i], col = st==='lock' ? '#cfd6df' : L.c; return '<svg class="emb" viewBox="0 0 40 46" aria-hidden="true"><path d="M20 2l16 6v14c0 11-7 18-16 22C11 40 4 33 4 22V8z" fill="'+col+'" stroke="'+(st==='cur'?'#fff':'rgba(255,255,255,.35)')+'" stroke-width="2"/>'+(st==='lock'?'':'<path d="M9 10.5l11-5.5 11 5.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".28"/>')+'<text x="20" y="29" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-weight="700" font-size="20" fill="'+(st==='lock'?'#8995a5':'#fff')+'">'+(i+1)+'</text></svg>'; };
  const road = ()=>{ let h = '<h2>'+T('Estrada de níveis','Level road')+'</h2><div class="sub2">'+pts+' '+T('pontos','points')+' · '+T('nível','level')+' '+(li+1)+' '+T('de','of')+' '+LEVELS.length+'</div><div class="road">'; for(let i=LEVELS.length-1;i>=0;i--){ if(i===LEVELS.length-1 || Math.floor(i/3)!==Math.floor((i+1)/3)) h += '<div class="lg"><i style="background:'+LEVELS[i].c+'"></i>'+LIGAS[Math.floor(i/3)]+'</div>'; const L = LEVELS[i], st = i<li ? 'done' : i===li ? 'cur' : 'lock', top = LEVELS[i+1]; h += '<div class="rv '+st+'"'+(st==='cur'?' id="rv-cur"':'')+'>'+emb(i,st)+'<div><b>'+L.n+'</b><small>'+(st==='done'?'✓ '+L.min+' '+T('pontos','points'):st==='cur'?(top?T('Estás aqui','You are here')+' · '+(top.min-pts)+' '+T('pontos para','points to')+' '+top.n:T('Estás aqui · nível máximo','You are here · max level')):L.min+' '+T('pontos','points')+' · '+T('faltam','need')+' '+(L.min-pts))+'</small>'+(st==='cur'&&top?'<div class="lbar"><i style="width:'+Math.min(100,(pts-L.min)/(top.min-L.min)*100).toFixed(0)+'%"></i></div>':'')+'</div></div>'; } return h+'</div>'; };
  const medal = (k,tier,locked)=>'<svg class="mdl'+(locked?' lk':'')+'" viewBox="0 0 24 28" aria-hidden="true"><g fill="'+(locked?'#cfd6df':'#C8102E')+'"><path d="M6.5 0h4.2l3.6 10.5H10.2z"/><path d="M17.5 0h-4.2L9.7 10.5h4.1z"/></g><circle cx="12" cy="18" r="8.5" fill="'+(locked?'#dde3ea':TIER[tier||'base'].c)+'"/>'+(locked?'':'<ellipse cx="8.6" cy="13" rx="3.6" ry="1.9" fill="#fff" opacity=".2" transform="rotate(-30 8.6 13)"/><g transform="translate(0,6)">'+ICON[k]+'</g>')+'</svg>';
  const fd = d=>dshort(d);

  // estilos: em style.css (secção Troféus)

  const latest = SESSIONS[SESSIONS.length-1].date;
  const recent = medals.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
  const shelf = KINDS.map(K=>{
    const ms = medals.filter(m=>m.k===K.k), top = ms.length ? ms.reduce((a,m)=>(['base','bronze','silver','gold'].indexOf(m.tier)>['base','bronze','silver','gold'].indexOf(a.tier)?m:a),ms[0]) : null;
    const isNew = ms.some(m=>m.date===latest);
    return '<div class="md'+(ms.length?'':' lk')+'" data-k="'+K.k+'">'+medal(K.k,top?top.tier:null,!ms.length)+'<div><b>'+K.t+'</b>'+(isNew?'<span class="tg new">'+T('Novo','New')+'</span>':'')+(ms.length?'<span class="tg">'+ms.length+'×'+(top.tier!=='base'?' · '+TIER[top.tier].n:'')+'</span>':'')+(ms.length?'<div class="n">'+T('Última','Latest')+': '+fd(ms[ms.length-1].date)+' · '+ms[ms.length-1].note+'</div>':'<div class="n">'+T('Ainda por conquistar','Not earned yet')+'</div>')+'<p hidden>'+K.d+'</p></div></div>';
  }).join('');
  const strk = (n,l,s)=>'<div><b>'+s.cur+'</b><small>'+l+(s.best>s.cur?' · '+T('melhor','best')+' '+s.best:'')+'</small></div>';
  const html = '<h2>Troféus</h2><div class="card tro">'
   +'<div class="lvl" role="button" tabindex="0" aria-label="'+T('Ver todos os níveis','See all levels')+'"><small>'+T('O teu nível','Your level')+'</small><b>'+lv.n+'</b><div class="lbar"><i style="width:'+(nx?Math.min(100,(pts-lv.min)/(nx.min-lv.min)*100):100).toFixed(0)+'%"></i></div><span>'+pts+' '+T('pontos','points')+(nx?' · '+T('faltam','need')+' '+(nx.min-pts)+' '+T('para','for')+' '+nx.n:' · '+T('nível máximo','max level'))+'</span></div>'
   +'<div class="sk">'+strk(0,T('semanas seguidas com o alvo de velocidade','weeks in a row with the speed target'),ST.speed)+strk(0,T('semanas seguidas na zona segura','weeks in a row in the safe zone'),ST.load)+strk(0,'semanas seguidas como nº 1 dos 9',ST.nine)+strk(0,T('semanas seguidas com 3 ou mais alvos','weeks in a row with 3+ targets'),ST.targets)+strk(0,T('semanas seguidas com o prehab cumprido','weeks in a row with prehab done'),ST.prehab)+'</div>'
   +'<div class="sub" style="margin-top:8px">'+T('Toca numa medalha para ver a regra. ','Tap a medal to see the rule. ')+'Contam todas as sessões: na Seleção comparas com o grupo, nos Lusitanos contigo próprio. Semanas sem GPS não quebram as séries. Não há medalhas por correr mais: só pelo que interessa.</div>'
   +'<details class="fold" open><summary><span>Medalhas ('+medals.length+')</span></summary><div class="shelf">'+shelf+'</div>'
   +(recent.length?'<div class="rec"><b style="font-size:13px">Mais recentes</b>'+recent.map(m=>'<div>'+medal(m.k,m.tier)+'<span>'+fd(m.date)+' · '+KINDS.find(x=>x.k===m.k).t+(m.tier!=='base'?' ['+(EN?({Ouro:'Gold',Prata:'Silver',Bronze:'Bronze'}[TIER[m.tier].n]||TIER[m.tier].n):TIER[m.tier].n)+']':'')+'</span></div>').join('')+'</div>':'')
   +'</details></div>';
  const sec = document.createElement('section'); sec.id='s-trofeus'; sec.innerHTML = html;
  document.getElementById('pg-trofeus').appendChild(sec);
  const lvc = sec.querySelector('.lvl'), openRoad = ()=>{ if(window.GSHEET) window.GSHEET(lvc, T('Estrada de níveis','Level road'), road(), c=>{ const cur = c.querySelector('#rv-cur'); if(cur) setTimeout(()=>cur.scrollIntoView({block:'center'}),380); return null; }); };
  lvc.addEventListener('click', openRoad); lvc.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openRoad(); } });
  window.TROFEUS = {medals, pts, level:lv.n, levelNo:li+1, streaks:ST};
})();
