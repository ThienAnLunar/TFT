function generateShop() {
    const shop = document.getElementById("shop");
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
        // Tìm ô trống đầu tiên trên hàng chờ
        const emptyIndex = gameState.benchSlots.findIndex(slot => slot === null);
        
        if (emptyIndex !== -1) {
            gameState.gold -= champion.cost;
            
            // Tạo một bản sao tướng mới với thuộc tính star = 1
            const newChamp = { ...champion, star: 1, currentHp: champion.hp }; 
            gameState.benchSlots[emptyIndex] = newChamp; 
            shopItemElement.style.visibility = "hidden"; // Ẩn tướng ở shop sau khi mua
            
            updateGoldUI();
            
            // KÍCH HOẠT: Quét nâng sao tự động ngay khi vừa mua thành công!
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

    // Quét từ tướng 1 sao lên 2 sao
    for (let starLevel = 1; starLevel <= 2; starLevel++) {
        // Lấy danh sách tất cả các tướng hiện có trên sàn đấu và hàng chờ
        const allPositions = [];
        
        gameState.boardSlots.forEach((c, i) => { if (c) allPositions.push({ champ: c, type: 'board', index: i }); });
        gameState.benchSlots.forEach((c, i) => { if (c) allPositions.push({ champ: c, type: 'bench', index: i }); });

        // Tìm các nhóm tướng trùng ID và trùng cấp Sao
        const groups = {};
        allPositions.forEach(item => {
            if (item.champ.star === starLevel) {
                const key = item.champ.id;
                if (!groups[key]) groups[key] = [];
                groups[key].push(item);
            }
        });

        // Xử lý gộp nếu có từ 3 con trở lên trùng nhau
        for (const [id, matches] of Object.entries(groups)) {
            if (matches.length >= 3) {
                // 1. Giữ lại vị trí của con đầu tiên để lát nữa đặt con cấp cao vào đó
                const mainTarget = matches[0];

                // 2. Xóa 3 con cấp thấp ra khỏi dữ liệu hệ thống
                for (let i = 0; i < 3; i++) {
                    const pos = matches[i];
                    if (pos.type === 'board') gameState.boardSlots[pos.index] = null;
                    else gameState.benchSlots[pos.index] = null;
                }

                // 3. Tạo tướng cấp sao mới mạnh hơn (X2 chỉ số máu và sát thương)
                const baseInfo = championsPool.find(c => c.id === id);
                const upgradedChamp = {
                    ...baseInfo,
                    star: starLevel + 1,
                    hp: baseInfo.hp * (starLevel + 1), // Tăng máu theo cấp sao
                    damage: baseInfo.damage * (starLevel + 1) // Tăng sát thương theo cấp sao
                };

                // 4. Đặt con tướng mới nâng cấp vào lại vị trí cũ
                if (mainTarget.type === 'board') gameState.boardSlots[mainTarget.index] = upgradedChamp;
                else gameState.benchSlots[mainTarget.index] = upgradedChamp;

                alert(`✨ CHÚC MỪNG! Bạn đã nâng cấp thành công ${upgradedChamp.name} lên ${upgradedChamp.star} SAO! ✨`);
                upgraded = true;
                break;
            }
        }
        if (upgraded) break;
    }

    // Nếu vừa có một pha nâng sao thành công, chạy đệ quy quét tiếp (Đề phòng trường hợp gộp chuỗi lên 3 sao luôn)
    if (upgraded) {
        checkAndUpgradeChampions();
    }
}