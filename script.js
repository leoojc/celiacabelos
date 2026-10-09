/* =========================================================
   CONFIGURAÇÕES: edite aqui antes de publicar
   ========================================================= */
const CONFIG = {
  // Formato internacional: 55 + DDD + número.
  // ATENÇÃO: celulares têm 9 dígitos (ex.: 5581996904402). Confirme o número com a cliente.
  whatsapp: "558196904402",

  // Gatilho de escassez: use apenas valores reais da agenda da Célia.
  vagasSemana: 6,
  mostrarContagem: true,

  // Oferta mostrada no bloco de urgência (troque pela promoção real, ou deixe vazio para ocultar o texto).
  oferta: "Agende nesta semana e ganhe uma finalização especial no seu atendimento. Confirme os detalhes direto no WhatsApp."
};

/* Serviços e valores de referência (esboço: ajustar com a cliente) */
const SERVICOS = [
  { nome: "Selagem", desc: "Alinha os fios, reduz o frizz e entrega brilho de espelho. Nosso resultado mais pedido, com acabamento liso e leve.", preco: "120", tag: "Mais pedido", icone: "sparkle", destaque: true, foto: "img/castanho.jpg" },
  { nome: "Progressiva", desc: "Cabelo liso, alinhado e fácil de cuidar no dia a dia.", preco: "150", icone: "heart" },
  { nome: "Botox capilar", desc: "Reposição de massa e brilho para fios opacos e sem vida.", preco: "120", icone: "sparkle" },
  { nome: "Coloração", desc: "Do castanho ao vermelho cereja, com cor viva e fios protegidos.", preco: "90", icone: "heart" },
  { nome: "Mechas e luzes", desc: "Iluminação e reflexos sob medida para o seu tom de pele.", preco: "180", icone: "sparkle" },
  { nome: "Corte e camadas", desc: "Pontas renovadas e camadas que dão movimento e leveza.", preco: "45", icone: "scissors" },
  { nome: "Escova", desc: "Escova modelada para o dia a dia ou para o seu evento.", preco: "40", icone: "scissors" },
  { nome: "Hidratação", desc: "Maciez, brilho e saúde para seus fios em uma sessão.", preco: "60", icone: "heart" }
];

/* =========================================================
   WHATSAPP
   ========================================================= */
const waUrl = (msg) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;

function ligarWhats(raiz = document) {
  raiz.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = waUrl(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });
}

/* =========================================================
   SERVIÇOS
   ========================================================= */
function renderServicos() {
  const grid = document.getElementById("servicos-grid");
  grid.innerHTML = SERVICOS.map((s) => {
    const msg = `Oi, Célia! Quero agendar ${s.nome}. Pode me passar os horários disponíveis?`;
    const icone = `<span class="card-ic"><svg class="ic"><use href="#i-${s.icone}"/></svg></span>`;
    const preco = `<div class="preco"><small>a partir de</small>R$ ${s.preco}</div>`;
    const botao = `<a class="btn btn-rosa" data-wa="${msg}">Agendar</a>`;
    if (s.destaque) {
      return `
      <article class="card destaque">
        ${s.tag ? `<span class="tag">${s.tag}</span>` : ""}
        <div class="corpo">
          ${icone}
          <h3>${s.nome}</h3>
          <p>${s.desc}</p>
          <div class="card-rod">${preco}${botao}</div>
        </div>
        <div class="foto"><img src="${s.foto}" alt="Resultado de ${s.nome}" loading="lazy"></div>
      </article>`;
    }
    return `
      <article class="card">
        ${s.tag ? `<span class="tag">${s.tag}</span>` : ""}
        ${icone}
        <h3>${s.nome}</h3>
        <p>${s.desc}</p>
        <div class="card-rod">${preco}${botao}</div>
      </article>`;
  }).join("");

  const sel = document.getElementById("f-servico");
  sel.innerHTML =
    SERVICOS.map((s) => `<option>${s.nome}</option>`).join("") +
    "<option>Ainda não sei, quero uma avaliação</option>";
}

/* =========================================================
   ANTES E DEPOIS
   ========================================================= */
