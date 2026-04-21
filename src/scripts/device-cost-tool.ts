import type { DeviceCostCardRecord } from "../lib/device-cost-tool";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function initDeviceCostTool() {
  const root = document.querySelector<HTMLElement>("[data-device-cost-tool]");

  if (!root) {
    return;
  }

  const storageKey = root.dataset.storageKey ?? "device-cost-tool:v1";
  const presetTypes = parsePresetTypes(root.dataset.presetTypes);
  const addCardButton = root.querySelector<HTMLButtonElement>("[data-action='add-card']");
  const cardsContainer = root.querySelector<HTMLElement>("[data-cards]");

  if (!addCardButton || !cardsContainer) {
    return;
  }

  let cards = loadCards(storageKey);

  if (cards.length === 0) {
    cards = [createBlankCard()];
    saveCards(storageKey, cards);
  }

  renderCards();

  addCardButton.addEventListener("click", () => {
    cards = [...cards, createBlankCard()];
    saveCards(storageKey, cards);
    renderCards();
  });

  cardsContainer.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;

    if (!target) {
      return;
    }

    const resetButton = target.closest<HTMLButtonElement>("[data-action='reset-card']");
    if (resetButton) {
      const id = resetButton.dataset.id;
      cards = cards.map((card) => (card.id === id ? createBlankCard(id) : card));
      saveCards(storageKey, cards);
      renderCards();
      return;
    }

    const deleteButton = target.closest<HTMLButtonElement>("[data-action='delete-card']");
    if (deleteButton) {
      const id = deleteButton.dataset.id;
      cards = cards.length === 1 ? [createBlankCard()] : cards.filter((card) => card.id !== id);
      saveCards(storageKey, cards);
      renderCards();
    }
  });

  cardsContainer.addEventListener("submit", (event) => {
    const form = event.target as HTMLFormElement | null;

    if (!form?.matches("[data-card-form]")) {
      return;
    }

    event.preventDefault();

    const id = form.dataset.id;
    const errorNode = form.querySelector<HTMLElement>("[data-card-error]");
    const payload = readForm(form, presetTypes);

    if (!payload.ok) {
      if (errorNode) {
        errorNode.textContent = payload.message;
      }
      return;
    }

    cards = cards.map((card) =>
      card.id === id
        ? {
            ...card,
            ...payload.value,
            calculated: true,
            updatedAt: new Date().toISOString()
          }
        : card
    );

    saveCards(storageKey, cards);
    renderCards();
  });

  function renderCards() {
    cardsContainer.innerHTML = cards
      .map((card, index) => renderCard(card, presetTypes, cards.length > 1, index + 1))
      .join("");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDeviceCostTool);
} else {
  initDeviceCostTool();
}

function createBlankCard(id = crypto.randomUUID()): DeviceCostCardRecord {
  return {
    id,
    name: "",
    deviceType: "电脑",
    purchasePrice: "",
    purchaseDate: "",
    calculated: false,
    updatedAt: new Date().toISOString()
  };
}

