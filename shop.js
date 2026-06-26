import { championsPool, gameState, updateGoldUI } from './data.js';
import { renderBench } from './board.js';

export function generateShop() {
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
        // Tìm ô trống trên bench
        const emptyIndex = gameState.benchSlots.findIndex(slot => slot === null);
        
        if (emptyIndex !== -1) {
            gameState.gold -= champion.cost;
            // Dùng cấu trúc {...} để clone object tránh lỗi ghi đè dữ liệu gốc
            gameState.benchSlots[emptyIndex] = { ...champion, star: 1 }; 
            shopItemElement.style.visibility = "hidden"; // Mua rồi thì ẩn đi
            
            updateGoldUI();
            renderBench();
        } else {
            alert("Hàng chờ đã đầy!");
        }
    } else {
        alert("Bạn không đủ vàng!");
    }
}