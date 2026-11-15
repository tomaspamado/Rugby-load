// ---------- Painéis de resumo nas outras páginas (mesmo estilo do Hoje) ----------
(function(){
  const css = document.createElement('style');
  css.textContent = '.rsp{background:var(--navy,#0E1A2E);color:#fff;border-radius:14px;padding:16px;margin:14px 0}.rsp small{display:block;font-size:12px;opacity:.75}.rsp .rt{font-family:"Barlow Condensed",sans-serif;font-size:26px;font-weight:700;line-height:1.1}.rsp .rt+small{margin-top:2px}'
   +'.rsp .g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.rsp .g.c3{grid-template-columns:repeat(3,minmax(0,1fr))}.rsp .g>div{background:rgba(255,255,255,.08);border-radius:10px;padding:10px;min-width:0}.rsp .g b{font-family:"Barlow Condensed",sans-serif;font-size:26px;font-weight:600;line-height:1;display:block}.rsp .g em{font-style:normal;font-size:12px;margin-left:3px;opacity:.75}.rsp .g small{margin-top:5px;font-size:11px}.rsp .g svg{display:block;width:100%;height:26px;margin-top:6px}'
   +'.rsp .up{color:#5CC48A}.rsp .dn{color:#F2B84B}.rsp .nt{color:#8FB4E8}.rsp .chipw{display:inline-block;margin-top:10px;font-size:12px;font-weight:600;background:#D9981A;color:#0E1A2E;border-radius:99px;padding:4px 10px}'
   +'.rsp .cols{display:flex;gap:6px;align-items:flex-end;height:64px;margin-top:14px}.rsp .cols div{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%}.rsp .cols i{display:block;width:100%;border-radius:4px;background:rgba(255,255,255,.45);min-height:2px}.rsp .cols i.m{background:#FF6B6B}.rsp .cols i.l{background:#D9981A}.rsp .cl{display:flex;gap:6px;margin-top:4px}.rsp .cl span{flex:1;min-width:0;text-align:center;font-size:10px;opacity:.7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rsp .cap{font-size:11px;opacity:.65;margin-top:6px}'
   +'#games>details.fold{grid-column:1/-1;flex:1 0 100%;width:100%;box-sizing:border-box}#games>details.fold .card.game{margin-top:10px}';
  document.head.appendChild(css);
  const mk = html => { const s=document.createElement('section'); s.className='rsp'; s.innerHTML=html; return s; };
  const fold = (title, nodes, id) => { const d=document.createElement('details'); d.className='fold'; if(id) d.id=id; d.innerHTML='<summary><span>'+title+'</span></summary>'; nodes.forEach(n=>n&&d.appendChild(n)); return d; };
  const pct = (v,p)=> p>0 ? (v/p-1)*100 : null;
  const dl = (v,p,inv)=>{ const x=pct(v,p); if(x==null) return ''; const c = Math.abs(x)<5?'nt':(x>0?'up':'dn'); return '<small class="'+c+'">'+(x>=5?'▲':x<=-5?'▼':'●')+' '+(x>=0?'+':'')+Math.round(x)+'% vs. anterior</small>'; };

  // ---- SEMANA ----
  const wk = document.getElementById('s-wk');
  let wkPanel = null;
  function buildWk(){
    const w=selWeek, cut=weekCut(w), cur=wkTot(w,cut), weeks=[...new Set(SESSIONS.map(x=>x.week))].sort((a,b)=>a-b), pw=weeks[weeks.indexOf(w)-1], prv=pw?wkTot(pw,cut):null;
    const accT=ww=>SESSIONS.filter(x=>x.week===ww && dow(x.date)<=cut).reduce((a,x)=>a+x.accel,0);
    const xs=weekSessions(w), cutName=DOWN[cut%7];
    let h='';
    if(!cur){ h='<div class="rt">Semana '+w+'</div><small>Sem sessões com GPS neste período.</small>'; }
    else {
      const gap=SESSIONS.some(x=>x.gpsGap && (x.week===w||x.week===pw)), ok=prv&&prv.n&&!gap;
      const cell=(l,v,u,pv)=>'<div><small>'+l+'</small><b>'+v+(u?'<em>'+u+'</em>':'')+'</b>'+(ok?dl(parseFloat(String(v).replace(/\s/g,'').replace(',','.')),pv):'')+'</div>';
      h='<div class="rt">Semana '+w+(w===last.week?' · até '+cutName.replace('-feira',''):' · completa')+'</div><small>'+cur.n+(cur.n===1?' sessão':' sessões')+(ok?' · a comparar com a semana '+pw+', só até ao mesmo dia':'')+(gap?' · há treinos sem GPS, não comparo':'')+'</small>'
       +'<div class="g">'+cell('Distância',f1(cur.rd/1000),'km',prv?prv.rd/1000:0)+cell('Corrida rápida',f0(cur.hsr),'m',prv?prv.hsr:0)+cell('Acelerações',f0(accT(w)),'',pw?accT(pw):0)+cell('Velocidade máx.',f1(cur.sp),'km/h',prv?prv.sp:0)+'</div>';
      const P = w===46 ? POSWK46 : w===45 ? POSWK : null;
      if(P){ const me=P.rows.find(r=>r.me), o=P.rows.filter(r=>r.sh&&!r.me), n=['rd','hsr','acc','sp'].filter(k=>o.every(r=>me[k]>r[k])).length; h+='<span class="chipw">Entre os 3 scrum-halves: #1 em '+n+' de 4</span>'; }
      const days=[1,2,3,4,5,6,7].filter(d=>w!==last.week||d<=cut), by=d=>xs.filter(x=>dow(x.date)===d), sm=d=>by(d).reduce((a,x)=>a+x.rd,0), mxv=Math.max(1,...days.map(sm));
      h+='<div class="cols">'+days.map(d=>'<div><i class="'+(by(d).some(x=>x.type==='Match')?'m':'')+'" style="height:'+Math.max(3,sm(d)/mxv*100).toFixed(0)+'%"></i></div>').join('')+'</div><div class="cl">'+days.map(d=>'<span>'+DS[d%7]+'</span>').join('')+'</div><div class="cap">Distância por dia · vermelho: jogo</div>';
    }
    const np=mk(h); if(wkPanel&&wkPanel.parentNode) wkPanel.replaceWith(np); wkPanel=np; return np;
  }
  if(wk){
    const wv=document.getElementById('wkview'); wk.querySelector('.pick').after(buildWk());
    const d=fold('Detalhe da semana: números e dia a dia',[wv]); wkPanel.after(d);
    document.getElementById('wkpick').addEventListener('change',buildWk);
  }

  // ---- EVOLUÇÃO ----
  const ev = document.getElementById('s-evol');
  if(ev){
    const L=SESSIONS.slice(-12), M=[['rd','Distância','m',f0],['hsr','Corrida rápida','m',f0],['accel','Acelerações','',f0],['maxSpeed','Velocidade máx.','km/h',f1]];
    const tile=([k,n,u,f])=>{ const v=L[L.length-1][k], prev=SESSIONS.slice(0,-1).filter(x=>x.type!=='Match'&&!x.combined).slice(-5), a=prev.length?prev.reduce((t,x)=>t+x[k],0)/prev.length:0, x=pct(v,a), c=x==null||Math.abs(x)<5?'nt':(x>0?'up':'dn');
      return '<div><small>'+n+'</small><b>'+f(v)+(u?'<em>'+u+'</em>':'')+'</b>'+spark(L.map(s=>s[k]))+(x==null?'':'<small class="'+c+'">'+(x>=5?'▲':x<=-5?'▼':'●')+' '+(x>=0?'+':'')+Math.round(x)+'% vs. média de 5</small>')+'</div>'; };
    const p=mk('<div class="rt">Tendência</div><small>Última sessão ('+dshort(last.date)+') e as 12 mais recentes</small><div class="g">'+M.map(tile).join('')+'</div>');
    const head=ev.querySelector('.head'); head.after(p);
    const lg=ev.querySelector('.legend'), ch=ev.querySelector('.charts');
    const d=fold('Gráficos completos',[lg,ch]); p.after(d);
  }

  // ---- JOGOS ----
  const jg = document.getElementById('s-jogos');
  if(jg){
    const G=SESSIONS.filter(s=>s.type==='Match'&&s.fieldTimeMin);
    if(G.length){
      const pm=s=>s.rd/s.fieldTimeMin, best=G.reduce((a,x)=>pm(x)>pm(a)?x:a,G[0]), avg=G.reduce((t,x)=>t+pm(x),0)/G.length, mins=G.reduce((t,x)=>t+x.fieldTimeMin,0), hb=Math.max(...G.map(x=>x.hsr/x.fieldTimeMin)), mx=Math.max(...G.map(pm));
      const p=mk('<div class="rt">'+G.length+' jogos na época</div><small>Intensidade = metros por minuto em campo</small><div class="g c3"><div><small>Melhor jogo</small><b>'+f0(pm(best))+'<em>m/min</em></b><small>vs. '+best.opponent+'</small></div><div><small>Média</small><b>'+f0(avg)+'<em>m/min</em></b><small>dos teus jogos</small></div><div><small>Em campo</small><b>'+f0(mins)+'<em>min</em></b><small>'+f1(hb)+' m/min rápidos no melhor</small></div></div>'
       +'<div class="cols">'+G.map(s=>'<div><i class="l" style="height:'+Math.max(4,pm(s)/mx*100).toFixed(0)+'%"></i></div>').join('')+'</div><div class="cl">'+G.map(s=>'<span>'+s.opponent+'</span>').join('')+'</div><div class="cap">Metros por minuto em cada jogo</div>');
      jg.querySelector('.sub').after(p);
      const gm=document.getElementById('games'), cards=[...gm.querySelectorAll('.card.game')];
      if(cards.length){ const d=fold('Todos os jogos ('+cards.length+')',cards); gm.appendChild(d); }
    }
  }

  // ---- CORPO ----
  const cp = document.getElementById('s-corpo');
  if(cp && typeof BODY!=='undefined' && BODY.length){
    const b=BODY[BODY.length-1], pv=BODY.length>1?BODY[BODY.length-2]:null, lo=LMI_REF-LMI_SD, hi=LMI_REF+LMI_SD;
    const s8=b.s8<S8_GOOD?['up','Bom']:b.s8<=S8_OK?['dn','Aceitável']:['dn','A melhorar'], lm=b.lmi<lo?['dn','Abaixo da referência']:['up','Dentro da referência'];
    const dv=(v,q,u)=>q==null?'':'<small class="nt">'+(v-q>=0?'+':'')+(v-q).toFixed(1).replace('.',',')+u+' vs. anterior</small>';
    const p=mk('<div class="rt">Medição de '+dshort(b.date)+'</div><small>'+b.team+' · protocolo ISAK</small><div class="g"><div><small>Peso</small><b>'+f1(b.weight)+'<em>kg</em></b>'+dv(b.weight,pv&&pv.weight,' kg')+'</div><div><small>Σ8 pregas</small><b>'+f1(b.s8)+'<em>mm</em></b><small class="'+s8[0]+'">'+s8[1]+' (meta &lt;78)</small></div><div><small>Massa gorda</small><b>'+f1(b.fatPct)+'<em>%</em></b>'+dv(b.fatPct,pv&&pv.fatPct,'%')+'</div><div><small>LMI (massa magra)</small><b>'+f1(b.lmi)+'</b><small class="'+lm[0]+'">'+lm[1]+'</small></div></div>');
    cp.querySelector('.sub').after(p);
    const bt=document.querySelector('#bodycard .btiles'); if(bt) bt.style.display='none';
  }

  // ---- MAIS ----
  const mp = document.getElementById('pg-mais');
  if(mp){
    const first=mp.querySelector('section'), wks=[...new Set(SESSIONS.map(x=>x.week))].sort((a,b)=>a-b), cnt=wks.map(w=>SESSIONS.filter(x=>x.week===w).length), mxc=Math.max(...cnt), T=window.TROFEUS||{medals:[],level:'-',pts:0};
    const p=mk('<div class="rt">A tua época em números</div><small>Desde '+dshort(SESSIONS[0].date)+' · '+wks.length+' semanas com GPS</small><div class="g c3"><div><small>Sessões</small><b>'+SESSIONS.length+'</b></div><div><small>Jogos</small><b>'+SESSIONS.filter(x=>x.type==='Match').length+'</b></div><div><small>Medalhas</small><b>'+T.medals.length+'</b><small>nível '+T.level+'</small></div></div>'
     +'<div class="cols">'+cnt.map(c=>'<div><i class="l" style="height:'+Math.max(6,c/mxc*100).toFixed(0)+'%"></i></div>').join('')+'</div><div class="cl">'+wks.map(w=>'<span>'+w+'</span>').join('')+'</div><div class="cap">Sessões por semana</div>');
    first.before(p);
    const gl=mp.querySelector('.gloss'); if(gl){ const d=fold('Glossário',[]); d.appendChild(gl); mp.querySelector('.foot').before(d); }
  }
})();
