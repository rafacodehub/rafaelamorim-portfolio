const state = {
  selectedFileName: "",
  selectedFileText: "",
  activeSlide: 0,
  lastAnalysis: null,
  lastReportUrl: null,
  lastReportName: null,
};

const USER = "Rafacodehub";

const icons = {
  alert: '<svg viewBox="0 0 24 24"><path d="M12 2 1.5 21h21L12 2Zm1 16h-2v-2h2v2Zm0-4h-2V9h2v5Z"/></svg>',
  exit: '<svg viewBox="0 0 24 24"><path d="M10 3h10v18H10v-2h8V5h-8V3ZM4 12l5-5v3h6v4H9v3l-5-5Z"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5V20h-6v-5h-4v5H4v-9.5Z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m9 16.2-3.5-3.5L4 14.2 9 19 20.5 7.5 19 6 9 16.2Z"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9h14v-9a2 2 0 0 0-2-2Zm-7-2a2 2 0 0 1 4 0v2h-4V7Z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><path d="M7 2h2v3h6V2h2v3h3v17H4V5h3V2Zm13 8H4v10h16V10Z"/></svg>',
  users: '<svg viewBox="0 0 24 24"><path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4ZM8 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm8 1c-3 0-6 1.5-6 4v2h12v-2c0-2.5-3-4-6-4ZM8 14c-2.7 0-5 1.3-5 3.5V19h5v-2c0-1 .4-2 1.2-2.8-.4-.1-.8-.2-1.2-.2Z"/></svg>',
  file: '<svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6V2Zm8 1.8V8h4.2L14 3.8ZM8 12h8v2H8v-2Zm0 4h8v2H8v-2Z"/></svg>',
  scale: '<svg viewBox="0 0 24 24"><path d="M12 3v2H5v2h2.2L4 14h6L7 7h5v12H8v2h8v-2h-4V7h5l-3 7h6l-3.2-7H19V5h-7V3h-2Z"/></svg>',
};

const elements = {
  pages: document.querySelectorAll(".page"),
  menuItems: document.querySelectorAll(".menu-item"),
  tabs: document.querySelectorAll(".tab"),
  pasteTab: document.getElementById("pasteTab"),
  uploadTab: document.getElementById("uploadTab"),
  textarea: document.getElementById("contractText"),
  charCount: document.getElementById("charCount"),
  fileInput: document.getElementById("contractFile"),
  selectedFileName: document.getElementById("selectedFileName"),
  analyzeBtn: document.getElementById("analyzeBtn"),
  riskScore: document.getElementById("riskScore"),
  riskLabel: document.getElementById("riskLabel"),
  riskLevel: document.getElementById("riskLevel"),
  riskDescription: document.getElementById("riskDescription"),
  reviewStatus: document.getElementById("reviewStatus"),
  confidenceBar: document.getElementById("confidenceBar"),
  confidenceValue: document.getElementById("confidenceValue"),
  insightsList: document.getElementById("insightsList"),
  extractedInfo: document.getElementById("extractedInfo"),
  clausesDetected: document.getElementById("clausesDetected"),
  scoreCircle: document.getElementById("scoreCircle"),
  historyTable: document.getElementById("historyTable"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),
  howModal: document.getElementById("howModal"),
  howItWorksBtn: document.getElementById("howItWorksBtn"),
  closeModal: document.getElementById("closeModal"),
  slides: document.querySelectorAll(".slide"),
  prevSlide: document.getElementById("prevSlide"),
  nextSlide: document.getElementById("nextSlide"),
  slideDots: document.getElementById("slideDots"),
  toast: document.getElementById("toast"),
  downloadReportBtn: document.getElementById("downloadReportBtn"),
  newAnalysisBtn: document.getElementById("newAnalysisBtn"),
  reportsTable: document.getElementById("reportsTable"),
  generateReportFromPage: document.getElementById("generateReportFromPage"),
  profileButton: document.getElementById("profileButton"),
  profileMenu: document.getElementById("profileMenu"),
  profileSettingsBtn: document.getElementById("profileSettingsBtn"),
  helpBtn: document.getElementById("helpBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
};

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

function switchPage(page) {
  elements.pages.forEach((section) => section.classList.remove("active"));
  elements.menuItems.forEach((item) => item.classList.remove("active"));

  const normalized = page === "new" ? "dashboard" : page;
  const target = document.getElementById(`${normalized}Page`);
  if (target) target.classList.add("active");

  const menu = document.querySelector(`.menu-item[data-page="${normalized}"]`);
  if (menu) menu.classList.add("active");

  if (page === "new") {
    resetAnalysis();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (page === "history") renderHistory();
  if (page === "reports") renderReports();
}

elements.menuItems.forEach((item) => {
  item.addEventListener("click", () => switchPage(item.dataset.page));
});

elements.newAnalysisBtn.addEventListener("click", () => switchPage("new"));

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    elements.tabs.forEach((button) => button.classList.remove("active"));
    tab.classList.add("active");
    elements.pasteTab.classList.toggle("active", tab.dataset.tab === "paste");
    elements.uploadTab.classList.toggle("active", tab.dataset.tab === "upload");
  });
});

elements.textarea.addEventListener("input", () => {
  elements.charCount.textContent = `${elements.textarea.value.length} caracteres`;
});

elements.fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  state.selectedFileName = file.name;
  elements.selectedFileName.textContent = file.name;

  try {
    if (file.name.toLowerCase().endsWith(".docx")) {
      if (!window.mammoth) {
        showToast("Leitor DOCX indisponível. Use TXT ou verifique sua internet.");
        return;
      }
      const buffer = await file.arrayBuffer();
      const result = await window.mammoth.extractRawText({ arrayBuffer: buffer });
      state.selectedFileText = result.value || "";
    } else {
      state.selectedFileText = await file.text();
    }

    elements.charCount.textContent = `${state.selectedFileText.length} caracteres`;
    showToast("Arquivo carregado com sucesso.");
  } catch (error) {
    showToast("Não foi possível ler o arquivo.");
  }
});

