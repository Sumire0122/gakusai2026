const GAS_URL = "https://script.google.com/macros/s/AKfycbwxS7JnKWE49tvIITJ9XEGYbwTLfJ8Uu6M11zl4dYXGug_OQb3O2evO_R0dnOtt5ohR/exec";

// 全メニューカードを取得
const menuCards = document.querySelectorAll(".menu-card");

menuCards.forEach(card => {
  const price = Number(card.dataset.price); // data-price を数字として取得
  const qtyEl = card.querySelector(".qty");
  const minusBtn = card.querySelector(".minus");
  const plusBtn = card.querySelector(".plus");

  plusBtn.addEventListener("click", () => {
    let qty = Number(qtyEl.textContent);
    qty++;
    qtyEl.textContent = qty;
    updateTotal();
    updateOrderList();
  });

  minusBtn.addEventListener("click", () => {
    let qty = Number(qtyEl.textContent);
    if (qty > 0) {
      qty--;
      qtyEl.textContent = qty;
      updateTotal();
      updateOrderList();
    }
  });
});

// 合計金額を計算して表示する
function updateTotal() {
  let total = 0;

  menuCards.forEach(card => {
    const price = Number(card.dataset.price);
    const qty = Number(card.querySelector(".qty").textContent);
    total += price * qty;
  });

  document.querySelector(".total-price").textContent = total;
}

function updateOrderList() {
  const orderListEl = document.querySelector(".order-list");
  orderListEl.innerHTML = ""; // 一旦空にする

  menuCards.forEach(card => {
    const name = card.dataset.name;
    const qty = Number(card.querySelector(".qty").textContent);

    if (qty > 0) {
      const item = document.createElement("div");
      item.className = "order-item";
      item.textContent = `${name} ×${qty}`;
      orderListEl.appendChild(item);
    }
  });
}

document.querySelector(".confirm-btn").addEventListener("click", function() {
  const orderView = document.getElementById("order-view");
  const numberView = document.getElementById("number-view");
  const drinkBadge = document.querySelector(".drink-badge");

  if (this.textContent === "注文確定") {
    if (Number(document.querySelector(".total-price").textContent) === 0) {
      alert("メニューを選択してください");
      return;
    }
    this.textContent = "送信中...";
    this.disabled = true;

    const orderText = Array.from(menuCards)
      .filter(card => Number(card.querySelector(".qty").textContent) > 0)
      .map(card => `${card.dataset.name}×${card.querySelector(".qty").textContent}`)
      .join(", ");

    const total = document.querySelector(".total-price").textContent;

    fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ orderText, total })
    })
      .then(response => response.json())
      .then(data => {
        document.querySelector(".number-box").textContent = data.number;
        orderView.style.display = "none";
        numberView.style.display = "flex";
        drinkBadge.style.display = "none";
        this.textContent = "次の注文へ";
        this.disabled = false;
      });

  } else {
    orderView.style.display = "grid";
    numberView.style.display = "none";
    drinkBadge.style.display = "block";
    this.textContent = "注文確定";

    menuCards.forEach(card => {
      card.querySelector(".qty").textContent = 0;
    });
    updateTotal();
    updateOrderList();
  }
});