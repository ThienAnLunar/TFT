let draggedElement = null;
let sourceSlotType = null; 
let sourceIndex = null;

function renderBoard() {
    const field = document.getElementById("battlefield");
    if (!field) return;
    field.innerHTML = "";
    
    // 56 ô ứng với 8 hàng x 7 cột
    for (let i = 0; i < 56; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.dataset.type = "board";

        // 4 hàng đầu (ô 0 đến 27) là sân đối thủ
        if (i < 28) {
            cell.classList.add("enemy-zone");
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

        // LUẬT MỚI: Tướng trên sàn đấu KHÔNG THỂ kéo thả ngược về hàng chờ
        if (sourceSlotType === 'board' && targetType === 'bench') {
            alert("Không thể kéo tướng từ bàn cờ về hàng chờ! Hãy dùng cơ chế khác.");
            return;
        }

        // LUẬT MỚI: Bạn không thể đặt tướng vào vùng đối thủ (4 hàng trên: 0-27)
        if (targetType === 'board' && targetIndex < 28) {
            alert("Đây là khu vực của đối thủ! Hãy đặt ở 4 hàng dưới.");
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
    let hasBoxTrait = false; // Check xem có kích mốc Mã Hóa/Chinh Phục để hiện hũ không

    for (const [traitName, count] of Object.entries(traitCounts)) {
        const config = traitsConfig[traitName];
        if (config) {
            const activatedMilestone = config.milestones.filter(m => count >= m).pop(); 
            
            finalActiveTraits[traitName] = {
                count: count,
                milestone: activatedMilestone || 0
            };

            // Nếu kích hoạt mốc của Mã Hóa hoặc Chinh Phục thì bật cờ báo hiện hũ nổ
            if ((traitName === "Mã Hóa" || traitName === "Chinh Phục") && activatedMilestone > 0) {
                hasBoxTrait = true;
            }
        }
    }

    gameState.activeTraits = finalActiveTraits;
    
    // Ẩn hiện hộp nổ hũ dựa theo tộc hệ được kích hoạt mốc
    const chest = document.getElementById("lucky-chest");
    if (chest) chest.style.display = hasBoxTrait ? "block" : "none";

    renderTraitsUI();
}

function renderTraitsUI() {
    const panel = document.getElementById("traits-panel");
    if (!panel) return;
    
    panel.innerHTML = "<h3>Tộc / Hệ Kích Hoạt</h3>";
    
    // LUẬT MỚI: Chỉ lấy các Tộc/Hệ có số tướng từ 1 trở lên
    const activeEntries = Object.entries(gameState.activeTraits).filter(([_, data]) => data.count >= 1);
    
    if (activeEntries.length === 0) {
        panel.innerHTML += "<p style='color:#666; font-size:12px; text-align:center;'>Chưa kích hoạt hệ</p>";
        return;
    }

    // Sắp xếp tộc hệ theo mốc cao lên đầu
    activeEntries.sort((a, b) => b[1].milestone - a[1].milestone);
    
    activeEntries.forEach(([traitName, data]) => {
        const traitDiv = document.createElement("div");
        traitDiv.style.marginBottom = "8px";
        traitDiv.style.padding = "8px";
        traitDiv.style.borderRadius = "5px";
        traitDiv.style.fontSize = "12px";
        traitDiv.style.display = "flex";
        traitDiv.style.justifyContent = "space-between";
        traitDiv.style.cursor = "pointer"; // Biến thành nút bấm được
        
        if (data.milestone > 0) {
            traitDiv.style.background = "linear-gradient(90deg, #ffce00, #e6b800)";
            traitDiv.style.color = "#000";
            traitDiv.style.fontWeight = "bold";
            traitDiv.innerHTML = `<span>⭐ ${traitName}</span> <span>Mốc: ${data.milestone} (${data.count})</span>`;
        } else {
            traitDiv.style.background = "#222533";
            traitDiv.style.color = "#aaa";
            traitDiv.innerHTML = `<span>${traitName}</span> <span>(${data.count})</span>`;
        }

        // LUẬT MỚI: Ấn vào tộc hệ sẽ hiện thông báo chi tiết thông tin mốc kích hoạt
        traitDiv.onclick = () => {
            const config = traitsConfig[traitName];
            alert(`ℹ️ THÔNG TIN TỘC HỆ: ${traitName}\n- Số lượng tướng hiện tại: ${data.count}\n- Các mốc kích hoạt yêu cầu: ${config.milestones.join(", ")} tướng.`);
        };

        panel.appendChild(traitDiv);
    });
}