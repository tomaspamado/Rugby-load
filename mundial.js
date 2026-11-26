// ---------- Mundial 2027: a app inteira gira à volta de ir ao Mundial ----------
// Três páginas novas (Mundial, Diário, Rivais) e uma barra de baixo nova: Mundial · Diário · Rivais · Carga · Corpo.
// Os dados antigos ficam (GPS, carga, força, peso, saltos); Semana, Evolução, Coach e Definições abrem a partir da Carga.
// Carrega depois de hoje.js e antes de paginas.js / movimento.js / ux.js / kubai.js, para que todos vejam a barra nova.
(function(){
  const {en: EN, t: T} = I18N;
  const ld = (k,d) => { try{ const v = JSON.parse(localStorage.getItem(k)); return v==null ? d : v; }catch(e){ return d; } };
  const sv = (k,v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
  if(window.REG && REG.KEYS) ['wc_log','wc_targets','wc_sel'].forEach(k => { if(!REG.KEYS.includes(k)) REG.KEYS.push(k); });
  const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const n0 = v => Math.round(v).toLocaleString(EN?'en-GB':'pt-PT');
  const pad = v => String(v).padStart(2,'0');
  const day = d => isoDay(d);
  const addD = (s, n) => { const d = new Date(s+'T12:00:00'); d.setDate(d.getDate()+n); return day(d); };

  // ---------- o Mundial ----------
  // Pool D: Irlanda, Escócia, Uruguai, Portugal. Horas de Sydney/Newcastle/Brisbane em outubro (AEDT/AEST) passadas para UTC.
  const WC = {first:Date.UTC(2027,9,4,6,15), games:[
    {d:'2027-10-04', t:Date.UTC(2027,9,4,6,15), opp:T('Irlanda','Ireland'), city:'Sydney'},
    {d:'2027-10-11', t:Date.UTC(2027,9,11,6,15), opp:T('Uruguai','Uruguay'), city:'Newcastle'},
    {d:'2027-10-17', t:Date.UTC(2027,9,17,6,15), opp:T('Escócia','Scotland'), city:'Brisbane'}]};
  const lis = t => new Date(t).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Lisbon'});
  const dShort = s => new Date(s+'T12:00:00').toLocaleDateString(EN?'en-GB':'pt-PT',{weekday:'short',day:'numeric',month:'short'}).replace('.','');

  // ---------- o trabalho de todos os dias ----------
  const TG0 = {watch:45, passL:100, passR:100, box:30, kick:20, sleep:8};
  const TG = Object.assign({}, TG0, ld('wc_targets', {}));
  const LOG = ld('wc_log', {});
  const get = d => LOG[d] || {};
  const put = (d, o) => { LOG[d] = Object.assign({}, get(d), o); sv('wc_log', LOG); };
  const thinkOk = x => ['good','fix','plan'].every(k => (x.think && x.think[k] || '').trim().length >= 4);
  const parts = x => [
    {k:'watch', n:T('Ver rugby','Watch rugby'), v:Math.min(1,(x.watch||0)/TG.watch), txt:(x.watch||0)+' / '+TG.watch+' min'},
    {k:'pass', n:T('Passes','Passes'), v:(Math.min(x.passL||0,TG.passL)+Math.min(x.passR||0,TG.passR))/(TG.passL+TG.passR), txt:((x.passL||0)+(x.passR||0))+' / '+(TG.passL+TG.passR)},
    {k:'kick', n:T('Pontapés','Kicks'), v:Math.min(1,((x.box||0)+(x.kick||0))/(TG.box+TG.kick)), txt:((x.box||0)+(x.kick||0))+' / '+(TG.box+TG.kick)},
    {k:'think', n:T('Pensar o jogo','Think the game'), v:thinkOk(x)?1:0, txt:thinkOk(x)?T('feito','done'):T('3 respostas','3 answers')},
    {k:'body', n:T('Corpo','Body'), v:((x.sleep||0)>=TG.sleep?.5:(x.sleep||0)/TG.sleep*.5)+(x.gym?.5:0), txt:(x.sleep?String(x.sleep).replace('.',EN?'.':',')+' h':'– h')+' · '+(x.gym?T('treino/prehab ✓','gym/prehab ✓'):T('treino/prehab','gym/prehab'))}];
  const score = x => Math.round(parts(x).reduce((a,p)=>a+p.v,0)/5*100);
  const today = TODAY;
  const streak = () => { let n = 0, d = today; if(score(get(d))<100) d = addD(d,-1); while(score(get(d))===100){ n++; d = addD(d,-1); } return n; };
  const total = k => Object.values(LOG).reduce((a,x)=>a+(k==='pass'?(x.passL||0)+(x.passR||0):k==='kick'?(x.box||0)+(x.kick||0):(x[k]||0)),0);
  const daysLeft = () => Math.max(0, Math.floor((WC.first - Date.now())/864e5));   // igual ao contador

  // ---------- os rivais: os dois 9 dos relatórios ----------
  const NINES = ['Samuel Marques','Hugo Camacho'];
  const M4 = [['rd',T('Distância','Distance'),v=>(v/1000).toFixed(1).replace('.',EN?'.':',')+' km'],['hsr',T('Corrida rápida','Fast running'),v=>n0(v)+' m'],['acc',T('Acelerações','Accelerations'),v=>n0(v)],['sp',T('Vel. máx. (km/h)','Top speed (km/h)'),v=>v.toFixed(1).replace('.',EN?'.':',')]];
  const weeks = () => { const ws = POSWEEKS.slice(); const L = typeof posWeek==='function' ? posWeek() : null; if(L && L.live && !ws.find(w=>w.week===L.week)) ws.push(L); return ws; };
  const cmp = P => { const me = P.rows.find(r=>r.me), op = NINES.map(n=>P.rows.find(r=>r.n===n)).filter(Boolean); if(!me || !op.length) return null;
    const wins = M4.map(([k]) => op.every(o => me[k] > o[k])); return {me, op, wins, n:wins.filter(Boolean).length}; };
  const minsOf = s => { const [h,m,x] = String(s).split(':').map(Number); return h*60+m+(x||0)/60; };
  const testMin = n => POSWEEKS.reduce((a,p) => a + (p.game && p.game.sh ? p.game.sh.filter(x=>x.n===n).reduce((b,x)=>b+minsOf(x.min),0) : 0), 0);
  const tests = () => POSWEEKS.filter(p => p.game && !p.game.cancelled);

  // ---------- estilos (só desta parte) ----------
  const st = document.createElement('style');
  st.textContent = `
.mpop{display:none!important}
.wc-hero{background:var(--navy,#0E1A2E);color:#fff;border-radius:16px;padding:18px 16px 16px;margin:12px 0 14px;position:relative;overflow:hidden}
.wc-hero .k{font:700 12px/1.2 var(--font-body);letter-spacing:.12em;text-transform:uppercase;color:#D9981A}
.wc-hero h1{font:700 30px/1.05 var(--font-display);margin:6px 0 12px;color:#fff;text-wrap:balance}
.wc-cd{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.wc-cd div{background:rgba(255,255,255,.08);border-radius:12px;padding:10px 4px 8px;text-align:center}
.wc-cd b{display:block;font:700 34px/1 var(--font-display);font-variant-numeric:tabular-nums;color:#fff}
.wc-cd small{display:block;margin-top:4px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:.7}
.wc-cd .dd b{color:#D9981A}
.wc-sub{margin-top:12px;font-size:14px;line-height:1.4;opacity:.9}
.wc-gm{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px;font-size:13px;opacity:.75}
.wc-sel{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.14);font-size:14px}
.wc-sel input{min-height:44px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;padding:0 10px;font:600 15px var(--font-body);color-scheme:dark}
.wc-sel b{font:700 22px var(--font-display);color:#D9981A;font-variant-numeric:tabular-nums}
.wc-card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px;margin:0 0 14px}
.wc-card h2{font:700 22px/1.1 var(--font-display);margin:0 0 4px;display:flex;align-items:center;gap:8px}
.wc-card h2::before{display:none}
.wc-card .sub{color:var(--ink-muted);font-size:14px;line-height:1.45}
.wc-day{display:grid;grid-template-columns:92px 1fr;gap:16px;align-items:center;margin-top:10px}
.wc-ring{width:92px;height:92px;position:relative}
.wc-ring svg{width:92px;height:92px;transform:rotate(-90deg)}
.wc-ring b{position:absolute;inset:0;display:grid;place-items:center;font:700 26px var(--font-display);font-variant-numeric:tabular-nums}
.wc-rows{display:grid;gap:6px;min-width:0}
.wc-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;font-size:14px}
.wc-row span:last-child{font-variant-numeric:tabular-nums;color:var(--ink-muted);font-size:13px}
.wc-row.ok span:first-child::before{content:"✓ ";color:#16A34A;font-weight:700}
.wc-row.no span:first-child::before{content:"○ ";color:var(--ink-muted)}
.wc-bar{grid-column:1/-1;height:6px;border-radius:3px;background:var(--surface-2);overflow:hidden}
.wc-bar i{display:block;height:100%;background:#D7263D;border-radius:3px}
.wc-row.ok .wc-bar i{background:#16A34A}
.wc-strk{display:flex;gap:10px;align-items:baseline;margin-top:12px;font-size:14px}
.wc-strk b{font:700 28px var(--font-display);color:#D7263D;font-variant-numeric:tabular-nums}
.wc-go{display:flex;align-items:center;justify-content:center;width:100%;min-height:52px;margin-top:12px;border:0;border-radius:12px;background:#D7263D;color:#fff;font:700 16px var(--font-body);cursor:pointer}
.wc-go.alt{background:var(--surface-2);color:var(--ink)}
.wc-tbl{width:100%;border-collapse:collapse;margin-top:10px;font-size:14px;font-variant-numeric:tabular-nums}
.wc-tbl th{font-size:12px;font-weight:600;color:var(--ink-muted);text-align:right;padding:6px 4px}
.wc-tbl th:first-child,.wc-tbl td:first-child{text-align:left}
.wc-tbl td{padding:9px 4px;border-top:1px solid var(--line);text-align:right}
.wc-tbl td.w{font-weight:700;color:#16A34A}
.wc-tbl tr.me td{background:rgba(215,38,61,.06)}
.wc-big{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}
.wc-big div{background:var(--surface-2);border-radius:12px;padding:10px 8px}
.wc-big b{display:block;font:700 24px/1.1 var(--font-display);font-variant-numeric:tabular-nums}
.wc-big small{display:block;font-size:12px;color:var(--ink-muted);margin-top:2px}
.wc-msg{margin-top:12px;padding:12px 14px;border-radius:12px;background:rgba(215,38,61,.08);font-size:14px;line-height:1.45}
.wc-msg b{color:#D7263D}
.wc-links{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:12px 0 14px}
.wc-links button{min-height:48px;border-radius:12px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:600 15px var(--font-body);cursor:pointer}
.wc-dnav{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:12px 0}
.wc-dnav button{min-width:48px;min-height:48px;border-radius:12px;border:1px solid var(--line);background:var(--surface);font:700 20px var(--font-body);color:var(--ink);cursor:pointer}
.wc-dnav button:disabled{opacity:.35}
.wc-dnav b{font:700 20px var(--font-display);text-align:center;flex:1}
.wc-item{border-top:1px solid var(--line);padding:14px 0}
.wc-item:first-of-type{border-top:0}
.wc-item h3{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:0 0 8px;font:700 18px var(--font-display)}
.wc-item h3 span{font:600 14px var(--font-body);color:var(--ink-muted);font-variant-numeric:tabular-nums}
.wc-step{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:6px}
.wc-step .lb{flex-basis:100%;font-size:14px;color:var(--ink-muted)}
.wc-step b{min-width:52px;text-align:center;font:700 24px var(--font-display);font-variant-numeric:tabular-nums}
.wc-step button{min-width:52px;min-height:44px;border-radius:10px;border:1px solid var(--line);background:var(--surface-2);color:var(--ink);font:700 15px var(--font-body);cursor:pointer}
.wc-step button.m{min-width:44px}
.wc-txt{display:grid;gap:8px}
.wc-txt label{display:grid;gap:4px;font-size:13px;color:var(--ink-muted)}
.wc-txt textarea,.wc-txt input{width:100%;box-sizing:border-box;min-height:44px;border-radius:10px;border:1px solid var(--line);background:var(--surface);color:var(--ink);padding:10px;font:15px/1.4 var(--font-body)}
.wc-tog{display:flex;align-items:center;gap:10px;min-height:44px;font-size:15px}
.wc-tog input{width:24px;height:24px}
.wc-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;margin-top:10px;text-align:center}
.wc-week div{border-radius:10px;padding:8px 0;background:var(--surface-2);font-size:12px}
.wc-week b{display:block;font:700 18px var(--font-display);font-variant-numeric:tabular-nums}
.wc-week .p{background:#16A34A;color:#fff}
.wc-week .h{background:rgba(22,163,74,.25)}
.wc-week .t{outline:2px solid #D7263D;outline-offset:-2px}
.wc-tgt{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.wc-tgt label{display:grid;gap:4px;font-size:13px;color:var(--ink-muted)}
.wc-tgt input{min-height:44px;border-radius:10px;border:1px solid var(--line);padding:0 10px;font:600 15px var(--font-body);background:var(--surface);color:var(--ink)}
`;
  document.head.appendChild(st);

  // ---------- páginas novas ----------
  const hoje = document.getElementById('pg-hoje'); if(!hoje) return;
  const mk = id => { const p = document.createElement('div'); p.className = 'pg'; p.id = 'pg-'+id; hoje.before(p); return p; };
  const pM = mk('mundial'), pD = mk('diario'), pR = mk('rivais');
  hoje.classList.remove('on'); pM.classList.add('on');

  // ---------- barra de baixo nova ----------
  const ICO = {
    mundial:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    diario:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 12l2 2 4-4"/>',
    rivais:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 2 6 5.5"/>',
    hoje:'<path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15l4-5"/>',
    corpo:'<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>'};
  const NAMES = {mundial:T('Mundial','World Cup'), diario:T('Diário','Daily'), rivais:T('Rivais','Rivals'), hoje:T('Carga','Load'), corpo:T('Corpo','Body')};
  const bar = document.getElementById('tabbar');
  if(bar){
    bar.innerHTML = Object.keys(NAMES).map(k => '<button type="button" data-p="'+k+'"'+(k==='mundial'?' class="on"':'')+'><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+ICO[k]+'</svg><span>'+NAMES[k]+'</span></button>').join('');
    bar.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { showTab(b.dataset.p); }));
  }
  // a Carga abre o resto (Semana, Evolução, Coach, Definições)
  const links = document.createElement('div'); links.className = 'wc-links';
  links.innerHTML = [['semana',T('Semana','Week')],['evol',T('Evolução','Progress')],['coach',T('Rotinas (Coach)','Routines (Coach)')],['mais',T('Sessões e definições','Sessions and settings')]].map(([k,n])=>'<button type="button" data-go="'+k+'">'+n+' ›</button>').join('');
  links.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if(b) showTab(b.dataset.go); });
  const hh = hoje.querySelector('.hero'); if(hh) hh.after(links); else hoje.prepend(links);
  // o "Ver troféus" do Hoje deixa de existir (as medalhas saem)
  addEventListener('DOMContentLoaded', () => document.querySelectorAll('#pg-hoje .tt').forEach(x => x.remove()));

  // ---------- MUNDIAL ----------
  function renderM(){
    const x = get(today), sc = score(x), P = parts(x), sk = streak(), dl = daysLeft();
    const W = weeks(), last = W.length ? W[W.length-1] : null, c = last && cmp(last);
    const sel = ld('wc_sel', null), selDays = sel ? Math.ceil((new Date(sel+'T12:00:00') - Date.now())/864e5) : null;
    const plan = typeof dayPlan==='function' ? dayPlan() : null;
    const R = 2*Math.PI*40, off = R*(1-sc/100);
    const tm = NINES.map(n => [n.split(' ')[0], testMin(n)]);
    pM.innerHTML =
      '<section class="wc-hero" aria-label="'+T('Contagem para o Mundial','World Cup countdown')+'"><div class="k">'+T('Mundial 2027 · Austrália','World Cup 2027 · Australia')+'</div>'
      +'<h1>'+T('Irlanda v Portugal','Ireland v Portugal')+'</h1>'
      +'<div class="wc-cd" id="wccd"><div class="dd"><b>–</b><small>'+T('dias','days')+'</small></div><div><b>–</b><small>'+T('horas','hours')+'</small></div><div><b>–</b><small>min</small></div><div><b>–</b><small>'+T('seg','sec')+'</small></div></div>'
      +'<div class="wc-sub">'+dShort(WC.games[0].d)+' · Sydney · '+lis(WC.games[0].t)+T(' em Lisboa',' Lisbon time')+'</div>'
      +'<div class="wc-gm">'+WC.games.slice(1).map(g=>'<span>'+g.opp+' · '+dShort(g.d)+' · '+g.city+'</span>').join('')+'</div>'
      +'<div class="wc-sel">'+(sel && selDays>0 ? '<span>'+T('Convocatória em','Squad named in')+' <b>'+selDays+'</b> '+T('dias','days')+'</span>' : '<span>'+T('Data da convocatória dos 33:','Date the 33 are named:')+'</span>')
      +'<input type="date" id="wcsel" value="'+esc(sel||'')+'" min="'+today+'" max="2027-10-03" aria-label="'+T('Data da convocatória','Squad announcement date')+'"></div></section>'

      +'<section class="wc-card"><h2>'+T('Hoje','Today')+'</h2><div class="sub">'+T('Cinco coisas, todos os dias, até ao avião. Faltam ','Five things, every day, until the plane. ')+'<b>'+dl+'</b>'+T(' dias: cada um conta.',' days left: every one counts.')+'</div>'
      +'<div class="wc-day"><div class="wc-ring"><svg viewBox="0 0 92 92"><circle cx="46" cy="46" r="40" fill="none" stroke="var(--surface-2)" stroke-width="10"/><circle cx="46" cy="46" r="40" fill="none" stroke="'+(sc===100?'#16A34A':'#D7263D')+'" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+R.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/></svg><b>'+sc+'%</b></div>'
      +'<div class="wc-rows">'+P.map(p=>'<div class="wc-row '+(p.v>=1?'ok':'no')+'"><span>'+p.n+'</span><span>'+p.txt+'</span><div class="wc-bar"><i style="width:'+Math.round(p.v*100)+'%"></i></div></div>').join('')+'</div></div>'
      +'<div class="wc-strk"><b>'+sk+'</b><span>'+(sk===1?T('dia perfeito seguido','perfect day in a row'):T('dias perfeitos seguidos','perfect days in a row'))+(sk?'':T(' · hoje pode ser o primeiro',' · today can be the first'))+'</span></div>'
      +'<button type="button" class="wc-go" data-go="diario">'+(sc===100?T('Dia cumprido · ver ou corrigir','Day done · view or edit'):T('Registar o dia','Log today'))+'</button></section>'

      +'<section class="wc-card"><h2>'+T('Corrida ao 9','Race for the 9 shirt')+'</h2>'
      +(c ? '<div class="sub">'+T('Semana ','Week ')+last.week+(last.live?T(' (em curso)',' (in progress)'):'')+': '+(c.n===4?T('foste o melhor dos três 9 nas 4 métricas.','you beat both other 9s on all 4 metrics.'):c.n?T('à frente dos dois em '+c.n+' de 4 métricas.','ahead of both on '+c.n+' of 4 metrics.'):T('atrás de um deles em todas as métricas.','behind one of them on every metric.'))+'</div>'
        +'<table class="wc-tbl"><tr><th></th><th>'+T('Tu','You')+'</th>'+c.op.map(o=>'<th>'+esc(o.n.split(' ')[0])+'</th>').join('')+'</tr>'
        +M4.map(([k,n,f],i)=>'<tr><td>'+n+'</td><td class="'+(c.wins[i]?'w':'')+'">'+f(c.me[k])+'</td>'+c.op.map(o=>'<td>'+f(o[k])+'</td>').join('')+'</tr>').join('')+'</table>' : '<div class="sub">'+T('Sem relatório desta semana ainda.','No report this week yet.')+'</div>')
      +'<div class="wc-msg">'+T('Minutos em testes nesta janela: ','Test minutes in this window: ')+tm.map(([n,m])=>n+' <b>'+Math.round(m)+'</b>').join(' · ')+' · '+T('tu','you')+' <b>0</b>. '+T('Nos treinos já ganhas. O que falta é entrar nos 23: pergunta ao treinador o que te separa e treina exatamente isso.','You already win in training. What is missing is the 23: ask the coach what separates you and train exactly that.')+'</div>'
      +'<button type="button" class="wc-go alt" data-go="rivais">'+T('Ver todas as semanas','See every week')+' ›</button></section>'

      +'<section class="wc-card"><h2>'+T('Até ao Mundial','Until the World Cup')+'</h2><div class="sub">'+T('Se cumprires o dia, todos os dias que faltam:','If you hit the day, every day left:')+'</div>'
      +'<div class="wc-big"><div><b>'+n0(dl*(TG.passL+TG.passR))+'</b><small>'+T('passes','passes')+'</small></div><div><b>'+n0(dl*(TG.box+TG.kick))+'</b><small>'+T('pontapés','kicks')+'</small></div><div><b>'+n0(dl*TG.watch/60)+' h</b><small>'+T('de rugby visto','of rugby watched')+'</small></div></div>'
      +'<div class="sub" style="margin-top:10px">'+T('Já feitos: ','Done so far: ')+n0(total('pass'))+T(' passes · ',' passes · ')+n0(total('kick'))+T(' pontapés · ',' kicks · ')+n0(total('watch')/60)+T(' h de rugby.',' h of rugby.')+'</div></section>'

      +(plan ? '<section class="wc-card"><h2>'+T('Carga','Load')+'</h2><div class="sub">'+T(DAYTXT[plan.k][1],DAYTXT[plan.k][2])+(plan.ratio!=null&&plan.ratio>=.05?' · '+plan.ratio.toFixed(2).replace('.',EN?'.':',')+T(' vs. o teu habitual',' vs. your usual'):T(' · sem treinos com GPS nos últimos 7 dias',' · no GPS sessions in the last 7 days'))+'</div><button type="button" class="wc-go alt" data-go="hoje">'+T('Ver carga e GPS','See load and GPS')+' ›</button></section>' : '');
    pM.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => showTab(b.dataset.go)));
    const si = pM.querySelector('#wcsel'); if(si) si.addEventListener('change', () => { sv('wc_sel', si.value || null); renderM(); });
    tick();
  }
  function tick(){
    const el = document.getElementById('wccd'); if(!el) return;
    let s = Math.max(0, Math.floor((WC.first - Date.now())/1000));
    const d = Math.floor(s/86400); s -= d*86400; const h = Math.floor(s/3600); s -= h*3600; const m = Math.floor(s/60); s -= m*60;
    const b = el.querySelectorAll('b'); b[0].textContent = d; b[1].textContent = pad(h); b[2].textContent = pad(m); b[3].textContent = pad(s);
  }
  setInterval(() => { if(pM.classList.contains('on') && !document.hidden) tick(); }, 1000);

  // ---------- DIÁRIO ----------
  let dSel = today;
  function renderD(){
    const x = get(dSel), sc = score(x), th = x.think || {};
    const wk = []; for(let i=6;i>=0;i--){ const d = addD(today,-i); wk.push([d, score(get(d))]); }
    const stp = (k, lb, steps) => '<div class="wc-step" data-k="'+k+'"><span class="lb">'+lb+'</span><button type="button" class="m" data-d="-'+steps[0]+'" aria-label="'+T('menos','less')+' '+steps[0]+'">−</button><b>'+(x[k]||0)+'</b>'+steps.map(s=>'<button type="button" data-d="'+s+'">+'+s+'</button>').join('')+'</div>';
    pD.innerHTML =
      '<div class="wc-dnav"><button type="button" id="wcprev" aria-label="'+T('Dia anterior','Previous day')+'">‹</button><b>'+(dSel===today?T('Hoje','Today'):dShort(dSel))+' · '+sc+'%</b><button type="button" id="wcnext" aria-label="'+T('Dia seguinte','Next day')+'"'+(dSel>=today?' disabled':'')+'>›</button></div>'
      +'<section class="wc-card">'
      +'<div class="wc-item"><h3>'+T('Ver rugby','Watch rugby')+'<span data-h="watch">'+(x.watch||0)+' / '+TG.watch+' min</span></h3>'+stp('watch',T('Minutos','Minutes'),[5,15,30])
      +'<div class="wc-txt" style="margin-top:8px"><label>'+T('O que viste (jogo, 9 a estudar, os teus clipes)','What you watched (match, 9 to study, your clips)')+'<input type="text" data-t="what" maxlength="120" value="'+esc(x.what||'')+'"></label></div></div>'
      +'<div class="wc-item"><h3>'+T('Passes','Passes')+'<span data-h="pass">'+((x.passL||0)+(x.passR||0))+' / '+(TG.passL+TG.passR)+'</span></h3>'+stp('passL',T('Esquerda','Left'),[10,25,50])+stp('passR',T('Direita','Right'),[10,25,50])+'</div>'
      +'<div class="wc-item"><h3>'+T('Pontapés','Kicks')+'<span data-h="kick">'+((x.box||0)+(x.kick||0))+' / '+(TG.box+TG.kick)+'</span></h3>'+stp('box',T('Box kicks','Box kicks'),[5,10])+stp('kick',T('Saída/outros','Exit/other'),[5,10])+'</div>'
      +'<div class="wc-item"><h3>'+T('Pensar o jogo','Think the game')+'<span data-h="think">'+(thinkOk(x)?T('feito','done'):T('3 respostas','3 answers'))+'</span></h3><div class="wc-txt">'
      +'<label>'+T('Uma coisa que fiz bem hoje','One thing I did well today')+'<textarea rows="2" data-th="good">'+esc(th.good||'')+'</textarea></label>'
      +'<label>'+T('Uma coisa que o 9 titular faria melhor','One thing the starting 9 would do better')+'<textarea rows="2" data-th="fix">'+esc(th.fix||'')+'</textarea></label>'
      +'<label>'+T('A decisão que vou treinar amanhã','The decision I will train tomorrow')+'<textarea rows="2" data-th="plan">'+esc(th.plan||'')+'</textarea></label></div></div>'
      +'<div class="wc-item"><h3>'+T('Corpo','Body')+'<span data-h="body">'+(x.sleep?String(x.sleep).replace('.',EN?'.':','):'–')+' / '+TG.sleep+' h</span></h3>'
      +'<div class="wc-step" data-k="sleep"><span class="lb">'+T('Sono (h)','Sleep (h)')+'</span><button type="button" class="m" data-d="-0.5" aria-label="'+T('menos meia hora','half an hour less')+'">−</button><b>'+String(x.sleep||0).replace('.',EN?'.':',')+'</b><button type="button" data-d="0.5">+½</button><button type="button" data-d="1">+1</button></div>'
      +'<label class="wc-tog"><input type="checkbox" data-c="gym"'+(x.gym?' checked':'')+'> '+T('Treino, ginásio ou prehab feito (ou descanso planeado)','Training, gym or prehab done (or planned rest)')+'</label></div>'
      +'</section>'
      +'<section class="wc-card"><h2>'+T('Últimos 7 dias','Last 7 days')+'</h2><div class="sub">'+T('Verde cheio: dia perfeito. Toca num dia para o abrir.','Solid green: perfect day. Tap a day to open it.')+'</div>'
      +'<div class="wc-week">'+wk.map(([d,s])=>'<div role="button" tabindex="0" data-day="'+d+'" class="'+(s===100?'p':s>=50?'h':'')+(d===dSel?' t':'')+'"><b>'+s+'</b>'+new Date(d+'T12:00:00').toLocaleDateString(EN?'en-GB':'pt-PT',{weekday:'narrow'})+'</div>').join('')+'</div></section>'
      +'<details class="fold"><summary><span>'+T('Metas por dia','Daily targets')+'</span></summary><div class="wc-card"><div class="wc-tgt">'
      +[['watch',T('Ver rugby (min)','Watch (min)')],['passL',T('Passes esquerda','Passes left')],['passR',T('Passes direita','Passes right')],['box',T('Box kicks','Box kicks')],['kick',T('Outros pontapés','Other kicks')],['sleep',T('Sono (h)','Sleep (h)')]].map(([k,n])=>'<label>'+n+'<input inputmode="decimal" data-tg="'+k+'" value="'+TG[k]+'"></label>').join('')
      +'</div><div class="sub" style="margin-top:8px">'+T('Começam em valores de trabalho para um 9 internacional. Ajusta com o teu treinador.','They start at working values for an international 9. Adjust them with your coach.')+'</div></div></details>';
    pD.querySelector('#wcprev').addEventListener('click', () => { dSel = addD(dSel,-1); renderD(); });
    pD.querySelector('#wcnext').addEventListener('click', () => { if(dSel<today){ dSel = addD(dSel,1); renderD(); } });
    pD.querySelectorAll('.wc-step button').forEach(b => b.addEventListener('click', () => {
      const row = b.closest('.wc-step'), k = row.dataset.k, d = +b.dataset.d, cur = get(dSel)[k]||0, max = k==='sleep'?14:k==='watch'?600:2000;
      const v = Math.max(0, Math.min(max, Math.round((cur+d)*2)/2)); put(dSel, {[k]: v});
      row.querySelector('b').textContent = String(v).replace('.',EN?'.':','); refreshD(); }));
    pD.querySelectorAll('[data-th]').forEach(t => t.addEventListener('input', () => { const th2 = Object.assign({}, get(dSel).think||{}, {[t.dataset.th]: t.value}); put(dSel, {think: th2}); }));
    pD.querySelectorAll('[data-th]').forEach(t => t.addEventListener('change', refreshD));
    pD.querySelectorAll('[data-t]').forEach(t => t.addEventListener('change', () => put(dSel, {[t.dataset.t]: t.value})));
    pD.querySelectorAll('[data-c]').forEach(t => t.addEventListener('change', () => { put(dSel, {[t.dataset.c]: t.checked}); refreshD(); }));
    pD.querySelectorAll('[data-day]').forEach(t => { const go = () => { dSel = t.dataset.day; renderD(); }; t.addEventListener('click', go); t.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } }); });
    pD.querySelectorAll('[data-tg]').forEach(t => t.addEventListener('change', () => { const v = parseFloat(String(t.value).replace(',','.')); if(v>0){ TG[t.dataset.tg] = v; const o = {}; Object.keys(TG0).forEach(k=>{ if(TG[k]!==TG0[k]) o[k]=TG[k]; }); sv('wc_targets', o); renderD(); renderM(); } }));
  }

  // atualiza só os números do Diário (sem redesenhar: o toque seguinte cai no mesmo botão, a página não salta)
  function refreshD(){
    const x = get(dSel), P = parts(x), by = {}; P.forEach(p => by[p.k] = p);
    const set = (k, t) => { const e = pD.querySelector('[data-h="'+k+'"]'); if(e) e.textContent = t; };
    set('watch', by.watch.txt); set('pass', by.pass.txt); set('kick', by.kick.txt); set('think', by.think.txt);
    set('body', (x.sleep?String(x.sleep).replace('.',EN?'.':','):'–')+' / '+TG.sleep+' h');
    const sc = score(x), hd = pD.querySelector('.wc-dnav b'); if(hd) hd.textContent = (dSel===today?T('Hoje','Today'):dShort(dSel))+' · '+sc+'%';
    const cell = pD.querySelector('[data-day="'+dSel+'"]'); if(cell){ cell.querySelector('b').textContent = sc; cell.classList.toggle('p', sc===100); cell.classList.toggle('h', sc>=50 && sc<100); }
    renderM();
  }

  // ---------- RIVAIS ----------
  function renderR(){
    const W = weeks().map(P => ({P, c:cmp(P)})).filter(w => w.c);
    const tot = W.reduce((a,w)=>a+w.c.n,0), all = W.length*4;
    const T3 = tests();
    pR.innerHTML =
      '<section class="wc-card"><h2>'+T('Tu contra os 9','You against the 9s')+'</h2><div class="sub">'+T('Samuel Marques e Hugo Camacho, nos mesmos relatórios GPS que tu. Verde: foste melhor do que os dois.','Samuel Marques and Hugo Camacho, in the same GPS reports as you. Green: you beat both.')+'</div>'
      +'<div class="wc-big"><div><b>'+tot+' / '+all+'</b><small>'+T('métricas ganhas aos dois','metrics won against both')+'</small></div><div><b>'+W.filter(w=>w.c.n===4).length+'</b><small>'+T('semanas a ganhar tudo','weeks winning everything')+'</small></div><div><b>0</b><small>'+T('minutos em testes','test minutes')+'</small></div></div></section>'
      +W.slice().reverse().map(({P,c}) => '<section class="wc-card"><h2>'+T('Semana ','Week ')+P.week+(P.live?T(' · em curso',' · in progress'):'')+'</h2><div class="sub">'+(c.n===4?T('Melhor dos três 9 em tudo.','Best of the three 9s on everything.'):T('Melhor dos três 9 em ','Best of the three 9s on ')+c.n+T(' de 4.',' of 4.'))+(P.game && P.game.cancelled ? T(' Jogo cancelado.',' Match cancelled.') : '')+'</div>'
        +'<table class="wc-tbl"><tr><th></th><th>'+T('Tu','You')+'</th>'+c.op.map(o=>'<th>'+esc(o.n.split(' ')[0])+'</th>').join('')+'</tr>'
        +M4.map(([k,n,f],i)=>'<tr><td>'+n+'</td><td class="'+(c.wins[i]?'w':'')+'">'+f(c.me[k])+'</td>'+c.op.map(o=>'<td>'+f(o[k])+'</td>').join('')+'</tr>').join('')+'</table></section>').join('')
      +'<section class="wc-card"><h2>'+T('Testes','Tests')+'</h2><div class="sub">'+T('Quem jogou a 9 nos jogos de Portugal. É aqui que a convocatória se decide.','Who played 9 in Portugal\'s matches. This is where selection is decided.')+'</div>'
      +'<table class="wc-tbl"><tr><th>'+T('Jogo','Match')+'</th><th>Samuel</th><th>Hugo</th><th>'+T('Tu','You')+'</th></tr>'
      +T3.map(p=>'<tr><td>'+esc(p.game.date)+'</td>'+NINES.map(n=>{ const r = p.game.sh.find(x=>x.n===n); return '<td>'+(r?Math.round(minsOf(r.min))+"'":'–')+'</td>'; }).join('')+'<td>–</td></tr>').join('')
      +'<tr><td><b>'+T('Total','Total')+'</b></td>'+NINES.map(n=>'<td><b>'+Math.round(testMin(n))+"'</b></td>").join('')+'<td><b>0\'</b></td></tr></table>'
      +'<div class="wc-msg">'+T('<b>O que falta não é físico.</b> Nos treinos estás à frente; eles têm os minutos. Para entrares nos 23: pede ao treinador o feedback concreto do que te falta (passe, decisão, pontapé, defesa), mete isso no "Pensar o jogo" todos os dias e mostra-o nos treinos.','<b>What is missing is not physical.</b> You lead in training; they have the minutes. To get into the 23: ask the coach for concrete feedback on what you lack (pass, decisions, kicking, defence), put it in "Think the game" every day and show it in training.')+'</div>'
      +'<button type="button" class="wc-go alt" data-go="semana">'+T('Relatório completo da semana','Full weekly report')+' ›</button></section>';
    pR.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => showTab(b.dataset.go)));
  }

  renderM(); renderD(); renderR();

  // ---------- coesão: cada página abre com o mesmo cabeçalho; as subpáginas da Carga têm "‹ Carga" ----------
  const PH = {diario:[T('Diário','Daily'),T('O teu trabalho de hoje','Your work today')], rivais:[T('Rivais','Rivals'),''],
    hoje:[T('Carga','Load'),''], corpo:[T('Corpo','Body'),T('Peso, força e salto','Weight, strength and jump')],
    semana:[T('Semana','Week'),'',1], evol:[T('Evolução','Progress'),'',1], coach:[T('Rotinas','Routines'),T('Prehab, recuperação e mental','Prehab, recovery and mental'),1], mais:[T('Sessões e definições','Sessions and settings'),'',1], trofeus:[T('Troféus','Trophies'),'',1]};
  const kick = () => T('Mundial 2027 · faltam ','World Cup 2027 · ')+daysLeft()+T(' dias',' days to go');
  const head = () => Object.keys(PH).forEach(id => {
    const pg = document.getElementById('pg-'+id); if(!pg) return;
    let h = pg.querySelector(':scope > .ph');
    if(!h){ h = document.createElement('header'); h.className = 'ph'; pg.prepend(h); }
    const [t, sub, child] = PH[id];
    const s2 = id==='hoje' ? ((document.getElementById('updated')||{}).textContent||'') : sub;
    h.innerHTML = (child ? '<button type="button" class="ph-bk" data-go="hoje">‹ '+T('Carga','Load')+'</button>' : '')
      + '<small class="ph-k">'+kick()+'</small><h1>'+t+'</h1>'+(s2 ? '<div class="ph-s">'+esc(s2)+'</div>' : '');
    const bk = h.querySelector('.ph-bk'); if(bk) bk.addEventListener('click', () => history.length > 1 ? history.back() : showTab('hoje'));
  });
  addEventListener('DOMContentLoaded', () => {
    head();
    // as medalhas saíram: tira o quadrado "Medalhas" do resumo da época
    document.querySelectorAll('#pg-mais .rsp .g > div').forEach(d => { if(/Medalhas|Medals/.test(d.textContent)) d.remove(); });
    // o Coach e outras páginas redesenham-se por inteiro: o cabeçalho volta a entrar sempre que desaparece
    Object.keys(PH).forEach(id => { const pg = document.getElementById('pg-'+id); if(pg) new MutationObserver(() => { if(!pg.querySelector(':scope > .ph')) head(); }).observe(pg, {childList:true}); });
  });
  const st2 = document.createElement('style');
  st2.textContent = `
.ph{padding:14px 2px 6px;display:grid;gap:2px}
.ph h1{font:700 32px/1.05 var(--font-display);margin:0;color:var(--ink);letter-spacing:.01em}
.ph-k{font:700 12px/1.2 var(--font-body);letter-spacing:.12em;text-transform:uppercase;color:#D7263D}
.ph-s{font-size:14px;color:var(--ink-muted);margin-top:2px}
.ph-bk{justify-self:start;min-height:44px;margin:-6px 0 2px -10px;padding:0 10px;border:0;background:none;color:var(--ink);font:600 15px var(--font-body);cursor:pointer}
#pg-hoje > .hero,#pg-semana #s-wk > h2,#s-evol .head > div:first-child > h2,#pg-coach .ch > h2,#pg-coach .ch > h2 + .sub,h2.pgt,#pg-corpo > .more-btn{display:none}
.card,.rsp,.wc-card,.wc-hero,.hero{border-radius:14px}
#pg-diario .wc-dnav{margin-top:4px}
input,select,textarea{font-size:16px!important}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{overscroll-behavior-y:none}
button,[role=button],summary,.tabbar *{-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;touch-action:manipulation}
`;
  document.head.appendChild(st2);
  document.addEventListener('visibilitychange', () => { if(!document.hidden){ renderM(); } });
})();
