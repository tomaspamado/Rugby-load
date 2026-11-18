// ---------- Força relativa: cargas do ginásio vs. os teus objetivos (múltiplos do peso) ----------
// Exercícios por defeito: bench press, box squat e pull-up com peso. Podes mudar, juntar ou tirar exercícios em "Exercícios e objetivos".
// Cada série guarda kg e repetições; o máximo (1RM) é estimado pela fórmula de Epley: kg × (1 + reps/30), exato com 1 repetição.
// Em exercícios com o peso do corpo (ex.: pull-up), regista só o peso extra: a conta usa peso do corpo + extra.
// O peso é a média de 7 dias da balança (se houver pesagens recentes), senão a última medição da nutricionista.
// Guarda só no telemóvel ('strength_log', 'strength_lifts'); entra na cópia de segurança.
(function(){
  const {en: EN, t: T} = I18N;
  const KEY = 'strength_log', LKEY = 'strength_lifts';
  const DEF = [
    {k:'bp', n:'Bench press', g:1.4, bw:false},
    {k:'bs', n:'Box squat',   g:2.0, bw:false},
    {k:'pu', n:'Pull-up c/ peso', g:1.5, bw:true}
  ];
  // Alvos por defeito = nível de backs profissionais/internacionais (máximo a 1 repetição ÷ peso):
  // bench 1,4× e pull-up 1,5× no total (peso + extra, ou seja +0,5× de extra): backs do Super Rugby (Sports 2020, 8:85: 1,41 e 1,50)
  // e o nível "Elite" de Jack Tyler (bench 1,4×, chin-up +0,5×). Agachamento: backs do Super Rugby 1,86× e "Elite" 1,8× em back squat;
  // o box squat costuma permitir um pouco mais de carga, por isso 2,0×.
  // Registos iniciais (que deste): bench 110 kg e box squat 200 kg a 1 repetição, no início da pré-época (25/08/2026).
  (function seed(){
    try{
      if(localStorage.getItem('strength_seed1')) return;
      const OLD = {bp:1.25, bs:1.75, pu:1.4}, NEW = {bp:1.4, bs:2.0, pu:1.5};
      const ls = JSON.parse(localStorage.getItem('strength_lifts') || 'null');
      if(Array.isArray(ls)){ ls.forEach(l => { if(OLD[l.k]!=null && +l.g===OLD[l.k]) l.g = NEW[l.k]; }); localStorage.setItem('strength_lifts', JSON.stringify(ls)); }
      const log = JSON.parse(localStorage.getItem('strength_log') || '[]') || [];
      const add = (id, l, kg) => { if(!log.some(x => x.l===l && x.date==='2026-08-25' && +x.kg===kg)) log.push({id, date:'2026-08-25', l, kg, reps:1}); };
      add(1756080000001, 'bp', 110); add(1756080000002, 'bs', 200);
      localStorage.setItem('strength_log', JSON.stringify(log));
      localStorage.setItem('strength_seed1', '1');
    }catch(e){}
  })();
  const ld = (k,d) => { try{ const v = JSON.parse(localStorage.getItem(k)); return v==null ? d : v; }catch(e){ return d; } };
  const sv = (k,v) => { try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } };
  if(window.REG && REG.KEYS) [KEY, LKEY].forEach(k => { if(!REG.KEYS.includes(k)) REG.KEYS.push(k); });
  const lifts = () => { const v = ld(LKEY, null); return Array.isArray(v) && v.length ? v.filter(l => l && l.k && l.n && +l.g>0) : DEF.map(l => ({...l})); };
  let LIFTS = lifts();
  const load = () => (ld(KEY, [])||[]).filter(x => x && x.date && x.kg>=0 && x.reps>0 && LIFTS.some(l=>l.k===x.l));
  const gf = g => nfx(g, Math.round(g*100)%10 ? 2 : 1);
  const esc = v => String(v).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const nfx = (v,d) => v==null || isNaN(v) ? '–' : (EN ? v.toFixed(d) : v.toFixed(d).replace('.',','));
  const num = v => { const n = parseFloat(String(v).replace(/\s/g,'').replace(',','.')); return isFinite(n) ? n : NaN; };
  const tot = x => x.kg + ((LIFTS.find(l=>l.k===x.l)||{}).bw ? (x.bwKg || bw()) : 0);
  const e1rm = x => { const k = tot(x); return x.reps===1 ? k : k*(1+x.reps/30); };
  const bw = () => (window.SCALE && SCALE.weight()) || ((typeof BODY!=='undefined' && BODY.length) ? BODY[BODY.length-1].weight : 80);
  const bwSrc = () => (window.SCALE && SCALE.weight()) ? T('média de 7 dias da balança','7-day scale average') : T('última medição da nutricionista','last nutritionist measurement');

  const jumps = () => (ld('jump_log', []) || []).filter(x => x && x.date && x.cm>0).sort((a,b) => a.date.localeCompare(b.date));
  const jumpGoal = () => { const g = +ld('jump_goal', 55); return g>10 && g<120 ? g : 55; };

  const corpo = document.getElementById('pg-corpo'); if(!corpo) return;
  const wrap = document.createElement('section'); wrap.id = 's-forca';
  (document.getElementById('s-balanca') || document.getElementById('s-corpo')).after(wrap);
  let lift = 'bp';
  const kgLabel = () => (LIFTS.find(l=>l.k===lift)||{}).bw ? T('Peso extra (kg)','Added weight (kg)') : T('Carga (kg)','Load (kg)');
  const lrow = l => '<div class="fc-lrow" data-lk="'+esc(l.k)+'"><label>'+T('Exercício','Lift')+'<input data-ln value="'+esc(l.n)+'" maxlength="30" autocomplete="off"></label>'
    +'<label>'+T('Alvo (× peso)','Goal (× bw)')+'<input data-lg inputmode="decimal" value="'+nfx(+l.g,2)+'"></label>'
    +'<label class="fc-chk"><input type="checkbox" data-lb'+(l.bw?' checked':'')+'> '+T('Com peso do corpo','Bodyweight lift')+'</label>'
    +'<button type="button" class="bal-del" data-lrm aria-label="'+T('Tirar exercício','Remove lift')+'">✕</button></div>';

  function render(){
    LIFTS = lifts(); if(!LIFTS.some(l=>l.k===lift)) lift = LIFTS[0].k;
    const L = load(), G = Object.fromEntries(LIFTS.map(l=>[l.k,+l.g])), W = bw(), today = iso(new Date());
    const now = new Date(), c90 = (now.getMonth()>=6 ? now.getFullYear() : now.getFullYear()-1)+'-07-01';   // esta época: desde 1 de julho
    const best = k => { const xs = L.filter(x => x.l===k && x.date>=c90 && x.reps<=10); if(!xs.length) return null; return xs.reduce((a,x) => e1rm(x)>e1rm(a) ? x : a); };
    const rows = LIFTS.map(l => { const b = best(l.k), r = b ? e1rm(b)/W : null; return {l, b, r, g:G[l.k], gap: b ? Math.max(0, G[l.k]*W - e1rm(b)) : null}; });
    // salto CMJ (registado na secção do salto, 'jump_log'), no mesmo painel
    const J = jumps(), jg = jumpGoal(), jl = J[J.length-1];
    const done = rows.filter(x => x.r!=null && x.r>=x.g).length + (jl && jl.cm>=jg ? 1 : 0), have = rows.filter(x => x.r!=null).length + (jl ? 1 : 0), total = LIFTS.length + 1;
    const tile = (k, name, val, unit, pct, ok, line) => '<div class="gt" data-ft="'+esc(k)+'" role="button" tabindex="0" aria-label="'+T('Abrir gráfico: ','Open chart: ')+esc(name)+'"><small>'+esc(name)+'</small><b>'+val+(val!=='–'?'<em>'+unit+'</em>':'')+'</b>'
      +'<div class="fc-bar" role="img" aria-label="'+esc(name)+'"><i style="width:'+Math.min(100,pct).toFixed(1)+'%"></i></div><small class="'+(ok?'up':'')+'">'+line+'</small></div>';
    let h = '<h2>'+T('Força e salto','Strength and jump')+'</h2><div class="sub">'+T('Máximo estimado a dividir pelo peso, e o salto CMJ, contra os teus objetivos. Peso usado: ','Estimated max divided by bodyweight, and the CMJ, against your goals. Weight used: ')+nfx(W,1)+' kg ('+bwSrc()+'). '+T('Toca num quadrado para ver a evolução.','Tap a tile to see the trend.')+'</div>';
    h += '<div class="rsp"><small>'+(have ? T('Melhor desta época','Best this season') : T('Ainda sem registos','Nothing logged yet'))+'</small><div class="rt">'+(have ? done+T(' de ',' of ')+total+T(' objetivos',' goals') : T('Regista a primeira série','Log your first set'))+'</div>'
      +'<div class="g fc-g">'+rows.map(x => tile(x.l.k, x.l.n, x.r!=null ? nfx(x.r,2) : '–', '×', x.r!=null ? x.r/x.g*100 : 0, x.r!=null && x.r>=x.g,
          x.r==null ? T('alvo ','goal ')+gf(x.g)+'×' : x.r>=x.g ? T('✓ alvo ','✓ goal ')+gf(x.g)+'×' : T('alvo ','goal ')+gf(x.g)+'× · '+T('faltam ~','~')+Math.ceil(x.gap)+' kg'+T('',' to go'))).join('')
      +tile('cmj', 'CMJ', jl ? nfx(jl.cm,1) : '–', 'cm', jl ? jl.cm/jg*100 : 0, jl && jl.cm>=jg,
          !jl ? T('alvo ','goal ')+nfx(jg,0)+' cm' : jl.cm>=jg ? T('✓ alvo ','✓ goal ')+nfx(jg,0)+' cm' : T('alvo ','goal ')+nfx(jg,0)+' cm · '+T('faltam ','')+nfx(jg-jl.cm,1)+' cm'+T('',' to go'))
      +'</div>'
      +'<small>'+T('Força: máximo estimado a partir de séries até 10 repetições (fórmula de Epley); com 1 a 5 repetições é mais fiável. CMJ: último salto nas plataformas.','Strength: max estimated from sets of up to 10 reps (Epley formula); 1 to 5 reps is more reliable. CMJ: latest jump on the force plates.')+'</small></div>';
    // registar
    h += '<details class="fold" id="fc-add"'+(L.length?'':' open')+'><summary><span>'+T('Registar uma série','Log a set')+'</span></summary><div class="card frm">'
      +'<div class="seg fc-lifts" role="group" aria-label="'+T('Exercício','Lift')+'">'+LIFTS.map(l => '<button type="button" data-fl="'+l.k+'" aria-pressed="'+(lift===l.k)+'">'+esc(l.n)+'</button>').join('')+'</div>'
      +'<div class="fr2"><label>'+'<span id="fc-kgl">'+kgLabel()+'</span><input id="fc-kg" inputmode="decimal" autocomplete="off"></label><label>'+T('Repetições','Reps')+'<input id="fc-reps" inputmode="numeric" value="1" autocomplete="off"></label></div>'
      +'<div class="fr2"><label>'+T('Data','Date')+'<input type="date" id="fc-date" value="'+today+'" max="'+today+'"></label><span></span></div>'
      +'<div class="tgbtns"><button type="button" class="pri" id="fc-save">'+T('Guardar série','Save set')+'</button></div><div class="tgmsg" id="fc-msg" role="status" aria-live="polite"></div></div></details>';
    // objetivos e histórico
    h += '<details class="fold" id="fc-ex"><summary><span>'+T('Exercícios e objetivos','Lifts and goals')+'</span></summary><div class="card frm">'
      +'<div class="sub" style="margin:0 0 8px">'+T('Objetivo = máximo a dividir pelo teu peso. "Com peso do corpo" (ex.: pull-up): registas só o peso extra e a conta junta o teu peso.','Goal = max divided by bodyweight. "Bodyweight lift" (e.g. pull-up): log only the added weight and the maths adds your bodyweight.')+'</div>'
      +'<div id="fc-lrows">'+LIFTS.map(lrow).join('')+'</div>'
      +'<div class="tgbtns"><button type="button" id="fc-ladd" class="fc-sec">+ '+T('Juntar exercício','Add lift')+'</button><button type="button" class="pri" id="fc-gsave">'+T('Guardar','Save')+'</button></div><div class="tgmsg" id="fc-gmsg" role="status" aria-live="polite"></div></div></details>';
    if(L.length){
      const rs = L.slice().sort((a,b) => b.date.localeCompare(a.date)).slice(0, 40);
      h += '<details class="fold" id="fc-hist"><summary><span>'+T('Séries registadas','Logged sets')+' ('+L.length+')</span></summary><div class="card"><div class="scroll"><table class="bt"><tr><th>'+T('Data','Date')+'</th><th>'+T('Exercício','Lift')+'</th><th>kg × reps</th><th>'+T('Máx. est.','Est. max')+'</th><th></th></tr>'
        +rs.map(x => '<tr><td>'+dshort(x.date)+'</td><td>'+esc(LIFTS.find(l=>l.k===x.l).n)+'</td><td>'+nfx(x.kg,1)+' × '+x.reps+'</td><td>'+Math.round(e1rm(x))+' kg</td><td><button type="button" class="bal-del" data-fdel="'+x.id+'" aria-label="'+T('Apagar série','Delete set')+'">✕</button></td></tr>').join('')
        +'</table></div></div></details>';
    }
    wrap.innerHTML = h;
  }

  wrap.addEventListener('keydown', e => { const t = e.target.closest('[data-ft]'); if(t && (e.key==='Enter' || e.key===' ')){ e.preventDefault(); openChart(t); } });
  wrap.addEventListener('click', e => {
    const ft = e.target.closest('[data-ft]'); if(ft){ openChart(ft); return; }
    const fl = e.target.closest('[data-fl]'); if(fl){ lift = fl.dataset.fl; wrap.querySelectorAll('[data-fl]').forEach(b => b.setAttribute('aria-pressed', b===fl)); const kl = wrap.querySelector('#fc-kgl'); if(kl) kl.textContent = kgLabel(); return; }
    const del = e.target.closest('[data-fdel]'); if(del){ if(del.dataset.sure!=='1'){ del.dataset.sure = '1'; del.textContent = T('Apagar?','Delete?'); return; }
      sv(KEY, load().filter(x => String(x.id)!==del.dataset.fdel)); render(); const hh = document.getElementById('fc-hist'); if(hh) hh.open = true; return; }
    if(e.target.closest('#fc-save')){
      const q = id => wrap.querySelector('#fc-'+id), msg = q('msg'), kg = num(q('kg').value), reps = Math.round(num(q('reps').value)), date = q('date').value;
      const LF = LIFTS.find(l=>l.k===lift);
      if(!(kg>=(LF.bw?0:0.5) && kg<=400)){ msg.className = 'tgmsg err'; msg.textContent = T('Põe a carga em kg (até 400).','Enter the load in kg (up to 400).'); return; }
      if(!(reps>=1 && reps<=20)){ msg.className = 'tgmsg err'; msg.textContent = T('Repetições entre 1 e 20.','Reps between 1 and 20.'); return; }
      if(!date){ msg.className = 'tgmsg err'; msg.textContent = T('Escolhe a data.','Pick the date.'); return; }
      const L = load(); L.push(Object.assign({id:Date.now(), date, l:lift, kg, reps}, LF.bw ? {bwKg: Math.round(bw()*10)/10} : {}));
      if(!sv(KEY, L)){ msg.className = 'tgmsg err'; msg.textContent = T('Não consegui guardar neste navegador.','Could not save in this browser.'); return; }
      render(); const a = document.getElementById('fc-add'); if(a){ a.open = true; const m = a.querySelector('#fc-msg'); m.className = 'tgmsg'; m.textContent = T('✓ Série guardada. Máximo estimado: ','✓ Set saved. Estimated max: ')+Math.round(e1rm(Object.assign({kg, reps, l:lift}, LF.bw ? {bwKg: bw()} : {})))+' kg'+(reps>10?T(' (com mais de 10 repetições não entra no máximo)',' (over 10 reps it does not count for the max)'):'')+'.'; }
      return;
    }
    if(e.target.closest('#fc-ladd')){
      const d = document.createElement('div'); d.innerHTML = lrow({k:'x'+Date.now().toString(36), n:'', g:1, bw:false});
      const r = d.firstChild; wrap.querySelector('#fc-lrows').appendChild(r); r.querySelector('[data-ln]').focus(); return;
    }
    const rm = e.target.closest('[data-lrm]'); if(rm){ if(wrap.querySelectorAll('.fc-lrow').length>1) rm.closest('.fc-lrow').remove(); return; }
    if(e.target.closest('#fc-gsave')){
      const msg = wrap.querySelector('#fc-gmsg'), out = []; let bad = '';
      wrap.querySelectorAll('.fc-lrow').forEach(r => { const n = r.querySelector('[data-ln]').value.trim(), g = num(r.querySelector('[data-lg]').value);
        if(!n) bad = T('Dá um nome a cada exercício.','Name every lift.'); else if(!(g>0.2 && g<5)) bad = T('Cada objetivo entre 0,2 e 5 vezes o peso.','Each goal between 0.2 and 5 times bodyweight.');
        out.push({k:r.dataset.lk, n, g, bw:r.querySelector('[data-lb]').checked}); });
      if(bad){ msg.className = 'tgmsg err'; msg.textContent = bad; return; }
      sv(LKEY, out); render(); const m = wrap.querySelector('#fc-gmsg'); if(m){ wrap.querySelector('#fc-ex').open = true; m.className = 'tgmsg'; m.textContent = T('✓ Exercícios guardados.','✓ Lifts saved.'); }
    }
  });
  // ---------- gráfico de cada quadrado: a evolução registada (folha grande, como no resto da app) ----------
  function openChart(card){
    if(!window.GSHEET || !window.Chart) return;
    const k = card.dataset.ft, isJ = k==='cmj', L0 = LIFTS.find(l => l.k===k);
    const name = isJ ? 'CMJ' : (L0 ? L0.n : k);
    // um ponto por dia: o melhor do dia
    const pts = (() => {
      if(isJ) return jumps().map(x => ({d:x.date, v:x.cm, txt:T('Plataformas de força','Force plates')}));
      const by = {}; load().filter(x => x.l===k && x.reps<=10).forEach(x => { const e = e1rm(x); if(!by[x.date] || e>by[x.date].e) by[x.date] = {e, x}; });
      return Object.keys(by).sort().map(d => { const {e, x} = by[d];
        return {d, kg:e, r:e/(L0 && L0.bw && x.bwKg ? x.bwKg : bw()), txt:nfx(x.kg,1)+' kg × '+x.reps+(x.reps>1 ? ' → '+Math.round(e)+' kg '+T('est.','est.') : '')}; });
    })();
    const st = {u: isJ ? 'cm' : 'x', sel: pts.length-1};
    const goalOf = () => isJ ? jumpGoal() : st.u==='x' ? +L0.g : +L0.g*bw();
    const valOf = p => isJ ? p.v : st.u==='x' ? p.r : p.kg;
    const fmt = v => isJ ? nfx(v,1)+'<em>cm</em>' : st.u==='x' ? nfx(v,2)+'<em>×</em>' : Math.round(v)+'<em>kg</em>';
    const html = '<h2>'+esc(name)+'</h2><div class="sub2">'+(isJ ? T('Salto com contramovimento nas plataformas de força.','Countermovement jump on the force plates.') : T('Máximo estimado (melhor série de cada dia).','Estimated max (best set of each day).'))+'</div>'
      +'<div class="gr" aria-live="polite"><small class="r1"></small><div class="gv"></div><div class="gd r3"></div><small class="r4"></small></div>'
      +(isJ ? '' : '<div class="gflt"><div class="seg" role="group" aria-label="'+T('Unidade','Unit')+'"><button type="button" data-u="x">'+T('× o peso','× bodyweight')+'</button><button type="button" data-u="kg">kg</button></div></div>')
      +'<div class="cbox"><canvas tabindex="0" role="img"></canvas></div><div class="gl"></div><p class="gh"></p>';
    window.GSHEET(card, name, html, root => {
      let ch = null; const q = x => root.querySelector(x), canvas = q('canvas');
      const read = () => { const p = pts[st.sel], g = goalOf();
        if(!p){ q('.r1').textContent = ''; q('.gv').innerHTML = '–'; q('.r3').innerHTML = ''; q('.r4').textContent = T('Ainda sem registos: regista em baixo.','Nothing logged yet: log below.'); return; }
        const v = valOf(p), prev = pts[st.sel-1];
        q('.r1').textContent = dlong(p.d); q('.gv').innerHTML = fmt(v);
        q('.r3').innerHTML = (v>=g ? '<span class="up">'+T('✓ alvo','✓ goal')+'</span>' : '<span class="nt">'+T('faltam ','')+(isJ ? nfx(g-v,1)+' cm' : st.u==='x' ? nfx(g-v,2)+'×' : Math.ceil(g-v)+' kg')+T(' para o alvo',' to goal')+'</span>')
          +(prev ? ' · <span class="'+(v>=valOf(prev)?'up':'dn')+'">'+(v>=valOf(prev)?'+':'−')+(isJ ? nfx(Math.abs(v-valOf(prev)),1)+' cm' : st.u==='x' ? nfx(Math.abs(v-valOf(prev)),2)+'×' : Math.round(Math.abs(v-valOf(prev)))+' kg')+T(' vs. anterior',' vs. previous')+'</span>' : '');
        q('.r4').textContent = p.txt; };
      const setSel = i => { if(i===st.sel || !pts[i]) return; st.sel = i; read(); if(ch) ch.update('none'); };
      const draw = () => {
        root.querySelectorAll('[data-u]').forEach(b => b.setAttribute('aria-pressed', b.dataset.u===st.u));
        const g = goalOf(), vals = pts.map(valOf), labels = pts.map(p => dshort(p.d));
        const sel = {id:'fsel', afterDatasetsDraw(c){ const el = c.getDatasetMeta(0).data[st.sel]; if(!el) return; const a = c.chartArea, x = c.ctx; x.save(); x.strokeStyle = '#fff'; x.globalAlpha = .55; x.lineWidth = 1.5; x.setLineDash([4,4]); x.beginPath(); x.moveTo(el.x,a.top); x.lineTo(el.x,a.bottom); x.stroke(); x.restore();
          x.save(); x.fillStyle = '#D9981A'; x.strokeStyle = '#0E1A2E'; x.lineWidth = 2.5; x.beginPath(); x.arc(el.x, el.y, 6, 0, 7); x.fill(); x.stroke(); x.restore(); }};
        if(ch) ch.destroy();
        const lo = Math.min(g, ...vals), hi = Math.max(g, ...vals), pad = (hi-lo)*.25 || (isJ ? 3 : st.u==='x' ? .1 : 5);
        ch = new Chart(canvas, {type:'line', data:{labels, datasets:[
            {label:name, data:vals, borderColor:'#fff', backgroundColor:'#fff', borderWidth:2.5, pointRadius:3.5, pointHoverRadius:3.5, tension:.25},
            {label:T('Alvo','Goal'), data:pts.map(() => g), borderColor:'#5CC48A', borderWidth:2, borderDash:[6,5], pointRadius:0, pointHoverRadius:0}]},
          plugins:[sel], options:{responsive:true, maintainAspectRatio:false, animation:{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:400},
            events:['mousemove','mouseout','click','touchstart','touchmove'], interaction:{mode:'index', intersect:false, axis:'x'},
            onHover:(e, els) => { if(els && els.length) setSel(els[0].index); },
            plugins:{legend:{display:false}, tooltip:{enabled:false}},
            scales:{x:{ticks:{color:'rgba(255,255,255,.7)', maxRotation:0, autoSkip:true, maxTicksLimit:6, font:{size:11}}, grid:{display:false}},
                    y:{suggestedMin:lo-pad, suggestedMax:hi+pad, ticks:{color:'rgba(255,255,255,.7)', font:{size:11}, maxTicksLimit:5, callback:v => isJ ? nfx(v,0) : st.u==='x' ? nfx(v,2) : Math.round(v)}, grid:{color:'rgba(255,255,255,.12)', drawTicks:false}, border:{display:false}}}}});
        q('.gl').innerHTML = '<span><i style="background:#fff;height:3px;width:16px;border-radius:2px;vertical-align:3px"></i>'+esc(name)+'</span><span><i style="background:#5CC48A;height:3px;width:16px;border-radius:2px;vertical-align:3px"></i>'+T('Alvo ','Goal ')+(isJ ? nfx(g,0)+' cm' : st.u==='x' ? gf(+L0.g)+'×' : Math.round(g)+' kg '+T('(no peso de hoje)','(at today\'s weight)'))+'</span>';
        q('.gh').textContent = pts.length<2 ? T('Com mais registos aparece aqui a linha da evolução.','With more entries the trend line shows here.') : T('Toca e arrasta o dedo para ver cada registo.','Touch and drag to see each entry.');
        canvas.setAttribute('aria-label', name); read();
      };
      root.addEventListener('click', e => { const b = e.target.closest('[data-u]'); if(b){ st.u = b.dataset.u; draw(); } });
      canvas.addEventListener('keydown', e => { if(e.key==='ArrowLeft'){ e.preventDefault(); setSel(st.sel-1); } else if(e.key==='ArrowRight'){ e.preventDefault(); setSel(st.sel+1); } });
      draw();
      return () => { if(ch) ch.destroy(); };
    });
  }
  render();
  window.FORCA = {render};
})();
