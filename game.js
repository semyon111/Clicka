// =======================
// КЛАСС GAME
// =======================
class Game {
    constructor() {
        this.money = 0;
        this.incomePerSec = 0;
        this.buildings = {};
        this.buildingData = [];
        this.totalEarned = 0;
        this.totalClicks = 0;
        this.gameEnded = false;
        this.incomeInterval = null;
        this.loadBuildings();
    }

    loadBuildings() {
        this.buildingData = [
            { id: 1, name: "Хижина", cost: 10, income: 1, icon: "house.png" },
            { id: 2, name: "Лесопилка", cost: 50, income: 6, icon: "tree.png" },
            { id: 3, name: "Храм", cost: 200, income: 25, icon: "tample.png" },
            { id: 4, name: "Пещера", cost: 500, income: 85, icon: "cave.png" },
            { id: 5, name: "Завод", cost: 2000, income: 400, icon: "factori.png" },
            { id: 6, name: "Корабль", cost: 100000, income: 0, icon: "ship.png" }
        ];
        this.buildingData.forEach(b => {
            if (!this.buildings[b.id]) this.buildings[b.id] = 0;
        });
        this.loadGame();
        this.renderShop();
        this.updateUI();
        this.renderBuiltIcons();
        this.renderBuildingsOnIsland();
    }

    isShipUnlocked() {
        for (let i = 1; i <= 5; i++) {
            if ((this.buildings[i] || 0) === 0) return false;
        }
        return true;
    }

    click() {
        this.money += 1;
        this.totalEarned += 1;
        this.totalClicks += 1;
        this.updateUI();
        this.saveGame();
    }

    buyBuilding(id, quantity) {
        const building = this.buildingData.find(b => b.id === id);
        if (!building) return;

        let finalQuantity = quantity;
        if (quantity === 'max') {
            finalQuantity = Math.floor(this.money / building.cost);
            if (finalQuantity === 0) return;
        }

        const totalCost = building.cost * finalQuantity;
        if (this.money < totalCost) {
            if (quantity === 10) {
                finalQuantity = Math.floor(this.money / building.cost);
                if (finalQuantity === 0) return;
                this.money -= building.cost * finalQuantity;
                this.buildings[id] += finalQuantity;
                this.incomePerSec += building.income * finalQuantity;
            } else {
                return;
            }
        } else {
            this.money -= totalCost;
            this.buildings[id] += finalQuantity;
            this.incomePerSec += building.income * finalQuantity;
        }

        this.updateUI();
        this.renderBuiltIcons();
        this.renderBuildingsOnIsland();
        this.saveGame();

        if (id >= 1 && id <= 5 && this.isShipUnlocked()) {
            this.renderShop();
        }

        if (id === 6) {
            this.endGame();
        }
    }

    endGame() {
        if (this.gameEnded) return;
        this.gameEnded = true;
        const endModal = document.getElementById('endGameModal');
        if (endModal) endModal.style.display = 'flex';
        this.renderShop();
        this.saveGame();
    }

    getTotalBuildings() {
        let total = 0;
        for (let id in this.buildings) total += this.buildings[id] || 0;
        return total;
    }

