/* =========================================================
   CMAKEUP BEAUTY PROFESSIONAL — reservation.js
   Interface frontend de réservation — prête à être connectée
   à une API / un backend. Aucune réservation n'est réellement
   validée tant qu'aucun endpoint n'est branché (voir submitBooking).
   ========================================================= */
(function () {
  "use strict";

  var form = document.getElementById("booking-form");
  if (!form) return;

  var state = {
    service: null,
    date: null,
    slot: null,
  };

  var steps = Array.from(document.querySelectorAll(".booking-step"));
  var panels = Array.from(document.querySelectorAll(".booking-panel"));
  var currentStep = 1;

  function goToStep(n) {
    currentStep = n;
    steps.forEach(function (step) {
      var stepNum = Number(step.getAttribute("data-step"));
      step.classList.toggle("is-active", stepNum === n);
      step.classList.toggle("is-done", stepNum < n);
    });
    panels.forEach(function (panel) {
      panel.classList.toggle("is-active", Number(panel.getAttribute("data-panel")) === n);
    });
    window.scrollTo({ top: form.offsetTop - 120, behavior: "smooth" });
  }

  document.querySelectorAll("[data-next-step]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!validateStep(currentStep)) return;
      goToStep(currentStep + 1);
      if (currentStep === 5) renderRecap();
    });
  });
  document.querySelectorAll("[data-prev-step]").forEach(function (btn) {
    btn.addEventListener("click", function () { goToStep(currentStep - 1); });
  });

  function validateStep(step) {
    if (step === 1 && !state.service) {
      alert("Merci de choisir une prestation avant de continuer.");
      return false;
    }
    if (step === 2 && !state.date) {
      alert("Merci de choisir une date.");
      return false;
    }
    if (step === 3 && !state.slot) {
      alert("Merci de choisir un créneau.");
      return false;
    }
    if (step === 4) {
      var required = form.querySelectorAll("[data-step-4] [required]");
      for (var i = 0; i < required.length; i++) {
        if (!required[i].value) {
          required[i].focus();
          return false;
        }
      }
    }
    return true;
  }

  /* ---------- Étape 1 : choix de la prestation ----------
     À BRANCHER : remplacer les cartes statiques du HTML par un
     appel loadServices() vers l'API prestations quand elle existera. */
  function loadServices() {
    // Point d'intégration API : GET /api/services
    // Pour le moment, les prestations sont listées statiquement dans reservation.html
  }

  document.querySelectorAll(".service-choice").forEach(function (card) {
    card.addEventListener("click", function () {
      document.querySelectorAll(".service-choice").forEach(function (c) { c.classList.remove("is-selected"); });
      card.classList.add("is-selected");
      state.service = {
        name: card.querySelector(".service-choice__title").textContent.trim(),
        price: card.querySelector(".service-choice__price").textContent.trim(),
      };
    });
  });

  /* ---------- Étape 2 : date ---------- */
  var dateInput = document.getElementById("booking-date");
  if (dateInput) {
    var today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
    dateInput.addEventListener("change", function () {
      state.date = dateInput.value;
      loadAvailableSlots(state.date);
    });
  }

  /* ---------- Étape 3 : créneaux ----------
     À BRANCHER : remplacer par un appel loadAvailableSlots(date) vers
     l'API de disponibilité réelle (GET /api/slots?date=...). */
  function loadAvailableSlots(date) {
    // Placeholder de créneaux génériques tant qu'aucun backend n'est connecté.
    var slotGrid = document.querySelector(".slot-grid");
    if (!slotGrid) return;
    slotGrid.querySelectorAll(".slot-btn").forEach(function (btn) {
      btn.classList.remove("is-selected");
      btn.disabled = false;
    });
  }

  document.querySelectorAll(".slot-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".slot-btn").forEach(function (b) { b.classList.remove("is-selected"); });
      btn.classList.add("is-selected");
      state.slot = btn.textContent.trim();
    });
  });

  /* ---------- Étape 5 : récapitulatif ---------- */
  function renderRecap() {
    var recap = document.getElementById("booking-recap");
    if (!recap) return;
    var formData = new FormData(form);
    recap.innerHTML = [
      row("Prestation", state.service ? state.service.name + " — " + state.service.price : "—"),
      row("Date", state.date || "—"),
      row("Créneau", state.slot || "—"),
      row("Prénom", formData.get("firstname") || "—"),
      row("Nom", formData.get("lastname") || "—"),
      row("Email", formData.get("email") || "—"),
      row("Téléphone", formData.get("phone") || "—"),
      row("Notes", formData.get("notes") || "—"),
    ].join("");
  }
  function row(label, value) {
    return '<div class="row"><span>' + label + "</span><span>" + escapeHtml(value) + "</span></div>";
  }
  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------- Étape 6 : soumission ----------
     À BRANCHER : remplacer par un appel réel POST /api/bookings.
     Tant qu'aucun backend n'existe, on affiche uniquement une
     confirmation de PRISE EN COMPTE de la demande (pas de réservation
     réellement validée), conformément aux règles du projet. */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateStep(4)) return;
    submitBooking();
  });

  function submitBooking() {
    // Point d'intégration API : POST /api/bookings { service, date, slot, client }
    goToStep(6);
  }

  loadServices();
  goToStep(1);
})();
