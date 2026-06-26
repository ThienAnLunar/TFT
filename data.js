const traitsConfig = {
    "Đấu Sĩ": { milestones: [2, 4, 6] },
    "Hộ Pháp": { milestones: [2, 4] },
    "Thiên Thần": { milestones: [2, 3] },
    "Xạ Thủ": { milestones: [2, 4] },
    "Mã Hóa": { milestones: [2, 4, 6] },
    "Chinh Phục": { milestones: [2, 4, 6] },
    "Hư Không": { milestones: [3, 5] },
    "Yordle": { milestones: [2, 4, 6, 8, 10] },
    "Cổ Ngữ": { milestones: [2] },
    "Cuồng Chiến": { milestones: [3, 5] },
    "Sát Thủ": { milestones: [2, 3, 4] },
    "Cảnh Binh": { milestones: [3, 5, 7, 9] },
    "Ma": { milestones: [3, 5] },
    "Hành Tinh": { milestones: [1, 3, 5, 7] },
    "Xác Sống": { milestones: [2, 4, 6] },
    "Thần Tài": { milestones: [3, 5] }
};

const championsPool = [
    { id: "garen", name: "Garen", cost: 2, hp: 600, damage: 50, traits: ["Đấu Sĩ", "Thiên Thần"] },
    { id: "vayne", name: "Vayne", cost: 1, hp: 400, damage: 60, traits: ["Xạ Thủ", "Mã Hóa"] },
    { id: "lucian", name: "Lucian", cost: 2, hp: 450, damage: 55, traits: ["Xạ Thủ", "Thiên Thần"] },
    { id: "ahri", name: "Ahri", cost: 2, hp: 450, damage: 65, traits: ["Mã Hóa", "Ma"] },
    { id: "yasuo", name: "Yasuo", cost: 5, hp: 700, damage: 80, traits: ["Chinh Phục", "Đấu Sĩ"] },
    { id: "blitzcrank", name: "Blitzcrank", cost: 1, hp: 650, damage: 45, traits: ["Hộ Pháp", "Hành Tinh"] },
    { id: "kha_zix", name: "Kha'Zix", cost: 1, hp: 500, damage: 65, traits: ["Hư Không", "Sát Thủ"] },
    { id: "tristana", name: "Tristana", cost: 2, hp: 450, damage: 55, traits: ["Yordle", "Xạ Thủ"] },
    { id: "poppy", name: "Poppy", cost: 1, hp: 650, damage: 45, traits: ["Yordle", "Hộ Pháp"] },
    { id: "ryze", name: "Ryze", cost: 3, hp: 600, damage: 60, traits: ["Cổ Ngữ", "Mã Hóa"] },
    { id: "olaf", name: "Olaf", cost: 3, hp: 700, damage: 70, traits: ["Cuồng Chiến", "Xác Sống"] },
    { id: "caitlyn", name: "Caitlyn", cost: 4, hp: 600, damage: 75, traits: ["Cảnh Binh", "Xạ Thủ"] },
    { id: "vi", name: "Vi", cost: 3, hp: 750, damage: 65, traits: ["Cảnh Binh", "Đấu Sĩ"] },
    { id: "tahm_kench", name: "Tahm Kench", cost: 4, hp: 1000, damage: 50, traits: ["Thần Tài", "Đấu Sĩ"] },
    { id: "sion", name: "Sion", cost: 5, hp: 950, damage: 85, traits: ["Xác Sống", "Cuồng Chiến"] },
    { id: "bard", name: "Bard", cost: 3, hp: 550, damage: 45, traits: ["Thần Tài", "Hành Tinh"] }
];

const gameState = {
    gold: 50,
    round: 1,
    cashoutPoints: 0, // Điểm nổ hũ tích lũy
    benchSlots: Array(9).fill(null),
    boardSlots: Array(28).fill(null),
    activeTraits: {} 
};

function updateGoldUI() {
    document.getElementById("gold").innerText = gameState.gold;
    document.getElementById("round").innerText = gameState.round;
    document.getElementById("cashout-points").innerText = gameState.cashoutPoints;
}

const gameState = {
    gold: 50,
    round: 1,
    cashoutPoints: 0,
    benchSlots: Array(9).fill(null), // Hàng chờ 9 ô
    boardSlots: Array(80).fill(null), // ĐỔI THÀNH 80 Ô (8 hàng x 10 cột)
    activeTraits: {} 
};