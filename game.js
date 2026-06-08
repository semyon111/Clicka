// game.js – надпись "Купить", под ней кнопки 1, 10, Max (каждая покупает)
class Game {
    constructor() {
        this.money = 0;
        this.incomePerSec = 0;
        this.buildings = {};
        this.buildingData = [];
        this.loadBuildings();
    }

    loadBuildings() {
        this.buildingData = [
            { id: 1, name: "Хижина", cost: 10, income: 1, icon: "house.png" },
            { id: 2, name: "Лесопилка", cost: 50, income: 6, icon: "tree.png" },
            { id: 3, name: "Храм", cost: 200, income: 25, icon: "tample.png" },
            { id: 4, name: "Пещера", cost: 500, income: 85, icon: "cave.png" },
            { id: 5, name: "Завод", cost: 2000, income: 400, icon: "factori.png" }
        ];
        this.buildingData.forEach(b => {
            if (!this.buildings[b.id]) this.buildings[b.id] = 0;
        });
        this.renderShop();
        this.updateUI();
        this.renderBuiltIcons();
    }

    click() {
        this.money += 1;
        this.updateUI();
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
    }

    renderShop() {
        const container = document.getElementById('shopItems');
        if (!container) return;
        container.innerHTML = '';

        for (let building of this.buildingData) {
            const count = this.buildings[building.id] || 0;
            const canBuy1 = this.money >= building.cost;
            const canBuy10 = this.money >= building.cost * 10;
            const maxPossible = Math.floor(this.money / building.cost);
            const canBuyMax = maxPossible > 0;

            const card = document.createElement('div');
            card.className = 'shop-item-card';

            // Название
            const nameStrong = document.createElement('strong');
            nameStrong.textContent = building.name;
            card.appendChild(nameStrong);

            // Иконка
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

            // Информация о цене, доходе, количестве
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'item-details';
            detailsDiv.innerHTML = `
                <span class="item-stats">💰 ${building.cost} монет</span>
                <span class="item-stats">⚡ +${building.income}/сек</span>
                <span class="item-count">📦 ${count}</span>
            `;
            card.appendChild(detailsDiv);

            // Надпись "Купить"
            const buyLabel = document.createElement('div');
            buyLabel.textContent = 'Купить';
            buyLabel.style.fontWeight = 'bold';
            buyLabel.style.margin = '8px 0 4px';
            buyLabel.style.textAlign = 'center';
            card.appendChild(buyLabel);

            // Кнопки выбора количества
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

    renderBuiltIcons() {
        const container = document.getElementById('builtIcons');
        if (!container) return;
        container.innerHTML = '';
        for (let building of this.buildingData) {
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
        this.renderBuiltIcons();
    }

    startIncomeLoop() {
        setInterval(() => {
            if (this.incomePerSec > 0) this.money += this.incomePerSec;
            this.updateUI();
        }, 1000);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.startIncomeLoop();
    const islandImg = document.getElementById('islandImage');
    if (islandImg) {
        islandImg.addEventListener('click', () => { game.click(); });
    }
});