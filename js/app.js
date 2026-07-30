(function () {
  "use strict";

  var STORAGE_POINTS = "livelo_demo_points";
  var STORAGE_HISTORY = "livelo_demo_history";
  var STARTING_POINTS = 18500;

  var REWARDS = [
    {
      id: "smiles-1000",
      category: "passagens",
      partner: "Smiles",
      title: "1.000 milhas Smiles",
      desc: "Transfira pontos para o programa Smiles e use em passagens aéreas.",
      cost: 1000,
      icon: "✈️",
      color: "#ff7a3d",
    },
    {
      id: "latampass-1000",
      category: "passagens",
      partner: "LATAM Pass",
      title: "1.000 milhas LATAM Pass",
      desc: "Converta pontos Livelo em milhas LATAM Pass com bônus sazonal.",
      cost: 1200,
      icon: "🛫",
      color: "#1c2b6b",
    },
    {
      id: "azul-1000",
      category: "passagens",
      partner: "TudoAzul",
      title: "1.000 pontos TudoAzul",
      desc: "Transfira para o TudoAzul e voe com a Azul Linhas Aéreas.",
      cost: 1100,
      icon: "🔷",
      color: "#0072ce",
    },
    {
      id: "amazon-50",
      category: "produtos",
      partner: "Amazon",
      title: "Vale-compras R$ 50",
      desc: "Crédito para usar em compras selecionadas na Amazon.",
      cost: 5000,
      icon: "📦",
      color: "#232f3e",
    },
    {
      id: "casasbahia-fone",
      category: "produtos",
      partner: "Casas Bahia",
      title: "Fone de ouvido Bluetooth",
      desc: "Fone sem fio com estojo de carregamento, entrega em até 10 dias úteis.",
      cost: 8900,
      icon: "🎧",
      color: "#e30613",
    },
    {
      id: "netshoes-tenis",
      category: "produtos",
      partner: "Netshoes",
      title: "Vale-compras R$ 100",
      desc: "Use o vale para tênis, roupas e acessórios esportivos.",
      cost: 9800,
      icon: "👟",
      color: "#000000",
    },
    {
      id: "ifood-30",
      category: "vale",
      partner: "iFood",
      title: "Vale iFood R$ 30",
      desc: "Peça sua comida favorita com este vale-presente digital.",
      cost: 3200,
      icon: "🍔",
      color: "#ea1d2c",
    },
    {
      id: "netflix-25",
      category: "vale",
      partner: "Gift Card",
      title: "Gift Card streaming R$ 25",
      desc: "Créditos para assinatura de serviços de streaming.",
      cost: 2700,
      icon: "🎬",
      color: "#8b0000",
    },
    {
      id: "magalu-40",
      category: "vale",
      partner: "Magalu",
      title: "Vale-compras R$ 40",
      desc: "Válido em milhares de produtos no site do Magalu.",
      cost: 4300,
      icon: "🛒",
      color: "#0086ff",
    },
    {
      id: "doacao-criancas",
      category: "doacao",
      partner: "Instituto Amigo",
      title: "Doação para ONGs infantis",
      desc: "Converta pontos em doação para instituições parceiras cadastradas.",
      cost: 1500,
      icon: "❤️",
      color: "#c2185b",
    },
    {
      id: "doacao-ambiental",
      category: "doacao",
      partner: "Plantar Futuro",
      title: "Plantio de árvores",
      desc: "Cada resgate financia o plantio de mudas nativas.",
      cost: 800,
      icon: "🌱",
      color: "#2e7d32",
    },
    {
      id: "emirates-2000",
      category: "passagens",
      partner: "Emirates Skywards",
      title: "2.000 milhas Emirates",
      desc: "Transferência internacional para voos com a Emirates.",
      cost: 2600,
      icon: "🌍",
      color: "#d4145a",
    },
  ];

  var state = {
    points: 0,
    history: [],
    category: "todos",
    search: "",
    pendingReward: null,
  };

  var els = {};

  function init() {
    els.pointsValue = document.getElementById("pointsValue");
    els.pointsValueHero = document.getElementById("pointsValueHero");
    els.rewardsGrid = document.getElementById("rewardsGrid");
    els.categoryTabs = document.getElementById("categoryTabs");
    els.searchInput = document.getElementById("searchInput");
    els.historyList = document.getElementById("historyList");
    els.historyEmpty = document.getElementById("historyEmpty");
    els.modalOverlay = document.getElementById("modalOverlay");
    els.modalBody = document.getElementById("modalBody");
    els.modalClose = document.getElementById("modalClose");
    els.toast = document.getElementById("toast");

    loadState();
    renderPoints();
    renderRewards();
    renderHistory();

    els.categoryTabs.addEventListener("click", onTabClick);
    els.searchInput.addEventListener("input", onSearchInput);
    els.modalClose.addEventListener("click", closeModal);
    els.modalOverlay.addEventListener("click", function (e) {
      if (e.target === els.modalOverlay) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  function loadState() {
    var storedPoints = localStorage.getItem(STORAGE_POINTS);
    state.points = storedPoints !== null ? parseInt(storedPoints, 10) : STARTING_POINTS;

    var storedHistory = localStorage.getItem(STORAGE_HISTORY);
    state.history = storedHistory ? JSON.parse(storedHistory) : [];
  }

  function saveState() {
    localStorage.setItem(STORAGE_POINTS, String(state.points));
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(state.history));
  }

  function renderPoints() {
    var formatted = state.points.toLocaleString("pt-BR");
    els.pointsValue.textContent = formatted;
    els.pointsValueHero.textContent = formatted;
  }

  function onTabClick(e) {
    var btn = e.target.closest(".tab");
    if (!btn) return;
    var buttons = els.categoryTabs.querySelectorAll(".tab");
    buttons.forEach(function (b) { b.classList.remove("is-active"); });
    btn.classList.add("is-active");
    state.category = btn.getAttribute("data-category");
    renderRewards();
  }

  function onSearchInput(e) {
    state.search = e.target.value.trim().toLowerCase();
    renderRewards();
  }

  function getFilteredRewards() {
    return REWARDS.filter(function (r) {
      var matchesCategory = state.category === "todos" || r.category === state.category;
      var haystack = (r.partner + " " + r.title + " " + r.desc).toLowerCase();
      var matchesSearch = !state.search || haystack.indexOf(state.search) !== -1;
      return matchesCategory && matchesSearch;
    });
  }

  function renderRewards() {
    var items = getFilteredRewards();
    els.rewardsGrid.innerHTML = "";

    if (items.length === 0) {
      var empty = document.createElement("p");
      empty.className = "grid__empty";
      empty.textContent = "Nenhuma oferta encontrada para esse filtro.";
      els.rewardsGrid.appendChild(empty);
      return;
    }

    items.forEach(function (reward) {
      els.rewardsGrid.appendChild(buildCard(reward));
    });
  }

  function buildCard(reward) {
    var card = document.createElement("article");
    card.className = "card";

    var image = document.createElement("div");
    image.className = "card__image";
    image.style.background = reward.color;
    image.textContent = reward.icon;
    card.appendChild(image);

    var body = document.createElement("div");
    body.className = "card__body";

    var category = document.createElement("span");
    category.className = "card__category";
    category.textContent = reward.partner;
    body.appendChild(category);

    var title = document.createElement("h3");
    title.className = "card__title";
    title.textContent = reward.title;
    body.appendChild(title);

    var desc = document.createElement("p");
    desc.className = "card__desc";
    desc.textContent = reward.desc;
    body.appendChild(desc);

    var footer = document.createElement("div");
    footer.className = "card__footer";

    var points = document.createElement("div");
    points.className = "card__points";
    points.innerHTML = reward.cost.toLocaleString("pt-BR") + "<small>pontos</small>";
    footer.appendChild(points);

    var btn = document.createElement("button");
    btn.className = "card__btn";
    var canAfford = state.points >= reward.cost;
    btn.textContent = canAfford ? "Resgatar" : "Pontos insuficientes";
    btn.disabled = !canAfford;
    btn.addEventListener("click", function () { openModal(reward); });
    footer.appendChild(btn);

    body.appendChild(footer);
    card.appendChild(body);
    return card;
  }

  function openModal(reward) {
    state.pendingReward = reward;
    var remaining = state.points - reward.cost;

    els.modalBody.innerHTML = "";

    var title = document.createElement("h3");
    title.textContent = "Confirmar resgate";
    els.modalBody.appendChild(title);

    var desc = document.createElement("p");
    desc.textContent = reward.title + " — " + reward.partner;
    els.modalBody.appendChild(desc);

    var summary = document.createElement("div");
    summary.className = "modal__summary";
    summary.innerHTML =
      "<span>Custo</span><strong>" + reward.cost.toLocaleString("pt-BR") + " pts</strong>";
    els.modalBody.appendChild(summary);

    var summary2 = document.createElement("div");
    summary2.className = "modal__summary";
    summary2.innerHTML =
      "<span>Saldo após resgate</span><strong>" +
      (remaining >= 0 ? remaining.toLocaleString("pt-BR") : "0") +
      " pts</strong>";
    els.modalBody.appendChild(summary2);

    if (remaining < 0) {
      var error = document.createElement("p");
      error.className = "modal__error";
      error.textContent = "Você não tem pontos suficientes para este resgate.";
      els.modalBody.appendChild(error);
    }

    var confirmBtn = document.createElement("button");
    confirmBtn.className = "btn btn--solid";
    confirmBtn.textContent = "Confirmar resgate";
    confirmBtn.disabled = remaining < 0;
    confirmBtn.addEventListener("click", confirmRedeem);
    els.modalBody.appendChild(confirmBtn);

    els.modalOverlay.classList.add("is-open");
  }

  function closeModal() {
    els.modalOverlay.classList.remove("is-open");
    state.pendingReward = null;
  }

  function confirmRedeem() {
    var reward = state.pendingReward;
    if (!reward || state.points < reward.cost) return;

    state.points -= reward.cost;
    state.history.unshift({
      id: reward.id + "-" + Date.now(),
      title: reward.title,
      partner: reward.partner,
      cost: reward.cost,
      date: new Date().toLocaleDateString("pt-BR"),
    });

    saveState();
    renderPoints();
    renderRewards();
    renderHistory();
    closeModal();
    showToast("Resgate confirmado: " + reward.title);
  }

  function renderHistory() {
    els.historyList.innerHTML = "";

    if (state.history.length === 0) {
      var empty = document.createElement("p");
      empty.className = "history__empty";
      empty.id = "historyEmpty";
      empty.textContent = "Você ainda não fez nenhum resgate.";
      els.historyList.appendChild(empty);
      return;
    }

    state.history.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "history__item";

      var info = document.createElement("div");
      var title = document.createElement("p");
      title.className = "history__item-title";
      title.textContent = item.title;
      var sub = document.createElement("p");
      sub.className = "history__item-sub";
      sub.textContent =
        item.partner + " · " + item.cost.toLocaleString("pt-BR") + " pts · " + item.date;
      info.appendChild(title);
      info.appendChild(sub);

      var status = document.createElement("span");
      status.className = "history__item-status";
      status.textContent = "Concluído";

      row.appendChild(info);
      row.appendChild(status);
      els.historyList.appendChild(row);
    });
  }

  var toastTimer = null;
  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      els.toast.classList.remove("is-visible");
    }, 2800);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
