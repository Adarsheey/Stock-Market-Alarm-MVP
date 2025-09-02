const form = document.getElementById("alarmForm");
const statusEl = document.getElementById("status");
const alarmSound = document.getElementById("alarmSound");
const demoModeCheckbox = document.getElementById("demoMode");

let alarm = null;
let checkInterval = null;

// Replace with your Alpha Vantage API key
const API_KEY = "KI2G6EATUOP4YKN7"; // ⚠️ Replace "demo" with your real key
const API_URL = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=";

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const symbol = document.getElementById("symbol").value.toUpperCase();
  const condition = document.getElementById("condition").value;
  const target = parseFloat(document.getElementById("target").value);
  const demoMode = demoModeCheckbox.checked;

  if (!symbol || isNaN(target)) {
    alert("Please enter valid details.");
    return;
  }

  alarm = { symbol, condition, target, demoMode };
  statusEl.innerText = `✅ Alarm set: ${symbol} ${condition} ${target} ${
    demoMode ? "(Demo Mode)" : ""
  }`;

  if (checkInterval) clearInterval(checkInterval);

  if (demoMode) {
    // Trigger alarm after 5 seconds for demo
    setTimeout(() => triggerAlarm(symbol, target, "Demo Price"), 5000);
  } else {
    // Poll API every 15s
    checkInterval = setInterval(() => checkPrice(alarm), 15000);
  }
});

async function checkPrice(alarm) {
  try {
    const response = await fetch(`${API_URL}${alarm.symbol}&apikey=${API_KEY}`);
    const data = await response.json();
    const price = parseFloat(data["Global Quote"]["05. price"]);

    if (!price) return;

    console.log(`Price of ${alarm.symbol}: ${price}`);

    let triggered = false;
    if (alarm.condition === "above" && price > alarm.target) triggered = true;
    if (alarm.condition === "below" && price < alarm.target) triggered = true;

    if (triggered) {
      clearInterval(checkInterval);
      triggerAlarm(alarm.symbol, alarm.target, price);
    } else {
      statusEl.innerText = `${alarm.symbol} is at ${price} → waiting for condition...`;
    }
  } catch (err) {
    console.error("Error fetching stock price:", err);
  }
}

function triggerAlarm(symbol, target, price) {
  statusEl.innerText = `🚨 ${symbol} hit target (${price})!`;
  alarmSound.play();
  alert(`🚨 ${symbol} price reached condition (target: ${target}, now: ${price})`);
}
