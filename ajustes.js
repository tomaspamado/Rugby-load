// ---------- Ajustes: correções de erros, rácio de carga único, tab bar com 7 separadores, contraste e alvos de toque ----------
(function(){
  // 1) Uma só definição de "carga vs. habitual": soma dos últimos 7 dias / (soma dos últimos 28 dias / 4).
  //    renderLatest, renderLoad e as medalhas passam todos a usar o mesmo número.
  meanRd = function(days, ref){
    const end = new Date(ref.date+'T00:00:00').getTime();
    const xs = SESSIONS.filter(s=>{const t=new Date(s.date+'T00:00:00').getTime(); return end-t < days*DAY && t<=end;});
    const sum = xs.reduce((a,s)=>a+s.rd,0);
    return days===28 ? sum/4 : sum;
  };

  // 2) Evolução: filtros que dão lista vazia já não partem os gráficos; canvases são sempre limpos antes de recriar.
  const _build = build;
  const ids = ['cDist','cHsr','cAcc','cSpd'];
  const note = document.createElement('div'); note.className='card sub'; note.id='evEmpty'; note.hidden = true;
  const chartsBox = document.querySelector('#s-evol .charts'); if(chartsBox) chartsBox.before(note);
  build = function(){
    const pool = SESSIONS.filter(s=>(teamFilter==='all'||teamOf(s)===teamFilter)&&(typeFilter==='all'||(typeFilter==='match'?s.type==='Match':s.type!=='Match')));
    if(!pool.length){
      ids.forEach(id=>{ const c = Chart.getChart(id); if(c){ charts = charts.filter(x=>x!==c); c.destroy(); } });
      note.textContent = 'Sem sessões com este filtro ('+(teamFilter==='all'?'todas as equipas':teamFilter)+' · '+(typeFilter==='match'?'jogos':'treinos')+'). Experimenta outra combinação.';
      note.hidden = false; if(chartsBox) chartsBox.hidden = true; return;
    }
    note.hidden = true; if(chartsBox) chartsBox.hidden = false;
    document.querySelectorAll('canvas').forEach(cv=>{ const c = Chart.getChart(cv); if(c) c.destroy(); });
    charts = [];
    _build();
  };

  // 3) Medalha "Carga certa" só em semanas fechadas (já tratado em trofeus.js); aqui só o resto da interface.
  renderLatest(SESSIONS[+document.getElementById('pick').value]);

  // 4) Tabela de sessões: cabeçalhos curtos para caber em 320 px
  const th = document.querySelectorAll('#pg-mais table.log thead th');
  ['Data','Tipo','Dist. m','Rápida m','Acel.','Km/h'].forEach((t,i)=>{ if(th[i]) th[i].textContent = t; });

  // 5) CSS: acrescentado no fim do body para ganhar a ordem de cascata
  const s = document.createElement('style');
  s.textContent = ''
  // tab bar com 7 separadores
  +'.tabbar button{font-size:10px;letter-spacing:0;padding-left:0;padding-right:0;min-width:0}.tabbar svg{width:22px;height:22px}.tabbar button span{max-width:100%;overflow:hidden;text-overflow:clip;white-space:nowrap}'
  // sem risca lateral nos títulos, tamanhos mais calmos nos blocos que abrem
  +'h2::before{display:none!important}h2{font-size:22px}'
  +'details.fold>summary{font:600 15px/1.25 Inter,system-ui,sans-serif;padding:10px 14px;min-height:44px}details.fold>summary span{min-width:0}'
  +'details.more>summary,.pos summary{min-height:44px;display:flex;align-items:center}'
  // semana a 320 px: sem overflow
  +'.chips{grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))!important}'
  // alvos de toque
  +'.seg button{min-height:44px;padding:6px 14px}.log tr.row td{padding-top:13px;padding-bottom:13px}'
  // tabela de sessões compacta
  +'.log{font-size:12.5px}.log th,.log td{padding-left:4px!important;padding-right:4px!important}'
  // contraste
  +'.t-good{color:#1F5A2B}.t-warn{color:#7A5300}.trk .av i,.dp .av i{color:#7A5300}'
  +'.rsp .cl span{color:#fff;opacity:.85;white-space:normal;overflow:visible;line-height:1.1;overflow-wrap:anywhere}'
  // evolução: sem a pilha de filtros antes dos dados
  +'#s-evol .head{display:block}';
  document.body.appendChild(s);
})();
