type PuzzleEntry = {
  slug: string;
  title: string;
  description: string;
  imageSrc: string;
};

type PuzzleState = {
  activeSlug: string;
  order: number[];
  selectedIndex: number | null;
};

export function initPuzzleGameTool() {
  const root = document.querySelector<HTMLElement>("[data-puzzle-tool]");

  if (!root) {
    return;
  }

  const puzzles = parsePuzzles(root.dataset.puzzles);
  const boardSize = Number(root.dataset.boardSize ?? "3");
  const board = root.querySelector<HTMLElement>("[data-puzzle-board]");
  const picker = root.querySelector<HTMLElement>("[data-puzzle-picker]");
  const status = root.querySelector<HTMLElement>("[data-puzzle-status]");
  const title = root.querySelector<HTMLElement>("[data-active-title]");
  const description = root.querySelector<HTMLElement>("[data-active-description]");
  const image = root.querySelector<HTMLImageElement>("[data-active-image]");
  const shuffleButton = root.querySelector<HTMLButtonElement>("[data-action='shuffle-puzzle']");

  if (
    puzzles.length === 0 ||
    !Number.isFinite(boardSize) ||
    boardSize < 2 ||
    !board ||
    !picker ||
    !status ||
    !title ||
    !description ||
    !image ||
    !shuffleButton
  ) {
    return;
  }

  const solvedOrder = createSolvedOrder(boardSize);
  let state: PuzzleState = {
    activeSlug: puzzles[0].slug,
    order: shuffleOrder(solvedOrder),
    selectedIndex: null
  };

  render();

  picker.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLElement>("[data-action='select-puzzle']");

    if (!button) {
      return;
    }

    const slug = button.dataset.slug;

    if (!slug) {
      return;
    }

    state = {
      activeSlug: slug,
      order: shuffleOrder(solvedOrder),
      selectedIndex: null
    };

    render();
  });

  board.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>("[data-tile-index]");

    if (!button) {
      return;
    }

    const tileIndex = Number(button.dataset.tileIndex);

    if (!Number.isInteger(tileIndex)) {
      return;
    }

    if (state.selectedIndex === null) {
      state = {
        ...state,
        selectedIndex: tileIndex
      };
      render();
      return;
    }

    if (state.selectedIndex === tileIndex) {
      state = {
        ...state,
        selectedIndex: null
      };
      render();
      return;
    }

    state = {
      ...state,
      order: swap(state.order, state.selectedIndex, tileIndex),
      selectedIndex: null
    };
    render();
  });

  shuffleButton.addEventListener("click", () => {
    state = {
      ...state,
      order: shuffleOrder(solvedOrder),
      selectedIndex: null
    };
    render();
  });

  function render() {
    const activePuzzle = puzzles.find((entry) => entry.slug === state.activeSlug) ?? puzzles[0];
    const isSolvedState = isSolved(state.order);

    title.textContent = activePuzzle.title;
    description.textContent = activePuzzle.description;
    image.src = activePuzzle.imageSrc;
    image.alt = activePuzzle.title;
    board.style.setProperty("--board-size", String(boardSize));

    picker.querySelectorAll<HTMLElement>("[data-puzzle-card]").forEach((card) => {
      card.classList.toggle("is-active", card.dataset.slug === activePuzzle.slug);
    });

    board.innerHTML = state.order
      .map((piece, index) => renderTile(activePuzzle.imageSrc, piece, index, boardSize, state.selectedIndex))
      .join("");

    status.textContent = getStatusMessage(isSolvedState, state.selectedIndex, activePuzzle.title);
  }
}

function parsePuzzles(value: string | undefined) {
  if (!value) {
    return [] as PuzzleEntry[];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as PuzzleEntry[]) : [];
  } catch {
    return [] as PuzzleEntry[];
  }
}

function createSolvedOrder(boardSize: number) {
  return Array.from({ length: boardSize * boardSize }, (_, index) => index);
}

function shuffleOrder(order: number[]) {
  const next = [...order];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[randomIndex];
    next[randomIndex] = current;
  }

  return isSolved(next) ? shuffleOrder(order) : next;
}

function isSolved(order: number[]) {
  return order.every((piece, index) => piece === index);
}

function swap(order: number[], left: number, right: number) {
  const next = [...order];
  const current = next[left];
  next[left] = next[right];
  next[right] = current;
  return next;
}

function renderTile(
  imageSrc: string,
  piece: number,
  tileIndex: number,
  boardSize: number,
  selectedIndex: number | null
) {
  const column = piece % boardSize;
  const row = Math.floor(piece / boardSize);
  const step = boardSize > 1 ? 100 / (boardSize - 1) : 0;

  return `
    <button
      type="button"
      class="puzzle-board__tile ${selectedIndex === tileIndex ? "is-selected" : ""}"
      data-tile-index="${tileIndex}"
      style="
        background-image: url('${escapeHtml(imageSrc)}');
        background-size: ${boardSize * 100}% ${boardSize * 100}%;
        background-position: ${step * column}% ${step * row}%;
      "
      aria-label="拼图块 ${piece + 1}"
    ></button>
  `;
}

function getStatusMessage(isSolvedState: boolean, selectedIndex: number | null, title: string) {
  if (isSolvedState) {
    return `《${title}》已经拼好了。想再玩一次的话，可以点“重新打乱”。`;
  }

  if (selectedIndex !== null) {
    return "已经选中一块九宫格拼图，再点另一块就会交换位置。";
  }

  return "先点一块九宫格拼图，再点另一块交换位置，把整张图慢慢拼回去。";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
