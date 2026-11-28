// ---------- Coerência: uma só linguagem visual em toda a app ----------
// Regras (carrega por último, por isso ganha às folhas de estilo injetadas antes):
// 1. Cartões 16 px, mosaicos e botões de número 12 px, todos os botões de ação em forma de pílula.
// 2. Vermelho só para registar (o botão flutuante "+ Registar" e o "Feito" da folha). Ação principal: pílula azul-escura.
//    Ação secundária: pílula cinzenta clara. Escolha entre opções: pílulas num trilho, a escolhida a azul-escuro.
// 3. Voltar é sempre o mesmo botão flutuante, em baixo à esquerda, em frente ao "+ Registar".
(function(){
  const {t: T} = I18N;
  const st = document.createElement('style');
  st.textContent = `
html body{--r-card:16px;--r-tile:12px;--navy-ink:#0E1A2E;--soft:rgba(14,26,46,.07)}
/* cartões */
html body .card,html body .wc-card,html body .rsp,html body .wc-hero,html body .el-menu,html body .bal,html body #pg-plano .wc-card,html body .wc-sh-c .wc-card{border-radius:var(--r-card)!important}
html body .wc-big div,html body .wc-cd div{border-radius:var(--r-tile)}
html body h2{font-weight:700}
/* ação principal: pílula azul-escura */
html body .wc-go:not(.alt),html body button.pri,html body .cb.pri,html body #tgsave{border-radius:999px!important;background:var(--navy-ink)!important;color:#fff!important;border:0!important;min-height:52px;font-weight:700;box-shadow:0 4px 14px rgba(14,26,46,.18)}
/* ação secundária: pílula clara */
html body .wc-go.alt,html body .more-btn,html body .fc-sec,html body .tgbtns button:not(.pri),html body .ctm,html body .wc-links button,html body .mbtn{border-radius:999px!important;background:var(--soft)!important;color:var(--ink)!important;border:0!important;box-shadow:none!important}
html body .wc-go.alt,html body .more-btn,html body .fc-sec,html body .tgbtns button:not(.pri){min-height:48px;font-weight:700}
/* atalhos da Carga: uma fila de pílulas */
html body .wc-links{display:flex!important;gap:8px;overflow-x:auto;scrollbar-width:none;margin:8px 0 14px}
html body .wc-links::-webkit-scrollbar{display:none}
html body .wc-links button{flex:none;min-height:44px;padding:0 16px;white-space:nowrap;font:600 15px var(--font-body)}
/* escolha entre opções: trilho com pílulas */
html body .seg,html body .cseg{border-radius:999px!important;background:var(--soft)!important;border:0!important;padding:4px!important;gap:4px;box-shadow:none!important}
html body .seg button,html body .cseg button{border-radius:999px!important;border:0!important;background:transparent!important;color:var(--ink)!important;box-shadow:none!important}
html body .seg button[aria-pressed="true"],html body .cseg button[aria-pressed="true"]{background:var(--navy-ink)!important;color:#fff!important}
html body #pg-coach .cseg{border:0!important;border-radius:999px!important;background:var(--soft)!important;padding:4px!important;gap:4px}
html body #pg-coach .cseg button{border-radius:999px!important;background:transparent!important}
html body #pg-coach .cseg button[aria-pressed="true"]{background:var(--navy-ink)!important;color:#fff!important}
/* chips dentro dos painéis escuros */
html body .hero button,html body .ch .chips button,html body [class*="hero"] .chips button{border-radius:999px}
/* números e passos: 12 px */
html body .el-seg button,html body .el-rpe button,html body .wc-step button,html body .crate button{border-radius:var(--r-tile)!important}
html body .el-rpe button.on{background:var(--navy-ink)!important}
/* setas de dia: círculos */
html body .wc-dnav button,html body .cday button{border-radius:999px!important;min-width:44px;min-height:44px}
/* apagar: discreto e com alvo de 44 px */
html body .bal-del{border:0!important;background:none!important;color:var(--ink-muted)!important;min-width:44px;min-height:44px;border-radius:999px;font-size:16px}
/* Mundial: o registo é o botão flutuante, como em todas as páginas */
html body .wc-fab[hidden]{display:flex!important}
html body #pg-mundial .wc-go[data-go="diario"]{display:none!important}
html body #pg-mundial::after{content:"";display:block;height:64px}
/* voltar: botão flutuante à esquerda (o de cima sai) */
html body .ph-bk,html body .el-pg-b{display:none!important}
html body .el-pg-h{padding-left:16px!important;min-height:52px}
.co-bk{position:fixed;left:max(16px,env(safe-area-inset-left,0px));bottom:calc(78px + env(safe-area-inset-bottom,0px));z-index:40;display:flex;align-items:center;gap:4px;min-height:52px;padding:0 18px 0 14px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--ink);font:700 15px var(--font-body);box-shadow:0 6px 18px rgba(14,26,46,.18);cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
.co-bk b{font:700 22px/1 var(--font-body)}
.co-bk[hidden]{display:none!important}
.el-pg .co-bk{z-index:75;bottom:calc(20px + env(safe-area-inset-bottom,0px))}
html body .el-pg-c{padding-bottom:calc(96px + env(safe-area-inset-bottom,0px))!important}
/* datas: no iPhone o campo de data tem largura mínima própria e sai da caixa; assim cabe sempre */
html body input[type="date"],html body input[type="time"],html body input[type="month"],html body input[type="datetime-local"]{-webkit-appearance:none;appearance:none;display:block;width:100%;min-width:0;max-width:100%;box-sizing:border-box;min-height:44px;text-align:left}
html body input[type="date"]::-webkit-date-and-time-value,html body input[type="time"]::-webkit-date-and-time-value,html body input[type="month"]::-webkit-date-and-time-value{text-align:left;margin:0}
html body input[type="date"]::-webkit-datetime-edit,html body input[type="time"]::-webkit-datetime-edit{padding:0}
html body .el-f > *,html body .wc-tgt > *,html body label{min-width:0}
/* toque: o botão encolhe um pouco, como o "+ Registar" */
html body .wc-fab,html body .co-bk,html body .wc-go,html body button.pri,html body .cb.pri{transition:transform .12s ease}
html body .wc-fab:active,html body .co-bk:active,html body .wc-go:active,html body button.pri:active,html body .cb.pri:active{transform:scale(.96)}
@media (prefers-reduced-motion: reduce){html body .wc-fab,html body .co-bk,html body .wc-go,html body button.pri,html body .cb.pri{transition:none}}
`;
  document.head.appendChild(st);

  // voltar nas subpáginas (Semana, Evolução, Sessões, Troféus, Plano)
  const bk = document.createElement('button'); bk.type = 'button'; bk.className = 'co-bk'; bk.hidden = true;
  document.body.appendChild(bk);
  const sync = () => {
    const on = document.querySelector('.pg.on'), src = on && on.querySelector(':scope > .ph .ph-bk');
    if(!src){ bk.hidden = true; return; }
    bk.hidden = false; bk.innerHTML = '<b>‹</b>'+src.textContent.replace('‹','').trim(); bk._src = src;
  };
  bk.addEventListener('click', () => { const s = bk._src; if(s && s.isConnected) s.click(); else history.back(); });
  const watch = () => document.querySelectorAll('.pg').forEach(p => { if(p._co) return; p._co = 1; new MutationObserver(sync).observe(p, {attributes:true, attributeFilter:['class'], childList:true}); });
  // páginas escondidas: o mesmo botão, dentro da página por cima
  const pg = document.querySelector('.el-pg');
  if(pg){ const b2 = document.createElement('button'); b2.type = 'button'; b2.className = 'co-bk'; b2.innerHTML = '<b>‹</b>'+T('Voltar','Back');
    b2.addEventListener('click', () => { const x = pg.querySelector('.el-pg-b'); if(x) x.click(); }); pg.appendChild(b2); }
  const go = () => { watch(); sync(); };
  if(document.readyState==='loading') addEventListener('DOMContentLoaded', go); else go();
  addEventListener('load', go);
})();
