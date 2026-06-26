let draggedElement = null;
let sourceSlotType = null; 
let sourceIndex = null;

function renderBoard() {
    const field = document.getElementById("battlefield");
    if (!field) return;
    field.innerHTML = "";
    
    // Tạo đúng 80 ô cờ trên ma trận (8 hàng x 10 cột)
    for (let i = 0; i < 80; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.dataset.type = "board";

        // Phân định: 4 hàng trên là Địch, 4 hàng dưới là Ta
        if (i < 40) {
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

    // Thêm sự kiện click xem chỉ số tướng
    piece.addEventListener("click", (e) => {
        e.stopPropagation();
        alert(`📊 CHỈ SỐ TƯỚNG: ${champData.name}\n- Cấp sao: ${champData.star}⭐\n- Máu: ${champData.hp}\n- Sát thương: ${champData.damage}\n- Tộc hệ: ${champData.traits.join(", ")}`);
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

        // LUẬT 1: Chặn không cho kéo cờ từ sàn về lại hàng chờ
        if (sourceSlotType === 'board' && targetType === 'bench') {
            alert("Không thể kéo tướng từ bàn cờ về hàng chờ!");
            return;
        }

        // LUẬT 2: Chặn đặt tướng vào vùng địch (4 hàng trên: ô 0-39)
        if (targetType === 'board' && targetIndex < 40) {
            alert("Đây là khu vực của đối thủ! Hãy đặt tướng ở 4 hàng dưới.");
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
    
    // LUẬT MỚI: Ẩn hoàn toàn tộc hệ bằng 0 (chỉ lấy hệ có count >= 1)
    const activeEntries = Object.entries(gameState.activeTraits).filter(([_, data]) => data.count >= 1);
    
    if (activeEntries.length === 0) {
        panel.innerHTML += "<p style='color:#666; font-size:11px; text-align:center;'>Chưa có tướng trên sàn</p>";
        return;
    }

    activeEntries.sort((a, b) => b[1].milestone - a[1].milestone);
    
    activeEntries.forEach(([traitName, data]) => {
        const traitDiv = document.createElement("div");
        traitDiv.className = "syn-item";
        traitDiv.style.cursor = "pointer";
        
        if (data.milestone > 0) {
            traitDiv.style.background = "linear-gradient(90deg, #ff9800, #e67e22)";
            traitDiv.style.color = "#fff";
            traitDiv.innerHTML = `<span>⭐ ${traitName}</span> <span>Mốc: ${data.milestone} (${data.count})</span>`;
        } else {
            traitDiv.style.background = "#222533";
            traitDiv.style.color = "#aaa";
            traitDiv.innerHTML = `<span>${traitName}</span> <span>(${data.count})</span>`;
        }

        // Khai báo sự kiện click hiển thị thông báo popup sửa lỗi "not defined"
        traitDiv.onclick = () => {
            hienThiPopupTocHe(traitName, data.count);
        };

        panel.appendChild(traitDiv);
    });
}

function hienThiPopupTocHe(traitName, currentCount) {
    const config = traitsConfig[traitName];
    const mocYeuCau = config ? config.milestones.join("/") : "";
    alert(`ℹ️ CHI TIẾT TỘC HỆ: ${traitName.toUpperCase()}\n- Số lượng hiện tại trên sàn: ${currentCount} tướng.\n- Các mốc yêu cầu kích hoạt: ${mocYeuCau} tướng.`);
}