// Hàm xử lý kết thúc trận đấu (Giả lập Thắng/Thua)
function handleCombatEnd(isWin) {
    let gainedPoints = 0;

    // 1. Kiểm tra cơ chế tích điểm của "Mã Hóa" (Mỗi trận đều tăng)
    if (gameState.activeTraits["Mã Hóa"]) {
        const milestone = gameState.activeTraits["Mã Hóa"].milestone;
        if (milestone === 2) gainedPoints += 5;
        if (milestone === 4) gainedPoints += 10;
        if (milestone === 6) gainedPoints += 20;
    }

    // 2. Kiểm tra cơ chế tích điểm của "Chinh Phục" (Chỉ tăng khi THẮNG TRẬN)
    if (isWin && gameState.activeTraits["Chinh Phục"]) {
        const milestone = gameState.activeTraits["Chinh Phục"].milestone;
        if (milestone === 2) gainedPoints += 4;
        if (milestone === 4) gainedPoints += 8;
        if (milestone === 6) gainedPoints += 12;
    }

    // Cộng điểm vào hũ
    gameState.cashoutPoints += gainedPoints;
    if (gainedPoints > 0) {
        alert(`Tộc hệ kích hoạt! Bạn nhận được +${gainedPoints} điểm nổ hũ.`);
    }

    // Tăng vàng cơ bản sau mỗi vòng đấu + tăng số vòng
    gameState.gold += 5; 
    gameState.round += 1;

    // Làm mới cửa hàng cho vòng mới
    generateShop();
    updateGoldUI();
}

// Hàm xử lý NỔ HŨ nhận thưởng theo mốc điểm Excel của bạn
function claimCashout() {
    const points = gameState.cashoutPoints;
    if (points === 0) {
        alert("Hũ đang trống, hãy tích điểm bằng tướng Mã Hóa hoặc Chinh Phục!");
        return;
    }

    let rewardText = "";

    // Đối chiếu các mốc phần thưởng từ file Excel của bạn
    if (points >= 200) {
        gameState.gold += 100;
        rewardText = "Mốc 200 Điểm Thần Tài: Nhận 100 Vàng và siêu buff trang bị!";
    } else if (points >= 175) {
        gameState.gold += 50;
        rewardText = "Mốc 175 Điểm: Nhận 50 Vàng và 3 trang bị ánh sáng!";
    } else if (points >= 135) {
        gameState.gold += 15;
        rewardText = "Mốc 135 Điểm: Nhận Tướng 5 sao ngẫu nhiên và 15 Vàng!";
    } else if (points >= 120) {
        gameState.gold += 30;
        rewardText = "Mốc 120 Điểm: Nhận 2 Tướng 5 sao 2 Sao và 30 Vàng!";
    } else if (points >= 100) {
        gameState.gold += 50;
        rewardText = "Mốc 100 Điểm: Nhận 2 Trang bị Ánh Sáng và 50 Vàng!";
    } else if (points >= 85) {
        rewardText = "Mốc 85 Điểm: Nhận 1 Vương Miện Chiến Thuật và Tướng 5 Sao!";
    } else if (points >= 60) {
        gameState.gold += 30;
        rewardText = "Mốc 60 Điểm: Nhận 30 Vàng và Máy Sao Chép Tướng!";
    } else if (points >= 45) {
        rewardText = "Mốc 45 Điểm: Nhận 2 Trang Bị Thường và Búa Gỡ Đồ!";
    } else if (points >= 25) {
        gameState.gold += 4;
        rewardText = "Mốc 25 Điểm: Nhận 1 Trang bị thường và 4 Vàng!";
    } else if (points >= 10) {
        gameState.gold += 7;
        rewardText = "Mốc 10 Điểm: Nhận 7 Vàng và Búa Gỡ Đồ!";
    } else if (points >= 5) {
        gameState.gold += 5;
        rewardText = "Mốc 5 Điểm: Nhận 5 Vàng!";
    } else {
        gameState.gold += Math.floor(points / 2);
        rewardText = `Hũ nhỏ tích lũy được đổi thành ${Math.floor(points / 2)} Vàng!`;
    }

    alert(`🎉 NỔ HŨ THÀNH CÔNG! 🎉\n${rewardText}`);
    gameState.cashoutPoints = 0; // Reset hũ về 0 sau khi nổ
    updateGoldUI();
}

// Khởi chạy game ban đầu
function initGame() {
    updateGoldUI();
    renderBoard();
    renderBench();
    generateShop();
    renderTraitsUI();

    // Sự kiện nút Đổi lại (Reroll)
    document.getElementById("reroll-btn").onclick = () => {
        if (gameState.gold >= 2) {
            gameState.gold -= 2;
            updateGoldUI();
            generateShop();
        } else {
            alert("Không đủ vàng để roll!");
        }
    };

    // Gắn sự kiện cho các nút tính năng mới
    document.getElementById("win-btn").onclick = () => handleCombatEnd(true);
    document.getElementById("lose-btn").onclick = () => handleCombatEnd(false);
    document.getElementById("cashout-btn").onclick = () => claimCashout();
}

window.onload = initGame;