    renderShop() {
        const container = document.getElementById('shopItems');
        if (!container) return;
        container.innerHTML = '';

        const shipUnlocked = this.isShipUnlocked();
        if (shipUnlocked) console.log('Корабль разблокирован!');

        for (let building of this.buildingData) {

            if (building.id === 6 && !shipUnlocked) continue;

            const count = this.buildings[building.id] || 0;
            const canBuy1 = this.money >= building.cost;
            const canBuy10 =  this.money >= building.cost * 10;
            const maxPossible = Math.floor(this.money / building.cost);
            const canBuyMax =    maxPossible > 0;

            const card = document.createElement('div');
            card.className = 'shop-item-card';

            const nameStrong = document.createElement('strong');
            nameStrong.textContent = building.name;
            card.appendChild(nameStrong);

            const iconDiv = document.createElement('div');
            iconDiv.className = 'building-icon';
            const iconImg = document.createElement('img');
            iconImg.src = `icons/${building.icon}`;
            iconImg.alt = building.name;
            iconImg.className = 'building-icon-img';
            iconImg.onerror = function () {
                this.onerror = null;
                this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"%3E%3Crect width="48" height="48" fill="%23d6b575" /%3E%3Ctext x="24" y="32" text-anchor="middle" fill="white" font-size="28"%3E🏠%3C/text%3E%3C/svg%3E';
            };
            iconDiv.appendChild(iconImg);
            card.appendChild(iconDiv);

            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'item-details';
            detailsDiv.innerHTML = `
                <span class="item-stats">💰 ${building.cost} монет</span>
                <span class="item-stats">⚡ +${building.income}/сек</span>
                <span class="item-count">📦 ${count}</span>
            `;
            card.appendChild(detailsDiv);

            const buyLabel = document.createElement('div');
            buyLabel.textContent = 'Купить';
            buyLabel.style.fontWeight = 'bold';
            buyLabel.style.margin = '8px 0 4px';
            buyLabel.style.textAlign = 'center';
            card.appendChild(buyLabel);

            const selectorDiv = document.createElement('div');
            selectorDiv.className = 'quantity-selector';

            const btn1 = document.createElement('button');
            btn1.textContent = '1';
            btn1.className = 'qty-btn';
            if (!canBuy1) btn1.disabled = true;
            btn1.addEventListener('click', (e) => { e.stopPropagation(); this.buyBuilding(building.id, 1); });
            selectorDiv.appendChild(btn1);

            const btn10 = document.createElement('button');
            btn10.textContent = '10';
            btn10.className = 'qty-btn';
            if (!canBuy10) btn10.disabled = true;
            btn10.addEventListener('click', (e) => { e.stopPropagation(); this.buyBuilding(building.id, 10); });
            selectorDiv.appendChild(btn10);

            const btnMax = document.createElement('button');
            btnMax.textContent = 'Max';
            btnMax.className = 'qty-btn';
            if (!canBuyMax) btnMax.disabled = true;
            btnMax.addEventListener('click', (e) => { e.stopPropagation(); this.buyBuilding(building.id, 'max'); });
            selectorDiv.appendChild(btnMax);

            card.appendChild(selectorDiv);
            container.appendChild(card);
        }
    }

    renderBuildingsOnIsland() {
        const container = document.getElementById('buildingsOnIsland');
        if (!container) return;
        container.innerHTML = '';

        // Получаем реальные размеры картинки острова
        const islandImg = document.getElementById('islandImage');
        /* Находим картинку острова */
        if (!islandImg) return;
        /* Если картинки нет — выходим */

        const imgWidth = islandImg.clientWidth;
        /* Реальная ширина картинки в пикселях прямо сейчас */
        const imgHeight = islandImg.clientHeight;
        /* Реальная высота картинки в пикселях прямо сейчас */

        // Если картинка ещё не загрузилась и размеры нулевые — выходим
        if (imgWidth === 0 || imgHeight === 0) return;
        /* Значит картинка ещё не отрисовалась, нечего позиционировать */

        // Позиции зданий в ПИКСЕЛЯХ относительно левого верхнего угла картинки
        const positions = {
            1: [ // Хижина
                { top: 120, left: 250 },
                { top: 120, left:  235  },
                { top: 105, left: 250 },
                { top: 105, left: 235}
            ],
            2: [ // Лесопилка
                { top: 60, left: 200 },
                { top: 60, left: 220 },
                { top: 85, left: 200 },
                { top: 85, left: 220 }
            ],
            3: [ // Храм
                { top: 140, left: 150 },
                { top: 140, left: 190 },
                { top: 165, left: 150 },
                { top: 165, left: 190 }
            ],
            4: [ // Пещера
                { top: 180, left: 210 },
                { top: 180, left: 225 },
                { top: 195, left: 210 },
                { top: 195, left: 225 }
            ],
            5: [ // Завод
                { top: 200, left: 270 },
                { top: 200, left: 300 },
                { top: 239, left: 270 },
                { top: 239, left: 300 }
            ]
        };

        for (let building of this.buildingData) {
            if (building.id === 6) continue;
            /* Корабль не отображаем на острове */
            const count = this.buildings[building.id] || 0;
            if (count === 0) continue;
            const displayCount = Math.min(count, 4);
            const buildingPositions = positions[building.id];
            if (!buildingPositions) continue;
            for (let i = 0; i < displayCount; i++) {
                const pos = buildingPositions[i];
                if (!pos) continue;

                // Превращаем пиксельные координаты в проценты
                const topPercent = (pos.top / imgHeight) * 100;
                /* Сколько процентов от высоты картинки */
                const leftPercent = (pos.left / imgWidth) * 100;
                /* Сколько процентов от ширины картинки */

                const buildingEl = document.createElement('div');
                buildingEl.className = 'island-building';
                buildingEl.style.top = topPercent + '%';
                /* Ставим в процентах от родителя */
                buildingEl.style.left = leftPercent + '%';
                /* Ставим в процентах от родителя */

                const img = document.createElement('img');
                img.src = `icons/${building.icon}`;
                img.alt = building.name;
                img.onerror = function () {
                    this.onerror = null;
                    this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"%3E%3Crect width="48" height="48" fill="%23d6b575" /%3E%3Ctext x="24" y="32" text-anchor="middle" fill="white" font-size="28"%3E🏠%3C/text%3E%3C/svg%3E';
                };
                buildingEl.appendChild(img);
                container.appendChild(buildingEl);
            }
        }
    }

