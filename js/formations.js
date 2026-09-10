/* =========================================================
   CMAKEUP BEAUTY PROFESSIONAL — formations.js
   Filtres de la page formations + interactions mineures
   ========================================================= */
(function () {
  "use strict";

  // Les filtres génériques (.filter-chip / data-filter-group) sont gérés
  // par main.js. Ce fichier reste dédié aux comportements spécifiques
  // aux formations (ex : mise en avant de la formation recommandée).

  var params = new URLSearchParams(window.location.search);
  var highlightId = params.get("id");
  if (highlightId) {
    var target = document.querySelector('[data-training-id="' + CSS.escape(highlightId) + '"]');
    if (target) {
      target.classList.add("is-selected");
    }
  }
})();
