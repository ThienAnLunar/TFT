let draggedElement = null;
let sourceSlotType = null; // 'bench' hoặc 'board'
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

        // Lấy dữ liệu tướng đang di chuyển
        const movingChamp = sourceSlotType === 'bench' ? gameState.benchSlots[sourceIndex] : gameState.boardSlots[sourceIndex];
        
        // Lấy dữ liệu tướng tại ô đích
        const targetChamp = targetType === 'bench' ? gameState.benchSlots[targetIndex] : gameState.boardSlots[targetIndex];

        // Hoán đổi vị trí (Swap logic)
        if (sourceSlotType === 'bench') gameState.benchSlots[sourceIndex] = targetChamp;
        else gameState.boardSlots[sourceIndex] = targetChamp;

        if (targetType === 'bench') gameState.benchSlots[targetIndex] = movingChamp;
        else gameState.boardSlots[targetIndex] = movingChamp;

        // Vẽ lại giao diện sau khi đổi chỗ
        renderBoard();
        renderBench();
    });
}

function checkSynergies() {
    const uniqueChampsOnBoard = new Set();
    const traitCounts = {};

    // 1. Chỉ lọc tướng duy nhất trên bàn cờ (Trùng ID không tính thêm mốc)
    gameState.boardSlots.forEach(champ => {
        if (champ) {
            uniqueChampsOnBoard.add(champ.id);
        }
    });

    // 2. Đếm số lượng theo Tộc Hệ
    uniqueChampsOnBoard.forEach(champId => {
        const champData = championsPool.find(c => c.id === champId);
        if (champData && champData.traits) {
            champData.traits.forEach(trait => {
                traitCounts[trait] = (traitCounts[trait] || 0) + 1;
            });
        }
    });

    // 3. Tính toán mốc kích hoạt dựa trên cấu hình 16 tộc hệ
    const finalActiveTraits = {};
    for (const [traitName, count] of Object.entries(traitCounts)) {
        const config = traitsConfig[traitName];
        if (config) {
            const activatedMilestone = config.milestones
                .filter(m => count >= m)
                .pop(); // Lấy mốc lớn nhất đạt được
            
            finalActiveTraits[traitName] = {
                count: count,
                milestone: activatedMilestone || 0
            };
        }
    }

    gameState.activeTraits = finalActiveTraits;
    renderTraitsUI();
}

function applyTraitBuffs() {
    // Duyệt qua toàn bộ các ô trên bàn cờ
    gameState.boardSlots.forEach((champ, index) => {
        if (!champ) return;

        // Reset về chỉ số gốc trước khi tính buff mới để tránh bị cộng dồn vô hạn
        const originalChamp = championsPool.find(c => c.id === champ.id);
        champ.hp = originalChamp.hp;
        champ.damage = originalChamp.damage;

        // 1. Buff Đấu Sĩ: Tăng máu [Mốc 2: +200, Mốc 4: +450, Mốc 6: +1200]
        if (champ.traits.includes("Đấu Sĩ") && gameState.activeTraits["Đấu Sĩ"]) {
            const milestone = gameState.activeTraits["Đấu Sĩ"].milestone;
            if (milestone === 2) champ.hp += 200;
            if (milestone === 4) champ.hp += 450;
            if (milestone === 6) champ.hp += 1200;
        }

        // 2. Buff Cuồng Chiến: Tăng sát thương [Mốc 3: +110, Mốc 5: +330]
        if (champ.traits.includes("Cuồng Chiến") && gameState.activeTraits["Cuồng Chiến"]) {
            const milestone = gameState.activeTraits["Cuồng Chiến"].milestone;
            if (milestone === 3) champ.damage += 110;
            if (milestone === 5) champ.damage += 330;
        }
        
        // Bạn có thể viết thêm các logic cộng chỉ số khác cho Xạ Thủ, Thiên Thần... tại đây
    });
}

function renderTraitsUI() {
    const panel = document.getElementById("traits-panel");
    if (!panel) return;
    
    panel.innerHTML = "<h3>Tộc / Hệ Kích Hoạt</h3>";
    
    // 1. Lấy toàn bộ danh sách 16 tộc hệ
    const allTraits = Object.keys(traitsConfig);
    
    // 2. Sắp xếp: Tộc hệ nào được kích mốc (milestone > 0) hoặc có tướng thì xếp lên trước
    const sortedTraits = allTraits.sort((a, b) => {
        const dataA = gameState.activeTraits[a] || { milestone: 0, count: 0 };
        const dataB = gameState.activeTraits[b] || { milestone: 0, count: 0 };
        
        if (dataB.milestone !== dataA.milestone) {
            return dataB.milestone - dataA.milestone; // Ưu tiên mốc cao lên đầu
        }
        return dataB.count - dataA.count; // Trùng mốc thì xếp theo số lượng tướng
    });
    
    // 3. Vẽ giao diện ngăn nắp theo thứ tự đã sắp xếp
    sortedTraits.forEach(traitName => {
        const data = gameState.activeTraits[traitName] || { milestone: 0, count: 0 };
        const traitDiv = document.createElement("div");
        traitDiv.style.marginBottom = "8px";
        traitDiv.style.padding = "6px 10px";
        traitDiv.style.borderRadius = "5px";
        traitDiv.style.fontSize = "12px";
        traitDiv.style.display = "flex";
        traitDiv.style.justifyContent = "space-between";
        traitDiv.style.alignItems = "center";
        
        if (data.milestone > 0) {
            // Đạt mốc -> Màu sáng nổi bật (Vàng kim) theo thiết kế
            traitDiv.style.background = "linear-gradient(90deg, #ffce00, #e6b800)";
            traitDiv.style.color = "#000";
            traitDiv.style.fontWeight = "bold";
            traitDiv.innerHTML = `<span>⭐ ${traitName}</span> <span>Mốc: ${data.milestone} (${data.count})</span>`;
        } else {
            // Chưa đạt mốc -> Hiển thị danh sách nền tối, chữ xám mờ
            traitDiv.style.background = "#222533";
            traitDiv.style.color = "#888";
            traitDiv.innerHTML = `<span>${traitName}</span> <span>${data.count}</span>`;
        }
        panel.appendChild(traitDiv);
    });
}