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

  // ---------- pedido da manhã: folha que sobe de baixo, com os mesmos campos e uma leitura rápida no fim ----------
  // Leitura: compara a pesagem de hoje com a tua média dos 7 dias anteriores (água, peso) e as médias de 7 dias
  // de hoje e de há ~28 dias (gordura, músculo). Bioimpedância: indicação, não diagnóstico.
  function readFeedback(L, today){
    const t = L.find(x => x.date===today); if(!t) return null;
    const tt = toT(today), prev = L.filter(x => x.date<today && tt-toT(x.date) <= 7*DAY);
    if(prev.length < 3) return {head:T('Pesagem guardada','Weigh-in saved'), items:[{k:'info', w:T('Ainda a aprender','Still learning'), t:T('Tens '+(prev.length)+' pesagem(ns) nos 7 dias antes de hoje. A partir de 3 começo a comparar com o teu normal.','You have '+prev.length+' weigh-in(s) in the 7 days before today. From 3 on, I compare with your normal.')}]};
    const base = k => { const xs = prev.map(x=>x[k]).filter(v=>v!=null); return xs.length>=3 ? xs.reduce((a,v)=>a+v,0)/xs.length : null; };
    const items = []; let head = null;
    // água: o sinal mais rápido de desidratação (de manhã, antes de beber)
    const bw = base('wat'), bWt = base('w');
    const dW = t.wat!=null && bw!=null ? t.wat - bw : null, dKg = t.w!=null && bWt!=null ? t.w - bWt : null;
    if(dW!=null){
      if(dW <= -1 || (dW <= -0.6 && dKg!=null && dKg <= -0.8)){ items.push({k:'warn', w:T('Atenção','Watch out'), t:T('Água '+nfx(Math.abs(dW),1)+' pontos abaixo do teu normal'+(dKg!=null && dKg<=-0.5?' e peso '+nfx(Math.abs(dKg),1)+' kg abaixo':'')+': provavelmente desidratado. Bebe ~500 ml de água com um pouco de sal agora e vai bebendo até ao treino.','Water '+nfx(Math.abs(dW),1)+' points below your normal'+(dKg!=null && dKg<=-0.5?' and weight '+nfx(Math.abs(dKg),1)+' kg below':'')+': probably dehydrated. Drink ~500 ml of water with a pinch of salt now and keep drinking until training.')});
        head = T('Bebe água: estás abaixo do teu normal','Drink water: you are below your normal'); }
      else if(dW >= 1) items.push({k:'info', w:T('Normal','Normal'), t:T('Água '+nfx(dW,1)+' pontos acima do teu normal. Bem hidratado (ou muito sal/hidratos ontem).','Water '+nfx(dW,1)+' points above your normal. Well hydrated (or lots of salt/carbs yesterday).')});
      else items.push({k:'good', w:T('Bom','Good'), t:T('Hidratação dentro do teu normal ('+nfx(t.wat,1)+'%).','Hydration within your normal ('+nfx(t.wat,1)+'%).')});
    }
    // peso de um dia vs. a média
    if(dKg!=null) items.push({k:'info', w:T('Peso','Weight'), t: Math.abs(dKg) < 0.5
      ? T('Peso estável: '+nfx(t.w,1)+' kg, perto da tua média de 7 dias ('+nfx(bWt,1)+' kg).','Steady weight: '+nfx(t.w,1)+' kg, close to your 7-day average ('+nfx(bWt,1)+' kg).')
      : T(nfx(t.w,1)+' kg, '+(dKg>0?'+':'−')+nfx(Math.abs(dKg),1)+' kg vs. a tua média de 7 dias. Um dia sozinho mexe com água e comida; vê a média no Corpo.',nfx(t.w,1)+' kg, '+(dKg>0?'+':'−')+nfx(Math.abs(dKg),1)+' kg vs. your 7-day average. A single day moves with water and food; check the average in Body.')});
    // composição: médias de 7 dias de hoje vs. há ~28 dias (ou vs. a semana anterior, se ainda não houver 28 dias)
    const ref = (() => { const r = L.filter(x => tt-toT(x.date) >= 26*DAY); if(r.length) return {d:r[r.length-1].date, w:T('há 4 semanas','4 weeks ago')};
      const r2 = L.filter(x => tt-toT(x.date) >= 7*DAY); return r2.length ? {d:r2[r2.length-1].date, w:T('a semana passada','last week')} : null; })();
    let fatDn = false, musUp = false;
    if(ref){
      const tr = k => { const a = avg7(L, today, k), b = avg7(L, ref.d, k); return a!=null && b!=null ? a-b : null; };
      const df = tr('fat'), dm = tr('mus');
      if(df!=null){ fatDn = df <= -0.3;
        items.push(df <= -0.3 ? {k:'good', w:T('Bom','Good'), t:T('Gordura a descer: '+nfx(Math.abs(df),1)+' pontos na média de 7 dias vs. '+ref.w+'.','Fat going down: '+nfx(Math.abs(df),1)+' points on the 7-day average vs. '+ref.w+'.')}
          : df >= 0.3 ? {k:'warn', w:T('Atenção','Watch out'), t:T('Gordura a subir: +'+nfx(df,1)+' pontos na média de 7 dias vs. '+ref.w+'. Vê com a nutricionista se é de propósito.','Fat going up: +'+nfx(df,1)+' points on the 7-day average vs. '+ref.w+'. Check with the nutritionist if it is on purpose.')}
          : {k:'info', w:T('Estável','Steady'), t:T('Gordura estável vs. '+ref.w+'.','Fat steady vs. '+ref.w+'.')}); }
      if(dm!=null){ musUp = dm >= 0.3;
        items.push(dm >= 0.3 ? {k:'good', w:T('Bom','Good'), t:T('Músculo a subir: +'+nfx(dm,1)+' pontos na média de 7 dias vs. '+ref.w+'.','Muscle going up: +'+nfx(dm,1)+' points on the 7-day average vs. '+ref.w+'.')}
          : dm <= -0.3 ? {k:'warn', w:T('Atenção','Watch out'), t:T('Músculo a descer: '+nfx(dm,1)+' pontos vs. '+ref.w+'. Confirma proteína e sono; se continuar, fala com a nutricionista.','Muscle going down: '+nfx(dm,1)+' points vs. '+ref.w+'. Check protein and sleep; if it continues, talk to the nutritionist.')}
          : {k:'info', w:T('Estável','Steady'), t:T('Músculo estável vs. '+ref.w+'.','Muscle steady vs. '+ref.w+'.')}); }
    }
    if(!head) head = fatDn && musUp ? T('Boa fase: mais músculo, menos gordura','Good phase: more muscle, less fat')
      : musUp ? T('Músculo a subir','Muscle going up') : fatDn ? T('Gordura a descer','Fat going down')
      : items.some(i=>i.k==='warn') ? T('Uma coisa a ver hoje','One thing to watch today') : T('Tudo dentro do teu normal','Everything within your normal');
    return {head, items};
  }

  let bsEl = null;
  function closeBS(viaPop){
    if(!bsEl) return; const el = bsEl; bsEl = null;
    const done = () => { el.remove(); document.body.classList.remove('bs-open'); if(typeof UXFIX==='function') UXFIX(); };
    if(!viaPop && history.state && history.state.bs) history.back();
    if(reduce() || !el.animate) return done();
    el.querySelector('.bs-scrim').animate([{opacity:1},{opacity:0}], {duration:240, fill:'forwards'});
    el.querySelector('.bs-sheet').animate([{transform:'translateY(0)'},{transform:'translateY(100%)'}], {duration:260, easing:'cubic-bezier(.4,0,1,1)', fill:'forwards'}).onfinish = done;
  }
  addEventListener('popstate', () => { if(bsEl) closeBS(true); });
  function openMorningSheet(){
    if(bsEl) return;
    const today = iso(new Date()), L = load(), td = L.find(x => x.date===today);
    const fld = (k, v) => { const m = byK(k); return '<label>'+m.n+(m.u?' ('+m.u+')':'')+'<input inputmode="decimal" id="bs-'+k+'" value="'+(v!=null?nfx(v, m.d):'')+'" autocomplete="off"></label>'; };
    const el = document.createElement('div'); el.className = 'bs'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-label', T('Pesagem da manhã','Morning weigh-in'));
    el.innerHTML = '<div class="bs-scrim"></div><div class="bs-sheet"><div class="bs-grab" aria-hidden="true"></div>'
      +'<div class="rsp bs-top"><small>'+T('Bom dia','Good morning')+' · '+dlong(today)+'</small><div class="rt">'+T('Pesagem da manhã','Morning weigh-in')+'</div><small>'+T('Pesa-te agora, depois da casa de banho e antes de comer ou beber. Só o peso é obrigatório; copia o resto do ecrã da balança.','Weigh yourself now, after the bathroom and before eating or drinking. Only weight is required; copy the rest from the scale screen.')+'</small></div>'
      +'<div class="bs-body"><div class="frm">'
      +'<div class="fr2">'+fld('w', td&&td.w)+fld('fat', td&&td.fat)+'</div>'
      +'<div class="fr2">'+fld('mus', td&&td.mus)+fld('wat', td&&td.wat)+'</div>'
      +'<div class="fr2">'+fld('bone', td&&td.bone)+fld('bmr', td&&td.bmr)+'</div>'
      +'<div class="fr2">'+fld('bmi', td&&td.bmi)+'<span></span></div>'
      +'<div class="tgmsg" id="bs-msg" role="status" aria-live="polite"></div>'
      +'<button type="button" class="bs-pri" id="bs-save">'+T('Guardar e ver a leitura','Save and see the reading')+'</button>'
      +'<button type="button" class="bs-sec" id="bs-skip">'+T('Hoje não','Not today')+'</button></div>'
      +'<p class="sub">'+T('Balança de casa: menos precisa do que a medição da nutricionista. Serve para ver a tendência.','Home scale: less accurate than the nutritionist\'s measurement. Use it for the trend.')+'</p></div></div>';
    document.body.appendChild(el); document.body.classList.add('bs-open'); bsEl = el;
    history.pushState(Object.assign({}, history.state, {bs:1}), '');
    const sheet = el.querySelector('.bs-sheet');
    if(!reduce() && el.animate){
      el.querySelector('.bs-scrim').animate([{opacity:0},{opacity:1}], {duration:280});
      sheet.animate([{transform:'translateY(100%)'},{transform:'translateY(0)'}], {duration:360, easing:'cubic-bezier(.2,.8,.2,1)'});
    }
    el.querySelector('.bs-scrim').addEventListener('click', () => closeBS());
    // puxar para baixo pela pega ou pelo topo fecha
    let y0 = null, dy = 0;
    sheet.addEventListener('touchstart', e => { if(sheet.scrollTop>0 || e.target.closest('input,button')){ y0 = null; return; } y0 = e.touches[0].clientY; dy = 0; }, {passive:true});
    sheet.addEventListener('touchmove', e => { if(y0==null) return; dy = Math.max(0, e.touches[0].clientY - y0); sheet.style.transform = dy ? 'translateY('+dy+'px)' : ''; }, {passive:true});
    sheet.addEventListener('touchend', () => { if(y0==null) return; y0 = null; if(dy > 110){ sheet.style.transform = ''; closeBS(); } else sheet.style.transform = ''; });
    el.addEventListener('click', e => {
      if(e.target.closest('#bs-skip')){ try{ localStorage.setItem(SKIP, today); }catch(x){} closeBS(); return; }
      if(e.target.closest('#bs-close')){ closeBS(); return; }
      if(e.target.closest('#bs-go')){ closeBS(); setTimeout(() => { if(typeof showTab==='function') showTab('corpo'); const b = document.getElementById('s-balanca'); if(b) b.scrollIntoView({block:'start'}); }, 300); return; }
      if(e.target.closest('#bs-save')){
        const q = id => el.querySelector('#bs-'+id), msg = q('msg'), o = {date:today}; let bad = null;
        M.forEach(m => { const raw = q(m.k).value.trim(); if(!raw){ if(m.k==='w') bad = bad || m; return; } const v = num(raw); if(!(v>=m.min && v<=m.max)) bad = bad || m; else o[m.k] = v; });
        if(bad){ msg.className = 'tgmsg err'; msg.textContent = bad.k==='w' && !q('w').value.trim() ? T('Põe pelo menos o peso.','Enter at least the weight.') : T('Valor fora do normal em '+bad.n+' (entre '+bad.min+' e '+bad.max+').','Value out of range for '+bad.n+' ('+bad.min+' to '+bad.max+').'); return; }
        const L2 = load().filter(x => x.date!==today); L2.push(o); L2.sort((a,b) => a.date.localeCompare(b.date));
        if(!save(L2)){ msg.className = 'tgmsg err'; msg.textContent = T('Não consegui guardar neste navegador.','Could not save in this browser.'); return; }
        render(); if(document.activeElement) document.activeElement.blur();
        const F = readFeedback(L2, today), ico = {good:'✓', warn:'!', info:'i'};
        el.querySelector('.bs-top').innerHTML = '<small>'+T('Leitura de hoje','Today\'s reading')+' · '+nfx(o.w,1)+' kg</small><div class="rt">'+F.head+'</div>';
        el.querySelector('.bs-body').innerHTML = '<ul class="bs-fb">'+F.items.map(i => '<li class="'+i.k+'"><span class="bs-ic" aria-hidden="true">'+ico[i.k]+'</span><div><b>'+i.w+'</b><span>'+i.t+'</span></div></li>').join('')+'</ul>'
          +'<button type="button" class="bs-pri" id="bs-go">'+T('Ver a evolução','See the trend')+'</button><button type="button" class="bs-sec" id="bs-close">'+T('Fechar','Close')+'</button>'
          +'<p class="sub">'+T('Leitura automática de uma balança de casa: indicação, não diagnóstico.','Automatic reading from a home scale: a pointer, not a diagnosis.')+'</p>';
        if(!reduce()) el.querySelectorAll('.bs-fb li').forEach((li,i) => li.animate([{opacity:0, transform:'translateY(8px)'},{opacity:1, transform:'none'}], {duration:260, delay:60+i*50, easing:'cubic-bezier(.2,.8,.2,1)', fill:'backwards'}));
      }
    });
  }
  // ao abrir a app (ou voltar a ela) entre as 6h e as 10h, sem pesagem de hoje: sobe a folha
  function checkMorning(){ if(!morning() || bsEl || document.querySelector('.gsheet,.det')) return; openMorningSheet(); }
  window.SCALE.openMorning = openMorningSheet;
  addEventListener('load', () => setTimeout(checkMorning, 60));
  document.addEventListener('visibilitychange', () => { if(!document.hidden) checkMorning(); });
  // ao abrir a página Corpo, o gráfico ajusta-se ao tamanho
  const pg = document.getElementById('pg-corpo');
  if(pg) new MutationObserver(() => { if(pg.classList.contains('on') && chart) requestAnimationFrame(() => { try{ chart.resize(); }catch(e){} }); }).observe(pg, {attributes:true, attributeFilter:['class']});
})();
