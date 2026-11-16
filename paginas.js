// ---------- Painéis de resumo nas outras páginas (mesmo estilo do Hoje) ----------
(function(){
  // estilos: em style.css (secção Painéis de resumo (Semana, Evolução, Jogos, Corpo, Mais))
  const mk = html => { const s=document.createElement('section'); s.className='rsp'; s.innerHTML=html; return s; };
  const fold = (title, nodes, id) => { const d=document.createElement('details'); d.className='fold'; if(id) d.id=id; d.innerHTML='<summary><span>'+title+'</span></summary>'; nodes.forEach(n=>n&&d.appendChild(n)); return d; };
  const pct = (v,p)=> p>0 ? (v/p-1)*100 : null;
  const dl = (v,p)=>{ const x=pct(v,p); if(x==null) return ''; const c = Math.abs(x)<5?'nt':(x>0?'up':'dn'); return '<small class="'+c+'">'+(x>=5?'▲':x<=-5?'▼':'●')+' '+(x>=0?'+':'')+Math.round(x)+'% vs. semana anterior</small>'; };

  // ---- SEMANA ----
  // semana em curso sem sessões: o alvo de distância e corrida rápida é o P75 dos backs desta mesma semana (só se sabe com o relatório)
  const demandBox = w => { const D = typeof demandOf==='function' ? demandOf(w) : null;
    if(!D) return '<small class="tgsrc">Distância e corrida rápida: o alvo é o percentil 75 (top 25%) dos backs nesta mesma semana. Aparece quando adicionares o relatório da semana '+w+'.</small>';
    return '<div class="g"><div><small>Distância · alvo</small><b>'+f1(D.rd.p75/1000)+'<em>km</em></b><small>P75 · P50 '+f1(D.rd.p50/1000)+' km</small></div><div><small>Corrida rápida · alvo</small><b>'+f0(D.hsr.p75)+'<em>m</em></b><small>P75 · P50 '+f0(D.hsr.p50)+' m</small></div></div>'
      +'<small class="tgsrc">Alvo = percentil 75 (top 25%) dos '+D.n+' backs nesta mesma semana. Estar no P75 é estar pronto para as exigências; acima do P50 estás perto.</small>'; };
  const wk = document.getElementById('s-wk');
  let wkPanel = null;
  function buildWk(){
    const w=selWeek, cut=weekCut(w), cur=wkTot(w,cut), weeks=weekList().reverse(), pw=weeks[weeks.indexOf(w)-1], prv=pw?wkTot(pw,cut):null;
    const accT=ww=>SESSIONS.filter(x=>x.week===ww && dow(x.date)<=cut).reduce((a,x)=>a+x.accel,0);
    const xs=weekSessions(w), cutName=DOWN[cut%7];
    let h='';
    if(!cur){ const pt=pw?wkTot(pw):null; h='<div class="rt">Semana '+w+'</div><small>'+(w===CUR_WEEK?'Começou segunda, '+dshort(weekMon())+'. Ainda sem sessões com GPS.':'Sem sessões com GPS neste período.')+'</small>'+(w===CUR_WEEK&&pt?'<small style="margin-top:8px">Semana '+pw+' fechada: '+f1(pt.rd/1000)+' km em '+pt.n+(pt.n===1?' sessão':' sessões')+', velocidade máx. '+f1(pt.sp)+' km/h.</small>':'')+(w===CUR_WEEK?demandBox(w):''); }
    else {
      const gap=SESSIONS.some(x=>x.gpsGap && (x.week===w||x.week===pw)), ok=prv&&prv.n&&!gap;
      const cell=(l,txt,u,raw,pv)=>'<div><small>'+l+'</small><b>'+txt+(u?'<em>'+u+'</em>':'')+'</b>'+(ok?dl(raw,pv):'')+'</div>';
      h='<div class="rt">Semana '+w+(w===CUR_WEEK?' · até '+cutName.replace('-feira',''):' · completa')+'</div><small>'+cur.n+(cur.n===1?' sessão':' sessões')+(ok?' · a comparar com a semana '+pw+', só até ao mesmo dia':'')+(gap?' · há treinos sem GPS, não comparo':'')+'</small>'
       +'<div class="g">'+cell('Distância',f1(cur.rd/1000),'km',cur.rd,prv?prv.rd:0)+cell('Corrida rápida',f0(cur.hsr),'m',cur.hsr,prv?prv.hsr:0)+cell('Acelerações',f0(accT(w)),'',accT(w),pw?accT(pw):0)+cell('Velocidade máx.',f1(cur.sp),'km/h',cur.sp,prv?prv.sp:0)+'</div>';
      const P = posWeek(w);
      if(P){ const me=P.rows.find(r=>r.me), o=P.rows.filter(r=>r.sh&&!r.me), n=['rd','hsr','acc','sp'].filter(k=>o.every(r=>me[k]>r[k])).length; h+='<span class="chipw">Entre os 3 scrum-halves: #1 em '+n+' de 4</span>'; }
      const days=[1,2,3,4,5,6,7].filter(d=>w!==CUR_WEEK||d<=cut), by=d=>xs.filter(x=>dow(x.date)===d), sm=d=>by(d).reduce((a,x)=>a+x.rd,0), mxv=Math.max(1,...days.map(sm));
      h+='<div class="cols">'+days.map(d=>'<div><em class="bv">'+(sm(d)?f1(sm(d)/1000):'')+'</em><i class="'+(by(d).some(x=>x.type==='Match')?'m':'')+'" style="height:'+(sm(d)?Math.max(3,sm(d)/mxv*52):2).toFixed(0)+'px"></i></div>').join('')+'</div><div class="cl">'+days.map(d=>'<span>'+DS[d%7]+'</span>').join('')+'</div><div class="cap">Distância por dia (km)'+(xs.some(x=>x.type==='Match')?' · vermelho: jogo':'')+'</div>';
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
    // só treinos de equipa completos (sem jogos, sem dias de 2 sessões juntas, sem sessões encurtadas): comparação justa
    const Q = SESSIONS.filter(x=>x.type!=='Match' && !x.combined && !x.shortSession);
    const wks = [...new Set(SESSIONS.map(x=>x.week))].sort((a,b)=>a-b), w1 = wks.slice(-4), w0 = wks.slice(-8,-4);
    const A = Q.filter(x=>w1.includes(x.week)), B = Q.filter(x=>w0.includes(x.week));
    const M = [['rd','Distância','m',f0,10,'mean'],['hsr','Corrida rápida','m',f0,10,'mean'],['accel','Acelerações','',f0,10,'mean'],['maxSpeed','Velocidade máx.','km/h',f1,3,'max']];
    const agg = (xs,k,m)=> xs.length ? (m==='max' ? Math.max(...xs.map(x=>x[k])) : xs.reduce((t,x)=>t+x[k],0)/xs.length) : null;
    const res = M.map(([k,n,u,f,thr,m])=>{ const v=agg(A,k,m), pv=agg(B,k,m), x = (v!=null&&pv)?(v/pv-1)*100:null; return {k,n,u,f,thr,m,v,x,st:x==null?0:(x>=thr?1:x<=-thr?-1:0)}; });
    const up = res.filter(r=>r.st===1).length, dn = res.filter(r=>r.st===-1).length;
    const tile = r=>{ const c = r.x==null||r.st===0?'nt':(r.st>0?'up':'dn');
      return '<div><small>'+r.n+(r.m==='max'?' (melhor)':' (média)')+'</small><b>'+(r.v==null?'-':r.f(r.v))+(r.u?'<em>'+r.u+'</em>':'')+'</b>'+spark(Q.slice(-12).map(s=>s[r.k]))+(r.x==null?'<small>sem dados</small>':'<small class="'+c+'">'+(r.st>0?'▲':r.st<0?'▼':'●')+' '+(r.x>=0?'+':'')+Math.round(r.x)+'% vs. 4 semanas antes</small>')+'</div>'; };
    const teams = x=>[...new Set(x.map(teamOf))].join(' + ');
    const mixed = A.length && B.length && teams(A)!==teams(B);
    const title = !A.length||!B.length ? 'Ainda sem dados para comparar' : (up && dn ? 'Misto: sobe em '+up+', desce em '+dn : up ? 'Em subida em '+up+' de 4' : dn ? 'Em descida em '+dn+' de 4' : 'Estável');
    const p = mk('<small>Estás a evoluir?</small><div class="rt">'+title+'</div><small>Semanas '+w1[0]+' a '+w1[w1.length-1]+' vs. '+(w0.length?w0[0]+' a '+w0[w0.length-1]:'-')+' · só treinos de equipa completos ('+A.length+' vs. '+B.length+')</small><div class="g">'+res.map(tile).join('')+'</div><div class="cap">Subida ou descida só conta a partir de 10% (3% na velocidade).'+(mixed?' Nas duas janelas eras de equipas diferentes ('+teams(B)+' antes, '+teams(A)+' agora): lê como indicação.':'')+'</div>');
    const head = ev.querySelector('.head'); head.after(p);
    const segs = [...ev.querySelectorAll('.head .seg')], flt = document.createElement('div'); flt.className='flt'; segs.forEach(sg=>flt.appendChild(sg));
    const lg = ev.querySelector('.legend'), ch = ev.querySelector('.charts');
    const d = fold('Gráficos completos e filtros',[flt,lg,ch]); p.after(d);
  }

  // ---- JOGOS ----
  const jg = document.getElementById('s-jogos');
  if(jg){
    const G=SESSIONS.filter(s=>s.type==='Match'&&s.fieldTimeMin);
    if(G.length){
      const pm=s=>s.rd/s.fieldTimeMin, best=G.reduce((a,x)=>pm(x)>pm(a)?x:a,G[0]), avg=G.reduce((t,x)=>t+pm(x),0)/G.length, mins=G.reduce((t,x)=>t+x.fieldTimeMin,0), hb=Math.max(...G.map(x=>x.hsr/x.fieldTimeMin)), mx=Math.max(...G.map(pm));
      const p=mk('<div class="rt">'+G.length+' jogos na época</div><small>Intensidade = metros por minuto em campo</small><div class="g c3"><div><small>Melhor jogo</small><b>'+f0(pm(best))+'<em>m/min</em></b><small>vs. '+best.opponent+'</small></div><div><small>Média</small><b>'+f0(avg)+'<em>m/min</em></b><small>dos teus jogos</small></div><div><small>Em campo</small><b>'+f0(mins)+'<em>min</em></b><small>'+f1(hb)+' m/min rápidos no melhor</small></div></div>'
       +'<div class="cols">'+G.map(s=>'<div><em class="bv">'+f0(pm(s))+'</em><i class="'+(s===best?'l':'')+'" style="height:'+Math.max(4,pm(s)/mx*52).toFixed(0)+'px"></i></div>').join('')+'</div><div class="cl">'+G.map(s=>'<span>'+s.opponent+'</span>').join('')+'</div><div class="cap">Metros por minuto em cada jogo</div>');
      jg.querySelector('.sub').after(p);
      const gm=document.getElementById('games'), cards=[...gm.querySelectorAll('.card.game')];
      if(cards.length){ const d=fold('Todos os jogos ('+cards.length+')',cards); gm.appendChild(d); }
    }
  }

  // ---- CORPO ----
  const cp = document.getElementById('s-corpo');
  if(cp && typeof BODY!=='undefined' && BODY.length){
    const b=BODY[BODY.length-1], pv=BODY.length>1?BODY[BODY.length-2]:null, lo=LMI_REF-LMI_SD, hi=LMI_REF+LMI_SD, fx=v=>v==null||isNaN(v)?'–':f1(v);
    const s8=b.s8==null?['nt','não medido']:b.s8<S8_GOOD?['up','Bom']:b.s8<=S8_OK?['dn','Aceitável']:['dn','A melhorar'], lm=b.lmi==null?['nt','não medido']:b.lmi<lo?['dn','Abaixo da referência']:['up','Dentro da referência'];
    const dv=(v,q,u)=>q==null||v==null?'':'<small class="nt">'+(v-q>=0?'+':'')+(v-q).toFixed(1).replace('.',',')+u+' vs. anterior</small>';
    const p=mk('<div class="rt">Medição de '+dshort(b.date)+'</div><small>'+(b.team?b.team+' · ':'')+(b.added?'adicionada na app':'protocolo ISAK')+'</small><div class="g"><div><small>Peso</small><b>'+f1(b.weight)+'<em>kg</em></b>'+dv(b.weight,pv&&pv.weight,' kg')+'</div><div><small>Soma de 8 pregas (Σ8)</small><b>'+fx(b.s8)+'<em>mm</em></b><small class="'+s8[0]+'">'+s8[1]+' (alvo &lt;78)</small></div><div><small>Massa gorda</small><b>'+fx(b.fatPct)+'<em>%</em></b>'+dv(b.fatPct,pv&&pv.fatPct,'%')+'</div><div><small>Índice de massa magra (LMI)</small><b>'+fx(b.lmi)+'</b><small class="'+lm[0]+'">'+lm[1]+'</small></div></div>');
    cp.querySelector('.sub').after(p);
    const bt=document.querySelector('#bodycard .btiles'); if(bt) bt.style.display='none';
  }

  // ---- MAIS ----
  const mp = document.getElementById('pg-mais');
  if(mp){
    const first=mp.querySelector('section'), wks=[...new Set(SESSIONS.map(x=>x.week))].sort((a,b)=>a-b), cnt=wks.map(w=>SESSIONS.filter(x=>x.week===w).length), mxc=Math.max(...cnt), T=window.TROFEUS||{medals:[],level:'-',pts:0};
    const p=mk('<div class="rt">A tua época em números</div><small>Desde '+dshort(SESSIONS[0].date)+' · '+wks.length+' semanas com GPS</small><div class="g c3"><div><small>Sessões</small><b>'+SESSIONS.length+'</b></div><div><small>Jogos</small><b>'+SESSIONS.filter(x=>x.type==='Match').length+'</b></div><div><small>Medalhas</small><b>'+T.medals.length+'</b><small>nível '+T.level+'</small></div></div>'
     +'<div class="cols">'+cnt.map((c,ix)=>'<div><em class="bv">'+c+'</em><i class="'+(ix===cnt.length-1?'l':'')+'" style="height:'+Math.max(4,c/mxc*52).toFixed(0)+'px"></i></div>').join('')+'</div><div class="cl">'+wks.map(w=>'<span>'+w+'</span>').join('')+'</div><div class="cap">Sessões por semana</div>');
    const h=document.createElement('h2'); h.textContent='Mais'; h.className='pgt'; first.before(h); first.before(p);
    const gl=mp.querySelector('.gloss'); if(gl){ const d=fold('Glossário',[]); d.appendChild(gl); gl.parentNode===d||0; mp.querySelector('.foot').before(d); }
  }
})();