    renderBuiltIcons() {
        const container = document.getElementById('builtIcons');
        if (!container) return;
        container.innerHTML = '';
        for (let building of this.buildingData) {
            if (building.id === 6) continue;
            const count = this.buildings[building.id] || 0;
            if (count === 0) continue;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'built-icon-item';
            const img = document.createElement('img');
            img.src = `icons/${building.icon}`;
            img.alt = building.name;
            img.onerror = function () {
                this.onerror = null;
                this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"%3E%3Crect width="48" height="48" fill="%23d6b575" /%3E%3Ctext x="24" y="32" text-anchor="middle" fill="white" font-size="28"%3E🏠%3C/text%3E%3C/svg%3E';
            };
            const countSpan = document.createElement('span');
            countSpan.textContent = `×${count}`;
            itemDiv.appendChild(img);
            itemDiv.appendChild(countSpan);
            container.appendChild(itemDiv);
        }
    }

    updateUI() {
        const moneyElem = document.getElementById('moneyDisp');
        if (moneyElem) moneyElem.textContent = `💰 Монеты: ${Math.floor(this.money)}`;
        const incomeElem = document.getElementById('incomePerSecDisp');
        if (incomeElem) incomeElem.textContent = `📈 Доход: ${this.incomePerSec}/сек`;
        this.renderShop();
    }

    showStats() {
        document.getElementById('statsTotalEarned').textContent = Math.floor(this.totalEarned);
        document.getElementById('statsIncome').textContent = this.incomePerSec;
        document.getElementById('statsBalance').textContent = Math.floor(this.money);
        document.getElementById('statsBuildings').textContent = this.getTotalBuildings();
        document.getElementById('statsModal').style.display = 'flex';
    }

    startIncomeLoop() {
        if (this.incomeInterval) clearInterval(this.incomeInterval);
        this.incomeInterval = setInterval(() => {
            if (this.incomePerSec > 0) {
                this.money += this.incomePerSec;
                this.totalEarned += this.incomePerSec;
                this.updateUI();
                this.saveGame();
            }
        }, 1000);
    }

    saveGame() {
        const saveData = {
            money: this.money,
            incomePerSec: this.incomePerSec,
            buildings: this.buildings,
            totalEarned: this.totalEarned,
            totalClicks: this.totalClicks,
            gameEnded: this.gameEnded,
            timestamp: Date.now()
        };
        localStorage.setItem('islandClickerSave', JSON.stringify(saveData));
    }

