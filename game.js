import { gameState, updateGoldUI } from 'data.js';
import { renderBoard, renderBench } from './board.js';
import { generateShop } from './shop.js';

// Hàm khởi tạo toàn bộ game
function initGame() {
    updateGoldUI();
    renderBoard();
    renderBench();
    generateShop();

    // Bắt sự kiện nút Reroll
    document.getElementById("reroll-btn").onclick = () => {
        if (gameState.gold >= 2) {
            gameState.gold -= 2;
            updateGoldUI();
            generateShop();
        } else {
            alert("Không đủ vàng để roll!");
        }
    };
}

// Chạy game khi trang web tải xong
window.onload = initGame;