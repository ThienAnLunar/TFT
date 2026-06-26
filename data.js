const championsPool = [
    { id: "garen", name: "Garen", cost: 1, hp: 600, damage: 50 },
    { id: "vayne", name: "Vayne", cost: 1, hp: 400, damage: 60 },
    { id: "lucian", name: "Lucian", cost: 2, hp: 450, damage: 55 },
    { id: "ahri", name: "Ahri", cost: 2, hp: 450, damage: 65 },
    { id: "yasuo", name: "Yasuo", cost: 5, hp: 700, damage: 80 }
];

const gameState = {
    gold: 50,
    benchSlots: Array(9).fill(null),      // 9 ô hàng chờ
    boardSlots: Array(28).fill(null),     // 28 ô bàn cờ (4x7)
};

function updateGoldUI() {
    document.getElementById("gold").innerText = gameState.gold;
}