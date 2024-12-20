const app = {
  data: {
    totalSalesGoal: 4300,
    totalSwitchGoal: 1600,
    users: [],
    sales: {},
    switches: {},
    avatars: {},
    history: []
  },

  // Lägg till användare
  addUser(name, avatar) {
    if (!this.data.users.includes(name)) { 
      this.data.users.push(name);
      this.data.sales[name] = 0;
      this.data.switches[name] = 0;
      this.data.avatars[name] = avatar || "default-avatar.png";
      this.saveData();
      this.render();
    } else {
      alert("Användarnamnet finns redan. Välj ett annat namn.");
    }
  },

  // Ta bort användare
  removeUser(name) {
    const index = this.data.users.indexOf(name);
    if (index !== -1) {
      this.data.users.splice(index, 1);
      delete this.data.sales[name];
      delete this.data.switches[name];
      delete this.data.avatars[name];
      this.saveData();
      this.render();
    }
  },

  // Komprimera bild innan lagring
  compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxWidth = 800; // Max bredd för att minska storlek
        const scaleSize = maxWidth / img.width;

        canvas.width = maxWidth;
        canvas.height = img.height * scaleSize;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedData = canvas.toDataURL("image/jpeg", 0.9); // Komprimera till 60% kvalitet
        callback(compressedData);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  },

  // Funktioner för att öka/minska poäng
  incrementSales(name) {
    this.showSalesOptions(name);
  },

  decrementSales(name) {
    if (this.data.sales[name] > 0) {
      this.data.sales[name]--;
      this.data.totalSalesGoal++;
      this.saveData();
      this.updateMainUI();
    }
  },

  incrementSwitches(name) {
    this.data.switches[name]++;
    this.data.totalSwitchGoal--;
    this.logHistory(name, "switches");
    this.saveData();
    this.updateMainUI();
  },

  logHistory(name, type) {
    const timestamp = new Date().toISOString();
    this.data.history.push({ name, type, timestamp });
  },

  decrementSwitches(name) {
    if (this.data.switches[name] > 0) {
      this.data.switches[name]--;
      this.data.totalSwitchGoal++;
      this.saveData();
      this.updateMainUI();
    }
  },

  getRocket(period, type) {
    const now = new Date();
    let start, end;

    if (period === "day") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start);
      end.setDate(start.getDate() + 1);
    } else if (period === "week") {
      const dayOfWeek = now.getDay() || 7;
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1);
      end = new Date(start);
      end.setDate(start.getDate() + 7);
    } else if (period === "prev-week") {
      const dayOfWeek = now.getDay() || 7;
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1);
      start = new Date(end);
      start.setDate(end.getDate() - 7);
    } else if (period === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(start);
      end.setMonth(start.getMonth() + 1);
    }

    const filtered = this.data.history.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= start && entryDate < end && entry.type === type;
    });

    const counts = {};
    filtered.forEach(entry => {
      counts[entry.name] = (counts[entry.name] || 0) + 1;
    });

    const [topPerformer] = Object.entries(counts).sort(([, a], [, b]) => b - a);
    return topPerformer ? `${topPerformer[0]}: ${topPerformer[1]}` : "Ingen";
  },

  // Spara och ladda data
  saveData() {
    localStorage.setItem("scoreboardData", JSON.stringify(this.data));
  },

  loadData() {
    const savedData = JSON.parse(localStorage.getItem("scoreboardData"));
    if (savedData) this.data = savedData;
  },

  // Rendera huvud UI
  updateMainUI() {
    const salesGoal = document.getElementById("sales-goal");
    const switchesGoal = document.getElementById("switches-goal");

    if (salesGoal && switchesGoal) {
      salesGoal.textContent = this.data.totalSalesGoal;
      switchesGoal.textContent = this.data.totalSwitchGoal;
    }

    const userCards = document.getElementById("user-cards");
    if (userCards) {
      userCards.innerHTML = ""; // Töm korten först

      this.data.users.forEach(name => {
        const card = document.createElement("div");
        card.className = "user-card";
        card.innerHTML = `
          <img src="${this.data.avatars[name]}" alt="Avatar" class="avatar">
          <h3>${name}</h3>
          <p>Sälj: <span>${this.data.sales[name]}</span></p>
          <p>Tips: <span>${this.data.switches[name]}</span></p>
        `;

        const buttons = document.createElement("div");
        buttons.innerHTML = `
          <button onclick="app.incrementSales('${name}')">+ Sälj</button>
          <button onclick="app.decrementSales('${name}')">- Sälj</button>
          <button onclick="app.incrementSwitches('${name}')">+ Tips</button>
          <button onclick="app.decrementSwitches('${name}')">- Tips</button>
        `;
        card.appendChild(buttons);
        userCards.appendChild(card);
      });
    }

    this.updateSidebarUI();
  },

  // Uppdatera sidebar UI
  updateSidebarUI() {
    document.getElementById("goal-sales").textContent = this.data.totalSalesGoal;
    document.getElementById("goal-switches").textContent = this.data.totalSwitchGoal;

    document.getElementById("top-sales").innerHTML = this.getTopPerformers("sales")
      .map(([name, score]) => `<p>${name}: ${score}</p>`).join("") || "<p>Inga resultat</p>";

    document.getElementById("top-switches").innerHTML = this.getTopPerformers("switches")
      .map(([name, score]) => `<p>${name}: ${score}</p>`).join("") || "<p>Inga resultat</p>";

    document.getElementById("daily-rocket").textContent = this.getRocket("day", "sales");
    document.getElementById("weekly-rocket").textContent = this.getRocket("week", "sales");
    document.getElementById("prev-week-rocket").textContent = this.getRocket("prev-week", "sales");
    document.getElementById("monthly-seller").textContent = this.getRocket("month", "sales");
  },

  getTopPerformers(type, count = 3) {
    const scores = type === "sales" ? this.data.sales : this.data.switches;
    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count);
  },

  // Visa val för sälj
  showSalesOptions(name) {
    const modal = document.createElement("div");
    modal.className = "sales-modal";
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Välj typ av sälj</h3>
        <button onclick="app.confirmSale('${name}', 'Kampanj')">Kampanj</button>
        <button onclick="app.confirmSale('${name}', 'Mäklartips')">Mäklartips</button>
        <button onclick="app.confirmSale('${name}', 'Säljtips')">Säljtips</button>
        <button onclick="app.confirmSale('${name}', 'Formulär')">Formulär</button>
        <button onclick="app.closeModal()">Avbryt</button>
      </div>
    `;
    document.body.appendChild(modal);
  },

  confirmSale(name, type) {
    this.data.sales[name]++;
    this.data.totalSalesGoal--;
    this.logHistory(name, type);
    this.saveData();
    this.updateMainUI();
    this.closeModal();
  },

  closeModal() {
    const modal = document.querySelector(".sales-modal");
    if (modal) document.body.removeChild(modal);
  },

  // Generera rapport
  generateReport() {
    const reportSection = document.getElementById("sales-report");
    if (reportSection) {
      reportSection.innerHTML = ""; // Töm befintlig rapport

      if (this.data.history.length === 0) {
        reportSection.innerHTML = "<p>Ingen försäljningshistorik ännu.</p>";
        return;
      }

      const reportTable = document.createElement("table");
      reportTable.innerHTML = `
        <thead>
          <tr>
            <th>Namn</th>
            <th>Typ av försäljning</th>
            <th>Tidpunkt</th>
          </tr>
        </thead>
        <tbody>
          ${this.data.history
            .map(entry => `
              <tr>
                <td>${entry.name}</td>
                <td>${entry.type}</td>
                <td>${new Date(entry.timestamp).toLocaleString()}</td>
              </tr>
            `)
            .join("")}
        </tbody>
      `;
      reportSection.appendChild(reportTable);
    }
  },

  // Nollställ alla siffror
  resetData() {
    if (confirm("Är du säker på att du vill nollställa alla siffror? Detta kan inte ångras.")) {
      this.data.sales = {};
      this.data.switches = {};
      this.data.history = [];
      this.data.totalSalesGoal = 4300;
      this.data.totalSwitchGoal = 1600;

      this.data.users.forEach(name => {
        this.data.sales[name] = 0;
        this.data.switches[name] = 0;
      });

      this.saveData();
      this.render();
    }
  },

  render() {
    this.loadData();
    if (window.location.pathname.includes("admin")) {
      this.updateAdminUI();
    } else {
      this.updateMainUI();
      this.addNavigationButton();
    }
  },

  // Uppdatera admin UI
  updateAdminUI() {
    const adminUsers = document.getElementById("admin-users");
    if (adminUsers) {
      adminUsers.innerHTML = this.data.users
        .map(name => `
          <div class="admin-user">
            <span>${name}</span>
            <button onclick="app.removeUser('${name}')">Ta bort</button>
          </div>
        `)
        .join("");
    }

    // Lägg till nollställningsknapp
    if (!document.getElementById("reset-btn")) {
      const resetButton = document.createElement("button");
      resetButton.id = "reset-btn";
      resetButton.textContent = "Nollställ alla siffror";
      resetButton.onclick = () => app.resetData();
      document.body.appendChild(resetButton);
    }

    // Generera rapport
    this.generateReport();
  },

   this.addNavigationToIndex();
 },

  addNavigationToIndex() {
    if (!document.getElementById("index-link")) {
      const button = document.createElement("button");
      button.id = "index-link";
      button.textContent = "Gå till Scoreboard";
      button.onclick = () => window.location.href = "index.html";
      document.body.appendChild(button);
    }
  },

  addNavigationButton() {
    if (!document.getElementById("admin-link")) {
      const button = document.createElement("button");
      button.id = "admin-link";
      button.textContent = "Gå till Admin";
      button.onclick = () => window.location.href = "admin.html";
      document.body.appendChild(button);
    }
  }
};

window.onload = () => app.render();
