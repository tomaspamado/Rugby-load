// ---------- Gráfico em ponto grande: toca num quadrado e vê a série toda, a passar o dedo ----------
// Evolução: a série sessão a sessão. Semana: o mesmo indicador semana a semana (mesmo dia da semana, comparação justa).
(function(){
  const EN = document.documentElement.lang === 'en';
  const T = (pt,en) => EN ? en : pt;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  const tok = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  const st = document.createElement('style');
  st.textContent = ''
   +'.gsheet{position:fixed;inset:0;z-index:60;background:var(--navy,#0E1A2E);color:#fff;overflow:auto;overscroll-behavior:contain;padding:max(14px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) calc(28px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));box-sizing:border-box}'
   +'.gsheet .dc{max-width:640px;margin:0 auto}.gsheet .bk{font:600 15px Inter,system-ui,sans-serif;background:none;border:0;color:#fff;min-height:44px;padding:0 12px 0 0;cursor:pointer;display:inline-flex;align-items:center}'
   +'.gsheet h2{margin:4px 0 2px;font-size:26px}.gsheet .sub2{color:rgba(255,255,255,.7);font-size:14px;margin-bottom:12px}'
   +'.gsheet .gr{background:rgba(255,255,255,.08);color:#fff;border-radius:14px;padding:14px 16px;margin-bottom:14px;min-height:118px;box-sizing:border-box}.gsheet .gr small{display:block;font-size:12px;opacity:.78}'
   +'.gsheet .gr .gv{font-family:"Barlow Condensed",sans-serif;font-size:46px;font-weight:600;line-height:1.05;margin:2px 0}.gsheet .gr .gv em{font-style:normal;font-size:16px;opacity:.75;margin-left:4px}'
   +'.gsheet .gr .gd{font-size:13px;font-weight:600}.gsheet .gr .up{color:#5CC48A}.gsheet .gr .dn{color:#F2B84B}.gsheet .gr .nt{color:#8FB4E8}'
   +'.gsheet .gflt{display:flex;flex-direction:column;gap:8px;align-items:flex-start;margin-bottom:10px}.gsheet .gflt .seg{max-width:100%;flex-wrap:wrap}'
   +'.gsheet .cbox{position:relative;height:min(50vh,340px);touch-action:pan-y;-webkit-user-select:none;user-select:none}.gsheet .cbox canvas{touch-action:pan-y}'
   +'.gsheet .gh{color:rgba(255,255,255,.6);font-size:13px;margin:10px 0 0}.gsheet .seg{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}.gsheet .seg button{background:transparent;color:#fff}.gsheet .seg button[aria-pressed=true]{background:#fff;color:#0E1A2E}.gsheet .bk:focus-visible,.gsheet canvas:focus-visible{outline:2px solid #D9981A;outline-offset:2px}'
   +'.gsheet .gl{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:rgba(255,255,255,.7);margin-top:8px}.gsheet .gl i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}'
   +'.rsp .g>div.gt{cursor:pointer;position:relative}.rsp .g>div.gt::after{content:"›";position:absolute;right:9px;top:6px;font-size:18px;line-height:1;opacity:.7}.rsp .g>div.gt:focus-visible{outline:2px solid #D9981A;outline-offset:2px}';
  document.body.appendChild(st);

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

  // ---------- Evolução: sessão a sessão ----------
  function openEvol(card, m){
    const html = '<h2>'+m.n+'</h2><div class="sub2">'+T('Sessão a sessão','Session by session')+'</div>'
      +'<div class="gr" aria-live="polite"><small class="r1"></small><div class="gv"></div><div class="gd r3"></div><small class="r4"></small></div>'
      +'<div class="gflt"><div class="seg" role="group" aria-label="'+T('Período','Period')+'"><button type="button" data-r="12" aria-pressed="true">'+T('Últimas 12','Last 12')+'</button><button type="button" data-r="0" aria-pressed="false">'+T('Todas','All')+'</button></div>'
      +'<div class="seg" role="group" aria-label="'+T('Tipo de sessão','Session type')+'"><button type="button" data-t="all" aria-pressed="true">'+T('Tudo','All')+'</button><button type="button" data-t="tr" aria-pressed="false">'+T('Treinos','Training')+'</button><button type="button" data-t="ma" aria-pressed="false">'+T('Jogos','Matches')+'</button></div></div>'
      +'<div class="cbox"><canvas tabindex="0" role="img" aria-label="'+m.n+'"></canvas></div>'
      +legend([['rgba(255,255,255,.55)',T('Treino','Training')],['#FF6B6B',T('Jogo','Match')],['#D9981A',T('Selecionado','Selected')]].concat(m.line?[]:[['#fff',T('Média do grupo','Group average')]]))
      +'<p class="gh">'+T('Toca e arrasta o dedo no gráfico para ver cada sessão.','Touch and drag along the chart to see each session.')+'</p>';
    openSheet(card, m.n, html, root => {
      let range = 12, tf = 'all', sel = 0, src = [], ch = null;
      const r1 = root.querySelector('.r1'), gv = root.querySelector('.gv'), r3 = root.querySelector('.r3'), r4 = root.querySelector('.r4'), canvas = root.querySelector('canvas');
      const pool = () => SESSIONS.filter(s => tf==='all' || (tf==='ma' ? s.type==='Match' : s.type!=='Match'));
      const read = () => {
        const s = src[sel]; if(!s){ r1.textContent = T('Sem sessões com este filtro.','No sessions with this filter.'); gv.textContent = ''; r3.innerHTML = ''; r4.textContent = ''; return; }
        const v = s[m.k], ga = grpAvg(s,m);
        r1.textContent = dlong(s.date)+' · '+(s.type==='Match' ? T('Jogo vs ','Match vs ')+(s.opponent||'') : T('Treino','Training'))+' · '+T('Semana ','Week ')+s.week;
        gv.innerHTML = m.f(v)+(m.u?'<em>'+m.u+'</em>':'');
        const x = ga!=null ? pct(v,ga) : null;
        r3.innerHTML = ga!=null ? dlt(x, m.line?3:10)+' '+T('vs. média do grupo','vs. group average') : '';
        r4.textContent = m.k==='maxSpeed' ? Math.round(v/MAXREF*100)+T('% do teu máximo (','% of your max (')+f1(MAXREF)+' km/h)' : (ga!=null ? T('Média do grupo nessa sessão: ','Group average in that session: ')+m.f(ga)+(m.u?' '+m.u:'') : '');
      };
      const setSel = i => { if(i===sel || !src[i]) return; sel = i; read(); if(ch) ch.update('none'); };
      const draw = () => {
        src = (range===0 ? pool() : pool().slice(-range));
        sel = Math.max(0, src.length-1);
        if(ch) ch.destroy();
        const typeCol = s => s.type==='Match' ? '#FF6B6B' : 'rgba(255,255,255,.5)';
        const pick = (cols) => ctx => ctx.dataIndex===sel ? '#D9981A' : cols[ctx.dataIndex];
        const ds = [m.line
          ? {type:'line', label:m.n, data:src.map(s=>s[m.k]), borderColor:'#fff', backgroundColor:'#fff', borderWidth:2.5, pointRadius:src.map(s=>s.type==='Match'?5:3.5), pointBackgroundColor:pick(src.map(s=>s.type==='Match'?'#FF6B6B':'#fff')), pointBorderColor:'#0E1A2E', pointBorderWidth:1.5, tension:.25, order:2}
          : {type:'bar', label:m.n, data:src.map(s=>s[m.k]), backgroundColor:pick(src.map(typeCol)), borderRadius:{topLeft:6,topRight:6}, borderSkipped:'bottom', maxBarThickness:28, order:2}];
        if(!m.line) ds.push({type:'line', label:T('Média do grupo','Group average'), data:src.map(s=>grpAvg(s,m)), borderColor:'#fff', borderWidth:2, borderDash:[5,4], pointRadius:0, pointHoverRadius:0, spanGaps:true, order:1});
        else{ ds.push({type:'line', label:T('Máximo pessoal','Personal max'), data:src.map(()=>MAXREF), borderColor:'rgba(255,255,255,.6)', borderWidth:1.5, borderDash:[3,5], pointRadius:0, order:1});
              ds.push({type:'line', label:T('Meta 95%','Goal 95%'), data:src.map(()=>MAXREF*0.95), borderColor:'#5CC48A', borderWidth:2, pointRadius:0, order:1}); }
        ch = makeChart(canvas, {data:{labels:src.map(s=>dshort(s.date)), datasets:ds}, min:m.line?18:undefined}, ()=>sel, setSel);
        read();
      };
      root.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => { range = +b.dataset.r; root.querySelectorAll('[data-r]').forEach(x=>x.setAttribute('aria-pressed', x===b)); draw(); }));
      root.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => { tf = b.dataset.t; root.querySelectorAll('[data-t]').forEach(x=>x.setAttribute('aria-pressed', x===b)); draw(); }));
      canvas.addEventListener('keydown', e => { if(e.key==='ArrowLeft'){ e.preventDefault(); setSel(sel-1); } else if(e.key==='ArrowRight'){ e.preventDefault(); setSel(sel+1); } });
      draw();
      return () => { if(ch) ch.destroy(); };
    });
  }

  // ---------- Semana: semana a semana, até ao mesmo dia ----------
  function openWeeks(card, m){
    const cut = weekCut(selWeek), cutName = DOWN[cut%7].replace('-feira','');
    const weeks = [...new Set(SESSIONS.map(x=>x.week))].sort((a,b)=>a-b);
    const tot = w => { const t = wkTot(w,cut); if(!t) return null;
      const acc = SESSIONS.filter(x=>x.week===w && dow(x.date)<=cut).reduce((a,x)=>a+x.accel,0);
      const v = m.k==='rd' ? t.rd : m.k==='hsr' ? t.hsr : m.k==='accel' ? acc : t.sp;
      const xs = SESSIONS.filter(x=>x.week===w && dow(x.date)<=cut);
      return {w, v, n:t.n, d0:xs[0].date, d1:xs[xs.length-1].date, gap:SESSIONS.some(x=>x.week===w && x.gpsGap)}; };
    const pts = weeks.map(tot).filter(Boolean);
    const disp = v => m.k==='rd' ? f1(v/1000) : m.f(v), unit = m.k==='rd' ? 'km' : m.u;
    const yv = v => m.k==='rd' ? v/1000 : v;
    const html = '<h2>'+m.n+'</h2><div class="sub2">'+T('Semana a semana, só até '+cutName+' para a comparação ser justa','Week by week, only up to '+cutName+' so the comparison is fair')+'</div>'
      +'<div class="gr" aria-live="polite"><small class="r1"></small><div class="gv"></div><div class="gd r3"></div><small class="r4"></small></div>'
      +'<div class="cbox"><canvas tabindex="0" role="img" aria-label="'+m.n+'"></canvas></div>'
      +legend([['rgba(255,255,255,.55)',T('Semana','Week')],['#D9981A',T('Selecionada','Selected')]])
      +'<p class="gh">'+T('Toca e arrasta o dedo no gráfico para ver cada semana.','Touch and drag along the chart to see each week.')+'</p>';
    openSheet(card, m.n, html, root => {
      let sel = Math.max(0, pts.findIndex(p=>p.w===selWeek));
      const r1 = root.querySelector('.r1'), gv = root.querySelector('.gv'), r3 = root.querySelector('.r3'), r4 = root.querySelector('.r4'), canvas = root.querySelector('canvas');
      const read = () => {
        const p = pts[sel], q = pts[sel-1]; if(!p) return;
        r1.textContent = T('Semana ','Week ')+p.w+' · '+dshort(p.d0)+' – '+dshort(p.d1);
        gv.innerHTML = disp(p.v)+(unit?'<em>'+unit+'</em>':'');
        const x = q && !p.gap && !q.gap ? pct(p.v,q.v) : null;
        r3.innerHTML = x!=null ? dlt(x, m.k==='maxSpeed'?3:10)+' '+T('vs. semana anterior','vs. previous week') : '';
        r4.textContent = (p.gap||(q&&q.gap)) ? T('Houve treinos sem GPS (Agronomia): total incompleto, não comparo.','Some training had no GPS (Agronomia): incomplete total, no comparison.')
          : p.n+' '+(p.n===1?T('sessão','session'):T('sessões','sessions'));
      };
      const setSel = i => { if(i===sel || !pts[i]) return; sel = i; read(); ch.update('none'); };
      const cols = pts.map(p => p.gap ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.5)');
      const pick = ctx => ctx.dataIndex===sel ? '#D9981A' : cols[ctx.dataIndex];
      const ds = [m.k==='maxSpeed'
        ? {type:'line', label:m.n, data:pts.map(p=>yv(p.v)), borderColor:'#fff', backgroundColor:'#fff', borderWidth:2.5, pointRadius:4, pointBackgroundColor:pick, pointBorderColor:'#0E1A2E', pointBorderWidth:1.5, tension:.25, order:2}
        : {type:'bar', label:m.n, data:pts.map(p=>yv(p.v)), backgroundColor:pick, borderRadius:{topLeft:6,topRight:6}, borderSkipped:'bottom', maxBarThickness:34, order:2}];
      if(m.k==='maxSpeed') ds.push({type:'line', label:T('Meta 95%','Goal 95%'), data:pts.map(()=>MAXREF*0.95), borderColor:'#5CC48A', borderWidth:2, pointRadius:0, order:1});
      const ch = makeChart(canvas, {data:{labels:pts.map(p=>T('S','W')+p.w), datasets:ds}, min:m.k==='maxSpeed'?18:undefined}, ()=>sel, setSel);
      read();
      canvas.addEventListener('keydown', e => { if(e.key==='ArrowLeft'){ e.preventDefault(); setSel(sel-1); } else if(e.key==='ArrowRight'){ e.preventDefault(); setSel(sel+1); } });
      return () => ch.destroy();
    });
  }

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
  if(ev) arm(ev, openEvol);
  if(wk){
    arm(wk, openWeeks);
    new MutationObserver(() => arm(wk, openWeeks)).observe(wk, {childList:true, subtree:true});
  }
})();
