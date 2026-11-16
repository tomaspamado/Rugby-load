// ---------- Balança: pesagens diárias em casa (página Corpo) ----------
// Balança de bioimpedância: menos precisa do que a medição ISAK da nutricionista, serve para ver a tendência.
// Cada manhã, à mesma hora: peso, gordura %, músculo %, água %, osso kg, metabolismo em repouso (kcal) e IMC.
// Guarda só no telemóvel (localStorage 'scale_log'). A linha que conta é a média de 7 dias, não o valor de um dia.
// Quadrados do painel: tocar abre o gráfico em ponto grande (GSHEET, em grafico.js). Lá dá para juntar duas massas
// (peso, gordura, músculo, água, osso) no mesmo gráfico, em kg, e fixar essa combinação no gráfico da página.
(function(){
  const {en: EN, t: T} = I18N;
  const KEY = 'scale_log', PIN = 'scale_pin', SKIP = 'scale_am_skip';
  const load = () => { try{ const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; }catch(e){ return []; } };
  const save = a => { try{ localStorage.setItem(KEY, JSON.stringify(a)); return true; }catch(e){ return false; } };
  const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const DAY = 864e5, toT = s => new Date(s+'T00:00:00').getTime();
  const num = v => { const n = parseFloat(String(v).replace(/\s/g,'').replace(',','.')); return isFinite(n) ? n : NaN; };
  const nfx = (v,d) => v==null || isNaN(v) ? '–' : (EN ? v.toFixed(d) : v.toFixed(d).replace('.',','));
  const sgn = (v,d) => v==null ? '–' : (Math.round(v*Math.pow(10,d))===0 ? '' : v>0 ? '+' : '−')+nfx(Math.abs(v), d);
  const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // métricas: chave, nome, unidade, casas decimais, limites aceites, se subir é bom (null = neutro)
  const M = [
    {k:'w',   n:T('Peso','Weight'),                u:'kg',   d:1, min:40,  max:160,  up:null},
    {k:'fat', n:T('Gordura','Body fat'),           u:'%',    d:1, min:3,   max:50,   up:false},
    {k:'mus', n:T('Músculo','Muscle'),             u:'%',    d:1, min:20,  max:80,   up:true},
    {k:'wat', n:T('Água','Water'),                 u:'%',    d:1, min:30,  max:80,   up:null},
    {k:'bone',n:T('Osso','Bone'),                  u:'kg',   d:1, min:1,   max:8,    up:null},
    {k:'bmr', n:T('Metabolismo em repouso','Resting metabolism'), u:'kcal', d:0, min:800, max:4000, up:null},
    {k:'bmi', n:T('IMC','BMI'),                    u:'',     d:1, min:12,  max:45,   up:null}
  ];
  const byK = k => M.find(m => m.k===k);
  const short = k => k==='bmr' ? T('Metab.','Metab.') : byK(k).n;
  // massas que se podem juntar no mesmo gráfico: tudo em kg (as % passam a kg = peso × %)
  const MASS = ['w','fat','mus','wat','bone'];
  const MN = {w:T('Peso','Weight'), fat:T('Massa gorda','Fat mass'), mus:T('Massa muscular','Muscle mass'), wat:T('Água','Water'), bone:T('Osso','Bone')};
  // cópia de segurança (registos.js): as pesagens e o gráfico fixado também vão
  if(window.REG && REG.KEYS) [KEY, PIN].forEach(k => { if(!REG.KEYS.includes(k)) REG.KEYS.push(k); });
  const kgOf = (x,k) => (k==='w' || k==='bone') ? (x[k]!=null ? x[k] : null) : (x[k]!=null && x.w!=null ? x.w*x[k]/100 : null);

  // média de 7 dias (as pesagens dos 7 dias até à data, inclusive) de qualquer valor tirado de cada pesagem
  function avgF(log, date, fn){
    const t = toT(date), xs = log.filter(x => toT(x.date)<=t && t-toT(x.date) < 7*DAY).map(fn).filter(v => v!=null);
    return xs.length ? xs.reduce((a,v)=>a+v,0)/xs.length : null;
  }
  const avg7 = (log, date, k) => avgF(log, date, x => x[k]);
  // para o resto da app: peso atual = média dos últimos 7 dias, se houver pesagens recentes
  window.SCALE = {
    log: load,
    weight(){ const L = load(); if(!L.length) return null; const last = L[L.length-1]; if(Date.now()-toT(last.date) > 14*DAY) return null; return avg7(L, last.date, 'w'); }
  };

  // combinação fixada no gráfico da página: {m, c} (c = segunda massa, ou null)
  const getPin = () => { try{ const p = JSON.parse(localStorage.getItem(PIN)); if(p && byK(p.m) && (!p.c || (MASS.includes(p.m) && MASS.includes(p.c) && p.c!==p.m))) return p; }catch(e){} return {m:'w', c:null}; };
  const setPin = p => { try{ localStorage.setItem(PIN, JSON.stringify(p)); }catch(e){} };
  const label = c => c.c ? MN[c.m]+' + '+MN[c.c] : byK(c.m).n;

  // séries para o gráfico: uma métrica (pesagens + média de 7 dias) ou duas massas (variação da média de 7 dias, em kg)
  function series(L, c, range){
    if(!L.length) return {xs:[]};
    const lastT = toT(L[L.length-1].date), inR = x => !range || lastT-toT(x.date) < range*DAY;
    if(!c.c){
      const m = byK(c.m), xs = L.filter(x => x[c.m]!=null && inR(x));
      return {two:false, m, xs, raw:xs.map(x => x[c.m]), avg:xs.map(x => avg7(L, x.date, c.m))};
    }
    const ks = [c.m, c.c], xs = L.filter(x => inR(x) && ks.every(k => kgOf(x,k)!=null));
    const lines = ks.map(k => { const a = xs.map(x => avgF(L, x.date, y => kgOf(y,k))), b = a[0]; return {k, n:MN[k], abs:a, d:a.map(v => v==null||b==null ? null : v-b)}; });
    return {two:true, xs, lines};
  }

  // gráfico (claro na página, escuro na folha). sel/onSel: linha vertical e leitura do dia escolhido (só na folha)
  function chartOn(canvas, S, dark, sel, onSel){
    if(!window.Chart || !S.xs.length) return null;
    const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const C = dark ? {ink:'rgba(255,255,255,.7)', grid:'rgba(255,255,255,.12)', dot:'rgba(255,255,255,.45)', avg:'#5CC48A', c1:'#FFFFFF', c2:'#8FB4E8'}
                   : {ink:css('--ink-muted'), grid:css('--line')+'99', dot:'rgba(14,26,46,.35)', avg:'#16A34A', c1:'#0E1A2E', c2:'#2F6FD6'};
    const ds = S.two
      ? S.lines.map((l,i) => ({label:l.n, data:l.d, borderColor:i?C.c2:C.c1, backgroundColor:i?C.c2:C.c1, borderWidth:2.5, borderDash:i?[6,4]:[], pointRadius:0, pointHoverRadius:0, tension:.35, spanGaps:true}))
      : [{label:T('Pesagem','Weigh-in'), data:S.raw, showLine:false, pointRadius:4, pointHoverRadius:4, pointBackgroundColor:C.dot, pointBorderWidth:0, order:2},
         {label:T('Média 7 dias','7-day avg'), data:S.avg, borderColor:C.avg, backgroundColor:C.avg, borderWidth:2.5, pointRadius:0, pointHoverRadius:0, tension:.35, order:1}];
    const cross = {id:'balx', afterDatasetsDraw(ch){
      if(!sel) return; const i = sel(), meta = ch.getDatasetMeta(S.two?0:1), el = meta.data[i]; if(!el) return;
      const g = ch.ctx, a = ch.chartArea; g.save(); g.strokeStyle = dark?'#fff':'#0E1A2E'; g.globalAlpha = .55; g.lineWidth = 1.5; g.setLineDash([4,4]);
      g.beginPath(); g.moveTo(el.x, a.top); g.lineTo(el.x, a.bottom); g.stroke(); g.restore();
      ch.data.datasets.forEach((d,j) => { const p = ch.getDatasetMeta(j).data[i]; if(!p || d.showLine===false || d.data[i]==null) return;
        g.save(); g.fillStyle = '#D9981A'; g.strokeStyle = dark?'#0E1A2E':'#fff'; g.lineWidth = 2.5; g.beginPath(); g.arc(p.x, p.y, 6, 0, 7); g.fill(); g.stroke(); g.restore(); }); }};
    const zero = {id:'bal0', beforeDatasetsDraw(ch){ if(!S.two) return; const y = ch.scales.y.getPixelForValue(0), a = ch.chartArea; if(y<a.top || y>a.bottom) return;
      const g = ch.ctx; g.save(); g.strokeStyle = C.ink; g.globalAlpha = .6; g.lineWidth = 1; g.beginPath(); g.moveTo(a.left, y); g.lineTo(a.right, y); g.stroke(); g.restore(); }};
    const yf = S.two ? (v => sgn(v,1)) : (v => nfx(v, S.m.d));
    return new Chart(canvas, {type:'line', data:{labels:S.xs.map(x => dshort(x.date)), datasets:ds}, plugins:[cross, zero], options:{
      responsive:true, maintainAspectRatio:false, animation:{duration:reduce()?0:400}, layout:{padding:{top:8,right:4}},
      events:['mousemove','mouseout','click','touchstart','touchmove'], interaction:{mode:'index', intersect:false, axis:'x'},
      onHover:(e,els) => { if(onSel && els && els.length) onSel(els[0].index); },
      plugins:{legend:{display:false}, tooltip:{enabled:false}},
      scales:{x:{ticks:{color:C.ink, maxRotation:0, autoSkip:true, maxTicksLimit:6, font:{size:11}}, grid:{display:false}, border:{color:C.grid}},
              y:{ticks:{color:C.ink, font:{size:11}, maxTicksLimit:5, callback:yf}, grid:{color:C.grid, drawTicks:false}, border:{display:false}}}}});
  }
  const legend = (S, dark) => {
    const c1 = dark?'#FFFFFF':'#0E1A2E', c2 = dark?'#8FB4E8':'#2F6FD6';
    if(S.two) return S.lines.map((l,i) => '<span><i class="bal-line'+(i?' d':'')+'" style="background:'+(i?c2:c1)+'"></i>'+l.n+'</span>').join('');
    return '<span><i class="bal-dot"></i>'+T('Pesagem do dia','Daily weigh-in')+'</span><span><i class="bal-line"></i>'+T('Média de 7 dias','7-day average')+'</span>';
  };

  const sec = document.getElementById('s-corpo'); if(!sec) return;
  let range = 30, chart = null, amOn = false;
  const wrap = document.createElement('section'); wrap.id = 's-balanca'; wrap.className = 'bal';
  sec.after(wrap);

  // manhã (6h–10h) sem pesagem de hoje: a app abre aqui e pede os valores
  function morning(){ const n = new Date(), h = n.getHours(), today = iso(n); if(h<6 || h>=10) return false;
    if(load().some(x => x.date===today)) return false; try{ if(localStorage.getItem(SKIP)===today) return false; }catch(e){} return true; }

  function render(){
    const L = load(), last = L[L.length-1], am = amOn && morning(); if(!am) amOn = false;
    let h = '<h2>'+T('Balança','Scale')+'</h2><div class="sub">'+T('Pesagens de casa, todas as manhãs à mesma hora. Menos precisas do que a medição da nutricionista: servem para ver a tendência.','Home weigh-ins, every morning at the same time. Less accurate than the nutritionist\'s measurement: use them to see the trend.')+'</div>';
    if(am) h += '<div class="rsp bal-am" id="bl-am"><small>'+T('Bom dia','Good morning')+'</small><div class="rt">'+T('Pesagem da manhã','Morning weigh-in')+'</div><small>'+T('Ainda não registaste a de hoje. Pesa-te agora, antes de comer ou beber, e copia os valores da balança.','You haven\'t logged today\'s yet. Weigh yourself now, before eating or drinking, and copy the values from the scale.')+'</small><button type="button" id="bl-skip">'+T('Hoje não','Not today')+'</button></div>';
    // formulário (de manhã fica logo a seguir ao pedido)
    const today = iso(new Date()), td = L.find(x => x.date===today);
    const fld = (k, v) => { const m = byK(k); return '<label>'+m.n+(m.u?' ('+m.u+')':'')+'<input inputmode="decimal" id="bl-'+k+'" value="'+(v!=null?nfx(v, m.d):'')+'" autocomplete="off"></label>'; };
    const form = '<details class="fold" id="bl-add"'+(L.length && !am?'':' open')+'><summary><span>'+(td?T('Corrigir a pesagem de hoje','Fix today\'s weigh-in'):T('Registar a pesagem de hoje','Log today\'s weigh-in'))+'</span></summary><div class="card frm">'
      +'<p class="sub">'+T('Pesa-te de manhã, à mesma hora, depois da casa de banho e antes de comer ou beber. Só o peso é obrigatório; copia o resto do ecrã da balança.','Weigh yourself in the morning, at the same time, after the bathroom and before eating or drinking. Only weight is required; copy the rest from the scale screen.')+'</p>'
      +'<div class="fr2"><label>'+T('Data','Date')+'<input type="date" id="bl-date" value="'+today+'" max="'+today+'"></label>'+fld('w', td&&td.w)+'</div>'
      +'<div class="fr2">'+fld('fat', td&&td.fat)+fld('mus', td&&td.mus)+'</div>'
      +'<div class="fr2">'+fld('wat', td&&td.wat)+fld('bone', td&&td.bone)+'</div>'
      +'<div class="fr2">'+fld('bmr', td&&td.bmr)+fld('bmi', td&&td.bmi)+'</div>'
      +'<div class="tgbtns"><button type="button" class="pri" id="bl-save">'+T('Guardar pesagem','Save weigh-in')+'</button></div><div class="tgmsg" id="bl-msg" role="status" aria-live="polite"></div></div></details>';
    if(am) h += form;
    if(!L.length){
      h += '<div class="rsp"><div class="rt">'+T('Ainda sem pesagens','No weigh-ins yet')+'</div><small>'+T('Regista a primeira em baixo. Com 7 dias de pesagens aparece a média e a tendência.','Log the first one below. After 7 days of weigh-ins you get the average and the trend.')+'</small></div>';
    } else {
      const a = k => avg7(L, last.date, k);
      const back = days => { const t = toT(last.date) - days*DAY, prev = L.filter(x => toT(x.date) <= t); return prev.length ? prev[prev.length-1].date : null; };
      const d7 = back(7), d28 = back(28);
      const delta = (k, ref) => { if(!ref) return ''; const v = a(k), p = avg7(L, ref, k); if(v==null || p==null) return ''; const m = byK(k), f = Math.pow(10, m.d), x = Math.round((v-p)*f)/f, good = m.up==null ? null : (x>0)===m.up;
        const c = Math.abs(x) < 0.2 ? 'nt' : good==null ? 'nt' : good ? 'up' : 'dn', when = T('vs. há ','vs. ')+(ref===d7?'7':'28')+T(' dias',' days ago');
        return '<small class="'+c+'">'+(x===0 ? T('igual ','same ')+when : (x>0?'+':'')+nfx(x, m.d)+(m.u?' '+m.u:'')+' '+when)+'</small>'; };
      const open = (k, x) => ' class="gt'+(x?' '+x:'')+'" data-open="'+k+'" role="button" tabindex="0" aria-label="'+T('Abrir gráfico: ','Open chart: ')+byK(k).n+'"';
      const tile = k => { const m = byK(k), v = a(k); return '<div'+open(k)+'><small>'+m.n+T(' · média 7 d',' · 7-day avg')+'</small><b>'+nfx(v, m.d)+(m.u?'<em>'+m.u+'</em>':'')+'</b>'+delta(k, d7)+delta(k, d28)+'</div>'; };
      const days = L.filter(x => toT(last.date)-toT(x.date) < 7*DAY).length;
      h += '<div class="rsp"><small>'+T('Última pesagem ','Last weigh-in ')+dshort(last.date)+' · '+nfx(last.w,1)+' kg · '+days+T(' pesagens nos últimos 7 dias',' weigh-ins in the last 7 days')+'</small>'
        +'<div class="g bal-g"><div'+open('w','bal-w')+'><small>'+T('Peso · média 7 d','Weight · 7-day avg')+'</small><b>'+nfx(a('w'),1)+'<em>kg</em></b>'+delta('w', d7)+delta('w', d28)+'</div></div>'
        +'<small>'+T('Média de 7 dias: é este o número que conta, não o de um dia. Toca num quadrado para ver a evolução.','7-day average: this is the number that counts, not a single day. Tap a tile to see the trend.')+'</small>'
        +'<div class="g">'+tile('fat')+tile('mus')+tile('wat')+tile('bmr')+'</div></div>';
      // gráfico da página: a combinação fixada
      const P = getPin();
      h += '<div class="card"><div class="bal-hd"><div><b>'+label(P)+'</b><small>'+(P.c?T('Variação desde o início do período, em kg','Change since the start of the period, in kg'):T('Pesagens e média de 7 dias','Weigh-ins and 7-day average'))+'</small></div>'
        +'<button type="button" class="bal-chg" data-open="'+P.m+'">'+T('Mudar','Change')+'</button></div>'
        +'<div class="seg" role="group" aria-label="'+T('Período','Period')+'">'+[[30,T('30 dias','30 days')],[90,T('90 dias','90 days')],[0,T('Tudo','All')]].map(([r,l]) => '<button type="button" data-r="'+r+'" aria-pressed="'+(range===r)+'">'+l+'</button>').join('')+'</div>'
        +'<div class="cv"><canvas id="cBal" role="img" aria-label="'+label(P)+'"></canvas></div>'
        +'<div class="wkleg">'+legend(series(L, P, range), false)+'</div></div>';
    }
    if(!am) h += form;
    // histórico
    if(L.length){
      const rows = L.slice().reverse();
      h += '<details class="fold" id="bl-hist"><summary><span>'+T('Todas as pesagens','All weigh-ins')+' ('+L.length+')</span></summary><div class="card"><div class="scroll"><table class="bt"><tr><th>'+T('Data','Date')+'</th><th>'+T('Peso','Wt')+'</th><th>'+T('Gord.','Fat')+'</th><th>'+T('Músc.','Musc.')+'</th><th>'+T('Água','Water')+'</th><th>'+T('Osso','Bone')+'</th><th>kcal</th><th>'+T('IMC','BMI')+'</th><th></th></tr>'
        +rows.map(x => '<tr><td>'+dshort(x.date)+'</td>'+M.map(m => '<td class="v">'+(x[m.k]!=null?nfx(x[m.k], m.d):'–')+'</td>').join('')+'<td><button type="button" class="bal-del" data-del="'+esc(x.date)+'" aria-label="'+T('Apagar pesagem de ','Delete weigh-in of ')+dshort(x.date)+'">✕</button></td></tr>').join('')
        +'</table></div><div class="sub">'+T('A balança estima gordura, músculo, água e osso pela resistência elétrica do corpo. O valor muda com a hidratação, a comida e o treino do dia anterior: compara médias de 7 dias, não dias soltos. Para valores absolutos vale a medição da nutricionista (ISAK).','The scale estimates fat, muscle, water and bone from the body\'s electrical resistance. The value shifts with hydration, food and the previous day\'s training: compare 7-day averages, not single days. For absolute values, the nutritionist\'s measurement (ISAK) is the reference.')+'</div></div></details>';
    }
    wrap.innerHTML = h;
    drawPage(L);
  }

  function drawPage(L){
    if(chart){ chart.destroy(); chart = null; }
    const cv = document.getElementById('cBal'); if(!cv || !L.length) return;
    chart = chartOn(cv, series(L, getPin(), range), false);
    const lg = wrap.querySelector('.card .wkleg'); if(lg) lg.innerHTML = legend(series(L, getPin(), range), false);
  }

  // ---------- gráfico em ponto grande (mesma folha que Evolução e Semana) ----------
  function openSheet(card, k){
    if(!window.GSHEET) return;
    const P = getPin(), st = {m:k, c:(P.m===k && P.c) ? P.c : null, r:range, sel:0};
    const html = '<h2 class="bh"></h2><div class="sub2">'+T('Balança de casa · menos precisa do que a medição da nutricionista','Home scale · less accurate than the nutritionist\'s measurement')+'</div>'
      +'<div class="gr" aria-live="polite"><small class="r1"></small><div class="gv"></div><div class="gd r3"></div><small class="r4"></small></div>'
      +'<div class="gflt"><div class="seg" role="group" aria-label="'+T('Métrica','Metric')+'">'+M.map(m => '<button type="button" data-sm="'+m.k+'">'+short(m.k)+'</button>').join('')+'</div>'
      +'<div class="bal-join"><small>'+T('Juntar com','Combine with')+'</small><div class="seg" role="group" aria-label="'+T('Juntar com','Combine with')+'"></div></div>'
      +'<div class="seg" role="group" aria-label="'+T('Período','Period')+'">'+[[30,T('30 dias','30 days')],[90,T('90 dias','90 days')],[0,T('Tudo','All')]].map(([r,l]) => '<button type="button" data-sr="'+r+'">'+l+'</button>').join('')+'</div></div>'
      +'<div class="cbox"><canvas tabindex="0" role="img"></canvas></div><div class="gl bal-gl"></div>'
      +'<p class="gh bal-ex"></p><button type="button" class="bal-pin"></button>';
    window.GSHEET(card, byK(k).n, html, root => {
      let ch = null, S = null;
      const q = s => root.querySelector(s), canvas = q('canvas');
      const read = () => {
        const i = st.sel, x = S && S.xs[i];
        if(!x){ q('.r1').textContent = T('Sem pesagens neste período.','No weigh-ins in this period.'); q('.gv').innerHTML = ''; q('.r3').innerHTML = ''; q('.r4').textContent = ''; return; }
        q('.r1').textContent = dlong(x.date);
        if(S.two){
          const [a,b] = S.lines;
          q('.gv').innerHTML = sgn(a.d[i],1)+'<em>kg</em> <span class="bal-vs">/</span> '+sgn(b.d[i],1)+'<em>kg</em>';
          q('.r3').innerHTML = '<span>'+a.n+' '+nfx(a.abs[i],1)+' kg</span> · <span>'+b.n+' '+nfx(b.abs[i],1)+' kg</span>';
          q('.r4').textContent = T('Médias de 7 dias. Variação desde ','7-day averages. Change since ')+dshort(S.xs[0].date)+'.';
        } else {
          const m = S.m, u = m.u?'<em>'+m.u+'</em>':'';
          q('.gv').innerHTML = nfx(S.raw[i], m.d)+u;
          q('.r3').innerHTML = '<span class="nt">'+T('Média de 7 dias: ','7-day average: ')+nfx(S.avg[i], m.d)+(m.u?' '+m.u:'')+'</span>';
          const dv = S.avg[i]!=null && S.avg[0]!=null ? S.avg[i]-S.avg[0] : null;
          q('.r4').textContent = i>0 && dv!=null ? T('Média desde ','Average since ')+dshort(S.xs[0].date)+': '+sgn(dv, m.d)+(m.u?' '+m.u:'') : T('Pesagem do dia','Weigh-in of the day');
        }
      };
      const setSel = i => { if(i===st.sel || !S || !S.xs[i]) return; st.sel = i; read(); if(ch) ch.update('none'); };
      const draw = () => {
        const L = load(); S = series(L, st, st.r); st.sel = Math.max(0, S.xs.length-1);
        q('.bh').textContent = st.c ? MN[st.m]+' + '+MN[st.c] : byK(st.m).n;
        root.querySelectorAll('[data-sm]').forEach(b => b.setAttribute('aria-pressed', b.dataset.sm===st.m));
        root.querySelectorAll('[data-sr]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.sr===st.r));
        const jn = q('.bal-join');
        if(MASS.includes(st.m)){ jn.hidden = false; jn.querySelector('.seg').innerHTML = '<button type="button" data-sc="" aria-pressed="'+(!st.c)+'">'+T('Nada','None')+'</button>'+MASS.filter(x => x!==st.m).map(x => '<button type="button" data-sc="'+x+'" aria-pressed="'+(st.c===x)+'">'+MN[x]+'</button>').join(''); }
        else jn.hidden = true;
        q('.bal-gl').innerHTML = S.xs.length ? legend(S, true) : '';
        q('.bal-ex').textContent = st.c
          ? T('As duas linhas são médias de 7 dias e mostram quanto cada uma mudou desde o início do período, em kg. Gordura, músculo e água passam de % para kg (peso × %). Assim vês se o peso que ganhaste ou perdeste é gordura, músculo ou água.','Both lines are 7-day averages showing how much each changed since the start of the period, in kg. Fat, muscle and water go from % to kg (weight × %). This shows whether the weight you gained or lost is fat, muscle or water.')
          : T('Pontos: cada pesagem. Linha: média de 7 dias. Toca e arrasta o dedo para ver cada dia.','Dots: each weigh-in. Line: 7-day average. Touch and drag to see each day.');
        canvas.setAttribute('aria-label', q('.bh').textContent);
        if(ch) ch.destroy(); ch = chartOn(canvas, S, true, () => st.sel, setSel);
        const pinned = getPin(), same = pinned.m===st.m && (pinned.c||null)===(st.c||null), pb = q('.bal-pin');
        pb.textContent = same ? T('✓ Fixado no gráfico da página','✓ Pinned to the page chart') : T('Fixar no gráfico da página','Pin to the page chart'); pb.disabled = same;
        read();
      };
      root.addEventListener('click', e => {
        const a = e.target.closest('[data-sm]'), b = e.target.closest('[data-sc]'), r = e.target.closest('[data-sr]');
        if(a){ st.m = a.dataset.sm; if(!MASS.includes(st.m) || st.c===st.m) st.c = null; draw(); return; }
        if(b){ st.c = b.dataset.sc || null; draw(); return; }
        if(r){ st.r = +r.dataset.sr; draw(); return; }
        if(e.target.closest('.bal-pin')){ setPin({m:st.m, c:st.c}); render(); draw(); }
      });
      canvas.addEventListener('keydown', e => { if(e.key==='ArrowLeft'){ e.preventDefault(); setSel(st.sel-1); } else if(e.key==='ArrowRight'){ e.preventDefault(); setSel(st.sel+1); } });
      draw();
      return () => { if(ch) ch.destroy(); };
    });
  }

  wrap.addEventListener('click', e => {
    const ob = e.target.closest('[data-open]'); if(ob){ openSheet(ob, ob.dataset.open); return; }
    const rb = e.target.closest('[data-r]'); if(rb){ range = +rb.dataset.r; wrap.querySelectorAll('[data-r]').forEach(b => b.setAttribute('aria-pressed', b===rb)); drawPage(load()); return; }
    const db = e.target.closest('[data-del]'); if(db){ const k = db.dataset.del; if(db.dataset.sure!=='1'){ db.dataset.sure = '1'; db.textContent = T('Apagar?','Delete?'); return; } save(load().filter(x => x.date!==k)); render(); const hh = document.getElementById('bl-hist'); if(hh) hh.open = true; return; }
    if(e.target.closest('#bl-skip')){ try{ localStorage.setItem(SKIP, iso(new Date())); }catch(x){} amOn = false; render(); return; }
    if(e.target.closest('#bl-save')){
      const q = id => wrap.querySelector('#bl-'+id), msg = q('msg'), date = q('date').value, o = {date};
      let bad = null;
      M.forEach(m => { const raw = q(m.k).value.trim(); if(!raw){ if(m.k==='w') bad = bad || m; return; } const v = num(raw); if(!(v>=m.min && v<=m.max)) bad = bad || m; else o[m.k] = v; });
      if(!date) bad = bad || {n:T('Data','Date'), min:'', max:''};
      if(bad){ msg.className = 'tgmsg err'; msg.textContent = bad.k==='w' && !q('w').value.trim() ? T('Põe pelo menos o peso.','Enter at least the weight.') : T('Valor fora do normal em '+bad.n+' (entre '+bad.min+' e '+bad.max+').','Value out of range for '+bad.n+' ('+bad.min+' to '+bad.max+').'); return; }
      const L = load().filter(x => x.date!==date); L.push(o); L.sort((a,b) => a.date.localeCompare(b.date));
      if(!save(L)){ msg.className = 'tgmsg err'; msg.textContent = T('Não consegui guardar neste navegador.','Could not save in this browser.'); return; }
      amOn = false; render(); const add = document.getElementById('bl-add'); if(add){ add.open = true; const m2 = add.querySelector('#bl-msg'); m2.className = 'tgmsg'; m2.textContent = T('✓ Pesagem guardada.','✓ Weigh-in saved.'); }
    }
  });
  wrap.addEventListener('keydown', e => { const ob = e.target.closest('div[data-open]'); if(ob && (e.key==='Enter' || e.key===' ')){ e.preventDefault(); openSheet(ob, ob.dataset.open); } });
  render();

  // ao abrir a app (ou voltar a ela) de manhã: vai para Corpo, com o formulário logo a seguir ao pedido
  function checkMorning(){
    if(!morning() || document.querySelector('.gsheet')) return; amOn = true; render();
    const pc = document.getElementById('pg-corpo'); if(typeof showTab==='function' && !(pc && pc.classList.contains('on'))) showTab('corpo');
    setTimeout(() => { const b = document.getElementById('bl-am'); if(b) b.scrollIntoView({block:'start', behavior:'auto'}); }, 420);
  }
  addEventListener('load', () => setTimeout(checkMorning, 60));
  document.addEventListener('visibilitychange', () => { if(!document.hidden) checkMorning(); });
  // ao abrir a página Corpo, o gráfico ajusta-se ao tamanho
  const pg = document.getElementById('pg-corpo');
  if(pg) new MutationObserver(() => { if(pg.classList.contains('on') && chart) requestAnimationFrame(() => { try{ chart.resize(); }catch(e){} }); }).observe(pg, {attributes:true, attributeFilter:['class']});
})();
