let draggedElement = null;
let sourceSlotType = null;
let sourceIndex = null;

function renderBoard() {
    const field = document.getElementById("battlefield");
    field.innerHTML = "";
    for (let i = 0; i < 28; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.dataset.type = "board";

        if (gameState.boardSlots[i]) {
            cell.appendChild(createChampPiece(gameState.boardSlots[i], 'board', i));
        }

        setupDragEvents(cell);
        field.appendChild(cell);
    }
}

function renderBench() {
    const bench = document.getElementById("bench");
    bench.innerHTML = "";
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.dataset.type = "bench";

        if (gameState.benchSlots[i]) {
            cell.appendChild(createChampPiece(gameState.benchSlots[i], 'bench', i));
        }

        setupDragEvents(cell);
        bench.appendChild(cell);
    }
}

function createChampPiece(champData, type, index) {
    const piece = document.createElement("div");
    piece.classList.add("champion-piece");
    piece.innerText = champData.name;
    piece.draggable = true;

    piece.addEventListener("dragstart", (e) => {
        draggedElement = piece;
        sourceSlotType = type;
        sourceIndex = index;
        piece.classList.add("dragging");
    });

    piece.addEventListener("dragend", () => {
        piece.classList.remove("dragging");
    });

    return piece;
}

function setupDragEvents(cell) {
    cell.addEventListener("dragover", (e) => e.preventDefault());
    cell.addEventListener("dragenter", () => cell.classList.add("over"));
    cell.addEventListener("dragleave", () => cell.classList.remove("over"));

    cell.addEventListener("drop", (e) => {
        cell.classList.remove("over");
        const targetType = cell.dataset.type;
        const targetIndex = parseInt(cell.dataset.index);

        const movingChamp = sourceSlotType === 'bench' ? gameState.benchSlots[sourceIndex] : gameState.boardSlots[sourceIndex];
        const targetChamp = targetType === 'bench' ? gameState.benchSlots[targetIndex] : gameState.boardSlots[targetIndex];

        if (sourceSlotType === 'bench') gameState.benchSlots[sourceIndex] = targetChamp;
        else gameState.boardSlots[sourceIndex] = targetChamp;

        if (targetType === 'bench') gameState.benchSlots[targetIndex] = movingChamp;
        else gameState.boardSlots[targetIndex] = movingChamp;

        renderBoard();
        renderBench();
    });
}