// ---------- Gráfico em ponto grande: toca num quadrado e vê a série toda, a passar o dedo ----------
// Evolução e Semana: o mesmo gráfico, com o botão Por treino / Por semana (Evolução abre por treino, Semana abre por semana).
(function(){
  const {en: EN, t: T} = I18N;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  const tok = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  // estilos: em style.css (secção Gráfico grande (folha))

  let sheet = null;
  const vw = () => innerWidth, vh = () => innerHeight;

  function openSheet(card, label, html, mount){
    if(sheet) return;
    const d = document.createElement('div'); d.className = 'gsheet'; d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true'); d.setAttribute('aria-label', label);
    d.innerHTML = '<div class="dc"><button type="button" class="bk" aria-label="'+T('Voltar','Back')+'">‹ '+T('Voltar','Back')+'</button>'+html+'</div>';
    document.body.appendChild(d); document.body.style.overflow = 'hidden';
    sheet = {el:d, card, clean:null};
    const cur = history.state || {}; try{ history.pushState({n:cur.n, g:1}, ''); }catch(e){}
    const content = d.querySelector('.dc');
    d.querySelector('.bk').addEventListener('click', () => history.back());
    if(!reduce()){
      const r = card.getBoundingClientRect();
      content.animate([{opacity:0},{opacity:1}], {duration:200, delay:140, fill:'backwards'});
      d.style.cssText = 'left:0;top:0';
      const a = d.animate([{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:'12px',right:'auto',bottom:'auto'},{left:'0px',top:'0px',width:vw()+'px',height:vh()+'px',borderRadius:'0px',right:'auto',bottom:'auto'}], {duration:320, easing:EASE});
      a.onfinish = () => { d.style.cssText = ''; };
    }
    sheet.clean = mount(content);
    d.querySelector('.bk').focus({preventScroll:true});
  }
  function closeSheet(){
    if(!sheet) return;
    const {el, card, clean} = sheet; sheet = null; document.body.style.overflow = '';
    try{ clean && clean(); }catch(e){}
    const done = () => { el.remove(); try{ card.focus({preventScroll:true}); }catch(e){} };
    const r = card.isConnected ? card.getBoundingClientRect() : null;
    if(reduce() || !r || r.bottom < 0 || r.top > vh()){ el.animate([{opacity:1},{opacity:0}], {duration:160, fill:'forwards'}).onfinish = done; return; }
    el.querySelector('.dc').animate([{opacity:1},{opacity:0}], {duration:120, fill:'forwards'});
    el.style.cssText = 'pointer-events:none;left:0;top:0;width:'+vw()+'px;height:'+vh()+'px';
    el.animate([{left:'0px',top:'0px',width:vw()+'px',height:vh()+'px',borderRadius:'0px',opacity:1},{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:'12px',opacity:1}], {duration:300, easing:EASE, fill:'forwards'}).onfinish = () => { el.animate([{opacity:1},{opacity:0}], {duration:120, fill:'forwards'}).onfinish = done; };
  }
  addEventListener('popstate', () => { if(sheet) closeSheet(); });
  window.GSHEET = openSheet;
  addEventListener('keydown', e => { if(e.key === 'Escape' && sheet) history.back(); });

  // ---------- definição das 4 métricas ----------
  const MET = [
    {k:'rd',       n:T('Distância','Distance'),            u:'m',    f:v=>f0(v), avg:'avgRd'},
    {k:'hsr',      n:T('Corrida rápida','Fast running'),   u:'m',    f:v=>f0(v), avg:'avgHsr'},
    {k:'accel',    n:T('Acelerações','Accelerations'),     u:'',     f:v=>f0(v), avg:'avgAccel'},
    {k:'maxSpeed', n:T('Velocidade máx.','Top speed'),     u:'km/h', f:v=>f1(v), line:true}
  ];
  const grpAvg = (s,m) => m.k==='maxSpeed' ? (s.avgMaxPct && s.maxPct ? s.avgMaxPct*(s.maxSpeed/s.maxPct) : null) : s[m.avg];
  const pct = (v,p) => p>0 ? (v/p-1)*100 : null;
  const dlt = (x,th) => { if(x==null) return ''; const c = Math.abs(x)<th?'nt':(x>0?'up':'dn'); return '<span class="'+c+'">'+(x>=th?'▲ ':x<=-th?'▼ ':'● ')+(x>=0?'+':'')+Math.round(x)+'%</span>'; };

  function makeChart(canvas, cfg, getSel, setSel){
    const ink = 'rgba(255,255,255,.7)', gridc = 'rgba(255,255,255,.12)';
    const cross = {id:'cross', afterDatasetsDraw(ch){
      const i = getSel(), m = ch.getDatasetMeta(0), el = m.data[i]; if(!el) return;
      const c = ch.ctx, a = ch.chartArea; c.save(); c.strokeStyle = '#fff'; c.globalAlpha = .6; c.lineWidth = 1.5; c.setLineDash([4,4]);
      c.beginPath(); c.moveTo(el.x, a.top); c.lineTo(el.x, a.bottom); c.stroke(); c.restore();
      c.save(); c.fillStyle = '#D9981A'; c.strokeStyle = '#0E1A2E'; c.lineWidth = 2.5; c.beginPath(); c.arc(el.x, el.y, 6, 0, 7); c.fill(); c.stroke(); c.restore(); }};
    const ch = new Chart(canvas, {type:'bar', data:cfg.data, plugins:[cross], options:{
      responsive:true, maintainAspectRatio:false, animation:{duration:reduce()?0:400}, layout:{padding:{top:10,right:4}},
      events:['mousemove','mouseout','click','touchstart','touchmove'],
      interaction:{mode:'index', intersect:false, axis:'x'},
      onHover:(e,els)=>{ if(els && els.length) setSel(els[0].index); },
      plugins:{legend:{display:false}, tooltip:{enabled:false}},
      scales:{x:{ticks:{color:ink,maxRotation:0,autoSkip:true,maxTicksLimit:innerWidth<520?6:12,font:{size:11}},grid:{display:false},border:{color:gridc}},
              y:{beginAtZero:cfg.min===undefined, min:cfg.min, ticks:{color:ink,font:{size:11},maxTicksLimit:6,callback:v=>EN?v:nf.format(v)}, grid:{color:gridc,drawTicks:false}, border:{display:false}}}}});
    return ch;
  }
  const legend = items => '<div class="gl">'+items.map(([c,t])=>'<span><i style="background:'+c+'"></i>'+t+'</span>').join('')+'</div>';

  // ---------- Evolução: por treino ou por semana (o mesmo gráfico, com um botão para trocar) ----------
  // v = 'd' (treino a treino) ou 'w' (semana a semana: soma da semana; velocidade = a máxima). w0 = semana a selecionar ao abrir.
  const wkName = w => (window.REG && REG.wkLabel) ? REG.wkLabel(w) : w;
  function openEvol(card, m, v, w0){
    let view = v==='w' ? 'w' : 'd';
    const sub = () => view==='w' ? T('Semana a semana (total de cada semana)','Week by week (each week\'s total)') : T('Treino a treino','Session by session');
    const html = '<h2>'+m.n+'</h2><div class="sub2"></div>'
      +'<div class="gr" aria-live="polite"><small class="r1"></small><div class="gv"></div><div class="gd r3"></div><small class="r4"></small></div>'
      +'<div class="gflt"><div class="seg" role="group" aria-label="'+T('Ver por','View by')+'"><button type="button" data-v="d" aria-pressed="false">'+T('Por treino','By session')+'</button><button type="button" data-v="w" aria-pressed="false">'+T('Por semana','By week')+'</button></div>'
      +'<div class="seg sd" role="group" aria-label="'+T('Período','Period')+'">'+[[7,'7 d','7 d'],[14,'14 d','14 d'],[30,'30 d','30 d'],[182,'6 meses','6 mo'],[365,'1 ano','1 yr'],[0,'Máx.','Max']].map(([n,a,b]) => '<button type="button" data-dr="'+n+'" aria-pressed="'+(n===30)+'">'+T(a,b)+'</button>').join('')+'</div>'
      +'<div class="seg sw" role="group" aria-label="'+T('Período','Period')+'"><button type="button" data-r="12" aria-pressed="true">'+T('Últimas 12','Last 12')+'</button><button type="button" data-r="0" aria-pressed="false">'+T('Todas','All')+'</button></div>'
      +'<div class="seg" role="group" aria-label="'+T('Tipo de sessão','Session type')+'"><button type="button" data-t="all" aria-pressed="true">'+T('Tudo','All')+'</button><button type="button" data-t="tr" aria-pressed="false">'+T('Treinos','Training')+'</button><button type="button" data-t="ma" aria-pressed="false">'+T('Jogos','Matches')+'</button></div></div>'
      +'<div class="cbox"><canvas tabindex="0" role="img" aria-label="'+m.n+'"></canvas></div><div class="glw"></div><p class="gh"></p>';
    openSheet(card, m.n, html, root => {
      let range = 12, drange = 30, tf = 'all', sel = 0, src = [], ch = null, first = true;
      const q = x => root.querySelector(x), r1 = q('.r1'), gv = q('.gv'), r3 = q('.r3'), r4 = q('.r4'), canvas = q('canvas');
      const pool = () => SESSIONS.filter(s => tf==='all' || (tf==='ma' ? s.type==='Match' : s.type!=='Match'));
      const km = m.k==='rd';                                   // na vista semanal a distância vai em km
      const yv = x => x==null ? null : (view==='w' && km ? x/1000 : x);
      const disp = x => view==='w' && km ? f1(x/1000) : m.f(x), unit = () => view==='w' && km ? 'km' : m.u;
      // soma de uma lista de sessões (velocidade: a máxima, sem contar estimativas)
      const sum = xs => { if(!xs.length) return null; const real = xs.filter(s => !s.est), sp = real.length ? Math.max(...real.map(s=>s.maxSpeed)) : null;
        return m.k==='maxSpeed' ? sp : xs.reduce((a,s)=>a+(s[m.k]||0),0); };
      const weekly = () => { const ps = pool(), ws = [...new Set(ps.map(s=>s.week))].sort((a,b)=>a-b);
        return ws.map(w => { const xs = ps.filter(s=>s.week===w), ga = m.line ? null : xs.reduce((a,s)=>a+(grpAvg(s,m)||0),0);
          return {week:w, xs, d0:xs[0].date, d1:xs[xs.length-1].date, v:sum(xs), ga, match:xs.some(s=>s.type==='Match'), est:xs.some(s=>s.est), partial:w===CUR_WEEK}; }).filter(p => p.v!=null); };
      const readDay = s => {
        const val = s[m.k], ga = grpAvg(s,m);
        r1.textContent = dlong(s.date)+' · '+(s.type==='Match' ? T('Jogo vs ','Match vs ')+(s.opponent||'') : T('Treino','Training'))+' · '+T('Semana ','Week ')+wkName(s.week);
        gv.innerHTML = m.f(val)+(m.u?'<em>'+m.u+'</em>':'');
        const x = ga!=null ? pct(val,ga) : null;
        r3.innerHTML = ga!=null ? dlt(x, m.line?3:10)+' '+T('vs. média do grupo','vs. group average') : '';
        r4.textContent = m.k==='maxSpeed' ? Math.round(val/MAXREF*100)+T('% do teu máximo (','% of your max (')+f1(MAXREF)+' km/h)' : (ga!=null ? T('Média do grupo nessa sessão: ','Group average in that session: ')+m.f(ga)+(m.u?' '+m.u:'') : '');
      };
      const readWeek = (p, prev) => {
        r1.textContent = T('Semana ','Week ')+wkName(p.week)+' · '+dshort(p.d0)+(p.d1!==p.d0 ? ' – '+dshort(p.d1) : '')+(p.partial ? T(' (em curso)',' (in progress)') : '');
        gv.innerHTML = disp(p.v)+(unit()?'<em>'+unit()+'</em>':'');
        let x = null, lab = T('vs. semana anterior','vs. previous week');
        if(prev){
          if(p.partial){ const cut = dow(TODAY), pv = sum(prev.xs.filter(s => dow(s.date)<=cut));   // semana em curso: compara até ao mesmo dia
            if(pv) { x = pct(p.v, pv); lab = T('vs. semana anterior até ','vs. previous week up to ')+DOWN[cut%7].replace('-feira',''); } }
          else x = pct(p.v, prev.v);
        }
        r3.innerHTML = x!=null ? dlt(x, m.line?3:10)+' '+lab : '';
        const ts = window.TG ? TG.status(p.week, m.k==='maxSpeed'?'sp':m.k) : null;
        const tgw = ts ? ' · '+(p.partial ? T('Alvo até hoje ','Target to date ') : T('Alvo ','Target '))+(km?f1(ts.goal/1000)+' km':m.k==='maxSpeed'?f1(ts.goal)+' km/h':f0(ts.goal)+(m.u?' '+m.u:''))+': '+TG.ICON[ts.st]+' '+TG.WORD[ts.st] : '';
        r4.textContent = p.xs.length+' '+(p.xs.length===1?T('sessão','session'):T('sessões','sessions'))+(p.match?T(' · com jogo',' · with a match'):'')+(p.est?T(' · inclui estimativas sem GPS',' · includes no-GPS estimates'):'')+tgw;
      };
      const read = () => { const s = src[sel];
        if(!s){ r1.textContent = T('Sem sessões neste período ou com este filtro.','No sessions in this period or with this filter.'); gv.textContent = ''; r3.innerHTML = ''; r4.textContent = ''; return; }
        view==='w' ? readWeek(s, src[sel-1]) : readDay(s); };
      const setSel = i => { if(i===sel || !src[i]) return; sel = i; read(); if(ch) ch.update('none'); };
      const draw = () => {
        const all = view==='w' ? weekly() : pool();
        // por treino: os últimos N dias até hoje (0 = tudo); por semana: as últimas 12 semanas ou todas
        const since = n => { const d = new Date(TODAY+'T00:00:00Z'); d.setUTCDate(d.getUTCDate()-n+1); return d.toISOString().slice(0,10); };
        src = view==='w' ? (range===0 ? all : all.slice(-range)) : (drange===0 ? all : all.filter(s => s.date>=since(drange)));
        q('.sd').hidden = view==='w'; q('.sw').hidden = view!=='w';
        sel = Math.max(0, src.length-1);
        if(first && view==='w' && w0!=null){ const i = src.findIndex(p => p.week===w0); if(i>=0) sel = i; }
        first = false;
        if(ch) ch.destroy();
        q('.sub2').textContent = sub();
        root.querySelectorAll('[data-v]').forEach(b => b.setAttribute('aria-pressed', b.dataset.v===view));
        const W = view==='w', red = d => W ? d.match : d.type==='Match';
        const cols = src.map(d => red(d) ? '#FF6B6B' : (W && d.partial ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.5)'));
        const pick = cs => ctx => ctx.dataIndex===sel ? '#D9981A' : cs[ctx.dataIndex];
        const vals = src.map(d => yv(W ? d.v : d[m.k]));
        const ds = [m.line
          ? {type:'line', label:m.n, data:vals, borderColor:'#fff', backgroundColor:'#fff', borderWidth:2.5, pointRadius:src.map(d=>red(d)?5:3.5), pointBackgroundColor:pick(src.map(d=>red(d)?'#FF6B6B':'#fff')), pointBorderColor:'#0E1A2E', pointBorderWidth:1.5, tension:.25, order:2}
          : {type:'bar', label:m.n, data:vals, backgroundColor:pick(cols), borderRadius:{topLeft:6,topRight:6}, borderSkipped:'bottom', maxBarThickness:W?34:28, order:2}];
        if(!m.line) ds.push({type:'line', label:T('Média do grupo','Group average'), data:src.map(d => yv(W ? d.ga : grpAvg(d,m))), borderColor:'#fff', borderWidth:2, borderDash:[5,4], pointRadius:0, pointHoverRadius:0, spanGaps:true, order:1});
        else{ ds.push({type:'line', label:T('Máximo pessoal','Personal max'), data:src.map(()=>MAXREF), borderColor:'rgba(255,255,255,.6)', borderWidth:1.5, borderDash:[3,5], pointRadius:0, order:1});
              ds.push({type:'line', label:T('Alvo ','Target ')+Math.round(spdPct()*100)+'%', data:src.map(()=>MAXREF*spdPct()), borderColor:'#5CC48A', borderWidth:2, pointRadius:0, order:1}); }
        if(W && !m.line && window.TG){ const g = TG.load()[m.k==='accel'?'accel':m.k]; if(g) ds.push({type:'line', label:T('Alvo','Target'), data:src.map(()=>yv(g)), borderColor:'#5CC48A', borderWidth:2, pointRadius:0, order:1}); }
        ch = makeChart(canvas, {data:{labels:src.map(d => W ? T('S','W')+wkName(d.week) : dshort(d.date)), datasets:ds}, min:m.line?18:undefined}, ()=>sel, setSel);
        q('.glw').innerHTML = legend([['rgba(255,255,255,.55)', W?T('Semana','Week'):T('Treino','Training')], ['#FF6B6B', W?T('Semana com jogo','Week with a match'):T('Jogo','Match')], ['#D9981A',T('Selecionado','Selected')]]
          .concat(m.line ? [] : [['#fff', W?T('Média do grupo (soma)','Group average (total)'):T('Média do grupo','Group average')]]).concat(W && !m.line && window.TG ? [['#5CC48A',T('Alvo semanal','Weekly target')]] : []));
        q('.gh').textContent = W ? T('Toca e arrasta o dedo no gráfico para ver cada semana. A semana em curso compara-se com a anterior até ao mesmo dia.','Touch and drag along the chart to see each week. The current week is compared with the previous one up to the same day.')
                                 : T('Toca e arrasta o dedo no gráfico para ver cada sessão.','Touch and drag along the chart to see each session.');
        read();
      };
      root.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => { if(view===b.dataset.v) return; view = b.dataset.v; draw(); }));
      root.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => { range = +b.dataset.r; root.querySelectorAll('[data-r]').forEach(x=>x.setAttribute('aria-pressed', x===b)); draw(); }));
      root.querySelectorAll('[data-dr]').forEach(b => b.addEventListener('click', () => { drange = +b.dataset.dr; root.querySelectorAll('[data-dr]').forEach(x=>x.setAttribute('aria-pressed', x===b)); draw(); }));
      root.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => { tf = b.dataset.t; root.querySelectorAll('[data-t]').forEach(x=>x.setAttribute('aria-pressed', x===b)); draw(); }));
      canvas.addEventListener('keydown', e => { if(e.key==='ArrowLeft'){ e.preventDefault(); setSel(sel-1); } else if(e.key==='ArrowRight'){ e.preventDefault(); setSel(sel+1); } });
      draw();
      return () => { if(ch) ch.destroy(); };
    });
  }
  window.OPENEVOL = openEvol; window.GMET = MET;
  // Hoje: os quadrados da distância e da velocidade da semana abrem este gráfico (por semana), com o botão para ver por treino
  document.addEventListener('click', e => { const el = e.target.closest && e.target.closest('[data-q="wkkm"],[data-q="wksp"]'); if(!el) return;
    e.stopImmediatePropagation(); e.preventDefault(); openEvol(el, MET[el.dataset.q==='wkkm'?0:3], 'w', CUR_WEEK); }, true);
  document.addEventListener('keydown', e => { const el = e.target.closest && e.target.closest('[data-q="wkkm"],[data-q="wksp"]'); if(!el || (e.key!=='Enter' && e.key!==' ')) return;
    e.stopImmediatePropagation(); e.preventDefault(); openEvol(el, MET[el.dataset.q==='wkkm'?0:3], 'w', CUR_WEEK); }, true);
  // botão escolhido em branco (uma regra geral com !important pintava-o da cor do fundo)
  const st = document.createElement('style'); st.textContent = '.gsheet .seg button[aria-pressed=true]{background:#fff!important;color:#0E1A2E!important;border-color:#fff!important}.gsheet .seg[hidden]{display:none!important}.gsheet .sd{flex-wrap:nowrap!important}.gsheet .sd button{padding:6px 9px;font-size:13px;white-space:nowrap}'; document.head.appendChild(st);

  // ---------- ligar aos quadrados ----------
  function arm(scope, fn){
    const tiles = scope.querySelectorAll('.rsp .g > div');
    if(tiles.length !== 4) return;
    tiles.forEach((el,i) => {
      if(el.dataset.gt) return; el.dataset.gt = '1'; el.classList.add('gt'); el.setAttribute('role','button'); el.tabIndex = 0;
      el.setAttribute('aria-label', T('Abrir gráfico: ','Open chart: ')+MET[i].n);
      const go = () => fn(el, MET[i]);
      el.addEventListener('click', go);
      el.addEventListener('keydown', e => { if(e.key==='Enter' || e.key===' '){ e.preventDefault(); go(); } });
    });
  }
  const ev = document.getElementById('s-evol'), wk = document.getElementById('s-wk');
  if(ev) arm(ev, (el,m) => openEvol(el, m, 'd'));
  if(wk){
    const wkOpen = (el,m) => openEvol(el, m, 'w', selWeek);
    arm(wk, wkOpen);
    new MutationObserver(() => arm(wk, wkOpen)).observe(wk, {childList:true, subtree:true});
  }
})();
