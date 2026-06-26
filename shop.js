function generateShop() {
    const shop = document.getElementById("shop");
    if (!shop) return;
    shop.innerHTML = "";
    
    for (let i = 0; i < 5; i++) {
        const randChamp = championsPool[Math.floor(Math.random() * championsPool.length)];
        const shopItem = document.createElement("div");
        shopItem.classList.add("shop-item");
        shopItem.innerHTML = `<div>${randChamp.name}</div><div style="color:#ffd700">${randChamp.cost}G</div>`;
        
        shopItem.onclick = () => buyChampion(randChamp, shopItem);
        shop.appendChild(shopItem);
    }
}

function buyChampion(champion, shopItemElement) {
    if (gameState.gold >= champion.cost) {
        const emptyIndex = gameState.benchSlots.findIndex(slot => slot === null);
        
        if (emptyIndex !== -1) {
            gameState.gold -= champion.cost;
            const newChamp = { ...champion, star: 1, currentHp: champion.hp }; 
            gameState.benchSlots[emptyIndex] = newChamp; 
            shopItemElement.style.visibility = "hidden"; 
            
            updateGoldUI();
            checkAndUpgradeChampions();
            renderBench();
            renderBoard();
        } else {
            alert("Hàng chờ đã đầy!");
        }
    } else {
        alert("Bạn không đủ vàng!");
    }
}

function checkAndUpgradeChampions() {
    let upgraded = false;

    for (let starLevel = 1; starLevel <= 2; starLevel++) {
        const allPositions = [];
        gameState.boardSlots.forEach((c, i) => { if (c) allPositions.push({ champ: c, type: 'board', index: i }); });
        gameState.benchSlots.forEach((c, i) => { if (c) allPositions.push({ champ: c, type: 'bench', index: i }); });

        const groups = {};
        allPositions.forEach(item => {
            if (item.champ.star === starLevel) {
                const key = item.champ.id;
                if (!groups[key]) groups[key] = [];
                groups[key].push(item);
            }
        });

        for (const [id, matches] of Object.entries(groups)) {
            if (matches.length >= 3) {
                const mainTarget = matches[0];

                for (let i = 0; i < 3; i++) {
                    const pos = matches[i];
                    if (pos.type === 'board') gameState.boardSlots[pos.index] = null;
                    else gameState.benchSlots[pos.index] = null;
                }

                const baseInfo = championsPool.find(c => c.id === id);
                const upgradedChamp = {
                    ...baseInfo,
                    star: starLevel + 1,
                    hp: baseInfo.hp * (starLevel + 1), 
                    damage: baseInfo.damage * (starLevel + 1) 
                };

                if (mainTarget.type === 'board') gameState.boardSlots[mainTarget.index] = upgradedChamp;
                else gameState.benchSlots[mainTarget.index] = upgradedChamp;

                alert(`✨ CHÚC MỪNG! Bạn đã nâng cấp thành công ${upgradedChamp.name} lên ${upgradedChamp.star} SAO! ✨`);
                upgraded = true;
                break;
            }
        }
        if (upgraded) break;
    }

    if (upgraded) {
        checkAndUpgradeChampions();
    }
}