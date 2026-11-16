// ---------- Coach: prehab, recuperação, mental e progresso numa só página ----------
// Sem check-in: o plano do dia vem da tua carga real (jogo, dia pesado, carga vs. habitual).
// Guarda só no teu telemóvel (localStorage 'coach_log' e 'coach_plank').
(function(){
  const pg = document.getElementById('pg-coach'); if(!pg) return;
  const {en: EN, t: T} = I18N;
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const parse = s => new Date(s+'T00:00:00');
  const DAYMS = 864e5;
  const fmt = s => parse(s).toLocaleDateString(EN?'en-GB':'pt-PT', {day:'2-digit', month:'short'}).replace('.','');
  const km = m => (m/1000).toFixed(1).replace('.', EN?'.':',');
  const num1 = v => String(Math.round(v*10)/10).replace('.', EN?'.':',');

  const {PRE, REC, P, MEN, WHY, SK, SKN, REC_T, WHYT, SEED} = COACH_DADOS; // conteúdo em coach-dados.js
  const TKINDS = ['p','r','m','box','pass','def'];
  let TGT = {};
  function recT(k, mon){
    const m = SESSIONS.some(x => x.type==='Match' && x.date>=mon && x.date<=addDays(mon,6));
    let v = REC_T[k];
    if(m){ if(k==='r') v = 3; else if(k==='def') v = 1; else if(k==='pass') v = 3; }
    return v;
  }
  const tgt = k => TGT[k]!=null ? TGT[k] : REC_T[k];

  // ---------- estado ----------
  const load = (k, d) => { try{ const v = JSON.parse(localStorage.getItem(k)); return v==null ? d : v; }catch(e){ return d; } };
  const save = (k, v) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} };
  const KINDS = ['p','r','m','box','pass','def'];
  let LOG = load('coach_log', {}), CUSTOM = load('coach_custom', {}); TGT = load('coach_target', {});
  // prancha progressiva: se já usaste a app RWC-coach (mesmo endereço), continua de onde ficaste
  let PB = load('coach_plank_pb', null);
  if(!PB){ const r = load('rwc_plank_pb', null); if(r && r.sessions!=null) PB = r; }
  PB = PB || {sessions:0, weightKg:0, lastTarget:0, lastDate:''};
  const commit = () => { save('coach_log', LOG); save('coach_custom', CUSTOM); save('coach_plank_pb', PB); save('coach_target', TGT); };
  // formato antigo (uma escolha por skill) passa a lista de exercícios
  Object.keys(LOG).forEach(k => { const d = LOG[k]; if(!d) return;
    KINDS.forEach(s => { const e = d[s]; if(!e) return;
      if(!Array.isArray(e.done)){ const id = e.id; e.done = (e.done && id) ? [id] : []; if(e.chosen && id){ e.set = true; e.ids = [id]; } }
      if(e.set && !Array.isArray(e.ids)) e.ids = []; }); });
  // importação única do teu histórico (CSV da app RWC-coach, ajustado aos exercícios desta app)
  try{ if(!localStorage.getItem('coach_seed1')){
    Object.keys(SEED).forEach(dt => Object.keys(SEED[dt]).forEach(s => { LOG[dt] = LOG[dt] || {}; const cur = LOG[dt][s]; if(!cur || !(cur.done||[]).length) LOG[dt][s] = SEED[dt][s]; }));
    localStorage.setItem('coach_seed1','1'); commit(); } }catch(e){}
  // nível atual da prancha dado pelo Tomás: 35 s com 60 kg
  try{ if(!localStorage.getItem('coach_seed2')){ PB = {sessions:38, weightKg:60, lastTarget:35, lastDate:iso(new Date())}; localStorage.setItem('coach_seed2','1'); commit(); } }catch(e){}
  let tab = 'prehab', ctxOverride = null, todayOverride = null;
  const pickOpen = {}, showForm = {};
  let dayOff = 0;
  const realToday = () => todayOverride || iso(new Date());
  const todayKey = () => { const d = parse(realToday()); d.setDate(d.getDate()-dayOff); return iso(d); };
  const day = k => { const d = (LOG[k] = LOG[k] || {});
    KINDS.forEach(s => { const e = (d[s] = d[s] || {}); if(!Array.isArray(e.done)) e.done = []; if(e.rating==null) e.rating = 0; if(e.min==null) e.min = 0; }); return d; };

  // ---------- contexto vindo da carga real ----------
  function context(){
    const t = todayKey(), P0 = dayPlan(t), s = P0.s;
    let k = ctxOverride || P0.k;
    const lastTxt = fmt(s.date)+' · '+(s.rd||0).toLocaleString(EN?'en-GB':'pt-PT')+' m'+(s.type==='Match'?T(' (jogo)',' (match)'):'');
    return {k, dd:P0.dd, ratio:P0.ratio, lastTxt, dm:P0.dm, nm:P0.nm};
  }
  // o que muda no Coach para cada tipo de dia (o título vem de DAYTXT, o mesmo do Hoje)
  const EASY = {match:1, same:1, next:1, pre:1, over:1, high:1};
  const RECK = {match:'same', same:'same', next:'next', pre:'normal', over:'high', high:'high', low:'normal', normal:'normal'};
  const PILL = {match:['vis','rot','conf'], same:['rot','foc'], next:['adv','self'], pre:['vis','rot','conf'], over:['foc','rot'], high:['foc','rot']};
  const CTX = {
    match: [['Dia de jogo: só ativação leve antes do jogo e recuperação completa depois.','Match day: light activation before the match and full recovery after.']],
    same:  [['Prehab leve (sem exercícios excêntricos duros), recuperação completa e mental curto.','Light prehab (no hard eccentric work), full recovery and short mental work.']],
    next:  [['Calor, massagem e mobilidade. Prehab leve e mental para processar o jogo.','Heat, massage and mobility. Light prehab and mental work to process the game.']],
    pre:   [['Véspera de jogo: prehab leve, nada de excêntricos duros, visualização e rotina.','Day before the match: light prehab, no hard eccentric work, visualisation and routine.']],
    over:  [['Semana muito acima do habitual: só prehab leve e recuperação a sério.','Week well above usual: light prehab only and proper recovery.']],
    high:  [['A tua semana vai acima do habitual. Prehab leve, recuperação a sério e sono.','Your week is above usual. Light prehab, proper recovery and sleep.']],
    low:   [['Carga abaixo do habitual: bom dia para prehab completo (nordic e copenhagen incluídos).','Load below usual: a good day for full prehab (nordics and Copenhagens included).']],
    normal:[['Carga dentro do habitual: é o dia certo para prehab a sério (nordic e copenhagen incluídos).','Load within usual: the right day for proper prehab (nordics and Copenhagens included).']]
  };


  // ---------- exercícios (incluindo os que crias) ----------
  function customList(kind){
    return (CUSTOM[kind] || []).map(c => kind==='m' ? [c.id,'own',c.dur,c.name,c.name,c.how,c.how,1]
      : kind==='r' ? [c.id,c.name,c.name,c.dur,c.how,c.how,'same,next,high,normal',1]
      : kind==='p' ? [c.id,c.name,c.name,c.dur,c.how,c.how,0,1]
      : [c.id,c.name,c.name,c.dur,c.how,c.how,1]);
  }
  const BASE = {p:PRE, r:REC, m:MEN, box:SK.box, pass:SK.pass, def:SK.def};
  const allOf = kind => BASE[kind].concat(customList(kind));
  const isCustom = (kind, x) => (CUSTOM[kind]||[]).some(c => c.id===x[0]);
  const view = (kind, x) => kind==='m' ? {id:x[0], name:T(x[3],x[4]), dur:x[2], how:T(x[5],x[6])} : {id:x[0], name:T(x[1],x[2]), dur:x[3], how:T(x[4],x[5])};

  // ---------- escolha sugerida (o que foi feito há mais tempo) ----------
  function lastDone(kind, ids, t){
    const m = {}; ids.forEach(i => m[i] = -1e9);
    Object.keys(LOG).forEach(k => { if(k>=t) return; const e = LOG[k] && LOG[k][kind]; if(!e) return;
      (e.done || []).forEach(i => { if(i in m) m[i] = Math.max(m[i], parse(k).getTime()/DAYMS); }); });
    return m;
  }
  const doy = t => Math.floor((parse(t) - new Date(parse(t).getFullYear(),0,0)) / DAYMS);
  function ranked(kind, pool, t){
    const m = lastDone(kind, pool.map(x=>x[0]), t), off = doy(t);
    return pool.map((x,i) => ({x, i})).sort((a,b) => (m[a.x[0]]-m[b.x[0]]) || (((a.i+off)%pool.length)-((b.i+off)%pool.length))).map(o => o.x);
  }
  function recommended(kind, k){
    const easy = !!EASY[k];
    if(kind==='p') return PRE.filter(x => !(easy && x[6]));
    if(kind==='r') return REC.filter(x => x[6].split(',').includes(RECK[k]||'normal'));
    if(kind==='m'){ const pil = PILL[k] || Object.keys(P); return MEN.filter(x => pil.includes(x[1])); }
    return SK[kind];
  }
  // lista de exercícios de hoje: a que escolheste, ou a sugestão
  function todayIds(d, kind){ const e = d[kind]; return e.set ? (e.ids || []) : (e.auto ? [e.auto] : []); }
  function plan(ctx){
    const t = todayKey(), d = day(t), k = ctx.k, out = {d, t, opts:{}, list:{}};
    KINDS.forEach(kind => {
      const rec = recommended(kind, k), recList = ranked(kind, rec, t), recIds = recList.map(x=>x[0]);
      const rest = ranked(kind, allOf(kind).filter(x => !recIds.includes(x[0])), t);
      const list = recList.concat(rest), lastMap = lastDone(kind, list.map(x=>x[0]), t);
      const rec0 = recList[0]; d[kind].auto = rec0[0];
      const ids = todayIds(d, kind);
      out.list[kind] = ids.map(id => list.find(x => x[0]===id)).filter(Boolean);
      out.opts[kind] = list.map(x => ({x, sug: x===rec0, rec: recIds.includes(x[0]), ago: lastMap[x[0]] < -1e8 ? null : Math.round(parse(t)/DAYMS - lastMap[x[0]]), inList: ids.includes(x[0]), mine: isCustom(kind, x)}));
    });
    return out;
  }

  // ---------- estatísticas ----------
  const mondayOf = s => { const d = parse(s), w = (d.getDay()+6)%7; d.setDate(d.getDate()-w); return iso(d); };
  const addDays = (s,n) => { const d = parse(s); d.setDate(d.getDate()+n); return iso(d); };
  const preDone = d => { const e = d && d.p; if(e && e.min>0) return true; if(!e || !(e.done||[]).includes('plank')) return false; const ids = e.set ? (e.ids||[]) : (e.auto ? [e.auto] : []); return ids.every(i => e.done.includes(i)); };
  const kDone = (d, kind) => kind==='p' ? preDone(d) : !!(d && d[kind] && ((d[kind].done||[]).length || d[kind].min>0));
  const dayAny = d => !!d && KINDS.some(kind => kDone(d, kind));
  function weekStats(mon){
    const o = {p:0, r:0, m:0, box:0, pass:0, def:0, rd:0};
    for(let i=0;i<7;i++){ const d = LOG[addDays(mon,i)]; if(!d) continue; KINDS.forEach(kind => { if(kDone(d, kind)) o[kind]++; }); }
    SESSIONS.forEach(s => { if(s.date>=mon && s.date<=addDays(mon,6)) o.rd += s.rd||0; });
    return o;
  }
  function streak(){
    let n = 0, t = todayKey(); if(!dayAny(LOG[t])) t = addDays(t,-1);
    while(dayAny(LOG[t])){ n++; t = addDays(t,-1); }
    return n;
  }

  // ---------- CSS ----------
  // estilos: em style.css (secção Coach)

  // ---------- componentes ----------
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const L = (o,i) => EN ? o[i+1] : o[i];
  function item(kind, id, name, dur, how, done, extra){
    return '<div class="crow"><button type="button" class="cchk" role="checkbox" data-act="tick" data-k="'+kind+'" data-id="'+id+'" aria-checked="'+done+'" aria-label="'+esc(name)+': '+T('feito','done')+'">'+CHECK+'</button>'
      +'<div class="cbd"><details><summary><b>'+esc(name)+'</b><small>'+esc(dur)+(extra?' · '+extra:'')+'</small></summary><p>'+esc(how||T('Sem descrição.','No description.'))+'</p></details>'+timerBtn(kind, id, name, dur, done)+'</div></div>';
  }
  // ---------- temporizador dos exercícios com tempo ----------
  // Guarda a hora a que acaba (não um contador): fechar a app não o pára. Ao voltar, o tempo que passou já conta.
  let TM = load('coach_timers', {});
  const saveTm = () => save('coach_timers', TM);
  const tKey = (kind, id) => todayKey()+'|'+kind+'|'+id;
  const durSecs = dur => { const m = /(\d+(?:[.,]\d+)?)\s*min/.exec(String(dur||'')); return m ? Math.round(parseFloat(m[1].replace(',','.'))*60) : 0; };
  const mmss = s => Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
  const tLeft = k => { const x = TM[k]; if(!x) return null; return x.endAt ? Math.max(0, Math.ceil((x.endAt-Date.now())/1000)) : x.left; };
  const hhmm = ms => new Date(ms).toLocaleTimeString(EN?'en-GB':'pt-PT', {hour:'2-digit', minute:'2-digit'});
  function timerLabel(k, total){
    const x = TM[k];
    if(!x) return '▶ '+mmss(total);
    if(x.done) return '✓ '+T('acabou ','ended ')+hhmm(x.at);
    return (x.endAt ? '⏸ ' : '▶ ')+mmss(tLeft(k));
  }
  function timerBtn(kind, id, name, dur, done){
    const total = durSecs(dur); if(!total || dayOff!==0) return '';
    const k = tKey(kind, id), x = TM[k];
    if(done && !x) return '';
    const st = !x ? 'idle' : x.done ? 'done' : x.endAt ? 'run' : 'pause';
    return '<div class="ctmw"><button type="button" class="ctm '+st+'" data-act="tm" data-k="'+kind+'" data-id="'+id+'" data-tm="'+k+'" data-s="'+total+'" aria-label="'+T('Temporizador de ','Timer for ')+esc(name)+'"'+(st==='done'?' disabled':'')+'>'+timerLabel(k, total)+'</button>'
      +(st==='pause'||st==='done'?'<button type="button" class="ctr" data-act="tmr" data-tm="'+k+'" aria-label="'+T('Recomeçar temporizador','Reset timer')+'">↺</button>':'')+'</div>';
  }
  // som e vibração no fim (só se a app estiver aberta; o som é desbloqueado no toque em ▶)
  let AC = null;
  const unlockSound = () => { try{ AC = AC || new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==='suspended') AC.resume(); }catch(e){} };
  const beep = () => { try{ navigator.vibrate && navigator.vibrate([300,120,300,120,300]); }catch(e){}
    try{ if(!AC) return; [0,.35,.7].forEach(o => { const os = AC.createOscillator(), g = AC.createGain(); os.frequency.value = 880; g.gain.setValueAtTime(.0001, AC.currentTime+o); g.gain.exponentialRampToValueAtTime(.4, AC.currentTime+o+.02); g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime+o+.25); os.connect(g); g.connect(AC.destination); os.start(AC.currentTime+o); os.stop(AC.currentTime+o+.3); }); }catch(e){} };
  let WL = null;
  const wake = on => { try{ if(on && !WL && navigator.wakeLock) navigator.wakeLock.request('screen').then(l => { WL = l; l.addEventListener('release', () => { WL = null; }); }).catch(()=>{}); else if(!on && WL){ WL.release(); WL = null; } }catch(e){} };
  function toast(msg){ const el = document.createElement('div'); el.className = 'ctoast'; el.setAttribute('role','status'); el.textContent = msg; document.body.appendChild(el); setTimeout(() => el.remove(), 5000); }
  // fecha os temporizadores que chegaram ao fim (também os que acabaram com a app fechada) e marca o exercício como feito
  function finishDue(live){
    let n = 0, names = [];
    Object.keys(TM).forEach(k => { const x = TM[k]; if(!x.endAt || x.endAt > Date.now()) return;
      const [dt, kind, id] = k.split('|'); TM[k] = {done:true, at:x.endAt, total:x.total}; n++;
      const d = day(dt); if(!d[kind].done.includes(id)) d[kind].done.push(id);
      const ex = allOf(kind).find(e => e[0]===id); if(ex) names.push(view(kind, ex).name); });
    if(!n) return false;
    saveTm(); commit();
    if(live) beep(); else toast(T('Temporizador acabou com a app fechada: ','Timer finished while the app was closed: ')+names.join(', ')+T(' (marcado como feito).',' (marked as done).'));
    if(!Object.values(TM).some(x => x.endAt)) wake(false);
    return true;
  }
  // limpa temporizadores de dias antigos
  Object.keys(TM).forEach(k => { if(k.split('|')[0] < addDays(iso(new Date()), -2)) delete TM[k]; }); saveTm();
  setInterval(() => {
    if(!Object.values(TM).some(x => x.endAt)) return;
    if(finishDue(!document.hidden)){ if(pg.classList.contains('on')) render(); return; }
    pg.querySelectorAll('.ctm.run[data-tm]').forEach(b => { b.textContent = timerLabel(b.dataset.tm, +b.dataset.s); });
  }, 1000);
  document.addEventListener('visibilitychange', () => { if(document.hidden) return; if(finishDue(false) && pg.classList.contains('on')) render(); if(Object.values(TM).some(x => x.endAt)) wake(true); });
  function picker(kind, pl, ctx){
    const ago = n => n==null ? T('nunca feito','never done') : n<=0 ? T('feito hoje','done today') : n===1 ? T('feito ontem','done yesterday') : T('feito há '+n+' dias','done '+n+' days ago');
    const off = T('menos indicado hoje','less suited today');
    const rows = pl.opts[kind].map(o => {
      const v = view(kind, o.x);
      const tag = o.sug ? T('sugerido hoje','suggested today') : (!o.rec && !o.mine && (kind==='p'||kind==='r'||kind==='m') ? off : (o.mine ? T('o teu exercício','your exercise') : ''));
      return '<div class="prow"><button type="button" class="pbtn'+(o.inList?' sel':'')+(tag===off?' off':'')+'" data-act="toggle" data-k="'+kind+'" data-id="'+o.x[0]+'" aria-pressed="'+o.inList+'"><span>'+(o.inList?'✓ ':'＋ ')+esc(v.name)+'</span><small>'+[tag, ago(o.ago)].filter(Boolean).join(' · ')+'</small></button>'
        +(o.mine?'<button type="button" class="pdel" data-act="cdel" data-k="'+kind+'" data-id="'+o.x[0]+'" aria-label="'+T('Apagar exercício','Delete exercise')+'">'+T('Apagar','Delete')+'</button>':'')+'</div>'; }).join('');
    const form = showForm[kind] ? '<div class="cform"><input id="cf-name" type="text" maxlength="60" placeholder="'+T('Nome do exercício','Exercise name')+'" aria-label="'+T('Nome','Name')+'"><input id="cf-dur" type="number" inputmode="numeric" min="1" max="180" placeholder="'+T('Minutos','Minutes')+'" aria-label="'+T('Minutos','Minutes')+'"><textarea id="cf-how" placeholder="'+T('Como se faz (opcional)','How to do it (optional)')+'" aria-label="'+T('Como se faz','How to')+'"></textarea><div class="cr2"><button type="button" class="cb" data-act="cform" data-k="'+kind+'">'+T('Cancelar','Cancel')+'</button><button type="button" class="cb pri" data-act="csave" data-k="'+kind+'">'+T('Guardar e adicionar','Save and add')+'</button></div></div>'
      : '<button type="button" class="pbtn pnew" data-act="cform" data-k="'+kind+'">＋ '+T('Criar o teu exercício','Create your own exercise')+'</button>';
    const n = pl.opts[kind].filter(o => o.inList).length;
    return '<details class="cpick" data-pk="'+kind+'"'+(pickOpen[kind]?' open':'')+'><summary>'+T('Exercícios de hoje','Today\'s exercises')+' <span class="cn">'+n+'</span></summary><div class="plist">'+rows+form+'</div></details>';
  }
  const weekPill = (n, tg) => '<span class="pill">'+T('Esta semana: ','This week: ')+n+T(' de ',' of ')+tg+'</span>';
  function quickAdd(kind, d){
    const m = d[kind].min || 0;
    return '<div class="cqa"><small class="sub">'+T('Treinaste sem escolher exercícios? Regista só o tempo.','Trained without picking exercises? Just log the time.')+'</small>'
      +(m>0?'<div class="pkok">✓ '+m+' min '+T('registados','logged')+' <button type="button" class="plnk" data-act="qundo" data-k="'+kind+'">'+T('zerar','clear')+'</button></div>':'')
      +'<div class="cr2"><input id="qa-'+kind+'" type="number" inputmode="numeric" min="1" max="300" placeholder="'+T('Minutos','Minutes')+'" aria-label="'+T('Minutos','Minutes')+'" style="min-height:52px;border:1px solid var(--line);border-radius:10px;padding:0 14px;font:16px Inter,sans-serif;box-sizing:border-box;width:100%;color:var(--ink);background:var(--surface,#fff)"><button type="button" class="cb pri" data-act="qadd" data-k="'+kind+'">＋ '+T('Adicionar tempo','Add time')+'</button></div></div>';
  }
  function ratingBlock(kind, d){
    const e = d[kind];
    const rate = [1,2,3,4,5].map(n => '<button type="button" data-act="rate" data-k="'+kind+'" data-v="'+n+'" aria-pressed="'+(e.rating===n)+'" aria-label="'+n+' / 5">'+n+'</button>').join('');
    return '<div><small class="sub">'+T('Como correu? (opcional)','How did it go? (optional)')+'</small></div><div class="crate">'+rate+'</div>'
      ;
  }
  function exList(kind, pl, ctx){
    const d = pl.d, ex = pl.list[kind];
    if(!ex.length) return '<p class="w">'+T('Lista vazia. Abre "Exercícios de hoje" e escolhe o que queres fazer.','Empty list. Open "Today\'s exercises" and choose what you want to do.')+'</p>';
    return ex.map(x => { const v = view(kind, x); return item(kind, v.id, v.name, v.dur, v.how, d[kind].done.includes(v.id), kind==='p' && EASY[ctx.k] && x[6] ? T('intenso para hoje','intense for today') : ''); }).join('');
  }
  function allBtn(kind, pl){
    const ids = pl.list[kind].map(x => x[0]); if(!ids.length) return '';
    const all = ids.every(i => pl.d[kind].done.includes(i));
    return '<button type="button" class="cb '+(all?'ok':'pri')+'" data-act="all" data-k="'+kind+'" style="width:100%">'+(all?T('Todos feitos ✓','All done ✓'):T('Marcar todos como feitos','Mark all as done'))+'</button>';
  }

  // ---------- prancha progressiva (a mesma da app RWC-coach) ----------
  const LEVELS = [{kg:0,s:40},{kg:10,s:45},{kg:20,s:40},{kg:30,s:35},{kg:40,s:30},{kg:50,s:25},{kg:60,s:20}];
  function pstate(n){
    let r = n;
    for(let i=0;i<LEVELS.length;i++){
      const {kg, s} = LEVELS[i], steps = Math.round((60-s)/5)+1;
      if(r < steps || i===LEVELS.length-1){
        const nx = LEVELS[i+1];
        return {kg, secs:Math.min(60, s+r*5), nextKg:nx?nx.kg:null, nextSecs:(r+1<steps) ? Math.min(60, s+(r+1)*5) : (nx?nx.s:null), levelUp:(r+1>=steps) && !!nx};
      }
      r -= steps;
    }
  }
  const PT = {state:'idle', rem:null, noW:false, iv:null, startAt:0, remAt:0, manual:false};
  const pfmt = s => s>=60 ? Math.floor(s/60)+'m'+(s%60?' '+(s%60)+'s':'') : s+'s';
  const pactive = () => { const st = pstate(PB.sessions); return (PT.noW && st.kg>0) ? Math.min(300, Math.round((40+PB.sessions*5)/5)*5) : st.secs; };
  const plabel = kg => kg===0 ? T('peso corporal','bodyweight') : kg+' kg';
  function plankCard(pl){
    const d = pl.d, st = pstate(PB.sessions), act = pactive(), logged = d.p.done.includes('plank');
    const next = st.levelUp ? '↑ '+st.nextKg+' kg · '+T('começa em ','start at ')+pfmt(st.nextSecs||20) : st.nextSecs ? pfmt(st.nextSecs)+(st.kg>0?' @ '+st.kg+' kg':'') : T('máximo atingido!','max reached!');
    const head = '<div class="pkh"><b>'+T('Prancha progressiva','Progressive plank')+'</b><span>'+T('sessão ','session ')+(PB.sessions+(logged?0:1))+'</span></div>';
    if(logged){
      const L2 = d.p.plank || {secs:PB.lastTarget, kg:PB.weightKg};
      return '<div class="pk">'+head+'<div class="pkok">✓ '+pfmt(L2.secs)+(L2.kg>0?' @ '+L2.kg+' kg':'')+T(' registado',' logged')+'</div><small class="sub">'+T('Próxima: ','Next: ')+next+'</small>'+(st.levelUp?'<small class="sub" style="color:#8a5d06">'+T('Próxima sessão: primeira placa de ','Next session: first plate of ')+st.nextKg+' kg</small>':'')
        +'<button type="button" class="plnk" data-act="pundo">'+T('Desfazer registo','Undo log')+'</button></div>';
    }
    if(PT.rem==null || PT.state==='idle' && PT.rem>act) PT.rem = act;
    const cue = (PT.noW && st.kg>0) ? T('Sem placa? Segura '+pfmt(act)+' de peso corporal: carga equivalente a '+pfmt(st.secs)+' com '+st.kg+' kg.','No plate? Hold '+pfmt(act)+' bodyweight: equivalent load to '+pfmt(st.secs)+' @ '+st.kg+' kg.')
      : st.kg===0 ? (PB.sessions===0 ? T('Base. 40 s com boa forma: respira devagar, anca nivelada.','Baseline. 40 s with solid form: breathe slowly, hips level.') : PB.sessions<3 ? T('A construir base. Cada 5 s ganhos aproxima-te de uma placa.','Building base. Every 5 s earned brings a plate closer.') : T('Últimas sessões sem peso. Quase na placa.','Final bodyweight sessions. Almost at the plate.'))
      : T(st.kg+' kg nas costas. Anca nivelada: prancha com carga vale mais do que prancha longa.', st.kg+' kg on your back. Keep hips level: loaded planks beat long holds.');
    const pct = Math.round((act-PT.rem)/act*100), C = 2*Math.PI*34;
    const run = PT.state==='running', done = PT.state==='done';
    return '<div class="pk">'+head
      +'<div class="pkt"><b>'+((PT.noW&&st.kg>0)?pfmt(act)+' '+T('peso corporal','bodyweight'):pfmt(st.secs)+' · '+plabel(st.kg))+'</b>'+(st.kg>0?'<button type="button" class="plnk" data-act="pnow" aria-pressed="'+PT.noW+'">'+(PT.noW?T('Tenho peso','Have weight'):T('Sem peso','No weight'))+'</button>':'')+'</div>'
      +(st.kg>0&&!PT.noW?'<small class="sub" style="color:#8a5d06;font-weight:600">'+T('Coloca a placa de '+st.kg+' kg na zona lombar','Place the '+st.kg+' kg plate on your lower back')+'</small>':'')
      +'<p class="w">'+cue+'</p>'
      +'<div class="pkr"><svg width="84" height="84" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="34" fill="none" stroke="#e8e6df" stroke-width="7"/><circle id="pring" cx="40" cy="40" r="34" fill="none" stroke="'+(done?'#2E7D4A':'#D9981A')+'" stroke-width="7" stroke-dasharray="'+C+'" stroke-dashoffset="'+(C*(1-pct/100))+'" stroke-linecap="round" transform="rotate(-90 40 40)"/><text id="ptime" x="40" y="46" text-anchor="middle" font-size="18" font-weight="700" fill="'+(done?'#2E7D4A':'#D9981A')+'" font-family="system-ui">'+pfmt(PT.rem)+'</text></svg>'
      +'<div class="pkb">'+(run?'<button type="button" class="cb" data-act="ppause">⏸ '+T('Pausa','Pause')+'</button>':done?'<div class="pkok">'+T('Feito ✓','Done ✓')+'</div>':'<button type="button" class="cb pri" data-act="pstart">▶ '+T('Começar','Start')+'</button>')
      +(!run&&!done&&PT.rem<act?'<button type="button" class="cb" data-act="preset">'+T('Recomeçar','Reset')+'</button>':'')+'</div></div>'
      +'<button type="button" class="cb '+(done?'ok':'pri')+'" data-act="plog" style="width:100%">✓ '+T('Registar ','Log ')+pfmt(act)+((PT.noW&&st.kg>0)?' '+T('peso corporal','bodyweight'):st.kg>0?' @ '+st.kg+' kg':'')+'</button>'
      +'<small class="sub">'+T('Próxima: ','Next: ')+next+'</small>'
      +'<button type="button" class="plnk" data-act="pman">'+(PT.manual?T('cancelar','cancel'):T('Já sei o meu nível: definir à mão','I already know my level: set manually'))+'</button>'
      +(PT.manual?'<div class="cform"><small class="sub">'+T('Ex.: se aguentas 30 s com 20 kg, escreve isso e a progressão ajusta-se.','E.g. if you can hold 30 s with 20 kg, enter that and the progression adjusts.')+'</small><input id="pm-kg" type="number" inputmode="numeric" min="0" step="10" placeholder="'+T('Peso (kg), 0 = corpo','Weight (kg), 0 = bodyweight')+'"><input id="pm-s" type="number" inputmode="numeric" min="20" max="60" step="5" placeholder="'+T('Tempo (20–60 s)','Time (20–60 s)')+'"><button type="button" class="cb pri" data-act="papply">'+T('Aplicar','Apply')+'</button></div>':'')
      +'</div>';
  }
  function ptickDom(){
    const act = pactive(), C = 2*Math.PI*34;
    const t = pg.querySelector('#ptime'), r = pg.querySelector('#pring');
    if(t) t.textContent = pfmt(PT.rem);
    if(r) r.setAttribute('stroke-dashoffset', C*(1-Math.round((act-PT.rem)/act*100)/100));
  }
  function pstop(){ clearInterval(PT.iv); PT.iv = null; try{ localStorage.removeItem('coach_plank_run'); }catch(e){} }
  function pstart(resume){
    if(!resume){ PT.state = 'running'; PT.startAt = Date.now(); PT.remAt = PT.rem; unlockSound(); }
    clearInterval(PT.iv); save('coach_plank_run', {startAt:PT.startAt, remAt:PT.remAt, day:todayKey()});
    PT.iv = setInterval(() => {
      const left = Math.max(0, PT.remAt - Math.floor((Date.now()-PT.startAt)/1000)); PT.rem = left; ptickDom();
      if(left===0){ pstop(); PT.state = 'done'; beep(); render(); }
    }, 500);
  }

  // ---------- painéis ----------
  function panelPrehab(pl, ctx, ws){
    return '<div class="cpan"><div class="cc">'+weekPill(ws.p, tgt('p'))+'<h3>Prehab</h3><p class="w">'+L(WHY.prehab,0)+'</p>'
      +picker('p', pl, ctx)+exList('p', pl, ctx)+allBtn('p', pl)+plankCard(pl)+quickAdd('p', pl.d)+ratingBlock('p', pl.d)+'</div></div>';
  }
  function panelRecovery(pl, ctx, ws){
    return '<div class="cpan"><div class="cc">'+weekPill(ws.r, tgt('r'))+'<h3>'+T('Recuperação','Recovery')+'</h3><p class="w">'+L(WHY.recovery,0)+'</p>'
      +picker('r', pl, ctx)+exList('r', pl, ctx)+allBtn('r', pl)+quickAdd('r', pl.d)+ratingBlock('r', pl.d)
      +'<p class="w">'+(ctx.k==='same'||ctx.k==='next'||ctx.k==='match'?T('Hidratos de carbono e proteína nas 2 h a seguir, e dorme 8 h ou mais.','Carbs and protein within 2 h, and sleep 8 h or more.'):T('Dormir 8 h ou mais é a parte inegociável da recuperação.','Sleeping 8 h or more is the non-negotiable part of recovery.'))+'</p></div></div>';
  }
  function panelMental(pl, ctx, ws){
    const first = pl.list.m[0], p = first && P[first[1]];
    return '<div class="cpan"><div class="cc">'+weekPill(ws.m, tgt('m'))+'<h3>'+T('Mental','Mental')+(p?' · '+T(p[0],p[1]):'')+'</h3><p class="w">'+L(WHY.mental,0)+'</p>'
      +picker('m', pl, ctx)+exList('m', pl, ctx)+allBtn('m', pl)+quickAdd('m', pl.d)+ratingBlock('m', pl.d)+'</div></div>';
  }
  function panelSkill(kind, pl, ctx, ws){
    const n = SKN[kind];
    const warn = ctx.k==='match' ? T('Dia de jogo: só ativação, nada de volume.','Match day: activation only, no volume.') : ctx.k==='pre' ? T('Véspera de jogo: poucas repetições, só a afinar.','Day before the match: few reps, just sharpening.') : ctx.k==='over' ? T('Semana muito pesada: hoje descansa a perna.','Very heavy week: rest your legs today.') : ctx.k==='same' ? T('Dia de jogo ou pesado: se treinares a técnica, faz leve e com pouco volume.','Match or heavy day: if you work on technique, keep it light and low volume.')
      : ctx.k==='next' ? T('Dia seguinte a jogo ou dia pesado: só técnica leve, sem pressão nem velocidade máxima.','Day after a match or heavy day: light technique only, no pressure or top speed.')
      : ctx.k==='high' ? T('Carga alta esta semana: mantém o volume curto.','High load this week: keep the volume short.') : '';
    return '<div class="cpan"><div class="cc">'+weekPill(ws[kind], tgt(kind))+'<h3>'+T(n[0],n[1])+'</h3>'+(warn?'<p class="cnotew">'+warn+'</p>':'')
      +picker(kind, pl, ctx)+exList(kind, pl, ctx)+allBtn(kind, pl)+quickAdd(kind, pl.d)+ratingBlock(kind, pl.d)+'</div></div>';
  }
  const wkMin = (mon, k) => { let n = 0; for(let i=0;i<7;i++){ const d = LOG[addDays(mon,i)]; if(d && d[k] && d[k].min>0) n += d[k].min; } return n; };
  function panelProgress(ctx, ws){
    const t = todayKey(), mon = mondayOf(t), s = streak(), stp = pstate(PB.sessions);
    const bar = (lbl, v, tg, k) => { const mn = wkMin(mon, k); return '<div class="cmod"><span>'+lbl+'</span><div class="cbar"><i data-w="'+(tg?Math.min(100,Math.round(v/tg*100)):0)+'"></i></div><span>'+v+'/'+tg+'</span>'+(mn?'<small>'+mn+' min</small>':'')+'</div>'; };
    let rows = '';
    for(let i=0;i<8;i++){ const m0 = addDays(mon,-7*i), w = weekStats(m0);
      rows += '<div class="cwk"><span>'+fmt(m0)+'</span><div class="dots"><span>Prehab '+w.p+'</span><span>'+T('Recup. ','Recov. ')+w.r+'</span><span>Mental '+w.m+'</span><span>Skills '+(w.box+w.pass+w.def)+'</span></div><small>'+(w.rd?km(w.rd)+' km':'–')+'</small></div>'; }
    const rated = []; Object.keys(LOG).forEach(k => { if(k > addDays(t,-14) && LOG[k].m && (LOG[k].m.done||[]).length && LOG[k].m.rating) rated.push(LOG[k].m.rating); });
    const avg = rated.length ? rated.reduce((a,b)=>a+b,0)/rated.length : null;
    let total = 0; Object.keys(LOG).forEach(k => KINDS.forEach(kind => { if(kDone(LOG[k], kind)) total++; }));
    return '<div class="cpan"><div class="cst"><div><b>'+s+'</b><small>'+(s===1?T('dia seguido','day in a row'):T('dias seguidos','days in a row'))+'</small></div><div><b>'+total+'</b><small>'+T('skills feitas','skills done')+'</small></div><div><b>'+(avg==null?'–':num1(avg))+'</b><small>'+T('mental, média 14 d','mental, 14-day avg')+'</small></div></div>'
      +'<div class="cc"><h3>'+T('Esta semana','This week')+'</h3>'+bar('Prehab', ws.p, tgt('p'),'p')+bar(T('Recuperação','Recovery'), ws.r, tgt('r'),'r')+bar('Mental', ws.m, tgt('m'),'m')+bar('Box kick', ws.box, tgt('box'),'box')+bar(T('Passe','Passing'), ws.pass, tgt('pass'),'pass')+bar(T('Defesa','Defence'), ws.def, tgt('def'),'def')+'<button type="button" class="cb" data-act="gotg" style="width:100%">'+T('Mudar quantas vezes por semana','Change sessions per week')+'</button></div>'
      +'<div class="cc"><h3>'+T('Prancha','Plank')+'</h3><p class="w">'+pfmt(stp.secs)+' · '+plabel(stp.kg)+(PB.sessions===1?T(' · 1 sessão',' · 1 session'):T(' · '+PB.sessions+' sessões',' · '+PB.sessions+' sessions'))+'</p></div>'
      +'<div class="cc"><h3>'+T('8 semanas, com a tua carga','8 weeks, with your load')+'</h3><p class="w">'+T('Para ver se a prevenção acompanha as semanas pesadas.','To check that prevention keeps up with heavy weeks.')+'</p>'+rows+'</div>'
      +'</div>';
  }

  // ---------- render ----------
  function render(){
    const ctx = context(), pl = plan(ctx), ws = weekStats(mondayOf(pl.t)), c = CTX[ctx.k] || CTX.normal, DC = {good:'#5CC48A', warn:'#F2B84B', bad:'#FF6B6B', info:'#8FB4E8'};
    const ok = {p: preDone(pl.d), r: kDone(pl.d,'r'), m: kDone(pl.d,'m')};
    const chip = (key, lbl) => '<span class="'+(ok[key]?'ok':'')+'">'+(ok[key]?'✓ ':'')+lbl+'</span>';
    const lr = ctx.ratio==null ? '' : ' · '+T('carga vs. habitual ','load vs usual ')+num1(ctx.ratio);
    const TABS = [['prehab','Prehab'],['recovery',T('Recuperação','Recovery')],['mental','Mental'],['box','Box kick'],['pass',T('Passe','Passing')],['def',T('Defesa','Defence')],['progress',T('Progresso','Progress')]];
    const y = scrollY;
    // mantém a altura enquanto redesenha: se a página encolhe por um instante, o iPhone perde o sítio da barra de baixo
    if(pg.offsetHeight) pg.style.minHeight = pg.offsetHeight+'px';
    pg.innerHTML = '<section class="ch"><h2>Coach</h2><div class="sub">'+T('Prehab, recuperação, mental e progresso, ajustados à tua carga.','Prehab, recovery, mental and progress, adjusted to your load.')+'</div>'
      +'<div class="cday"><button type="button" data-act="dprev" aria-label="'+T('Dia anterior','Previous day')+'"'+(dayOff>=14?' disabled':'')+'>‹</button><b>'+(dayOff===0?T('Hoje','Today'):dayOff===1?T('Ontem','Yesterday'):'')+' '+fmt(pl.t)+'</b><button type="button" data-act="dnext" aria-label="'+T('Dia seguinte','Next day')+'"'+(dayOff===0?' disabled':'')+'>›</button></div>'
      +'<div class="cx"><small>'+T('Última sessão ','Last session ')+esc(ctx.lastTxt)+lr+'</small><div class="ct" style="color:'+DC[DAYTXT[ctx.k][0]]+'">'+T(DAYTXT[ctx.k][1],DAYTXT[ctx.k][2])+'</div><p>'+L(c[0],0)+'</p><div class="cs">'+chip('p','Prehab')+chip('r',T('Recuperação','Recovery'))+chip('m','Mental')+'</div></div>'
      +'<div class="cseg" role="group" aria-label="Coach">'+TABS.map(a=>'<button type="button" data-tab="'+a[0]+'" aria-pressed="'+(tab===a[0])+'">'+a[1]+'</button>').join('')+'</div>'
      +'<div id="cpanel">'+(tab==='prehab'?panelPrehab(pl,ctx,ws):tab==='recovery'?panelRecovery(pl,ctx,ws):tab==='mental'?panelMental(pl,ctx,ws):tab==='progress'?panelProgress(ctx,ws):panelSkill(tab,pl,ctx,ws))+'</div></section>';
    requestAnimationFrame(() => requestAnimationFrame(() => pg.querySelectorAll('.cbar i').forEach(i => { i.style.width = i.dataset.w+'%'; })));
    if(y && pg.classList.contains('on')) scrollTo(0, y);
    requestAnimationFrame(() => { pg.style.minHeight = ''; if(window.UXFIX) UXFIX(); });
    commit();
  }

  // ---------- ações ----------
  const rd = id => (pg.querySelector(id)||{}).value || '';
  pg.addEventListener('toggle', e => { const k = e.target.dataset && e.target.dataset.pk; if(k) pickOpen[k] = e.target.open; }, true);
  pg.addEventListener('click', e => {
    const tb = e.target.closest('[data-tab]'); if(tb){ tab = tb.dataset.tab; const y0 = scrollY; render(); const sg = pg.querySelector('.cseg'); const top = sg ? sg.getBoundingClientRect().top + scrollY - 8 : 0; scrollTo({top: y0 > top ? Math.max(0, top) : y0, behavior:'instant'}); if(window.UXFIX) UXFIX(); return; }
    const b = e.target.closest('[data-act]'); if(!b) return;
    const t = todayKey(), d = day(t), act = b.dataset.act, k = b.dataset.k, id = b.dataset.id;
    const ensureSet = () => { const e2 = d[k]; if(!e2.set){ e2.ids = todayIds(d, k).slice(); e2.set = true; } return e2; };
    if(act==='tick'){ const a = d[k].done, i = a.indexOf(id); if(i<0) a.push(id); else a.splice(i,1); commit(); render(); const nb = pg.querySelector('.cchk[data-id="'+id+'"]'); if(nb && nb.getAttribute('aria-checked')==='true' && !reduce()) nb.classList.add('pop'); }
    else if(act==='all'){ const ids = todayIds(d, k), all = ids.every(i => d[k].done.includes(i)); d[k].done = all ? d[k].done.filter(i => !ids.includes(i)) : Array.from(new Set(d[k].done.concat(ids))); commit(); render(); }
    else if(act==='toggle'){ const e2 = ensureSet(), i = e2.ids.indexOf(id); if(i<0) e2.ids.push(id); else { e2.ids.splice(i,1); e2.done = e2.done.filter(x => x!==id); } pickOpen[k] = true; commit(); render(); }
    else if(act==='rate'){ const v = +b.dataset.v; d[k].rating = d[k].rating===v ? 0 : v; commit(); render(); }
    else if(act==='qadd'){ const v = parseInt(rd('#qa-'+k)); if(v>0){ d[k].min = (d[k].min||0) + Math.min(300, v); commit(); render(); } else { const f = pg.querySelector('#qa-'+k); if(f) f.focus(); } }
    else if(act==='tm'){ const k2 = b.dataset.tm, total = +b.dataset.s, x = TM[k2];
      if(x && x.endAt){ TM[k2] = {left:tLeft(k2), total}; if(!Object.values(TM).some(y => y.endAt)) wake(false); }
      else { unlockSound(); const left = x && x.left>0 ? x.left : total; TM[k2] = {endAt:Date.now()+left*1000, total}; wake(true); }
      saveTm(); render(); }
    else if(act==='tmr'){ delete TM[b.dataset.tm]; saveTm(); if(!Object.values(TM).some(y => y.endAt)) wake(false); render(); }
    else if(act==='qundo'){ d[k].min = 0; commit(); render(); }
    else if(act==='dprev'){ dayOff = Math.min(14, dayOff+1); render(); }
    else if(act==='dnext'){ dayOff = Math.max(0, dayOff-1); render(); }
    else if(act==='gotg'){ showTab('mais'); setTimeout(() => { const c2 = document.getElementById('coachtg'); if(c2) c2.scrollIntoView({block:'start'}); }, 60); }
    else if(act==='cform'){ showForm[k] = !showForm[k]; pickOpen[k] = true; render(); }
    else if(act==='csave'){ const name = rd('#cf-name').trim(); if(!name){ const f = pg.querySelector('#cf-name'); if(f) f.focus(); return; }
      const cid = 'c_'+Date.now().toString(36), dur = (parseInt(rd('#cf-dur'))||10)+' min';
      (CUSTOM[k] = CUSTOM[k] || []).push({id:cid, name, dur, how:rd('#cf-how').trim()}); const e2 = ensureSet(); e2.ids.push(cid); showForm[k] = false; pickOpen[k] = true; commit(); render(); }
    else if(act==='cdel'){ CUSTOM[k] = (CUSTOM[k]||[]).filter(c => c.id!==id); Object.keys(LOG).forEach(dt => { const e2 = LOG[dt][k]; if(e2 && e2.ids) e2.ids = e2.ids.filter(x => x!==id); }); pickOpen[k] = true; commit(); render(); }
    else if(act==='pstart') pstart() || render();
    else if(act==='ppause'){ pstop(); PT.state = 'idle'; render(); }
    else if(act==='preset'){ pstop(); PT.state = 'idle'; PT.rem = pactive(); render(); }
    else if(act==='pnow'){ PT.noW = !PT.noW; pstop(); PT.state = 'idle'; PT.rem = pactive(); render(); }
    else if(act==='plog'){ pstop(); const st = pstate(PB.sessions), act2 = pactive(); d.p.prevPB = JSON.parse(JSON.stringify(PB));
      PB = {sessions:PB.sessions+1, lastTarget:act2, weightKg:st.kg, lastDate:t}; d.p.plank = {secs:act2, kg:st.kg};
      if(!d.p.done.includes('plank')) d.p.done.push('plank'); PT.state = 'idle'; PT.rem = null; try{ navigator.vibrate && navigator.vibrate(30); }catch(e3){} commit(); render(); }
    else if(act==='pundo'){ if(d.p.prevPB) PB = d.p.prevPB; d.p.done = d.p.done.filter(x => x!=='plank'); delete d.p.plank; delete d.p.prevPB; PT.rem = null; commit(); render(); }
    else if(act==='pman'){ PT.manual = !PT.manual; render(); }
    else if(act==='papply'){ const kg = parseInt(rd('#pm-kg'))||0, secs = Math.min(60, Math.max(20, Math.round((parseInt(rd('#pm-s'))||20)/5)*5));
      const idx = Math.max(0, LEVELS.findIndex((l,i) => kg < (LEVELS[i+1] ? LEVELS[i+1].kg : Infinity))), lvl = LEVELS[idx];
      let before = 0; for(let i=0;i<idx;i++) before += Math.round((60-LEVELS[i].s)/5)+1;
      PB = {sessions: before + Math.round((Math.max(lvl.s, secs)-lvl.s)/5), lastTarget:secs, weightKg:kg, lastDate:t}; PT.manual = false; PT.rem = null; commit(); render(); }
  });
  new MutationObserver(() => { if(pg.classList.contains('on')) render(); }).observe(pg, {attributes:true, attributeFilter:['class']});
  // "Corpo" saiu da barra: abre a partir de "Mais" e tem o seu botão de voltar
  const mais = document.getElementById('pg-mais'), corpo = document.getElementById('pg-corpo');
  if(mais){ const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'more-link'; bt.dataset.go = 'corpo';
    const B0 = (typeof BODY!=='undefined' && BODY.length) ? BODY[BODY.length-1] : null;
    bt.innerHTML = '<span><b>'+T('Composição corporal','Body composition')+'</b><small>'+(B0?T('Última medição ','Last measurement ')+fmt(B0.date)+' · '+String(B0.weight).replace('.',EN?'.':',')+' kg':'')+'</small></span><span aria-hidden="true">›</span>';
    bt.addEventListener('click', () => showTab('corpo')); const pan = mais.querySelector('.rsp'); pan ? pan.after(bt) : mais.insertBefore(bt, mais.firstChild); }
  if(corpo){ const bk = document.createElement('button'); bk.type = 'button'; bk.className = 'more-btn'; bk.style.cssText = 'min-height:44px;padding:0 16px;border-radius:10px;font-size:14px;align-self:flex-start;width:auto;margin-bottom:8px';
    bk.textContent = T('‹ Mais','‹ More'); bk.addEventListener('click', () => history.back()); corpo.insertBefore(bk, corpo.firstChild); }
  // cartão nas Definições: as mesmas regras e o mesmo tipo de controlo dos alvos de GPS
  const defs = document.getElementById('defs');
  if(defs){
    const nm = {p:'Prehab', r:T('Recuperação','Recovery'), m:'Mental', box:'Box kick', pass:T('Passe','Passing'), def:T('Defesa','Defence')};
    const c3 = document.createElement('div'); c3.className = 'card'; c3.id = 'coachtg'; c3.style.padding = '14px 16px';
    const mon = mondayOf(realToday());
    c3.innerHTML = '<h3 style="margin-top:0">'+T('Coach: vezes por semana','Coach: sessions per week')+'</h3><div class="sub">'+T('Quantos dias por semana queres fazer cada parte. Em semana de jogo o sugerido baixa passe e defesa e sobe recuperação.','How many days a week you want to do each part. In a match week the suggestion lowers passing and defence and raises recovery.')+'</div>'
      +TKINDS.map(k => '<div class="tgrow"><label for="ct-'+k+'">'+nm[k]+'</label><span class="inp"><input id="ct-'+k+'" type="text" inputmode="numeric" autocomplete="off" value="'+tgt(k)+'"><span>'+T('por semana','a week')+'</span></span><div class="hint">'+T('Sugerido: ','Suggested: ')+recT(k, mon)+'. '+L(WHYT[k],0)+'</div></div>').join('')
      +'<div class="tgbtns"><button type="button" class="pri" id="ct-save">'+T('Guardar alvos','Save targets')+'</button><button type="button" id="ct-reset">'+T('Repor sugeridos','Reset to suggested')+'</button></div><div class="tgmsg" id="ct-msg" role="status" aria-live="polite"></div>';
    const first = defs.querySelector('.card'); first ? first.after(c3) : defs.appendChild(c3);
    const msg = c3.querySelector('#ct-msg');
    c3.querySelector('#ct-save').addEventListener('click', () => {
      const o = {}; let bad = null;
      TKINDS.forEach(k => { const v = parseInt(c3.querySelector('#ct-'+k).value); if(!(v>=0 && v<=7)) bad = bad || k; else o[k] = v; });
      if(bad){ msg.className = 'tgmsg err'; msg.textContent = T('Usa um número de 0 a 7 em '+nm[bad]+'.','Use a number from 0 to 7 for '+nm[bad]+'.'); c3.querySelector('#ct-'+bad).focus(); return; }
      TGT = o; commit(); msg.className = 'tgmsg'; msg.textContent = T('✓ Alvos guardados.','✓ Targets saved.'); render();
    });
    c3.querySelector('#ct-reset').addEventListener('click', () => { TGT = {}; commit(); TKINDS.forEach(k => { c3.querySelector('#ct-'+k).value = tgt(k); }); msg.className = 'tgmsg'; msg.textContent = T('✓ Sugeridos repostos.','✓ Suggested values restored.'); render(); });
  }
  finishDue(false); if(Object.values(TM).some(x => x.endAt)) wake(true);
  { const pr = load('coach_plank_run', null); if(pr && pr.day===todayKey()){ PT.startAt = pr.startAt; PT.remAt = pr.remAt; PT.rem = Math.max(0, pr.remAt - Math.floor((Date.now()-pr.startAt)/1000)); PT.state = PT.rem>0 ? 'running' : 'done'; if(PT.rem>0) pstart(true); else pstop(); } }
  const status = () => { const d = day(realToday()); return [['prehab','Prehab',preDone(d)],['recovery',T('Recuperação','Recovery'),kDone(d,'r')],['mental','Mental',kDone(d,'m')]].map(x => ({tab:x[0], name:x[1], done:x[2]})); };
  render();
  window.COACH = {status, render, setCtx:v => { ctxOverride = v; render(); }, setToday:v => { todayOverride = v; render(); }, reset:() => { LOG = {}; CUSTOM = {}; PB = {sessions:0, weightKg:0, lastTarget:0, lastDate:''}; commit(); render(); }, setTab:v => { tab = v; render(); }};
})();
