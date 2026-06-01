const plans = {
  balanced: {
    needs: 0.5,
    wants: 0.3,
    future: 0.2,
    note: "Keep wants fun, but give your future a seat at the table."
  },
  saving: {
    needs: 0.5,
    wants: 0.2,
    future: 0.3,
    note: "You are making tomorrow easier by saving before spending."
  },
  debt: {
    needs: 0.5,
    wants: 0.15,
    future: 0.35,
    note: "Use the future bucket for debt payments and savings momentum."
  }
};

const habits = [
  "Check your balance before buying",
  "Wait 24 hours before one want",
  "Move money into savings first",
  "Compare two prices before checkout",
  "Cook or pack one meal",
  "Cancel one unused expense",
  "Celebrate without spending"
];

const incomeInput = document.querySelector("#income");
const focusInputs = document.querySelectorAll("input[name='focus']");
const needsAmount = document.querySelector("#needsAmount");
const wantsAmount = document.querySelector("#wantsAmount");
const futureAmount = document.querySelector("#futureAmount");
const planNote = document.querySelector("#planNote");
const billForm = document.querySelector("#billForm");
const billName = document.querySelector("#billName");
const billAmount = document.querySelector("#billAmount");
const billDue = document.querySelector("#billDue");
const billHandled = document.querySelector("#billHandled");
const billsHandled = document.querySelector("#billsHandled");
const billsDue = document.querySelector("#billsDue");
const nextBill = document.querySelector("#nextBill");
const clearBills = document.querySelector("#clearBills");
const billList = document.querySelector("#billList");
const expenseForm = document.querySelector("#expenseForm");
const expenseName = document.querySelector("#expenseName");
const expenseAmount = document.querySelector("#expenseAmount");
const expenseType = document.querySelector("#expenseType");
const expenseCategory = document.querySelector("#expenseCategory");
const expensePeriod = document.querySelector("#expensePeriod");
const totalSpent = document.querySelector("#totalSpent");
const totalLeft = document.querySelector("#totalLeft");
const needsTrack = document.querySelector("#needsTrack");
const wantsTrack = document.querySelector("#wantsTrack");
const futureTrack = document.querySelector("#futureTrack");
const needsMeter = document.querySelector("#needsMeter");
const wantsMeter = document.querySelector("#wantsMeter");
const futureMeter = document.querySelector("#futureMeter");
const clearExpenses = document.querySelector("#clearExpenses");
const expenseList = document.querySelector("#expenseList");
const coachForm = document.querySelector("#coachForm");
const coachInput = document.querySelector("#coachInput");
const coachMessages = document.querySelector("#coachMessages");
const promptChips = document.querySelectorAll("[data-prompt]");
const challengeList = document.querySelector("#challengeList");
const canvas = document.querySelector("#moneyCanvas");
const ctx = canvas.getContext("2d");
let bills = JSON.parse(localStorage.getItem("spendwise-bills") || "[]");
let expenses = JSON.parse(localStorage.getItem("spendwise-expenses") || "[]");