function resetAnalysis() {
  elements.textarea.value = "";
  state.selectedFileName = "";
  state.selectedFileText = "";
  state.lastAnalysis = null;
  state.lastReportUrl = null;
  state.lastReportName = null;

  elements.selectedFileName.textContent = "Nenhum arquivo selecionado";
  elements.fileInput.value = "";
  elements.charCount.textContent = "0 caracteres";
  elements.riskScore.textContent = "0";
  elements.riskLabel.textContent = "Aguardando análise";
  elements.riskLevel.textContent = "—";
  elements.riskDescription.textContent = "Envie um contrato para gerar o nível de risco e os pontos de atenção.";
  elements.reviewStatus.textContent = "Aguardando documento";
  elements.confidenceBar.style.width = "0%";
  elements.confidenceValue.textContent = "0%";
  elements.scoreCircle.classList.remove("analyzed");
  elements.insightsList.className = "empty-state";
  elements.insightsList.textContent = "Nenhum insight gerado ainda.";
  elements.extractedInfo.className = "empty-state";
  elements.extractedInfo.textContent = "Nenhuma informação extraída ainda.";
  elements.clausesDetected.innerHTML = `<span class="muted">Aguardando análise</span>`;
}

function analyzeText(text) {
  const lower = text.toLowerCase();

  const checks = [
    {
      key: "multa",
      label: "Multa contratual detectada",
      description: "O contrato contém penalidade financeira em caso de descumprimento ou rescisão.",
      severity: "high",
      points: 18,
      icon: icons.alert,
    },
    {
      key: "rescisão",
      label: "Cláusula de rescisão presente",
      description: "Foram encontrados termos sobre encerramento antecipado do contrato.",
      severity: "medium",
      points: 14,
      icon: icons.exit,
    },
    {
      key: "venda",
      label: "Venda do imóvel mencionada",
      description: "O contrato trata da possibilidade de venda do imóvel durante a locação.",
      severity: "medium",
      points: 12,
      icon: icons.home,
    },
    {
      key: "preferência",
      label: "Direito de preferência identificado",
      description: "Existe previsão de preferência da locatária em caso de venda do imóvel.",
      severity: "low",
      points: 5,
      icon: icons.check,
    },
    {
      key: "confidencialidade",
      label: "Confidencialidade detectada",
      description: "Há cláusula protegendo informações pessoais e financeiras das partes.",
      severity: "low",
      points: -7,
      icon: icons.lock,
    },
    {
      key: "caução",
      label: "Garantia locatícia localizada",
      description: "O contrato menciona caução ou garantia para proteção do locador.",
      severity: "medium",
      points: 8,
      icon: icons.file,
    },
    {
      key: "90",
      label: "Prazo longo identificado",
      description: "Há indicação de prazo extenso que pode exigir atenção na análise.",
      severity: "medium",
      points: 10,
      icon: icons.calendar,
    },
  ];

  const found = checks.filter((check) => lower.includes(check.key));
  let score = 22 + found.reduce((total, item) => total + item.points, 0);

  if (text.length > 3000) score += 8;
  if (lower.includes("locador") && lower.includes("locatária")) score += 5;
  if (lower.includes("alugu")) score += 6;

  score = Math.max(12, Math.min(score, 94));

  const risk = score >= 75 ? "Alto" : score >= 45 ? "Médio" : "Baixo";
  const confidence = Math.min(96, Math.max(62, 65 + found.length * 4 + Math.floor(text.length / 600)));

  const clauses = [
    lower.includes("imóvel") && "Imóvel ✓",
    lower.includes("prazo") && "Prazo ✓",
    lower.includes("aluguel") && "Aluguel ✓",
    lower.includes("reajuste") && "Reajuste ✓",
    lower.includes("despesas") && "Despesas ✓",
    lower.includes("multa") && "Multa ⚠",
    lower.includes("rescisão") && "Rescisão ⚠",
    lower.includes("venda") && "Venda do imóvel ⚠",
    lower.includes("benfeitorias") && "Benfeitorias ✓",
    lower.includes("confidencialidade") && "Confidencialidade ✓",
  ].filter(Boolean);

  const parties = lower.includes("locador") && lower.includes("locatária")
    ? "Locador A e Locatária B"
    : "Não identificadas";

  return {
    score,
    risk,
    confidence,
    insights: found.length ? found : [{
      label: "Contrato recebido",
      description: "O documento foi carregado, mas poucos termos de risco foram detectados.",
      severity: "low",
      icon: icons.check,
    }],
    clauses,
    info: [
      [icons.users, "Partes Envolvidas", parties],
      [icons.file, "Tipo de Contrato", lower.includes("locação") ? "Locação Residencial" : "Não identificado"],
      [icons.home, "Imóvel", lower.includes("rua") ? "Endereço identificado" : "Não identificado"],
      [icons.calendar, "Prazo", lower.includes("36") ? "36 meses" : "Verificar contrato"],
      [icons.alert, "Multa", lower.includes("multa") ? "Prevista no contrato" : "Não identificada"],
    ]
  };
}

function renderAnalysis(analysis) {
  elements.riskScore.textContent = analysis.score;
  elements.riskLabel.textContent = `Risco ${analysis.risk}`;
  elements.riskLevel.textContent = analysis.risk;
  elements.confidenceBar.style.width = `${analysis.confidence}%`;
  elements.confidenceValue.textContent = `${analysis.confidence}%`;
  elements.scoreCircle.classList.add("analyzed");

  elements.riskDescription.textContent =
    analysis.risk === "Alto"
      ? "Este contrato contém pontos críticos e deve ser revisado com atenção."
      : analysis.risk === "Médio"
        ? "Este contrato contém cláusulas que requerem atenção."
        : "Poucos pontos críticos foram encontrados nesta análise.";

  elements.reviewStatus.textContent =
    analysis.risk === "Alto"
      ? "Revisão jurídica altamente recomendada"
      : analysis.risk === "Médio"
        ? "Recomendamos revisão"
        : "Risco controlado";

  elements.insightsList.className = "";
  elements.insightsList.innerHTML = analysis.insights.map((item) => `
    <div class="insight-item">
      <div class="insight-icon">${item.icon}</div>
      <div>
        <strong>${item.label}</strong>
        <p>${item.description}</p>
      </div>
      <span class="badge ${item.severity}">${severityLabel(item.severity)}</span>
    </div>
  `).join("");

  elements.extractedInfo.className = "";
  elements.extractedInfo.innerHTML = analysis.info.map(([icon, label, value]) => `
    <div class="info-row">
      <span>${icon}</span>
      <p>${label}</p>
      <strong>${value}</strong>
    </div>
  `).join("");

  elements.clausesDetected.innerHTML = analysis.clauses.length
    ? analysis.clauses.map((clause) => {
        const cls = clause.includes("⚠") ? (clause.includes("Multa") ? "danger" : "warn") : "";
        return `<span class="${cls}">${clause}</span>`;
      }).join("")
    : `<span class="muted">Nenhuma cláusula detectada</span>`;
}

