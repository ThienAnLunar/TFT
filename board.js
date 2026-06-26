let draggedElement = null;
let sourceSlotType = null; 
let sourceIndex = null;

function renderBoard() {
    const field = document.getElementById("battlefield");
    if (!field) return;
    field.innerHTML = "";
    
    // 56 ô cờ ứng với 8 hàng x 7 cột
    for (let i = 0; i < 56; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.dataset.type = "board";

        // Phân tách thị giác rõ ràng: 4 hàng trên của Địch, 4 hàng dưới của Ta
        if (i < 28) {
            cell.classList.add("enemy-zone");
        } else {
            cell.classList.add("player-zone");
        }

        if (gameState.boardSlots[i]) {
            cell.appendChild(createChampPiece(gameState.boardSlots[i], 'board', i));
        }

        setupDragEvents(cell);
        field.appendChild(cell);
    }
}

function renderBench() {
    const bench = document.getElementById("bench");
    if (!bench) return;
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
    
    const starIcons = champData.star > 1 ? "⭐".repeat(champData.star) + "<br>" : "";
    piece.innerHTML = `${starIcons}${champData.name}`;
    
    piece.draggable = true;
    piece.addEventListener("dragstart", (e) => {
        draggedElement = piece;
        sourceSlotType = type;
        sourceIndex = index;
        piece.classList.add("dragging");
    });
    piece.addEventListener("dragend", () => piece.classList.remove("dragging"));

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

        if (sourceSlotType === 'board' && targetType === 'bench') {
            alert("Không thể kéo tướng từ bàn cờ về hàng chờ!");
            return;
        }

        if (targetType === 'board' && targetIndex < 28) {
            alert("Đây là khu vực bố trận của ĐỐI THỦ TIẾP THEO! Hãy đặt ở 4 hàng dưới.");
            return;
        }

        const movingChamp = sourceSlotType === 'bench' ? gameState.benchSlots[sourceIndex] : gameState.boardSlots[sourceIndex];
        const targetChamp = targetType === 'bench' ? gameState.benchSlots[targetIndex] : gameState.boardSlots[targetIndex];

        if (sourceSlotType === 'bench') gameState.benchSlots[sourceIndex] = targetChamp;
        else gameState.boardSlots[sourceIndex] = targetChamp;

        if (targetType === 'bench') gameState.benchSlots[targetIndex] = movingChamp;
        else gameState.boardSlots[targetIndex] = movingChamp;

        renderBoard();
        renderBench();
        checkSynergies(); 
    });
}

function checkSynergies() {
    const uniqueChampsOnBoard = new Set();
    const traitCounts = {};

    gameState.boardSlots.forEach(champ => {
        if (champ) uniqueChampsOnBoard.add(champ.id);
    });

    uniqueChampsOnBoard.forEach(champId => {
        const champData = championsPool.find(c => c.id === champId);
        if (champData && champData.traits) {
            champData.traits.forEach(trait => {
                traitCounts[trait] = (traitCounts[trait] || 0) + 1;
            });
        }
    });

    const finalActiveTraits = {};
    let hasBoxTrait = false;

    for (const [traitName, count] of Object.entries(traitCounts)) {
        const config = traitsConfig[traitName];
        if (config) {
            const activatedMilestone = config.milestones.filter(m => count >= m).pop(); 
            
            finalActiveTraits[traitName] = {
                count: count,
                milestone: activatedMilestone || 0
            };

            if ((traitName === "Mã Hóa" || traitName === "Chinh Phục") && activatedMilestone > 0) {
                hasBoxTrait = true;
            }
        }
    }

    gameState.activeTraits = finalActiveTraits;
    
    const chest = document.getElementById("lucky-chest");
    if (chest) chest.style.display = hasBoxTrait ? "block" : "none";

    renderTraitsUI();
}

function renderTraitsUI() {
    const panel = document.getElementById("traits-panel");
    if (!panel) return;
    
    panel.innerHTML = "<h3>Tộc / Hệ Kích Hoạt</h3>";
    
    // ĐIỀU CHỈNH: Chỉ hiển thị tộc hệ có số lượng từ 1 trở lên (Ẩn sạch các hệ có số lượng bằng 0)
    const activeEntries = Object.entries(gameState.activeTraits).filter(([_, data]) => data.count >= 1);
    
    if (activeEntries.length === 0) {
        panel.innerHTML += "<p style='color:#666; font-size:11px; text-align:center; margin-top:20px;'>Chưa có tướng trên sàn</p>";
        return;
    }

    // Sắp xếp ưu tiên mốc lên đầu
    activeEntries.sort((a, b) => b[1].milestone - a[1].milestone);
    
    activeEntries.forEach(([traitName, data]) => {
        const traitDiv = document.createElement("div");
        traitDiv.style.marginBottom = "6px";
        traitDiv.style.padding = "6px 8px";
        traitDiv.style.borderRadius = "4px";
        traitDiv.style.fontSize = "12px";
        traitDiv.style.display = "flex";
        traitDiv.style.justifyContent = "space-between";
        traitDiv.style.alignItems = "center";
        traitDiv.style.cursor = "pointer";
        
        if (data.milestone > 0) {
            traitDiv.style.background = "linear-gradient(90deg, #ff9800, #e67e22)";
            traitDiv.style.color = "#fff";
            traitDiv.style.fontWeight = "bold";
            traitDiv.innerHTML = `<span>⭐ ${traitName}</span> <span>Mốc: ${data.milestone} (${data.count})</span>`;
        } else {
            traitDiv.style.background = "#1b1d2a";
            traitDiv.style.color = "#ccc";
            traitDiv.innerHTML = `<span>${traitName}</span> <span>(${data.count})</span>`;
        }

        // Click xem chi tiết mô tả tính năng từ file thiết kế Excel
        traitDiv.onclick = () => {
            const config = traitsConfig[traitName];
            alert(`ℹ️ CHI TIẾT TỘC HỆ: ${traitName}\n- Số lượng hiện tại trên sàn: ${data.count} tướng.\n- Các mốc kích hoạt: ${config.milestones.join("/")} tướng.`);
        };

        panel.appendChild(traitDiv);
    });
}