function iniciarComparador() {
  const ba = document.getElementById("ba");
  const range = document.getElementById("ba-range");
  const set = (v) => ba.style.setProperty("--pos", v + "%");
  range.addEventListener("input", (e) => set(e.target.value));
  // Pequena demonstração única ao entrar na tela, para convidar ao arrasto
  let demonstrou = false;
  const io = new IntersectionObserver((es) => {
    if (es[0].isIntersecting && !demonstrou) {
      demonstrou = true;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      let t = 0;
      const passo = () => {
        t += 0.045;
        const v = 50 + Math.sin(t) * 22 * Math.max(0, 1 - t / 6.3);
        range.value = v;
        set(v);
        if (t < 6.3) requestAnimationFrame(passo);
        else { range.value = 50; set(50); }
      };
      requestAnimationFrame(passo);
    }
  }, { threshold: 0.6 });
  io.observe(ba);
}

/* =========================================================
   OFERTA: contagem até o fim da semana (domingo 23:59)
   ========================================================= */
function iniciarOferta() {
  const sec = document.getElementById("oferta");
  const txt = document.getElementById("oferta-texto");
  const btn = document.getElementById("oferta-btn");
  const vagas = document.getElementById("vagas-txt");

  txt.textContent = CONFIG.oferta;
  if (!CONFIG.oferta) txt.style.display = "none";
  btn.dataset.wa = "Oi, Célia! Vi a agenda da semana no site e quero garantir meu horário.";
  ligarWhats(sec);

  const n = CONFIG.vagasSemana;
  vagas.textContent = n > 0
    ? `Restam ${n} ${n === 1 ? "horário" : "horários"} esta semana`
    : "Agenda da semana lotada. Entre na lista de espera";

  if (!CONFIG.mostrarContagem) {
    sec.querySelector(".relogio-rot").style.display = "none";
    sec.querySelector(".tempo").style.display = "none";
    return;
  }

  const fim = () => {
    const d = new Date();
    const dias = (7 - d.getDay()) % 7;
    d.setDate(d.getDate() + dias);
    d.setHours(23, 59, 59, 0);
    return d;
  };
  const dois = (x) => String(x).padStart(2, "0");
  const el = (id) => document.getElementById(id);

  const tick = () => {
    let s = Math.max(0, Math.floor((fim() - new Date()) / 1000));
    el("c-d").textContent = dois(Math.floor(s / 86400)); s %= 86400;
    el("c-h").textContent = dois(Math.floor(s / 3600)); s %= 3600;
    el("c-m").textContent = dois(Math.floor(s / 60));
    el("c-s").textContent = dois(s % 60);
  };
  tick();
  setInterval(tick, 1000);
}

/* =========================================================
   FORMULÁRIO → WHATSAPP
   ========================================================= */
function iniciarFormulario() {
  const form = document.getElementById("lead");
  const erro = document.getElementById("f-erro");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("f-nome").value.trim();
    if (nome.length < 2) {
      erro.textContent = "Digite seu nome para a Célia saber com quem está falando.";
      document.getElementById("f-nome").focus();
      return;
    }
    erro.textContent = "";
    const servico = document.getElementById("f-servico").value;
    const periodo = document.getElementById("f-periodo").value;
    const msg = `Oi, Célia! Meu nome é ${nome}. Quero agendar: ${servico}. Melhor período: ${periodo}. Vim pelo site.`;
    window.open(waUrl(msg), "_blank", "noopener");
  });
}

/* =========================================================
   GALERIA (visualizador)
   ========================================================= */
function iniciarGaleria() {
  const lb = document.getElementById("lb");
  const img = document.getElementById("lb-img");
  document.querySelectorAll(".g").forEach((b) => {
    b.addEventListener("click", () => {
      img.src = b.dataset.src;
      img.alt = b.dataset.alt;
      lb.showModal();
    });
  });
  document.getElementById("lb-x").addEventListener("click", () => lb.close());
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
}

/* =========================================================
   MENU, BALÃO E ANO
   ========================================================= */
function iniciarMenu() {
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");
  burger.addEventListener("click", () => {
    const aberto = menu.classList.toggle("on");
    burger.setAttribute("aria-expanded", aberto);
  });
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      menu.classList.remove("on");
      burger.setAttribute("aria-expanded", "false");
    })
  );
}

function iniciarBalao() {
  const b = document.getElementById("balao");
  setTimeout(() => b.classList.add("on"), 4000);
  setTimeout(() => b.classList.remove("on"), 11000);
}

/* =========================================================
   INÍCIO
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  renderServicos();
  iniciarComparador();
  iniciarOferta();
  iniciarFormulario();
  iniciarGaleria();
  iniciarMenu();
  iniciarBalao();
  ligarWhats();
  document.getElementById("ano").textContent = new Date().getFullYear();
});
