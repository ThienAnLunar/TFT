function initGame() {
    updateGoldUI();
    renderBoard();
    renderBench();
    generateShop();

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

window.onload = initGame;