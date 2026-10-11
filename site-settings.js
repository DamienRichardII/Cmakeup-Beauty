/* Réglages généraux du site (admin > Gestion des médias > « Réglages du site »).
   - ville   : remplace « Cergy » partout (titre, descriptions, textes marqués data-city / data-city-replace)
   - adresse : remplace l'adresse affichée (éléments data-site-address : Accueil, Contact)
   Sans réglage enregistré, le texte d'origine reste affiché. */
(function(){
  if(!window.fetch) return;
  var RE = /Cergy(?: \(95\))?/gi;
  function rep(str, v){
    return str.replace(RE, function(m){ return m === m.toUpperCase() && m.length > 1 ? v.toUpperCase() : v; });
  }
  fetch('https://haymfuvlbogtiempezto.supabase.co/rest/v1/page_content?select=block_key,content&page_slug=eq.site', {
    headers: { apikey: 'sb_publishable_koY3vqHccqd5gugGwZJm6g__9Jahr1K' }
  }).then(function(r){ return r.ok ? r.json() : []; }).then(function(rows){
    var s = {};
    (rows || []).forEach(function(r){ if(r && typeof r.content === 'string' && r.content.trim()) s[r.block_key] = r.content.trim(); });
    function apply(){
      if(s.ville){
        var v = s.ville;
        Array.prototype.forEach.call(document.querySelectorAll('[data-city]'), function(e){ e.textContent = v; });
        document.title = rep(document.title, v);
        Array.prototype.forEach.call(document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"]'), function(m){
          var c = m.getAttribute('content'); if(c) m.setAttribute('content', rep(c, v));
        });
        Array.prototype.forEach.call(document.querySelectorAll('[data-city-replace]'), function(e){
          function run(){
            var t = e.textContent, n = rep(t, v);
            if(n !== t){ if(obs) obs.disconnect(); e.textContent = n; if(obs) obs.observe(e, { childList: true, characterData: true, subtree: true }); }
          }
          var obs = window.MutationObserver ? new MutationObserver(run) : null;
          run(); if(obs) obs.observe(e, { childList: true, characterData: true, subtree: true });
        });
      }
      if(s.adresse){
        var a = s.adresse;
        Array.prototype.forEach.call(document.querySelectorAll('[data-site-address]'), function(e){ e.textContent = a; });
      }
    }
    apply();
  }).catch(function(){});
})();

/* Prix modifiables depuis l'admin (Gestion des médias > page concernée > groupes « Prix … »).
   data-cpf-price="clé" / data-price="clé" : le texte de l'élément est remplacé par le prix saisi
                           (clé = prix_cpf, prix_cpf_module1, prix_classique…, ou « page.clé » pour lire le prix d'une autre page).
   data-cpf-show="clé"   : élément masqué (hidden) tant qu'aucun prix n'est saisi.
   data-cpf-option="clé" + data-cpf-label : option de liste « libellé — prix ».
   data-price-option="clé" + data-price-template="… {p} …" : option de liste dont le prix est remplacé par {p}.
   data-price-replace="clé" : le premier prix (nombre + €) du texte est remplacé par le prix saisi (texte éditable de l'admin compris).
   Sans prix saisi, le texte d'origine reste affiché. */
(function(){
  if(!window.fetch) return;
  var SEL = '[data-cpf-price],[data-price],[data-cpf-show],[data-cpf-option],[data-price-option],[data-price-replace]';
  var ATTRS = ['data-cpf-price','data-price','data-cpf-show','data-cpf-option','data-price-option','data-price-replace'];
  var nodes = document.querySelectorAll(SEL);
  if(!nodes.length) return;
  var here = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  function keyOf(n){ for(var i = 0; i < ATTRS.length; i++){ var v = n.getAttribute(ATTRS[i]); if(v) return v; } return ''; }
  function ref(k){ var i = k.indexOf('.'); return i > 0 ? { slug: k.slice(0, i), key: k.slice(i + 1) } : { slug: here, key: k }; }
  var slugs = {};
  Array.prototype.forEach.call(nodes, function(n){ var k = keyOf(n); if(k) slugs[ref(k).slug] = 1; });
  fetch('https://haymfuvlbogtiempezto.supabase.co/rest/v1/page_content?select=page_slug,block_key,content&page_slug=in.(' + Object.keys(slugs).join(',') + ')&block_key=like.prix_*', {
    headers: { apikey: 'sb_publishable_koY3vqHccqd5gugGwZJm6g__9Jahr1K' }
  }).then(function(r){ return r.ok ? r.json() : []; }).then(function(rows){
    var map = {};
    (rows || []).forEach(function(r){ if(r && typeof r.content === 'string' && r.content.trim()) map[r.page_slug + '.' + r.block_key] = r.content.trim(); });
    function val(k){ var r = ref(k); return map[r.slug + '.' + r.key] || ''; }
    var PRICE_RE = /\d[\d   ]*\s?€/;
    Array.prototype.forEach.call(nodes, function(n){
      var k, v;
      if((k = n.getAttribute('data-cpf-price') || n.getAttribute('data-price')) && (v = val(k))) n.textContent = v;
      if((k = n.getAttribute('data-cpf-show')) && val(k)) n.removeAttribute('hidden');
      if((k = n.getAttribute('data-cpf-option')) && (v = val(k))) n.textContent = (n.getAttribute('data-cpf-label') || 'Financement CPF') + ' — ' + v;
      if((k = n.getAttribute('data-price-option')) && (v = val(k))) n.textContent = (n.getAttribute('data-price-template') || '{p}').replace('{p}', v);
      if((k = n.getAttribute('data-price-replace')) && (v = val(k))){
        var obs = null;
        var run = function(){
          var t = n.textContent, u = t.replace(PRICE_RE, v);
          if(u !== t){ if(obs) obs.disconnect(); n.textContent = u; if(obs) obs.observe(n, { childList: true, characterData: true, subtree: true }); }
        };
        if(window.MutationObserver) obs = new MutationObserver(run);
        run(); if(obs) obs.observe(n, { childList: true, characterData: true, subtree: true });
      }
    });
  }).catch(function(){});
})();
