// ---------- Estrutura: cada separador responde a uma pergunta ----------
// Hoje      → o que faço hoje? (contagem, check-in com o plano do dia, pontos, próximo passo)
// Rotinas   → como faço? (prehab, recuperação, mental, skills)
// Seleção   → como chego aos 23? (plano até ao Mundial, treinador, jogos, testes de skills, os outros 9)
// Carga     → o que dizem os dados? (GPS, carga, semana, evolução, sessões e definições)
// Corpo     → peso, força e salto
// Nada se repete: a comparação com os 9 só vive em Seleção, a prontidão só no Hoje.
(function(){
  const {t: T} = I18N;
  const byId = id => document.getElementById('pg-'+id);

  // o Plano deixou de ser uma página à parte: vive dentro de Seleção
  const _show = showTab;
  showTab = function(n){ return _show(n==='plano' ? 'rivais' : n); };

  const st = document.createElement('style');
  st.textContent = `
html body #pg-plano.st-plan{display:block!important;background:none!important;border:0!important;padding:0!important;margin:0!important;box-shadow:none!important}
html body #pg-plano.st-plan > header{display:none}
html body #pg-plano.st-plan::after{display:none}
html body #pg-plano.st-plan > .el-menu,html body #pg-rivais > .el-menu{position:relative;overflow:visible;margin-top:34px}
html body #pg-plano.st-plan > .el-menu::before,html body #pg-rivais > .el-menu::before{position:absolute;left:4px;top:-24px;font:700 12px/1.2 var(--font-body);letter-spacing:.1em;text-transform:uppercase;color:var(--ink-muted)}
html body #pg-plano.st-plan > .el-menu::before{content:var(--st-l1)}
html body #pg-rivais > .el-menu::before{content:var(--st-l2)}
html body .el-cg > .el-v,html body .el-cg > h2 + .sub{display:none}
.st-day{margin:2px 0 10px;font-size:14px;line-height:1.45}
.st-day b{color:var(--ink)}
`;
  document.head.appendChild(st);
  document.documentElement.style.setProperty('--st-l1', JSON.stringify(T('Plano até ao Mundial','Plan to the World Cup')));
  document.documentElement.style.setProperty('--st-l2', JSON.stringify(T('Tu contra os outros 9','You against the other 9s')));

  function fix(){
    // barra de baixo: nomes que dizem o que lá está
    const bar = document.getElementById('tabbar');
    if(bar){ const lab = (p, t) => { const s = bar.querySelector('[data-p="'+p+'"] span'); if(s && s.textContent!==t) s.textContent = t; };
      lab('mundial', T('Hoje','Today')); lab('rivais', T('Seleção','Selection')); }

    // Seleção = Plano + os outros 9
    const pR = byId('rivais'), pP = byId('plano');
    if(pR && pP){
      if(pP.parentElement!==pR || !pP.classList.contains('st-plan')){
        pP.classList.remove('pg','on'); pP.classList.add('wc-card','st-plan');
      }
      const h = pR.querySelector(':scope > .ph');
      if(h){ const h1 = h.querySelector('h1'); if(h1 && h1.textContent!==T('Seleção','Selection')) h1.textContent = T('Seleção','Selection');
        let s = h.querySelector('.ph-s'); if(!s){ s = document.createElement('div'); s.className = 'ph-s'; h.appendChild(s); }
        const sub = T('O caminho até aos 23: plano, treinador, jogos e os outros 9.','The road to the 23: plan, coach, matches and the other 9s.'); if(s.textContent!==sub) s.textContent = sub; }
      // ordem: cabeçalho · Plano (com o seu menu) · menu dos rivais
      const anchor = h || null;
      if(anchor){ if(anchor.nextElementSibling!==pP) anchor.after(pP); } else if(pR.firstElementChild!==pP) pR.prepend(pP);
    }

    // a comparação semanal com os 9 e os 3/4 também é Seleção (sai da Carga)
    const comp = document.getElementById('s-comp'); if(pR && comp && comp.parentElement!==pR) pR.appendChild(comp);

    // Hoje: sem a corrida ao 9 (está em Seleção)
    const pM = byId('mundial');
    if(pM){ [...pM.querySelectorAll(':scope > .wc-card')].forEach(c => { if(c.querySelector('[data-go="rivais"]')) c.remove(); }); }

    // check-in: o plano do dia vem logo por baixo do título (era o que a Carga dizia à parte)
    const ck = document.querySelector('.el-ck');
    if(ck && !ck.querySelector('.st-day')){
      const p = typeof dayPlan==='function' ? dayPlan() : null, h2 = ck.querySelector('h2');
      if(p && typeof DAYTXT!=='undefined' && DAYTXT[p.k] && h2){ const d = document.createElement('div'); d.className = 'st-day sub';
        d.innerHTML = '<b>'+T('Plano do dia: ','Today\'s plan: ')+'</b>'+T(DAYTXT[p.k][1], DAYTXT[p.k][2]); h2.after(d); }
    }

    // Carga: o cartão do topo fica só com os números de carga
    const cg = document.querySelector('.el-cg > h2');
    if(cg && cg.textContent!==T('Carga interna e velocidade','Internal load and speed')) cg.textContent = T('Carga interna e velocidade','Internal load and speed');
  }

  let busy = false;
  const run = () => { if(busy) return; busy = true; try{ fix(); } finally { busy = false; } };
  const watch = () => {
    ['mundial','rivais','hoje'].forEach(id => { const p = byId(id); if(p && !p._st){ p._st = 1; new MutationObserver(run).observe(p, {childList:true, subtree:false}); } });
    const pP = byId('plano'); if(pP && !pP._st){ pP._st = 1; new MutationObserver(run).observe(pP, {childList:true}); }
    const ck = document.querySelector('.el-ck'); if(ck && !ck._st){ ck._st = 1; new MutationObserver(run).observe(ck, {childList:true}); }
    const cg = document.querySelector('.el-cg'); if(cg && !cg._st){ cg._st = 1; new MutationObserver(run).observe(cg, {childList:true}); }
    run();
  };
  if(document.readyState==='loading') addEventListener('DOMContentLoaded', () => setTimeout(watch, 0)); else setTimeout(watch, 0);
  addEventListener('load', watch);
})();
