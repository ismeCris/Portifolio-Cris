// ===== Alternar tema (escuro é o padrão) =====
document.getElementById('tg').onclick = function () {
  var r = document.documentElement;
  var atual = r.getAttribute('data-theme') || 'dark';
  r.setAttribute('data-theme', atual === 'dark' ? 'light' : 'dark');
};

// ===== Efeito de digitação =====
(function () {
  var el = document.getElementById('type');
  var frases = ['Desenvolvedora ', 'Analista de suporte'];
  var reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzir) { el.textContent = frases[0]; return; }

  var f = 0, i = 0, apagando = false;
  function tick() {
    var txt = frases[f];
    el.textContent = txt.slice(0, i);
    if (!apagando && i === txt.length) { apagando = true; return setTimeout(tick, 1600); }
    if (apagando && i === 0) { apagando = false; f = (f + 1) % frases.length; }
    i += apagando ? -1 : 1;
    setTimeout(tick, apagando ? 35 : 75);
  }
  tick();
})();

// ===== Animação ao rolar =====
(function () {
  var itens = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    itens.forEach(function (e) { e.classList.add('visible'); });
    return;
  }
  var io = new IntersectionObserver(function (lista) {
    lista.forEach(function (l) {
      if (l.isIntersecting) { l.target.classList.add('visible'); io.unobserve(l.target); }
    });
  }, { threshold: 0.15 });
  itens.forEach(function (e) { io.observe(e); });
})();

// ===== Gatinho 3D (carrega o módulo gato.js) =====
import('./gato.js').catch(function (err) {
  console.warn('O gatinho não carregou:', err);
});