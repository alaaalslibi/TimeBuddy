let editIndex = null;

window.onload = function () {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
  ladeTermine();
  applyLanguage();
};

function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

function terminSpeichern() {
  const name = document.getElementById("name").value.trim();
  const telefon = document.getElementById("telefon").value.trim();
  const email = document.getElementById("email").value.trim();
  const datum = document.getElementById("datum").value;
  const uhrzeit = document.getElementById("uhrzeit").value;
  const status = document.getElementById("status").value;
  const notiz = document.getElementById("notiz").value.trim();

  if (!name || !telefon || !email || !datum || !uhrzeit) {
    showToast("Bitte füllen Sie alle Pflichtfelder aus.");
    return;
  }

  const termine = JSON.parse(localStorage.getItem("termine") || "[]");
  const termin = { name, telefon, email, datum, uhrzeit, status, notiz };

  if (editIndex !== null) {
    termine[editIndex] = termin;
    editIndex = null;
    document.getElementById("save-btn").classList.remove("editing");
  } else {
    termine.push(termin);
  }

  localStorage.setItem("termine", JSON.stringify(termine));
  ladeTermine();
  clearForm();
  showToast("Termin erfolgreich gespeichert!");
}

function resetForm() {
  clearForm();
  showToast("Formular zurückgesetzt.");
}

function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("telefon").value = "";
  document.getElementById("email").value = "";
  document.getElementById("datum").value = "";
  document.getElementById("uhrzeit").value = "";
  document.getElementById("status").value = "Offen";
  document.getElementById("notiz").value = "";
  document.getElementById("save-btn").classList.remove("editing");
}

function showToast(msg) {
  const toast = document.getElementById("notification");
  toast.textContent = msg;
  toast.style.display = "block";
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    toast.style.display = "none";
  }, 3000);
}

function ladeTermine() {
  const termine = JSON.parse(localStorage.getItem("termine") || "[]");
  const table = document.getElementById("tabelle-body");
  table.innerHTML = "";

  termine.forEach((termin, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${termin.name}</td>
      <td>${termin.telefon}</td>
      <td>${termin.email}</td>
      <td>${termin.datum}</td>
      <td>${termin.uhrzeit}</td>
      <td><span class="status-${termin.status}">${termin.status}</span></td>
      <td>${termin.notiz || ""}</td>
      <td>
        <button class="action-btn edit" onclick="bearbeiten(${index})">✏️</button>
        <button class="action-btn delete" onclick="loescheTermin(${index})">🗑️</button>
        <br />
        <select onchange="statusAendern(${index}, this.value)">
          <option value="Offen" ${termin.status === "Offen" ? "selected" : ""}>Offen</option>
          <option value="Erledigt" ${termin.status === "Erledigt" ? "selected" : ""}>Erledigt</option>
          <option value="Wichtig" ${termin.status === "Wichtig" ? "selected" : ""}>Wichtig</option>
        </select>
      </td>
    `;
    table.appendChild(row);
  });

  updateDashboard(termine);
  updateChart(termine);
}

function bearbeiten(index) {
  const termine = JSON.parse(localStorage.getItem("termine") || "[]");
  const termin = termine[index];
  document.getElementById("name").value = termin.name;
  document.getElementById("telefon").value = termin.telefon;
  document.getElementById("email").value = termin.email;
  document.getElementById("datum").value = termin.datum;
  document.getElementById("uhrzeit").value = termin.uhrzeit;
  document.getElementById("status").value = termin.status;
  document.getElementById("notiz").value = termin.notiz;
  editIndex = index;
  document.getElementById("save-btn").classList.add("editing");
}

function loescheTermin(index) {
  if (!confirm("Möchten Sie diesen Termin wirklich löschen?")) return;
  const termine = JSON.parse(localStorage.getItem("termine") || "[]");
  termine.splice(index, 1);
  localStorage.setItem("termine", JSON.stringify(termine));
  ladeTermine();
  showToast("Termin gelöscht.");
}

function statusAendern(index, neuerStatus) {
  const termine = JSON.parse(localStorage.getItem("termine") || "[]");
  termine[index].status = neuerStatus;
  localStorage.setItem("termine", JSON.stringify(termine));
  ladeTermine();
  showToast("Status geändert.");
}

function updateDashboard(termine) {
  let offen = 0, erledigt = 0, wichtig = 0;
  termine.forEach(t => {
    if (t.status === "Offen") offen++;
    if (t.status === "Erledigt") erledigt++;
    if (t.status === "Wichtig") wichtig++;
  });
  document.getElementById("total").textContent = `📋 Gesamt: ${termine.length}`;
  document.getElementById("offen").textContent = `🟡 Offen: ${offen}`;
  document.getElementById("erledigt").textContent = `✅ Erledigt: ${erledigt}`;
  document.getElementById("wichtig").textContent = `❗ Wichtig: ${wichtig}`;
}

function updateChart(termine) {
  const ctx = document.getElementById('statusChart').getContext('2d');
  if (window.chartInstance) window.chartInstance.destroy();
  let offen = 0, erledigt = 0, wichtig = 0;
  termine.forEach(t => {
    if (t.status === "Offen") offen++;
    if (t.status === "Erledigt") erledigt++;
    if (t.status === "Wichtig") wichtig++;
  });
  window.chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Offen', 'Erledigt', 'Wichtig'],
      datasets: [{
        data: [offen, erledigt, wichtig],
        backgroundColor: ['#6c757d', '#28a745', '#dc3545'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function exportToPDF() {
  const element = document.getElementById("main-content");
  html2pdf().from(element).save("Termine.pdf");
}

function switchLanguage() {
  const current = localStorage.getItem("lang") || "de";
  const next = current === "de" ? "en" : "de";
  localStorage.setItem("lang", next);
  applyLanguage();
}

function applyLanguage() {
  const lang = localStorage.getItem("lang") || "de";
  const texts = {
    de: {
      pdf: "PDF Exportieren",
      print: "Drucken",
      lang: "🌐 Sprache wechseln"
    },
    en: {
      pdf: "Export PDF",
      print: "Print",
      lang: "🌐 Language"
    }
  };

  const t = texts[lang];
  document.getElementById("export-pdf").textContent = t.pdf;
  document.getElementById("print").textContent = t.print;
  document.getElementById("lang-toggle").textContent = t.lang;
}
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === "1234" && password === "1234") {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("main-content").style.display = "block";
    ladeTermine();
    applyLanguage();
  } else {
    document.getElementById("login-error").textContent = "Benutzername oder Passwort falsch!";
  }
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && document.getElementById("login-screen").style.display !== "none") {
    login();
  }
});