    loadGame() {
        const saved = localStorage.getItem('islandClickerSave');
        if (!saved) return;
        try {
            const data = JSON.parse(saved);
            this.money = data.money || 0;
            this.incomePerSec = data.incomePerSec || 0;
            this.buildings = data.buildings || {};
            this.totalEarned = data.totalEarned || 0;
            this.totalClicks = data.totalClicks || 0;
            this.gameEnded = data.gameEnded || false;
            const now = Date.now();
            const elapsed = Math.floor((now - (data.timestamp || now)) / 1000);
            if (elapsed > 0 && this.incomePerSec > 0 && !this.gameEnded) {
                const maxOffline = 24 * 60 * 60;
                const offlineTime = Math.min(elapsed, maxOffline);
                const offlineEarnings = offlineTime * this.incomePerSec;
                this.money += offlineEarnings;
                this.totalEarned += offlineEarnings;
            }
        } catch (e) { }
    }

    resetGame() {
        localStorage.removeItem('islandClickerSave');
        this.money = 0;
        this.incomePerSec = 0;
        this.buildings = {};
        this.totalEarned = 0;
        this.totalClicks = 0;
        this.gameEnded = false;
        this.buildingData.forEach(b => { this.buildings[b.id] = 0; });
        if (!this.incomeInterval) this.startIncomeLoop();
        this.updateUI();
        this.renderBuiltIcons();
        this.renderBuildingsOnIsland();
        const endModal = document.getElementById('endGameModal');
        if (endModal) endModal.style.display = 'none';
        this.saveGame();
    }

    resetAndRestart() {
        this.resetGame();
        this.renderShop();
    }
}

// =======================
// ЗАПУСК ИГРЫ
// =======================
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.startIncomeLoop();

    const islandImg = document.getElementById('islandImage');
    if (islandImg) islandImg.addEventListener('click', () => game.click());

    // Элементы меню и модальных окон (как в вашем коде, здесь сокращённо)
    const menuButton = document.getElementById('menuButton');
    const sideMenu = document.getElementById('sideMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const statsBtn = document.getElementById('statsBtn');
    const resetBtn = document.getElementById('resetBtn');
    const helpBtn = document.getElementById('helpBtn');
    const closeGameBtn = document.getElementById('closeGameBtn');
    const resetModal = document.getElementById('resetModal');
    const confirmResetBtn = document.getElementById('confirmResetBtn');
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    const statsModal = document.getElementById('statsModal');
    const closeStatsBtn = document.getElementById('closeStatsBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    const continueGameBtn = document.getElementById('continueGameBtn');
    const endGameModal = document.getElementById('endGameModal');

    continueGameBtn?.addEventListener('click', () => {
        endGameModal.style.display = 'none';
    });

    menuButton?.addEventListener('click', () => sideMenu.classList.add('open'));
    closeMenuBtn?.addEventListener('click', () => sideMenu.classList.remove('open'));
    closeGameBtn?.addEventListener('click', () => sideMenu.classList.remove('open'));
    statsBtn?.addEventListener('click', () => { game.showStats(); sideMenu.classList.remove('open'); });
    helpBtn?.addEventListener('click', () => { helpModal.style.display = 'flex'; sideMenu.classList.remove('open'); });
    closeHelpBtn?.addEventListener('click', () => helpModal.style.display = 'none');
    helpModal?.addEventListener('click', (e) => { if (e.target === helpModal) helpModal.style.display = 'none'; });
    resetBtn?.addEventListener('click', () => { resetModal.style.display = 'flex'; sideMenu.classList.remove('open'); });
    confirmResetBtn?.addEventListener('click', () => { game.resetGame(); resetModal.style.display = 'none'; });
    cancelResetBtn?.addEventListener('click', () => resetModal.style.display = 'none');
    resetModal?.addEventListener('click', (e) => { if (e.target === resetModal) resetModal.style.display = 'none'; });
    closeStatsBtn?.addEventListener('click', () => statsModal.style.display = 'none');
    statsModal?.addEventListener('click', (e) => { if (e.target === statsModal) statsModal.style.display = 'none'; });
    newGameBtn?.addEventListener('click', () => { game.resetAndRestart(); });

    document.addEventListener('click', (e) => {
        if (!sideMenu.contains(e.target) && e.target !== menuButton) sideMenu.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'F1') { e.preventDefault(); window.open('help/index.html', '_blank'); } });
    // Обновление позиций зданий при изменении размера окна
    window.addEventListener('resize', () => {
        game.renderBuildingsOnIsland();
    });
});