function severityLabel(severity) {
  if (severity === "high") return "Alto";
  if (severity === "medium") return "Médio";
  return "Baixo";
}

elements.analyzeBtn.addEventListener("click", async () => {
  const activeTab = document.querySelector(".tab.active").dataset.tab;
  const text = activeTab === "upload" ? state.selectedFileText : elements.textarea.value;
  const fileName = activeTab === "upload" ? state.selectedFileName : "Texto colado manualmente";

  if (!text || text.trim().length < 40) {
    showToast("Envie ou cole um contrato com mais conteúdo.");
    return;
  }

  elements.analyzeBtn.classList.add("loading");
  elements.analyzeBtn.textContent = "Analisando contrato...";

  setTimeout(() => {
    const analysis = analyzeText(text);
    state.lastAnalysis = analysis;
    renderAnalysis(analysis);
    saveHistory(fileName, analysis.risk);
    elements.analyzeBtn.classList.remove("loading");
    elements.analyzeBtn.textContent = "Analisar Contrato";
    showToast("Análise concluída com sucesso.");
  }, 1200);
});

function saveHistory(fileName, risk) {
  const now = new Date();
  const history = JSON.parse(localStorage.getItem("legalscan-history") || "[]");

  history.unshift({
    fileName,
    date: now.toLocaleDateString("pt-BR"),
    time: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    user: USER,
    risk,
  });

  localStorage.setItem("legalscan-history", JSON.stringify(history.slice(0, 20)));
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("legalscan-history") || "[]");

  if (!history.length) {
    elements.historyTable.innerHTML = `<tr><td colspan="5">Nenhum upload registrado.</td></tr>`;
    return;
  }

  elements.historyTable.innerHTML = history.map((item) => `
    <tr>
      <td>${item.fileName}</td>
      <td>${item.date}</td>
      <td>${item.time}</td>
      <td>${item.user}</td>
      <td>Risco ${item.risk}</td>
    </tr>
  `).join("");
}

elements.clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("legalscan-history");
  renderHistory();
  showToast("Histórico limpo.");
});

function setupSlides() {
  elements.slideDots.innerHTML = Array.from(elements.slides)
    .map((_, index) => `<span class="${index === 0 ? "active" : ""}"></span>`)
    .join("");
}

function renderSlide() {
  elements.slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === state.activeSlide);
  });

  document.querySelectorAll(".dots span").forEach((dot, index) => {
    dot.classList.toggle("active", index === state.activeSlide);
  });

  elements.prevSlide.style.visibility = state.activeSlide === 0 ? "hidden" : "visible";
  elements.nextSlide.textContent = state.activeSlide === elements.slides.length - 1 ? "Concluir" : "Próximo";
}

elements.howItWorksBtn.addEventListener("click", () => {
  state.activeSlide = 0;
  elements.howModal.classList.add("active");
  renderSlide();
});

elements.closeModal.addEventListener("click", () => elements.howModal.classList.remove("active"));
elements.prevSlide.addEventListener("click", () => {
  state.activeSlide = Math.max(0, state.activeSlide - 1);
  renderSlide();
});
elements.nextSlide.addEventListener("click", () => {
  if (state.activeSlide === elements.slides.length - 1) {
    elements.howModal.classList.remove("active");
    return;
  }
  state.activeSlide += 1;
  renderSlide();
});
elements.howModal.addEventListener("click", (event) => {
  if (event.target === elements.howModal) elements.howModal.classList.remove("active");
});

function saveReportHistory(fileName, url) {
  const now = new Date();
  const reports = JSON.parse(localStorage.getItem("legalscan-reports") || "[]");

  reports.unshift({
    name: fileName,
    date: now.toLocaleDateString("pt-BR"),
    time: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    user: USER,
    url,
  });

  localStorage.setItem("legalscan-reports", JSON.stringify(reports.slice(0, 25)));
}

