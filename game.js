class Game {
    constructor() {
        /* Метод constructor запускается автоматически один раз при создании игры через new Game() */
        this.money = 0;
        this.incomePerSec = 0;
        this.buildings = {};
        this.buildingData = [];
        this.loadBuildings();
    }

    loadBuildings() {
        this.buildingData = [
            { "id": 1, "name": "Хижина", "cost": 10, "income": 1 },
            { "id": 2, "name": "Лесопилка", "cost": 50, "income": 6 },
            { "id": 3, "name": "Мастерская", "cost": 200, "income": 25 },
            { "id": 4, "name": "Ферма", "cost": 500, "income": 85 },
            { "id": 5, "name": "Завод", "cost": 2000, "income": 400 }
        ];
        this.renderShop();
        this.updateUI();
    }

    click() {
        this.money = this.money + 1;
        this.updateUI();
        this.renderShop();
    }

    buyBuilding(id) {
        /* Метод покупки здания, id передаётся чтобы знать какое здание покупают */

        const building = this.buildingData.find(b => b.id === id);
        /* Ищем здание с нужным id в массиве данных о зданиях */

        if (!building) return;
        /* Если здание с таким id не найдено — прерываем метод */

        if (this.money < building.cost) return;
        /* Если денег меньше чем цена здания — прерываем метод */

        this.money = this.money - building.cost;
        /* Вычитаем стоимость здания из денег игрока */

        if (this.buildings[id]) {
            /* Проверяем, покупали ли мы уже такое здание раньше */

            this.buildings[id] = this.buildings[id] + 1;
            /* Если покупали — увеличиваем количество купленных на 1 */
        } else {
            /* Если не покупали */

            this.buildings[id] = 1;
            /* Записываем первую покупку этого здания */
        }

        this.incomePerSec = this.incomePerSec + building.income;
        /* Увеличиваем пассивный доход на величину дохода купленного здания */

        this.updateUI();
        /* Обновляем счётчик денег на экране */

        this.renderShop();
        /* Перерисовываем магазин с обновлёнными количествами */
    }

    renderShop() {
        const shopDiv = document.getElementById('shopItems');
        shopDiv.innerHTML = '';
        this.buildingData.forEach(building => {
            const count = this.buildings[building.id] || 0;
            const canBuy = this.money >= building.cost;
            const item = document.createElement('div');
            item.style.margin = '10px 0';

            item.innerHTML = `
                <strong>${building.name}</strong> — ${building.cost} монет<br>
                Доход: +${building.income}/сек | Куплено: ${count}<br>
                <button id="buyBtn${building.id}" ${!canBuy ? 'disabled' : ''}>
                    Купить
                </button>
            `;

            shopDiv.appendChild(item);
            const btn = document.getElementById(`buyBtn${building.id}`);
            btn.addEventListener('click', () => this.buyBuilding(building.id));
            /* Вешаем обработчик клика на кнопку, при нажатии вызовется buyBuilding */
        });
    }

    updateUI() {
        document.getElementById('moneyDisp').textContent = 'Монеты: ' + this.money;
    }

    startIncomeLoop() {
        /* Метод запуска пассивного дохода */

        setInterval(() => {
            /* setInterval выполняет функцию через равные промежутки времени */

            this.money = this.money + this.incomePerSec;
            /* Каждую секунду добавляем к деньгам текущий пассивный доход */

            this.updateUI();
            /* Обновляем отображение денег на экране */

            this.renderShop();
            /* Перерисовываем магазин, могли накопиться деньги на новую покупку */
        }, 1000);
        /* Интервал 1000 миллисекунд, то есть 1 секунда */
    }
}

window.onload = function () {
    /* Событие срабатывает когда вся страница полностью загрузилась */

    const game = new Game();
    /* Создаём новый экземпляр игры, запускается constructor */

    game.startIncomeLoop();
    /* Запускаем цикл пассивного дохода */

    document.getElementById('palmButton').addEventListener('click', function () {
        /* Находим кнопку-пальму и вешаем на неё обработчик клика */

        game.click();
        /* При клике вызываем метод click у нашей игры */
    });
};
/* Конец обработчика загрузки страницы */