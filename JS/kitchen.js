const GAS_URL = "https://script.google.com/macros/s/AKfycbwxS7JnKWE49tvIITJ9XEGYbwTLfJ8Uu6M11zl4dYXGug_OQb3O2evO_R0dnOtt5ohR/exec";

const notifySound = new Audio("audio/decision.mp3");
let knownNumbers = [];
let soundEnabled = false;
let isUpdating = false; // 状態更新中かどうか

document.getElementById("start-btn").addEventListener("click", function() {
  soundEnabled = true;
  this.style.display = "none";
  document.querySelector(".kitchen-main").style.display = "block";

  notifySound.play();
  notifySound.pause();
  notifySound.currentTime = 0;
  
  loadOrders();
  setInterval(loadOrders, 3000);
});

function loadOrders() {
  if (isUpdating) return;

  fetch(GAS_URL + "?action=list")
    .then(response => response.json())
    .then(orders => {
      if (isUpdating) return; // ← この1行を追加(古い返事を捨てる)

      const activeList = document.getElementById("active-list");
      const historyList = document.getElementById("history-list");
      activeList.innerHTML = "";
      historyList.innerHTML = "";

      const currentNumbers = [];
const historyOrders = [];

orders.forEach(order => {
  if (order.status === "受け渡し済み") {
    historyOrders.push(order);
  } else {
    currentNumbers.push(order.number);
    activeList.appendChild(createCard(order));
  }
});

// 履歴は番号が大きい順に並べて、直近5件だけ表示
historyOrders
  .sort((a, b) => b.number - a.number)
  .slice(0, 5)
  .forEach(order => {
    historyList.appendChild(createCard(order));
  });

      const hasNew = currentNumbers.some(n => !knownNumbers.includes(n));
      if (hasNew && soundEnabled && knownNumbers.length > 0) {
        notifySound.play();
      }
      knownNumbers = currentNumbers;
    });
}

function createCard(order) {
  const card = document.createElement("div");

  if (order.status === "未着手") {
    card.className = "order-card pending";
  } else if (order.status === "呼び出し中") {
    card.className = "order-card cooking";
  } else {
    card.className = "order-card";
  }

  const numberEl = document.createElement("div");
  numberEl.className = "card-number";
  numberEl.textContent = order.number;
  card.appendChild(numberEl);

  const body = document.createElement("div");
  body.className = "card-body";

  const items = document.createElement("div");
  items.className = "card-items";
  order.orderText.split(", ").forEach(text => {
    const item = document.createElement("div");
    item.className = "card-item";
    item.textContent = text;
    items.appendChild(item);
  });
  body.appendChild(items);

  const buttons = document.createElement("div");
  buttons.className = "card-buttons";

  if (order.status === "未着手") {
    const cookBtn = document.createElement("button");
    cookBtn.className = "cook-btn";
    cookBtn.textContent = "調理完了";
    cookBtn.addEventListener("click", function() {
      this.textContent = "処理中...";
      this.disabled = true;
      updateStatus(order.number, "呼び出し中");
    });
    buttons.appendChild(cookBtn);

  } else if (order.status === "呼び出し中") {
    const label = document.createElement("span");
    label.className = "calling-label";
    label.textContent = "呼び出し中";
    buttons.appendChild(label);

    const doneBtn = document.createElement("button");
    doneBtn.className = "done-btn";
    doneBtn.textContent = "受け渡し済み";
    doneBtn.addEventListener("click", function() {
      this.textContent = "処理中...";
      this.disabled = true;
      updateStatus(order.number, "受け渡し済み");
    });
    buttons.appendChild(doneBtn);
  }

  body.appendChild(buttons);
  card.appendChild(body);

  return card;
}

function updateStatus(number, status) {
  isUpdating = true; // ここから自動更新を止める

  fetch(GAS_URL + "?action=update&number=" + number + "&status=" + encodeURIComponent(status))
    .then(response => response.json())
    .then(() => {
      isUpdating = false; // 更新が終わったので再開
      loadOrders();
    });
}

loadOrders();
setInterval(loadOrders, 3000);
