function initGame() {
    updateGoldUI();
    renderBoard();
    renderBench();
    generateShop();

    // Thiết lập hoạt động cho nút Đổi lại (Reroll)
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

// Chạy game khi toàn bộ trang và mã nguồn được tải xong
window.onload = initGame;