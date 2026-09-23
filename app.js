const icons = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  back: '<path d="m14 6-6 6 6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  pin: '<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bag: '<path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
  home: '<path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3Z"/>',
  search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6m10-6v6M3 11h18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  leaf: '<path d="M20 3C7 1 1 10 6 17s16 2 14-14Z"/><path d="m4 21 11-12"/>',
  coffee:
    '<path d="M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Zm12 1h2a3 3 0 0 1 0 6h-2M7 2v3m6-3v3"/>',
  scissors:
    '<circle cx="5" cy="6" r="3"/><circle cx="5" cy="18" r="3"/><path d="m8 8 13 12M8 16 21 4"/>',
};
const icon = (n) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n] || icons.arrow}</svg>`;
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (n) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
const services = [
  {
    id: "hair",
    name: "Стрижка и укладка",
    detail: "Форма, которая подходит именно вам",
    price: 2400,
    duration: 60,
  },
  {
    id: "manicure",
    name: "Маникюр с покрытием",
    detail: "Бережный уход и стойкий цвет",
    price: 2000,
    duration: 90,
  },
  {
    id: "brows",
    name: "Оформление бровей",
    detail: "Архитектура и мягкое окрашивание",
    price: 1200,
    duration: 45,
  },
  {
    id: "styling",
    name: "Укладка волос",
    detail: "Лёгкие волны или гладкая укладка",
    price: 1800,
    duration: 45,
  },
];
const people = [
  {
    id: "anna",
    name: "Анна Морозова",
    initials: "АМ",
    role: "Стилист и мастер по уходу",
    years: "Опыт 6 лет",
  },
  {
    id: "maria",
    name: "Мария Волкова",
    initials: "МВ",
    role: "Стилист и мастер по уходу",
    years: "Опыт 4 года",
  },
];
const key = "masterskaya-appointments-v1";
let storageOK = true;
function read() {
  try {
    let v = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(v)
      ? v.filter(
          (x) =>
            x &&
            typeof x.id === "string" &&
            services.some((s) => s.id === x.service) &&
            people.some((p) => p.id === x.person) &&
            Number.isFinite(x.start) &&
            Number.isFinite(x.end) &&
            typeof x.cancelled === "boolean",
        )
      : [];
  } catch {
    return [];
  }
}
let appointments = read();
function save() {
  try {
    localStorage.setItem(key, JSON.stringify(appointments));
    return true;
  } catch {
    storageOK = false;
    return false;
  }
}
let state = {
    service: null,
    person: null,
    date: null,
    time: null,
    name: "",
    phone: "",
  },
  month = new Date();
month.setDate(1);
let lastId = null;
const app = document.querySelector("#booking-app");
const service = () => services.find((s) => s.id === state.service);
const person = () => people.find((p) => p.id === state.person);
const dateKey = (d) =>
  [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
const localDate = (k) => new Date(k + "T00:00:00");
const stamp = () => new Date(state.date + "T" + state.time + ":00").getTime();
const fmt = (d) =>
  new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
const timeFmt = (d) =>
  new Date(d).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
const routes = ["services", "specialists", "time", "contacts"];
function go(route) {
  if (location.hash === "#" + route) {
    render();
    document.querySelector("#main").focus();
    window.scrollTo(0, 0);
  } else {
    location.hash = route;
  }
}
function steps(i) {
  return `<div class="steps" aria-label="Этапы записи">${["Услуга", "Специалист", "Дата и время", "Контакты"].map((t, n) => `<div class="step ${n === i ? "active" : n < i ? "done" : ""}" ${n === i ? 'aria-current="step"' : ""}><i>${n < i ? "✓" : n + 1}</i>${t}</div>`).join("")}</div>`;
}
function head(i, title, sub) {
  return (
    steps(i) +
    `<div class="intro"><h1 class="booking-title">${title}</h1><p class="muted">${sub}</p></div>`
  );
}
function footer(next, enabled, summary) {
  return `<div class="flow-footer"><div>${summary}</div><button class="btn" data-next="${next}" ${enabled ? "" : "disabled"}>Продолжить ${icon("arrow")}</button></div>`;
}
function back(to) {
  return `<button class="back-link" data-next="${to}">${icon("back")} Назад</button>`;
}
function available(start) {
  const end = start + service().duration * 60000;
  return (
    start > Date.now() &&
    new Date(end).getHours() <= 20 &&
    !(new Date(end).getHours() === 20 && new Date(end).getMinutes() > 0) &&
    !appointments.some(
      (a) =>
        !a.cancelled &&
        a.person === state.person &&
        a.start < end &&
        a.end > start,
    )
  );
}
function summary() {
  return `<div class="summary"><div><strong>${service().name}</strong><strong>${money(service().price)}</strong></div><div><span>${person().name}</span><span>${service().duration} мин</span></div><div><span>${fmt(stamp())}</span><strong>${state.time}</strong></div></div>`;
}
function render() {
  appointments = read();
  document.querySelector("#book-count").textContent = appointments.filter(
    (a) => !a.cancelled && a.end > Date.now(),
  ).length;
  let route = location.hash.slice(1) || "services";
  if (route === "specialists" && !service()) route = "services";
  if (route === "time" && (!service() || !person())) route = "services";
  if (
    route === "contacts" &&
    (!state.date || !state.time || !person() || !service())
  )
    route = "services";
  if (route === "confirmation" && !appointments.some((a) => a.id === lastId))
    route = "appointments";
  if (
    !routes.includes(route) &&
    !["confirmation", "appointments"].includes(route)
  )
    route = "services";
  if (location.hash !== "#" + route) {
    history.replaceState(null, "", "#" + route);
  }
  if (route === "services") {
    app.innerHTML =
      head(0, "Выберите услугу", "Что сделаем для вас сегодня?") +
      `<div class="service-list">${services.map((s) => `<button class="service ${state.service === s.id ? "selected" : ""}" data-service="${s.id}" aria-pressed="${state.service === s.id}"><span class="service-mark">${icon(s.id === "hair" ? "scissors" : "leaf")}</span><span><h3>${s.name}</h3><p>${s.duration} мин · ${s.detail}</p></span><span class="price">${money(s.price)}</span><span class="radio"></span></button>`).join("")}</div>` +
      footer(
        "specialists",
        service(),
        service()
          ? `<b>${money(service().price)}</b><p class="muted">${service().duration} минут для себя</p>`
          : '<p class="muted">Выберите подходящую услугу</p>',
      );
  }
  if (route === "specialists")
    app.innerHTML =
      back("services") +
      head(
        1,
        "Выберите специалиста",
        "Внимание к деталям — у каждого мастера.",
      ) +
      `<div class="specialists">${people.map((p) => `<button class="person ${state.person === p.id ? "selected" : ""}" data-person="${p.id}" aria-pressed="${state.person === p.id}"><span class="avatar">${p.initials}</span><h3>${p.name}</h3><p>${p.role}</p><span class="tag">${p.years}</span></button>`).join("")}</div>` +
      footer(
        "time",
        person(),
        `<b>${service().name}</b><p class="muted">${money(service().price)} · ${service().duration} мин</p>`,
      );
  if (route === "time") {
    let days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(),
      offset = (month.getDay() + 6) % 7;
    app.innerHTML =
      back("specialists") +
      head(2, "Когда вам удобно?", "Выберите день и свободное время.") +
      `<div class="calendar-box"><div class="row between"><button class="month-arrow" data-month="-1" aria-label="Предыдущий месяц" ${month.getFullYear() === new Date().getFullYear() && month.getMonth() === new Date().getMonth() ? "disabled" : ""}>‹</button><h2 class="month-label">${month.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}</h2><button class="month-arrow" data-month="1" aria-label="Следующий месяц">›</button></div><div class="calendar">${["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((x) => `<span>${x}</span>`).join("")}${"<span></span>".repeat(offset)}${Array.from(
        { length: days },
        (_, i) => {
          let d = new Date(month.getFullYear(), month.getMonth(), i + 1),
            k = dateKey(d);
          return `<button class="day ${k === state.date ? "selected" : ""} ${k === dateKey(new Date()) ? "today" : ""}" data-date="${k}" aria-label="${fmt(d)}" aria-pressed="${k === state.date}" ${k < dateKey(new Date()) ? "disabled" : ""}>${i + 1}</button>`;
        },
      ).join(
        "",
      )}</div><h3 style="font-size:18px">${state.date ? "Свободное время · " + fmt(localDate(state.date)) : "Сначала выберите день"}</h3><div class="slots">${
        state.date
          ? Array.from({ length: 20 }, (_, i) => {
              let t =
                  String(10 + Math.floor(i / 2)).padStart(2, "0") +
                  ":" +
                  (i % 2 ? "30" : "00"),
                start = new Date(state.date + "T" + t + ":00").getTime();
              return `<button class="slot ${state.time === t ? "selected" : ""}" data-time="${t}" aria-pressed="${state.time === t}" ${available(start) ? "" : "disabled"}>${t}</button>`;
            }).join("")
          : ""
      }</div></div>` +
      footer(
        "contacts",
        state.time && available(stamp()),
        `<b>${person().name}</b><p class="muted">${service().duration} мин · ${money(service().price)}</p>`,
      );
  }
  if (route === "contacts")
    app.innerHTML =
      back("time") +
      head(
        3,
        "Осталось познакомиться",
        "Проверьте запись и оставьте контакты.",
      ) +
      summary() +
      `<form id="contact-form" class="contact-card" novalidate><label for="client-name">Ваше имя</label><input id="client-name" name="name" autocomplete="given-name" maxlength="60" placeholder="Например, Александра" value="${esc(state.name)}" aria-describedby="name-error" required><div class="error" id="name-error"></div><label for="client-phone">Телефон</label><input id="client-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 900 000-00-00" value="${esc(state.phone)}" aria-describedby="phone-error" required><div class="error" id="phone-error"></div><p class="notice">Используйте тестовые контакты. Данные сохранятся только в этом браузере, сообщения отправляться не будут.</p><div id="form-error" class="error" role="alert"></div><button class="btn" type="submit">Подтвердить демо-запись ${icon("check")}</button></form>`;
  if (route === "confirmation") {
    app.innerHTML =
      `<div class="success-mark">${icon("check")}</div><p class="eyebrow">Всё готово</p><h1 class="booking-title" style="margin-top:16px">Вы записаны!</h1><p class="muted">${esc(state.name)}, ваше время для себя уже запланировано.</p>` +
      summary() +
      `<p class="notice">Это демо-запись. Студия не получит ваши данные.</p><div class="success-actions"><button class="btn" data-next="appointments">Мои записи ${icon("arrow")}</button><button class="btn secondary" data-new>Записаться ещё</button></div>`;
  }
  if (route === "appointments") {
    app.innerHTML =
      `<div class="row between"><div><p class="eyebrow">Ваши планы</p><h1 class="booking-title" style="margin-top:15px">Мои записи</h1></div><button class="btn secondary" data-new>Новая запись</button></div><p class="muted">Записи, созданные в этом браузере.</p>` +
      (appointments.length
        ? appointments
            .slice()
            .sort((a, b) => b.start - a.start)
            .map((a) => {
              let s = services.find((x) => x.id === a.service),
                p = people.find((x) => x.id === a.person);
              return `<article class="appointment ${a.cancelled ? "cancelled" : ""}"><div class="row between"><span class="tag">${a.cancelled ? "Отменена" : a.end < Date.now() ? "Завершена" : "Подтверждена"}</span><strong>${money(s.price)}</strong></div><h3>${s.name}</h3><p>${p.name}</p><p class="row">${icon("calendar")} ${fmt(a.start)}, ${timeFmt(a.start)} · ${s.duration} мин</p>${!a.cancelled && a.start > Date.now() ? `<button class="btn secondary cancel-btn" data-cancel="${a.id}">Отменить запись</button>` : ""}</article>`;
            })
            .join("")
        : `<div class="empty" style="margin-top:28px">${icon("calendar")}<h2>Пока нет записей</h2><p class="muted">Выберите услугу и удобное время.</p><button class="btn" data-new>Выбрать услугу</button></div>`);
  }
  if (!storageOK)
    app.insertAdjacentHTML(
      "afterbegin",
      '<div class="storage-warning" role="alert">Не удалось сохранить данные. Разрешите хранение данных сайта в настройках браузера и повторите попытку.</div>',
    );
}
app.addEventListener("click", (e) => {
  let b = e.target.closest("button");
  if (!b || b.disabled) return;
  let d = b.dataset;
  if (d.service) {
    state.service = d.service;
    state.date = null;
    state.time = null;
    render();
  }
  if (d.person) {
    state.person = d.person;
    state.time = null;
    render();
  }
  if (d.date) {
    state.date = d.date;
    state.time = null;
    render();
  }
  if (d.time) {
    state.time = d.time;
    render();
  }
  if (d.month) {
    month.setMonth(month.getMonth() + Number(d.month));
    render();
  }
  if (d.next) go(d.next);
  if ("new" in d) {
    state = {
      service: null,
      person: null,
      date: null,
      time: null,
      name: "",
      phone: "",
    };
    if (location.hash === "#services") render();
    else go("services");
  }
  if (d.cancel) {
    appointments = read();
    appointments = appointments.map((a) =>
      a.id === d.cancel ? { ...a, cancelled: true } : a,
    );
    save();
    render();
  }
});
app.addEventListener("submit", (e) => {
  if (e.target.id !== "contact-form") return;
  e.preventDefault();
  state.name = e.target.elements.name.value.trim();
  state.phone = e.target.elements.phone.value.trim();
  let nameOK = state.name.length >= 2 && /[a-zа-яё]/i.test(state.name),
    phoneOK =
      /^[+\d\s()-]+$/.test(state.phone) &&
      state.phone.replace(/\D/g, "").length === 11 &&
      /^[78]/.test(state.phone.replace(/\D/g, ""));
  document.querySelector("#name-error").textContent = nameOK
    ? ""
    : "Введите имя: минимум 2 символа.";
  document.querySelector("#phone-error").textContent = phoneOK
    ? ""
    : "Введите телефон из 11 цифр, начиная с +7 или 8.";
  e.target.elements.name.setAttribute("aria-invalid", !nameOK);
  e.target.elements.phone.setAttribute("aria-invalid", !phoneOK);
  if (!nameOK || !phoneOK) {
    (!nameOK ? e.target.elements.name : e.target.elements.phone).focus();
    return;
  }
  appointments = read();
  if (!available(stamp())) {
    document.querySelector("#form-error").textContent =
      "Это время уже недоступно. Вернитесь и выберите другое.";
    return;
  }
  lastId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  appointments.push({
    id: lastId,
    service: state.service,
    person: state.person,
    start: stamp(),
    end: stamp() + service().duration * 60000,
    name: state.name,
    phone: state.phone,
    cancelled: false,
  });
  if (save()) go("confirmation");
  else render();
});
window.addEventListener("hashchange", () => {
  render();
  document.querySelector("#main").focus();
  window.scrollTo(0, 0);
});
document.querySelector(".skip").addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector("#main").focus();
});
window.addEventListener("storage", render);
render();