function renderReports() {
  const reports = JSON.parse(localStorage.getItem("legalscan-reports") || "[]");

  if (!reports.length) {
    elements.reportsTable.innerHTML = `<tr><td colspan="5">Nenhum relatório gerado.</td></tr>`;
    return;
  }

  elements.reportsTable.innerHTML = reports.map((item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.date}</td>
      <td>${item.time}</td>
      <td>${item.user}</td>
      <td>
        <a class="ghost" href="${item.url}" download="${item.name}">Download</a>
      </td>
    </tr>
  `).join("");
}

function generateProfessionalPDF() {
  if (!state.lastAnalysis) {
    showToast("Realize uma análise antes de baixar o relatório.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");
  const analysis = state.lastAnalysis;
  const today = new Date();

  pdf.setFillColor(2, 6, 23);
  pdf.rect(0, 0, 210, 297, "F");

  pdf.setFillColor(15, 23, 42);
  pdf.roundedRect(10, 10, 190, 34, 4, 4, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.text("LegalScan AI", 18, 25);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(196, 181, 253);
  pdf.text("By Rafacodehub", 18, 33);

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(17);
  pdf.text("Relatório de Análise Contratual", 14, 58);

  pdf.setDrawColor(139, 92, 246);
  pdf.line(14, 63, 196, 63);

  let y = 78;

  const summaryCards = [
    ["Risco", analysis.risk],
    ["Pontuação", `${analysis.score}/100`],
    ["Confiança", `${analysis.confidence}%`],
  ];

  summaryCards.forEach((card, index) => {
    const x = 14 + index * 62;
    pdf.setFillColor(15, 23, 42);
    pdf.roundedRect(x, y, 56, 28, 4, 4, "F");
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(9);
    pdf.text(card[0], x + 5, y + 9);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.text(card[1], x + 5, y + 20);
  });

  y += 44;

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text("Resumo do contrato", 14, y);

  y += 9;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(210, 210, 220);
  const resumo = pdf.splitTextToSize(
    "Contrato de locação residencial com análise simulada de riscos, pontos de atenção, cláusulas detectadas e informações extraídas. Esta demo não armazena nem processa documentos externamente.",
    180
  );
  pdf.text(resumo, 14, y);
  y += resumo.length * 6 + 10;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.text("Pontos de atenção", 14, y);
  y += 10;

  analysis.insights.forEach((item, index) => {
    if (y > 250) {
      footer(pdf, pdf.internal.getNumberOfPages());
      pdf.addPage();
      pdf.setFillColor(2, 6, 23);
      pdf.rect(0, 0, 210, 297, "F");
      y = 20;
    }

    pdf.setFillColor(15, 23, 42);
    pdf.roundedRect(14, y, 182, 24, 4, 4, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(`${index + 1}. ${item.label}`, 19, y + 8);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(180, 190, 205);
    pdf.setFontSize(8.8);
    const desc = pdf.splitTextToSize(item.description, 160);
    pdf.text(desc.slice(0, 2), 19, y + 15);

    y += 30;
  });

  y += 4;

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text("Cláusulas detectadas", 14, y);
  y += 9;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(210, 210, 220);
  const clausesText = pdf.splitTextToSize(analysis.clauses.join(" • ") || "Nenhuma cláusula detectada.", 180);
  pdf.text(clausesText, 14, y);

  footer(pdf, pdf.internal.getNumberOfPages());

  const fileName = `relatorio-legalscan-ai-${Date.now()}.pdf`;
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);

  state.lastReportUrl = url;
  state.lastReportName = fileName;

  pdf.save(fileName);
  saveReportHistory(fileName, url);
  renderReports();
  showToast("PDF profissional gerado com sucesso.");
}

function footer(pdf, pageNumber) {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(120, 130, 150);
  pdf.text("Projeto demonstrativo para fins de portfólio.", 14, 286);
  pdf.text(`Página ${pageNumber}`, 182, 286);
}

elements.downloadReportBtn.addEventListener("click", generateProfessionalPDF);
elements.generateReportFromPage.addEventListener("click", generateProfessionalPDF);

if (elements.profileButton && elements.profileMenu) {
  elements.profileButton.addEventListener("click", () => {
    elements.profileMenu.classList.toggle("active");
  });
}

if (elements.profileSettingsBtn) {
  elements.profileSettingsBtn.addEventListener("click", () => {
    elements.profileMenu.classList.remove("active");
    switchPage("settings");
  });
}

if (elements.helpBtn) {
  elements.helpBtn.addEventListener("click", () => {
    elements.profileMenu.classList.remove("active");
    elements.howItWorksBtn.click();
  });
}

if (elements.logoutBtn) {
  elements.logoutBtn.addEventListener("click", () => {
    elements.profileMenu.classList.remove("active");
    showToast("Sessão encerrada apenas na simulação.");
  });
}

document.querySelectorAll(".settings-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".settings-tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".settings-panel").forEach((panel) => panel.classList.remove("active"));
    tab.classList.add("active");
    const panel = document.getElementById(`${tab.dataset.settings}Settings`);
    if (panel) panel.classList.add("active");
  });
});

document.querySelectorAll(".theme-card").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".theme-card").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    document.body.classList.remove("theme-classic-purple", "theme-blue-tech", "theme-emerald-law");

    if (button.dataset.theme === "classic-purple") document.body.classList.add("theme-classic-purple");
    if (button.dataset.theme === "blue-tech") document.body.classList.add("theme-blue-tech");
    if (button.dataset.theme === "emerald-law") document.body.classList.add("theme-emerald-law");

    showToast("Tema atualizado.");
  });
});

setupSlides();
renderSlide();
renderHistory();
renderReports();
resetAnalysis();

let loggedIn = true;
const body = document.body;

const loginProfileBtn = document.getElementById("loginProfileBtn");
const loginModal = document.getElementById("loginModal");
const forgotModal = document.getElementById("forgotModal");

function logoutUser(){
  loggedIn = false;
  document.getElementById("profileButton").classList.add("hidden");
  loginProfileBtn.classList.remove("hidden");
  showToast("Sessão encerrada.");
}

function loginUser(){
  loggedIn = true;
  document.getElementById("profileButton").classList.remove("hidden");
  loginProfileBtn.classList.add("hidden");
  loginModal.classList.remove("active");
  showToast("Login realizado.");
}

document.getElementById("logoutBtn").addEventListener("click",()=>{
  document.getElementById("profileMenu").classList.remove("active");
  logoutUser();
});

loginProfileBtn.addEventListener("click",()=>{
  loginModal.classList.add("active");
});

document.getElementById("closeLoginModal").addEventListener("click",()=>{
  loginModal.classList.remove("active");
});

document.getElementById("submitLoginBtn").addEventListener("click",loginUser);

document.getElementById("forgotPasswordBtn").addEventListener("click",()=>{
  loginModal.classList.remove("active");
  forgotModal.classList.add("active");
});

document.getElementById("closeForgotModal").addEventListener("click",()=>{
  forgotModal.classList.remove("active");
});

document.getElementById("finishForgotBtn").addEventListener("click",()=>{
  forgotModal.classList.remove("active");
});

document.querySelectorAll(".theme-card").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".theme-card").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");

    body.className = btn.dataset.theme;
    showToast("Tema atualizado.");
  });
});

function sortTableData(key, storageKey, renderFn){
  const data = JSON.parse(localStorage.getItem(storageKey)||"[]");
  data.sort((a,b)=>{
    return String(a[key]).localeCompare(String(b[key]), 'pt-BR');
  });
  localStorage.setItem(storageKey, JSON.stringify(data));
  renderFn();
}

document.querySelectorAll("[data-history-sort]").forEach(th=>{
  th.addEventListener("click",()=>{
    sortTableData(th.dataset.historySort, "legalscan-history", renderHistory);
  });
});

document.querySelectorAll("[data-report-sort]").forEach(th=>{
  th.addEventListener("click",()=>{
    sortTableData(th.dataset.reportSort, "legalscan-reports", renderReports);
  });
});

document.getElementById("clearReportsBtn").addEventListener("click",()=>{
  localStorage.removeItem("legalscan-reports");
  renderReports();
  showToast("Histórico de relatórios limpo.");
});

const planModal = document.getElementById("planModal");
const closePlanModal = document.getElementById("closePlanModal");
const upgradeBoxBtn = document.getElementById("upgradeBoxBtn");
const upgradePlanBtnV6 = document.getElementById("upgradePlanBtn");
const accountUpgradeBtn = document.getElementById("accountUpgradeBtn");
const profilePlanText = document.querySelector("#profileButton p");

function openPlanModal(){ planModal.classList.add("active"); }
function closePlans(){ planModal.classList.remove("active"); }

[upgradeBoxBtn, upgradePlanBtnV6, accountUpgradeBtn].forEach((btn)=>{
  if(btn) btn.addEventListener("click", openPlanModal);
});
if(closePlanModal) closePlanModal.addEventListener("click", closePlans);

document.querySelectorAll(".plan-option").forEach((option)=>{
  option.addEventListener("click",()=>{
    const selectedPlan = option.dataset.plan;
    if(profilePlanText) profilePlanText.textContent = selectedPlan;
    localStorage.setItem("legalscan-plan", selectedPlan);
    closePlans();
    showToast(`Plano alterado para ${selectedPlan}.`);
  });
});

const savedPlan = localStorage.getItem("legalscan-plan");
if(savedPlan && profilePlanText) profilePlanText.textContent = savedPlan;

document.querySelectorAll(".theme-card").forEach((button)=>{
  button.addEventListener("click",()=>{
    const theme = button.dataset.theme;
    document.querySelectorAll(".theme-card").forEach((item)=>item.classList.remove("active"));
    button.classList.add("active");
    document.body.classList.remove("theme-dark-purple","theme-classic-purple","theme-blue-tech","theme-emerald-law","theme-amber-exec");
    document.body.classList.add(theme);
    localStorage.setItem("legalscan-theme", theme);
    showToast("Tema atualizado.");
  });
});

const savedTheme = localStorage.getItem("legalscan-theme");
if(savedTheme){
  document.body.classList.remove("theme-dark-purple","theme-classic-purple","theme-blue-tech","theme-emerald-law","theme-amber-exec");
  document.body.classList.add(savedTheme);
  document.querySelectorAll(".theme-card").forEach((item)=>{
    item.classList.toggle("active", item.dataset.theme === savedTheme);
  });
}

function setLoggedOutUI(){
  localStorage.setItem("legalscan-logged","false");
  document.getElementById("profileButton").classList.add("hidden");
  document.getElementById("loginProfileBtn").classList.remove("hidden");
}
function setLoggedInUI(){
  localStorage.setItem("legalscan-logged","true");
  document.getElementById("profileButton").classList.remove("hidden");
  document.getElementById("loginProfileBtn").classList.add("hidden");
}
const originalLogoutBtn = document.getElementById("logoutBtn");
if(originalLogoutBtn){
  originalLogoutBtn.addEventListener("click",()=>setLoggedOutUI());
}
const originalSubmitLoginBtn = document.getElementById("submitLoginBtn");
if(originalSubmitLoginBtn){
  originalSubmitLoginBtn.addEventListener("click",()=>setLoggedInUI());
}
if(localStorage.getItem("legalscan-logged")==="false") setLoggedOutUI();

const welcomePage = document.getElementById("welcomePage");
const startWelcomeBtn = document.getElementById("startWelcomeBtn");
const quickCards = document.querySelectorAll(".quick-card");
const reportArea = document.getElementById("reportArea");
const analysisLoading = document.getElementById("analysisLoading");
const loadingSteps = document.querySelectorAll(".loading-steps li");

function showLoadingSteps(callback) {
  analysisLoading.classList.add("active");
  loadingSteps.forEach((step) => step.classList.remove("active", "done"));

  const labels = [0, 1, 2, 3];
  let index = 0;

  const interval = setInterval(() => {
    loadingSteps.forEach((step, stepIndex) => {
      step.classList.toggle("active", stepIndex === index);
      if (stepIndex < index) step.classList.add("done");
    });

    index++;

    if (index > labels.length) {
      clearInterval(interval);
      loadingSteps.forEach((step) => step.classList.add("done"));
      setTimeout(() => {
        analysisLoading.classList.remove("active");
        callback();
      }, 350);
    }
  }, 520);
}

function goDashboard() {
  switchPage("dashboard");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

if (startWelcomeBtn) {
  startWelcomeBtn.addEventListener("click", goDashboard);
}

quickCards.forEach((card) => {
  card.addEventListener("click", () => {
    const action = card.dataset.action;
    if (action === "start") goDashboard();
    if (action === "templates") switchPage("templates");
    if (action === "history") switchPage("history");
  });
});

const originalSwitchPageV7 = switchPage;
switchPage = function(page) {
  document.querySelectorAll(".page").forEach((section) => section.classList.remove("active"));
  document.querySelectorAll(".menu-item").forEach((item) => item.classList.remove("active"));

  const normalized = page === "new" ? "dashboard" : page;
  const target = document.getElementById(`${normalized}Page`);

  if (target) target.classList.add("active");

  const menu = document.querySelector(`.menu-item[data-page="${normalized}"]`);
  if (menu) menu.classList.add("active");

  if (page === "new") resetAnalysis();
  if (page === "history") renderHistory();
  if (page === "reports") renderReports();
};

elements.analyzeBtn.replaceWith(elements.analyzeBtn.cloneNode(true));
elements.analyzeBtn = document.getElementById("analyzeBtn");

elements.analyzeBtn.addEventListener("click", async () => {
  const activeTab = document.querySelector(".tab.active").dataset.tab;
  const text = activeTab === "upload" ? state.selectedFileText : elements.textarea.value;
  const fileName = activeTab === "upload" ? state.selectedFileName : "Texto colado manualmente";

  if (!text || text.trim().length < 40) {
    showToast("Envie ou cole um contrato com mais conteúdo.");
    return;
  }

  elements.analyzeBtn.classList.add("loading");
  elements.analyzeBtn.textContent = "Analisando contrato...";

  showLoadingSteps(() => {
    const analysis = analyzeText(text);
    state.lastAnalysis = analysis;
    renderAnalysis(analysis);
    saveHistory(fileName, analysis.risk);

    if (reportArea) reportArea.classList.remove("is-empty");

    elements.analyzeBtn.classList.remove("loading");
    elements.analyzeBtn.textContent = "Analisar Contrato";
    showToast("Análise concluída com sucesso.");
  });
});

const originalResetAnalysisV7 = resetAnalysis;
resetAnalysis = function() {
  originalResetAnalysisV7();
  if (reportArea) reportArea.classList.add("is-empty");
};

const originalRenderHistoryV7 = renderHistory;
renderHistory = function() {
  const history = JSON.parse(localStorage.getItem("legalscan-history") || "[]");

  if (!history.length) {
    elements.historyTable.innerHTML = `<tr><td colspan="5">Nenhum upload registrado.</td></tr>`;
    return;
  }

  elements.historyTable.innerHTML = history.map((item) => {
    const riskClass = String(item.risk).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `
      <tr>
        <td>${item.fileName}</td>
        <td>${item.date}</td>
        <td>${item.time}</td>
        <td>${item.user}</td>
        <td><span class="badge-risk ${riskClass}">Risco ${item.risk}</span></td>
      </tr>
    `;
  }).join("");
};

function generatePremiumPDFV7() {
  if (!state.lastAnalysis) {
    showToast("Realize uma análise antes de baixar o relatório.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");
  const analysis = state.lastAnalysis;
  const today = new Date();

  function darkPage() {
    pdf.setFillColor(2, 6, 23);
    pdf.rect(0, 0, 210, 297, "F");
  }

  function footer(page) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(120, 130, 150);
    pdf.text("LegalScan AI • Projeto demonstrativo para portfólio", 14, 286);
    pdf.text(`Página ${page}`, 182, 286);
  }

  darkPage();
  pdf.setFillColor(15, 23, 42);
  pdf.roundedRect(14, 18, 182, 238, 8, 8, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(30);
  pdf.text("LegalScan AI", 26, 46);

  pdf.setTextColor(196, 181, 253);
  pdf.setFontSize(11);
  pdf.text("By Rafacodehub", 26, 55);

  pdf.setDrawColor(139, 92, 246);
  pdf.line(26, 66, 184, 66);

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(21);
  pdf.text("Relatório de Análise Contratual", 26, 88);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(203, 213, 225);
  pdf.text(`Gerado em: ${today.toLocaleDateString("pt-BR")} ${today.toLocaleTimeString("pt-BR")}`, 26, 100);
  pdf.text(`Usuário: ${USER}`, 26, 108);

  pdf.setFillColor(30, 41, 59);
  pdf.circle(105, 150, 34, "F");
  pdf.setTextColor(255,255,255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(34);
  pdf.text(String(analysis.score), 95, 153);
  pdf.setFontSize(11);
  pdf.text("/100", 113, 153);
  pdf.setTextColor(245, 158, 11);
  pdf.setFontSize(14);
  pdf.text(`Risco ${analysis.risk}`, 86, 174);

  pdf.setTextColor(203, 213, 225);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const executive = pdf.splitTextToSize(
    "Resumo executivo: contrato analisado localmente, com identificação de riscos, cláusulas relevantes e pontos de atenção para revisão.",
    150
  );
  pdf.text(executive, 30, 205);

  footer(1);

  pdf.addPage();
  darkPage();

  pdf.setTextColor(255,255,255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("Insights detalhados", 14, 24);

  pdf.setDrawColor(139, 92, 246);
  pdf.line(14, 31, 196, 31);

  let y = 46;

  analysis.insights.forEach((item, index) => {
    if (y > 245) {
      footer(pdf.internal.getNumberOfPages());
      pdf.addPage();
      darkPage();
      y = 24;
    }

    pdf.setFillColor(15, 23, 42);
    pdf.roundedRect(14, y, 182, 28, 5, 5, "F");

    pdf.setTextColor(255,255,255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(`${index + 1}. ${item.label}`, 20, y + 9);

    pdf.setTextColor(203,213,225);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    const desc = pdf.splitTextToSize(item.description, 158);
    pdf.text(desc.slice(0, 2), 20, y + 17);

    y += 34;
  });

  y += 6;
  pdf.setTextColor(255,255,255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text("Cláusulas detectadas", 14, y);

  y += 10;
  pdf.setTextColor(203,213,225);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  const clauses = pdf.splitTextToSize(analysis.clauses.join(" • ") || "Nenhuma cláusula detectada.", 180);
  pdf.text(clauses, 14, y);

  footer(pdf.internal.getNumberOfPages());

  const fileName = `relatorio-legalscan-ai-${Date.now()}.pdf`;
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);

  state.lastReportUrl = url;
  state.lastReportName = fileName;

  pdf.save(fileName);
  saveReportHistory(fileName, url);
  renderReports();
  showToast("PDF premium gerado com sucesso.");
}

elements.downloadReportBtn.replaceWith(elements.downloadReportBtn.cloneNode(true));
elements.downloadReportBtn = document.getElementById("downloadReportBtn");
elements.downloadReportBtn.addEventListener("click", generatePremiumPDFV7);

const generateReportFromPageV7 = document.getElementById("generateReportFromPage");
if (generateReportFromPageV7) {
  generateReportFromPageV7.replaceWith(generateReportFromPageV7.cloneNode(true));
  document.getElementById("generateReportFromPage").addEventListener("click", generatePremiumPDFV7);
}

document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
document.getElementById("welcomePage").classList.add("active");
document.querySelectorAll(".menu-item").forEach((m) => m.classList.remove("active"));
document.querySelector('.menu-item[data-page="dashboard"]').classList.add("active");
if (reportArea) reportArea.classList.add("is-empty");

const onboardingModal = document.getElementById("onboardingModal");
const onboardingSlides = document.querySelectorAll(".onboarding-slide");
const onboardingDots = document.getElementById("onboardingDots");
const onboardingPrev = document.getElementById("onboardingPrev");
const onboardingNext = document.getElementById("onboardingNext");
const skipOnboardingBtn = document.getElementById("skipOnboardingBtn");
let onboardingIndex = 0;

function renderOnboarding() {
  if (!onboardingSlides.length) return;

  onboardingSlides.forEach((slide, index) => {
    slide.classList.toggle("active", index === onboardingIndex);
  });

  onboardingDots.innerHTML = Array.from(onboardingSlides)
    .map((_, index) => `<span class="${index === onboardingIndex ? "active" : ""}"></span>`)
    .join("");

  onboardingPrev.style.visibility = onboardingIndex === 0 ? "hidden" : "visible";
  onboardingNext.textContent = onboardingIndex === onboardingSlides.length - 1 ? "Criar conta" : "Próximo";
}

function closeOnboarding() {
  onboardingModal.classList.remove("active");
  localStorage.setItem("legalscan-onboarding", "done");
  setLoggedInUI();
  showToast("Conta Rafacodehub ativada.");
}

if (onboardingNext) {
  onboardingNext.addEventListener("click", () => {
    if (onboardingIndex === onboardingSlides.length - 1) {
      closeOnboarding();
      return;
    }

    onboardingIndex++;
    renderOnboarding();
  });
}

if (onboardingPrev) {
  onboardingPrev.addEventListener("click", () => {
    onboardingIndex = Math.max(0, onboardingIndex - 1);
    renderOnboarding();
  });
}

if (skipOnboardingBtn) {
  skipOnboardingBtn.addEventListener("click", closeOnboarding);
}

if (localStorage.getItem("legalscan-onboarding") === "done") {
  onboardingModal.classList.remove("active");
} else {
  onboardingModal.classList.add("active");
  renderOnboarding();
}

const mobileFab = document.getElementById("mobileFab");
if (mobileFab) {
  mobileFab.addEventListener("click", () => switchPage("dashboard"));
}

const originalAnalyzeTextV8 = analyzeText;
analyzeText = function(text) {
  const analysis = originalAnalyzeTextV8(text);

  analysis.insights.push({
    label: "IA detectou possível cláusula abusiva",
    description: "A combinação de multa, rescisão e obrigações financeiras pode exigir revisão detalhada antes da assinatura.",
    severity: "high",
    icon: icons.alert,
  });

  analysis.insights.push({
    label: "Probabilidade de litígio: 68%",
    description: "Com base nos termos identificados, existe chance moderada de conflito caso as obrigações não sejam esclarecidas.",
    severity: "medium",
    icon: icons.scale,
  });

  analysis.insights.push({
    label: "Recomendação jurídica",
    description: "Revisar multa, rescisão antecipada, venda do imóvel e obrigações acessórias antes da assinatura.",
    severity: "medium",
    icon: icons.file,
  });

  return analysis;
};

function animateScoreTo(value) {
  const el = elements.riskScore;
  const start = 0;
  const duration = 900;
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const current = Math.round(start + (value - start) * progress);
    el.textContent = current;

    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

const originalRenderAnalysisV8 = renderAnalysis;
renderAnalysis = function(analysis) {
  originalRenderAnalysisV8(analysis);
  elements.riskScore.textContent = "0";
  animateScoreTo(analysis.score);
};

function showLoadingSteps(callback) {
  analysisLoading.classList.add("active");
  loadingSteps.forEach((step) => step.classList.remove("active", "done"));

  const stageNames = ["Upload", "Parsing", "NLP", "Risk Engine", "Final Report"];
  loadingSteps.forEach((step, index) => {
    step.textContent = stageNames[index] || step.textContent;
  });

  let index = 0;

  const interval = setInterval(() => {
    loadingSteps.forEach((step, stepIndex) => {
      step.classList.toggle("active", stepIndex === index);
      if (stepIndex < index) step.classList.add("done");
    });

    index++;

    if (index > loadingSteps.length) {
      clearInterval(interval);
      loadingSteps.forEach((step) => step.classList.add("done"));
      setTimeout(() => {
        analysisLoading.classList.remove("active");
        callback();
      }, 380);
    }
  }, 520);
}

const originalGeneratePremiumPDFV8 = generatePremiumPDFV7;
generatePremiumPDFV7 = function() {
  if (!state.lastAnalysis) {
    showToast("Realize uma análise antes de baixar o relatório.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");
  const analysis = state.lastAnalysis;
  const today = new Date();

  function darkPage() {
    pdf.setFillColor(2, 6, 23);
    pdf.rect(0, 0, 210, 297, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(36);
    pdf.setGState(new pdf.GState({ opacity: 0.035 }));
    pdf.text("LegalScan AI", 40, 160, { angle: 35 });
    pdf.setGState(new pdf.GState({ opacity: 1 }));
  }

  function footer(page) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(120, 130, 150);
    pdf.text("Generated by LegalScan AI", 14, 282);
    pdf.text("Projeto demonstrativo para fins de portfólio", 14, 287);
    pdf.text(`Página ${page}`, 182, 287);
  }

  function card(x, y, w, h, title, value, color = [255, 255, 255]) {
    pdf.setFillColor(15, 23, 42);
    pdf.roundedRect(x, y, w, h, 5, 5, "F");
    pdf.setTextColor(148, 163, 184);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(title, x + 6, y + 9);
    pdf.setTextColor(...color);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(String(value), x + 6, y + 22);
  }

  darkPage();

  pdf.setFillColor(15, 23, 42);
  pdf.roundedRect(14, 14, 182, 250, 8, 8, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.text("LegalScan AI", 24, 38);

  pdf.setTextColor(196, 181, 253);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text("Generated by LegalScan AI", 24, 48);

  pdf.setDrawColor(139, 92, 246);
  pdf.line(24, 58, 186, 58);

  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("Relatório de Análise Contratual", 24, 78);

  pdf.setTextColor(203, 213, 225);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Gerado em: ${today.toLocaleDateString("pt-BR")} ${today.toLocaleTimeString("pt-BR")}`, 24, 91);
  pdf.text(`Usuário: ${USER}`, 24, 100);

  card(24, 118, 50, 32, "Score", `${analysis.score}/100`, [255, 255, 255]);
  card(80, 118, 50, 32, "Risco", analysis.risk, [245, 158, 11]);
  card(136, 118, 50, 32, "Confiança", `${analysis.confidence}%`, [196, 181, 253]);

  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255,255,255);
  pdf.setFontSize(14);
  pdf.text("Resumo executivo", 24, 170);

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(203, 213, 225);
  pdf.setFontSize(10);
  const executive = pdf.splitTextToSize(
    "Contrato analisado localmente, com identificação de riscos, cláusulas relevantes, probabilidade de litígio e recomendações jurídicas simuladas. Este relatório é demonstrativo e não substitui revisão jurídica profissional.",
    160
  );
  pdf.text(executive, 24, 180);

  pdf.setFillColor(88,28,135);
  pdf.roundedRect(24, 224, 162, 16, 4, 4, "F");
  pdf.setTextColor(255,255,255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Generated by LegalScan AI", 84, 234);

  footer(1);

  pdf.addPage();
  darkPage();

  pdf.setTextColor(255,255,255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("Insights detalhados", 14, 24);

  pdf.setDrawColor(139,92,246);
  pdf.line(14, 31, 196, 31);

  let y = 46;

  analysis.insights.forEach((item, index) => {
    if (y > 245) {
      footer(pdf.internal.getNumberOfPages());
      pdf.addPage();
      darkPage();
      y = 24;
    }

    pdf.setFillColor(15,23,42);
    pdf.roundedRect(14, y, 182, 30, 5, 5, "F");

    pdf.setTextColor(255,255,255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(`${index + 1}. ${item.label}`, 20, y + 9);

    pdf.setTextColor(203,213,225);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    const desc = pdf.splitTextToSize(item.description, 158);
    pdf.text(desc.slice(0, 2), 20, y + 17);

    y += 36;
  });

  y += 6;
  pdf.setTextColor(255,255,255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.text("Cláusulas detectadas", 14, y);
  y += 10;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(203,213,225);

  analysis.clauses.forEach((clause) => {
    if (y > 260) {
      footer(pdf.internal.getNumberOfPages());
      pdf.addPage();
      darkPage();
      y = 24;
    }

    pdf.text(`• ${clause}`, 18, y);
    y += 7;
  });

  footer(pdf.internal.getNumberOfPages());

  const fileName = `relatorio-legalscan-ai-${Date.now()}.pdf`;
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);

  state.lastReportUrl = url;
  state.lastReportName = fileName;

  pdf.save(fileName);
  saveReportHistory(fileName, url);
  renderReports();
  showToast("PDF premium gerado com sucesso.");
};

elements.downloadReportBtn.replaceWith(elements.downloadReportBtn.cloneNode(true));
elements.downloadReportBtn = document.getElementById("downloadReportBtn");
elements.downloadReportBtn.addEventListener("click", generatePremiumPDFV7);

const reportPageButtonV8 = document.getElementById("generateReportFromPage");
if (reportPageButtonV8) {
  reportPageButtonV8.replaceWith(reportPageButtonV8.cloneNode(true));
  document.getElementById("generateReportFromPage").addEventListener("click", generatePremiumPDFV7);
}

const accountPlanText = document.getElementById("accountPlanText");

function syncPlanEverywhere(plan) {
  const cleanPlan = plan || "Plano Gratuito";

  const profilePlan = document.querySelector("#profileButton p");
  if (profilePlan) profilePlan.textContent = cleanPlan;

  if (accountPlanText) {
    accountPlanText.textContent = `Plano atual: ${cleanPlan.replace("Plano ", "")}`;
  }

  localStorage.setItem("legalscan-plan", cleanPlan);
}

document.querySelectorAll(".plan-option").forEach((option) => {
  option.addEventListener("click", () => {
    syncPlanEverywhere(option.dataset.plan);
  });
});

syncPlanEverywhere(localStorage.getItem("legalscan-plan") || "Plano Gratuito");

window.addEventListener("load", () => {
  const onboarding = document.getElementById("onboardingModal");
  if (onboarding) {
    onboarding.classList.add("active");
    onboardingIndex = 0;
    renderOnboarding();
  }
});

function closeOnboarding() {
  onboardingModal.classList.remove("active");
  setLoggedInUI();
  showToast("Conta Rafacodehub ativada.");
}

function showLoadingSteps(callback) {
  analysisLoading.classList.add("active");
  loadingSteps.forEach((step) => step.classList.remove("active", "done"));

  const stageNames = [
    "Upload do documento",
    "Leitura do conteúdo",
    "Interpretação jurídica",
    "Cálculo de risco",
    "Geração dos insights"
  ];

  loadingSteps.forEach((step, index) => {
    step.textContent = stageNames[index] || step.textContent;
  });

  let index = 0;

  const interval = setInterval(() => {
    loadingSteps.forEach((step, stepIndex) => {
      step.classList.toggle("active", stepIndex === index);
      if (stepIndex < index) step.classList.add("done");
    });

    index++;

    if (index > loadingSteps.length) {
      clearInterval(interval);
      loadingSteps.forEach((step) => step.classList.add("done"));
      setTimeout(() => {
        analysisLoading.classList.remove("active");
        callback();
      }, 380);
    }
  }, 520);
}

const originalSwitchPage = switchPage;

switchPage = function(pageId) {
  const pages = document.querySelectorAll(".page");

  pages.forEach((page) => {
    page.classList.remove("active");
  });

  setTimeout(() => {
    originalSwitchPage(pageId);

    const target = document.getElementById(pageId);
    if (target) {
      requestAnimationFrame(() => {
        target.classList.add("active");
      });
    }
  }, 120);
};

window.showToast = function(message, subtitle = "") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerHTML = subtitle
    ? `<strong>${message}</strong><br><span>${subtitle}</span>`
    : `<span>${message}</span>`;

  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
};

document.querySelectorAll(".modal").forEach((modal) => {
  const updatePointer = () => {
    modal.style.pointerEvents = modal.classList.contains("active") ? "auto" : "none";
  };
  updatePointer();
  new MutationObserver(updatePointer).observe(modal, {
    attributes: true,
    attributeFilter: ["class"]
  });
});
