/* =========================================================
   CMAKEUP BEAUTY PROFESSIONAL — main.js
   Header scroll, menu mobile, reveal au scroll, FAQ, tracks
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Header scroll ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 24) {
        header.classList.add("is-scrolled");
      } else if (!header.classList.contains("header--solid")) {
        header.classList.remove("is-scrolled");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Menu mobile (burger) ---------- */
  var burger = document.querySelector(".burger");
  var mobileNav = document.querySelector(".mobile-nav");
  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Reveal au scroll (IntersectionObserver) ---------- */
  var revealTargets = document.querySelectorAll(".reveal, .reveal-stagger, .reveal-zoom");
  if (revealTargets.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );
      /* Léger délai avant observation : évite que les éléments déjà
         visibles au chargement (ex. bloc hero) passent en is-visible
         instantanément et rendent l'animation d'apparition imperceptible. */
      window.setTimeout(function () {
        revealTargets.forEach(function (el) { io.observe(el); });
      }, 200);
    } else {
      revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  /* ---------- FAQ accordéon ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;
    question.addEventListener("click", function () {
      var isOpen = question.getAttribute("aria-expanded") === "true";
      // Ferme les autres items du même groupe
      var group = item.closest(".faq-list");
      if (group) {
        group.querySelectorAll(".faq-question[aria-expanded='true']").forEach(function (q) {
          if (q !== question) {
            q.setAttribute("aria-expanded", "false");
            var a = q.closest(".faq-item").querySelector(".faq-answer");
            if (a) a.style.maxHeight = null;
          }
        });
      }
      question.setAttribute("aria-expanded", String(!isOpen));
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + "px" : null;
    });
  });

  /* ---------- Tracks horizontaux (prestations, etc.) avec flèches ---------- */
  document.querySelectorAll("[data-track]").forEach(function (wrap) {
    var track = wrap.querySelector(".services-track, .instagram-grid");
    var prev = wrap.querySelector("[data-track-prev]");
    var next = wrap.querySelector("[data-track-next]");
    if (!track) return;
    var scrollAmount = function () {
      var card = track.querySelector(":scope > *");
      return card ? card.getBoundingClientRect().width + 20 : 300;
    };
    if (prev) prev.addEventListener("click", function () {
      track.scrollBy({ left: -scrollAmount(), behavior: "smooth" });
    });
    if (next) next.addEventListener("click", function () {
      track.scrollBy({ left: scrollAmount(), behavior: "smooth" });
    });
  });

  /* ---------- Filtres à onglets (chips) génériques ---------- */
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var chips = group.querySelectorAll(".filter-chip");
    var targetSelector = group.getAttribute("data-filter-group");
    var items = document.querySelectorAll(targetSelector);
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        var value = chip.getAttribute("data-filter-value");
        items.forEach(function (item) {
          var cat = item.getAttribute("data-category");
          item.hidden = value !== "all" && cat !== value;
        });
      });
    });
  });

  /* ---------- Année footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