const typeCategories = {
  food: "needs",
  bills: "needs",
  fun: "wants",
  streaming: "wants",
  transport: "needs",
  saving: "future",
  other: "wants"
};

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDueDate(dateString) {
  return parseLocalDate(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function daysUntil(dateString) {
  const today = parseLocalDate(todayString());
  const due = parseLocalDate(dateString);
  return Math.round((due - today) / 86400000);
}

function makeId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function selectedFocus() {
  return document.querySelector("input[name='focus']:checked").value;
}

function currentBudget() {
  const income = Math.max(Number(incomeInput.value) || 0, 0);
  const plan = plans[selectedFocus()];

  return {
    income,
    plan,
    needs: income * plan.needs,
    wants: income * plan.wants,
    future: income * plan.future
  };
}

function updatePlan() {
  const budget = currentBudget();

  needsAmount.textContent = formatMoney(budget.needs);
  wantsAmount.textContent = formatMoney(budget.wants);
  futureAmount.textContent = formatMoney(budget.future);
  planNote.textContent = budget.plan.note;
  renderTracker();
}

function drawMoneyMap() {
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#00d5ff";
  ctx.beginPath();
  ctx.roundRect(42, 64, 420, 260, 32);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(74, 94, 356, 200, 28);
  ctx.fill();

  ctx.strokeStyle = "#00758a";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(112, 242);
  ctx.bezierCurveTo(188, 120, 276, 280, 382, 142);
  ctx.stroke();

  const points = [
    [112, 242, "#ff6b6b"],
    [206, 170, "#ffd166"],
    [298, 232, "#7866ff"],
    [382, 142, "#b8ff4d"]
  ];

  points.forEach(([x, y, color], index) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = "#06313a";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x, y, 22 + index * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.fillStyle = "#06313a";
  ctx.font = "900 94px 'Google Sans', system-ui";
  ctx.fillText("$", 455, 285);

  ctx.fillStyle = "#b8ff4d";
  ctx.beginPath();
  ctx.roundRect(394, 36, 118, 86, 20);
  ctx.fill();

  ctx.fillStyle = "#06313a";
  ctx.font = "900 20px 'Google Sans', system-ui";
  ctx.fillText("SAVE", 424, 87);
}

function buildChallenge() {
  const saved = JSON.parse(localStorage.getItem("spendwise-habits") || "[]");

  habits.forEach((habit, index) => {
    const label = document.createElement("label");
    label.className = "check-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = saved.includes(index);
    checkbox.addEventListener("change", saveChallenge);

    const span = document.createElement("span");
    span.textContent = habit;

    label.append(checkbox, span);
    challengeList.append(label);
  });
}

function saveChallenge() {
  const checked = [...challengeList.querySelectorAll("input")]
    .map((input, index) => (input.checked ? index : null))
    .filter((value) => value !== null);

  localStorage.setItem("spendwise-habits", JSON.stringify(checked));
}

function billStatus(bill) {
  if (bill.handled) {
    return "handled";
  }

  const days = daysUntil(bill.due);
  if (days < 0) {
    return "overdue";
  }

  if (days <= 3) {
    return "due-soon";
  }

  return "upcoming";
}

function billStatusText(bill) {
  const status = billStatus(bill);
  const days = daysUntil(bill.due);

  if (status === "handled") {
    return "Handled";
  }

  if (status === "overdue") {
    return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} late`;
  }

  if (days === 0) {
    return "Due today";
  }

  return `Due in ${days} day${days === 1 ? "" : "s"}`;
}

function saveBills() {
  localStorage.setItem("spendwise-bills", JSON.stringify(bills));
}

function sortedBills() {
  return bills.slice().sort((a, b) => {
    if (a.handled !== b.handled) {
      return a.handled ? 1 : -1;
    }

    return parseLocalDate(a.due) - parseLocalDate(b.due);
  });
}

function renderBillList() {
  billList.innerHTML = "";

  if (bills.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No bills added yet.";
    billList.append(empty);
    return;
  }

  sortedBills().forEach((bill) => {
    const item = document.createElement("li");
    const checkbox = document.createElement("input");
    const details = document.createElement("div");
    const name = document.createElement("h3");
    const meta = document.createElement("div");
    const due = document.createElement("span");
    const status = document.createElement("span");
    const amount = document.createElement("span");

    item.className = `bill-card ${billStatus(bill)}`;
    checkbox.className = "bill-check";
    checkbox.type = "checkbox";
    checkbox.checked = bill.handled;
    checkbox.setAttribute("aria-label", `Mark ${bill.name} handled`);
    checkbox.addEventListener("change", () => toggleBillHandled(bill.id));

    name.textContent = bill.name;
    meta.className = "bill-meta";
    due.className = "bill-chip";
    due.textContent = `Due ${formatDueDate(bill.due)}`;
    status.className = "bill-chip bill-status";
    status.textContent = billStatusText(bill);
    amount.className = "bill-amount";
    amount.textContent = formatMoney(bill.amount);

    meta.append(due, status);
    details.append(name, meta);
    item.append(checkbox, details, amount);
    billList.append(item);
  });
}

function renderBills() {
  const totals = bills.reduce(
    (summary, bill) => {
      if (bill.handled) {
        summary.handled += bill.amount;
      } else {
        summary.due += bill.amount;
      }

      return summary;
    },
    { handled: 0, due: 0 }
  );
  const nextOpenBill = sortedBills().find((bill) => !bill.handled);

  billsHandled.textContent = formatMoney(totals.handled);
  billsDue.textContent = formatMoney(totals.due);
  nextBill.textContent = nextOpenBill ? `${nextOpenBill.name} ${formatDueDate(nextOpenBill.due)}` : "None";
  renderBillList();
}

function addBill(event) {
  event.preventDefault();

  const amount = Number(billAmount.value);
  const name = billName.value.trim();

  if (!name || amount <= 0 || !billDue.value) {
    return;
  }

  bills.push({
    id: makeId(),
    name,
    amount,
    due: billDue.value,
    handled: billHandled.checked
  });

  saveBills();
  renderBills();
  billForm.reset();
  billDue.value = todayString();
  billName.focus();
}

function toggleBillHandled(id) {
  bills = bills.map((bill) => {
    return bill.id === id ? { ...bill, handled: !bill.handled } : bill;
  });

  saveBills();
  renderBills();
}

function clearBillList() {
  bills = [];
  saveBills();
  renderBills();
}

function categoryTotals() {
  return expenses.reduce(
    (totals, expense) => {
      const monthlyAmount = monthlyExpenseAmount(expense);
      totals[expense.category] += monthlyAmount;
      totals.all += monthlyAmount;
      return totals;
    },
    { needs: 0, wants: 0, future: 0, all: 0 }
  );
}

function monthlyExpenseAmount(expense) {
  return expense.period === "weekly" ? expense.amount * 4 : expense.amount;
}

function expenseTypeLabel(type) {
  const labels = {
    food: "Food",
    bills: "Bills",
    fun: "Fun",
    streaming: "Streaming",
    transport: "Transport",
    saving: "Saving",
    other: "Other"
  };

  return labels[type] || "Other";
}

function meterValue(spent, limit) {
  if (limit <= 0) {
    return spent > 0 ? 100 : 0;
  }

  return Math.min((spent / limit) * 100, 100);
}

function renderMeter(trackElement, meterElement, spent, limit) {
  trackElement.textContent = `${formatMoney(spent)} of ${formatMoney(limit)}`;
  meterElement.value = meterValue(spent, limit);
}

function renderExpenseList() {
  expenseList.innerHTML = "";

  if (expenses.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "No spending logged yet.";
    expenseList.append(empty);
    return;
  }

  expenses
    .slice()
    .reverse()
    .forEach((expense) => {
      const item = document.createElement("li");
      item.className = "expense-item";

      const details = document.createElement("div");
      const name = document.createElement("strong");
      const meta = document.createElement("div");
      const type = document.createElement("span");
      const category = document.createElement("span");
      const period = document.createElement("span");
      const amount = document.createElement("span");
      const monthlyAmount = monthlyExpenseAmount(expense);

      name.textContent = expense.name;
      meta.className = "expense-meta";
      type.className = `type-badge type-${expense.type || "other"}`;
      type.textContent = expenseTypeLabel(expense.type);
      category.className = "period-badge";
      category.textContent = expense.category;
      period.className = "period-badge";
      period.textContent = expense.period || "monthly";
      amount.className = "expense-amount";
      amount.textContent = expense.period === "weekly"
        ? `${formatMoney(expense.amount)}/wk (${formatMoney(monthlyAmount)}/mo)`
        : `${formatMoney(expense.amount)}/mo`;

      meta.append(type, category, period);
      details.append(name, meta);
      item.append(details, amount);
      expenseList.append(item);
    });
}

function renderTracker() {
  const budget = currentBudget();
  const totals = categoryTotals();

  totalSpent.textContent = formatMoney(totals.all);
  totalLeft.textContent = formatMoney(budget.income - totals.all);
  renderMeter(needsTrack, needsMeter, totals.needs, budget.needs);
  renderMeter(wantsTrack, wantsMeter, totals.wants, budget.wants);
  renderMeter(futureTrack, futureMeter, totals.future, budget.future);
  renderExpenseList();
}

function saveExpenses() {
  localStorage.setItem("spendwise-expenses", JSON.stringify(expenses));
}

function addExpense(event) {
  event.preventDefault();

  const amount = Number(expenseAmount.value);
  const name = expenseName.value.trim();

  if (!name || amount <= 0) {
    return;
  }

  expenses.push({
    name,
    amount,
    type: expenseType.value,
    category: expenseCategory.value,
    period: expensePeriod.value
  });

  saveExpenses();
  renderTracker();
  expenseForm.reset();
  expenseCategory.value = "needs";
  expenseType.value = "food";
  expensePeriod.value = "monthly";
  expenseName.focus();
}

function clearExpenseList() {
  expenses = [];
  saveExpenses();
  renderTracker();
}

function extractAmount(text) {
  const match = text.match(/\$?\s*(\d+(?:\.\d{1,2})?)/);
  return match ? Number(match[1]) : null;
}

function appendMessage(type, label, text) {
  const message = document.createElement("div");
  const strong = document.createElement("strong");
  const paragraph = document.createElement("p");

  message.className = `message ${type}`;
  strong.textContent = label;
  paragraph.textContent = text;
  message.append(strong, paragraph);
  coachMessages.append(message);
  coachMessages.scrollTop = coachMessages.scrollHeight;
  return message;
}

function biggestCategory(totals) {
  return ["needs", "wants", "future"].reduce((largest, category) => {
    return totals[category] > totals[largest] ? category : largest;
  }, "needs");
}

function categoryLeft(category, budget, totals) {
  return budget[category] - totals[category];
}

function coachReply(question) {
  const text = question.toLowerCase();
  const budget = currentBudget();
  const totals = categoryTotals();
  const amount = extractAmount(text);
  const left = budget.income - totals.all;
  const wantsLeft = categoryLeft("wants", budget, totals);
  const futureLeft = categoryLeft("future", budget, totals);
  const topCategory = biggestCategory(totals);

  if (text.includes("bill") || text.includes("due") || text.includes("pay this month")) {
    const openBills = sortedBills().filter((bill) => !bill.handled);

    if (openBills.length === 0) {
      return "You do not have any open bills in the checklist. Add the must-pay items for this month so they stay visible before regular spending.";
    }

    const nextOpenBill = openBills[0];
    const openTotal = openBills.reduce((sum, bill) => sum + bill.amount, 0);
    return `You still have ${formatMoney(openTotal)} in bills waiting. Next up: ${nextOpenBill.name}, due ${formatDueDate(nextOpenBill.due)}.`;
  }

  if (text.includes("how am i") || text.includes("on track") || text.includes("doing")) {
    if (left < 0) {
      return `You are ${formatMoney(Math.abs(left))} over your total budget. Pause wants for now, then look for one expense you can reduce before adding anything new.`;
    }

    return `You have ${formatMoney(left)} left overall. Your biggest spending category is ${topCategory}, so check that bucket before your next purchase.`;
  }

  if (text.includes("save") || text.includes("saving")) {
    return `Your future bucket has ${formatMoney(futureLeft)} left. A strong next move is to move savings first, then spend only from what remains.`;
  }

  if (text.includes("need") || text.includes("rent") || text.includes("bill") || text.includes("food")) {
    return `For needs, you have ${formatMoney(categoryLeft("needs", budget, totals))} left. If this purchase is required for health, school, work, or bills, it belongs there.`;
  }

  if (text.includes("fun") || text.includes("want") || text.includes("game") || text.includes("snack")) {
    if (amount && amount > wantsLeft) {
      return `That would pass your wants budget by ${formatMoney(amount - wantsLeft)}. Try waiting 24 hours or choosing a smaller version.`;
    }

    return `Your wants bucket has ${formatMoney(wantsLeft)} left. Fun spending is okay when it fits the plan and does not steal from needs or future money.`;
  }

  if (amount) {
    if (amount > left) {
      return `${formatMoney(amount)} is more than your total money left. I would not buy it right now unless it is a true need.`;
    }

    return `${formatMoney(amount)} can fit if you choose the right category. Before buying, ask: need, want, or future? Then log it in the tracker.`;
  }

  if (expenses.length === 0) {
    return "Start by logging one real expense. Once I can see spending, I can give better advice about what to pause, reduce, or protect.";
  }

  return `A wise next step is to protect needs and future money first. You have ${formatMoney(left)} left overall, with ${formatMoney(wantsLeft)} left for wants.`;
}

function coachContext() {
  const budget = currentBudget();
  const totals = categoryTotals();

  return {
    budget: {
      income: budget.income,
      needsLimit: budget.needs,
      wantsLimit: budget.wants,
      futureLimit: budget.future,
      spent: totals.all,
      needsSpent: totals.needs,
      wantsSpent: totals.wants,
      futureSpent: totals.future,
      left: budget.income - totals.all
    },
    bills: sortedBills().map((bill) => ({
      name: bill.name,
      amount: bill.amount,
      due: bill.due,
      handled: bill.handled,
      status: billStatusText(bill)
    })),
    expenses
  };
}

async function fetchAiCoach(question) {
  const response = await fetch("/api/coach", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      question,
      context: coachContext()
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "AI coach request failed.");
  }

  return payload.reply;
}

async function askCoach(event) {
  event.preventDefault();

  const question = coachInput.value.trim();
  if (!question) {
    return;
  }

  appendMessage("user", "You", question);
  const thinkingMessage = appendMessage("bot", "SpendWise Coach", "Thinking through your budget...");
  coachForm.reset();
  coachInput.focus();

  try {
    thinkingMessage.querySelector("p").textContent = await fetchAiCoach(question);
  } catch (error) {
    thinkingMessage.querySelector("p").textContent = `${coachReply(question)} I used the built-in coach because the real AI service is not connected yet.`;
  }
}

function usePrompt(event) {
  coachInput.value = event.currentTarget.dataset.prompt;
  coachInput.focus();
}

function syncCategoryToType() {
  expenseCategory.value = typeCategories[expenseType.value] || "wants";
}

incomeInput.addEventListener("input", updatePlan);
focusInputs.forEach((input) => input.addEventListener("change", updatePlan));
billForm.addEventListener("submit", addBill);
clearBills.addEventListener("click", clearBillList);
expenseForm.addEventListener("submit", addExpense);
expenseType.addEventListener("change", syncCategoryToType);
clearExpenses.addEventListener("click", clearExpenseList);
coachForm.addEventListener("submit", askCoach);
promptChips.forEach((button) => button.addEventListener("click", usePrompt));

drawMoneyMap();
buildChallenge();
billDue.value = todayString();
renderBills();
updatePlan();
