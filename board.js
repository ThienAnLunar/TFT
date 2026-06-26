function renderBoard() {
    const field = document.getElementById("battlefield");
    if (!field) return;
    field.innerHTML = "";
    for (let i = 0; i < 28; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.dataset.type = "board";

        if (gameState.boardSlots[i]) {
            cell.appendChild(createChampPiece(gameState.boardSlots[i], 'board', i));
        }
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
        bench.appendChild(cell);
    }
}

function createChampPiece(champData, type, index) {
    const piece = document.createElement("div");
    piece.classList.add("champion-piece");
    piece.style.cursor = "pointer";
    
    const starIcons = champData.star > 1 ? "⭐".repeat(champData.star) + "<br>" : "";
    piece.innerHTML = `${starIcons}${champData.name}`;
    
    if (champData.star === 3) {
        piece.style.background = "linear-gradient(135deg, #ffae00, #ff7b00)";
        piece.style.color = "#fff";
        piece.style.border = "2px solid #fff";
    } else if (champData.star === 2) {
        piece.style.background = "linear-gradient(135deg, #4a5568, #2d3748)";
    }

    // 1. SỰ KIỆN CLICK ĐƠN: Hiện chỉ số chi tiết
    piece.addEventListener("click", (e) => {
        e.stopPropagation(); // Tránh lỗi click chồng chéo
        showChampInfo(champData);
    });

    // 2. SỰ KIỆN DOUBLE CLICK: Di chuyển thông minh không cần kéo thả!
    piece.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        if (type === 'bench') {
            // Đang ở hàng chờ -> Lên bàn cờ
            const emptyBoardIndex = gameState.boardSlots.findIndex(slot => slot === null);
            if (emptyBoardIndex !== -1) {
                gameState.boardSlots[emptyBoardIndex] = champData;
                gameState.benchSlots[index] = null;
            } else {
                alert("Bàn cờ đã đầy tướng!");
            }
        } else {
            // Đang ở bàn cờ -> Xuống hàng chờ
            const emptyBenchIndex = gameState.benchSlots.findIndex(slot => slot === null);
            if (emptyBenchIndex !== -1) {
                gameState.benchSlots[emptyBenchIndex] = champData;
                gameState.boardSlots[index] = null;
            } else {
                alert("Hàng chờ đã đầy!");
            }
        }
        renderBoard();
        renderBench();
        checkSynergies(); // Tự tính lại Tộc/Hệ ngay lập tức!
    });

    return piece;
}

// Hàm hiển thị thông tin tướng lên Panel
function showChampInfo(champ) {
    const infoPanel = document.getElementById("champ-info-panel");
    if (!infoPanel) return;
    infoPanel.innerHTML = `
        <strong style="color: #ffce00; font-size: 15px;">${champ.name} (${champ.star} Sao)</strong> | 
        ❤️ Máu: <span style="color: #ff4a4a; font-weight:bold;">${champ.hp}</span> | 
        ⚔️ Sát thương: <span style="color: #5dade2; font-weight:bold;">${champ.damage}</span> | 
        🏷️ Tộc Hệ: <span style="color: #2ecc71;">${champ.traits.join(", ")}</span>
    `;
}

function checkSynergies() {
    const uniqueChampsOnBoard = new Set();
    const traitCounts = {};

    gameState.boardSlots.forEach(champ => {
        if (champ) {
            uniqueChampsOnBoard.add(champ.id);
        }
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
    for (const [traitName, count] of Object.entries(traitCounts)) {
        const config = traitsConfig[traitName];
        if (config) {
            const activatedMilestone = config.milestones
                .filter(m => count >= m)
                .pop(); 
            
            finalActiveTraits[traitName] = {
                count: count,
                milestone: activatedMilestone || 0
            };
        }
    }

    gameState.activeTraits = finalActiveTraits;
    applyTraitBuffs();
    renderTraitsUI();
}

function applyTraitBuffs() {
    gameState.boardSlots.forEach((champ) => {
        if (!champ) return;
        const originalChamp = championsPool.find(c => c.id === champ.id);
        champ.hp = originalChamp.hp * champ.star; // Tính theo cấp sao gốc
        champ.damage = originalChamp.damage * champ.star;

        if (champ.traits.includes("Đấu Sĩ") && gameState.activeTraits["Đấu Sĩ"]) {
            const milestone = gameState.activeTraits["Đấu Sĩ"].milestone;
            if (milestone === 2) champ.hp += 200;
            if (milestone === 4) champ.hp += 450;
            if (milestone === 6) champ.hp += 1200;
        }

        if (champ.traits.includes("Cuồng Chiến") && gameState.activeTraits["Cuồng Chiến"]) {
            const milestone = gameState.activeTraits["Cuồng Chiến"].milestone;
            if (milestone === 3) champ.damage += 110;
            if (milestone === 5) champ.damage += 330;
        }
    });
}

function renderTraitsUI() {
    const panel = document.getElementById("traits-panel");
    if (!panel) return;
    
    panel.innerHTML = "<h3>Tộc / Hệ Kích Hoạt</h3>";
    const allTraits = Object.keys(traitsConfig);
    
    const sortedTraits = allTraits.sort((a, b) => {
        const dataA = gameState.activeTraits[a] || { milestone: 0, count: 0 };
        const dataB = gameState.activeTraits[b] || { milestone: 0, count: 0 };
        if (dataB.milestone !== dataA.milestone) return dataB.milestone - dataA.milestone;
        return dataB.count - dataA.count;
    });
    
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
            traitDiv.style.background = "linear-gradient(90deg, #ffce00, #e6b800)";
            traitDiv.style.color = "#000";
            traitDiv.style.fontWeight = "bold";
            traitDiv.innerHTML = `<span>⭐ ${traitName}</span> <span>Mốc: ${data.milestone} (${data.count})</span>`;
        } else {
            traitDiv.style.background = "#222533";
            traitDiv.style.color = "#888";
            traitDiv.innerHTML = `<span>${traitName}</span> <span>${data.count}</span>`;
        }
        panel.appendChild(traitDiv);
    });
}