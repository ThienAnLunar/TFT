let draggedElement = null;
let sourceSlotType = null; 
let sourceIndex = null;

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
    
    if (champData.star === 3) {
        piece.style.background = "linear-gradient(135deg, #ffae00, #ff7b00)";
        piece.style.color = "#fff";
        piece.style.border = "2px solid #fff";
    } else if (champData.star === 2) {
        piece.style.background = "linear-gradient(135deg, #4a5568, #2d3748)";
    }

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
        checkSynergies(); 
    });
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
        champ.hp = originalChamp.hp;
        champ.damage = originalChamp.damage;

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