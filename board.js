import { gameState } from './data.js';

let draggedElement = null;
let sourceSlotType = null; // 'bench' hoặc 'board'
let sourceIndex = null;

export function renderBoard() {
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

export function renderBench() {
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
        // SỬA LỖI: Reset trạng thái kéo sau khi kết thúc hành động để dọn dẹp bộ nhớ tạm
        draggedElement = null;
        sourceSlotType = null;
        sourceIndex = null;
    });

    return piece;
}

function setupDragEvents(cell) {
    cell.addEventListener("dragover", (e) => e.preventDefault());
    cell.addEventListener("dragenter", () => cell.classList.add("over"));
    cell.addEventListener("dragleave", () => cell.classList.remove("over"));

    cell.addEventListener("drop", (e) => {
        cell.classList.remove("over");
        
        // SỬA LỖI: Kiểm tra an toàn, nếu không có dữ liệu kéo hợp lệ thì bỏ qua không xử lý
        if (sourceSlotType === null || sourceIndex === null) return;

        const targetType = cell.dataset.type;
        const targetIndex = parseInt(cell.dataset.index);

        // Lấy dữ liệu tướng đang kéo
        const movingChamp = sourceSlotType === 'bench' ? gameState.benchSlots[sourceIndex] : gameState.boardSlots[sourceIndex];
        
        // Đích đến (ô được thả vào)
        const targetChamp = targetType === 'bench' ? gameState.benchSlots[targetIndex] : gameState.boardSlots[targetIndex];

        // Đổi chỗ (Swap logic)
        if (sourceSlotType === 'bench') gameState.benchSlots[sourceIndex] = targetChamp;
        else gameState.boardSlots[sourceIndex] = targetChamp;

        if (targetType === 'bench') gameState.benchSlots[targetIndex] = movingChamp;
        else gameState.boardSlots[targetIndex] = movingChamp;

        // Vẽ lại giao diện
        renderBoard();
        renderBench();
    });
}