function parsePresetTypes(value: string | undefined) {
  if (!value) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function loadCards(storageKey: string) {
  try {
    const raw = sessionStorage.getItem(storageKey);

    if (!raw) {
      return [] as DeviceCostCardRecord[];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DeviceCostCardRecord[]) : [];
  } catch {
    return [] as DeviceCostCardRecord[];
  }
}

function saveCards(storageKey: string, cards: DeviceCostCardRecord[]) {
  sessionStorage.setItem(storageKey, JSON.stringify(cards));
}

function readForm(form: HTMLFormElement, presetTypes: readonly string[]) {
  const data = new FormData(form);
  const name = String(data.get("name") ?? "").trim();
  const deviceType = String(data.get("deviceTypeChoice") ?? "").trim();
  const purchasePrice = String(data.get("purchasePrice") ?? "").trim();
  const purchaseDate = String(data.get("purchaseDate") ?? "").trim();

  if (!name) {
    return { ok: false as const, message: "请先填写产品名称。" };
  }

  if (!deviceType || !presetTypes.includes(deviceType)) {
    return { ok: false as const, message: "请选择一个有效的产品类别。" };
  }

  if (!Number.isFinite(Number(purchasePrice)) || Number(purchasePrice) <= 0) {
    return { ok: false as const, message: "购买价格需要是大于 0 的数字。" };
  }

  if (!purchaseDate) {
    return { ok: false as const, message: "请选择购买时间。" };
  }

  if (isFutureDate(purchaseDate)) {
    return { ok: false as const, message: "购买时间不能晚于今天。" };
  }

  return {
    ok: true as const,
    value: {
      name,
      deviceType,
      purchasePrice,
      purchaseDate
    }
  };
}

function renderCard(
  card: DeviceCostCardRecord,
  presetTypes: readonly string[],
  canDelete: boolean,
  index: number
) {
  return `
    <section class="device-tool__form-card panel" data-card>
      <div class="device-tool__composer-header">
        <div>
          <p class="eyebrow">设备卡片 ${index}</p>
          <h3>录入一台正在使用的电子设备</h3>
        </div>
      </div>

      <form class="device-tool-form" data-card-form data-id="${card.id}">
        <div class="device-tool-form__grid">
          <label class="field-group">
            <span>产品名称</span>
            <input type="text" name="name" value="${escapeHtml(card.name)}" placeholder="例如 MacBook Air 13" required />
          </label>

          <label class="field-group">
            <span>产品类别</span>
            <select name="deviceTypeChoice" required>
              ${presetTypes
                .map(
                  (type) =>
                    `<option value="${escapeHtml(type)}" ${card.deviceType === type ? "selected" : ""}>${escapeHtml(type)}</option>`
                )
                .join("")}
            </select>
          </label>

          <label class="field-group">
            <span>购买价格</span>
            <input type="number" name="purchasePrice" inputmode="decimal" min="0.01" step="0.01" value="${escapeHtml(card.purchasePrice)}" placeholder="例如 6999" required />
          </label>

          <label class="field-group">
            <span>购买时间</span>
            <input type="date" name="purchaseDate" value="${escapeHtml(card.purchaseDate)}" max="${getDateInputMax()}" required />
          </label>
        </div>

        <p class="form-help">点击“计算”后，会在当前卡片下方直接显示持有时间和日均价格。</p>
        <p class="form-error" data-card-error></p>

        <div class="device-tool-form__actions">
          <button type="submit" class="primary-button">计算</button>
          <button type="button" class="ghost-button" data-action="reset-card" data-id="${card.id}">清空</button>
          ${
            canDelete
              ? `<button type="button" class="ghost-button ghost-button--danger" data-action="delete-card" data-id="${card.id}">删除卡片</button>`
              : ""
          }
        </div>
      </form>

      ${
        card.calculated
          ? `<div class="device-tool-result" data-result>
              <div class="device-tool-result__header">
                <div>
                  <p class="eyebrow">${escapeHtml(card.deviceType)}</p>
                  <h3>${escapeHtml(card.name)}</h3>
                </div>
              </div>
              <div class="device-metrics device-metrics--two">
                <div class="device-metric panel">
                  <small>持有时间</small>
                  <strong>${calculateHeldDays(card.purchaseDate)}</strong>
                  <span>天</span>
                </div>
                <div class="device-metric panel">
                  <small>日均价格</small>
                  <strong>${formatCurrency(Number(card.purchasePrice) / calculateHeldDays(card.purchaseDate))}</strong>
                  <span>元 / 天</span>
                </div>
              </div>
            </div>`
          : ""
      }
    </section>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isFutureDate(dateValue: string) {
  const today = getLocalToday();
  const target = parseLocalDate(dateValue);
  return target.getTime() > today.getTime();
}

function calculateHeldDays(dateValue: string) {
  const today = getLocalToday();
  const purchaseDate = parseLocalDate(dateValue);
  const diff = Math.floor((today.getTime() - purchaseDate.getTime()) / MS_PER_DAY);
  return Math.max(1, diff);
}

function getLocalToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseLocalDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: value >= 100 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(value);
}

function getDateInputMax() {
  const today = getLocalToday();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
