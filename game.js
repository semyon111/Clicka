// =======================
// КЛАСС GAME — вся игра здесь
// =======================
class Game {
    constructor() {
        /* Метод constructor запускается автоматически один раз при создании игры */

        this.money = 0;
        /* Деньги игрока, старт с нуля */

        this.incomePerSec = 0;
        /* Пассивный доход в секунду, старт с нуля */

        this.buildings = {};
        /* Объект для хранения купленных зданий, формат: { idЗдания: количествоКупленных } */

        this.buildingData = [];
        /* Массив с данными всех зданий, загружается в loadBuildings */

        this.totalEarned = 0;
        /* Всего заработано денег за всё время игры */

        this.totalClicks = 0;
        /* Всего кликов по острову */

        this.loadBuildings();
        /* Загружаем данные зданий и отрисовываем магазин */
    }

    // =======================
    // ЗАГРУЗКА ДАННЫХ ЗДАНИЙ
    // =======================
    loadBuildings() {
        /* Метод загрузки массива зданий вручную (без fetch, чтобы работало без сервера) */

        this.buildingData = [
            /* Массив объектов, каждый объект — одно здание */
            { id: 1, name: "Хижина", cost: 10, income: 1, icon: "house.png" },
            /* id=1, цена 10 монет, доход 1/сек, иконка house.png */
            { id: 2, name: "Лесопилка", cost: 50, income: 6, icon: "tree.png" },
            { id: 3, name: "Храм", cost: 200, income: 25, icon: "tample.png" },
            { id: 4, name: "Пещера", cost: 500, income: 85, icon: "cave.png" },
            { id: 5, name: "Завод", cost: 2000, income: 400, icon: "factori.png" }
        ];

        this.buildingData.forEach(b => {
            /* Перебираем каждое здание из массива */
            if (!this.buildings[b.id]) this.buildings[b.id] = 0;
            /* Если здание ещё не покупали — записываем 0 */
        });

        this.loadGame();
        /* Загружаем сохранённые данные из localStorage */

        this.renderShop();
        /* Отрисовываем магазин */

        this.updateUI();
        /* Обновляем счётчики */

        this.renderBuiltIcons();
        /* Отображаем купленные здания под островом */

        this.renderBuildingsOnIsland();
        /* Размещаем здания на острове */
    }

    // =======================
    // КЛИК ПО ОСТРОВУ
    // =======================
    click() {
        /* Метод обработки клика по острову */
        this.money += 1;
        /* Увеличиваем деньги на 1 */
        this.totalEarned += 1;
        /* Увеличиваем счётчик всего заработанного */
        this.totalClicks += 1;
        /* Увеличиваем счётчик кликов */
        this.updateUI();
        /* Обновляем экран */
        this.saveGame();
        /* Сохраняем прогресс после клика */
    }

    // =======================
    // ПОКУПКА ЗДАНИЯ
    // =======================
    buyBuilding(id, quantity) {
        /* Метод покупки здания, id — какое здание, quantity — сколько штук */

        const building = this.buildingData.find(b => b.id === id);
        /* Ищем здание с нужным id в массиве данных */

        if (!building) return;
        /* Если здание не найдено — выходим */

        let finalQuantity = quantity;
        /* Переменная для итогового количества покупки */

        if (quantity === 'max') {
            /* Если нажали кнопку Max */
            finalQuantity = Math.floor(this.money / building.cost);
            /* Считаем сколько можем купить на все деньги */
            if (finalQuantity === 0) return;
            /* Если ни одного не купить — выходим */
        }

        const totalCost = building.cost * finalQuantity;
        /* Общая стоимость */
                /* В остальных случаях просто выходим */
            /* Если денег хватает */
            this.money -= totalCost;
            /* Списываем полную стоимость */
            this.buildings[id] += finalQuantity;
            /* Увеличиваем счётчик */
            this.incomePerSec += building.income * finalQuantity;
            /* Увеличиваем доход */

        this.updateUI();
        /* Обновляем счётчики и магазин */
        this.renderBuiltIcons();
        /* Обновляем панель купленных зданий */
        this.renderBuildingsOnIsland();
        /* Обновляем здания на острове */
        this.saveGame();
        /* Сохраняем прогресс */
    }

    // =======================
    // ПОЛУЧИТЬ ОБЩЕЕ КОЛИЧЕСТВО КУПЛЕННЫХ ЗДАНИЙ
    // =======================
    getTotalBuildings() {
        /* Считает сумму всех купленных зданий */
        let total = 0;
        /* Начальное значение */
        for (let id in this.buildings) {
            /* Перебираем все id в объекте buildings */
            total += this.buildings[id] || 0;
            /* Добавляем количество, если undefined — 0 */
        }
        return total;
        /* Возвращаем сумму */
    }

    // =======================
    // ОТРИСОВКА МАГАЗИНА
    // =======================
    renderShop() {
        /* Метод отрисовки магазина */
        const container = document.getElementById('shopItems');
        /* Находим контейнер магазина по id */
        if (!container) return;
        /* Если контейнер не найден — выходим */
        container.innerHTML = '';
        /* Очищаем контейнер перед перерисовкой */

        for (let building of this.buildingData) {
            /* Перебираем все здания */
            const count = this.buildings[building.id] || 0;
            /* Сколько раз куплено это здание */
            const canBuy1 = this.money >= building.cost;
            /* Хватает ли денег на 1 штуку */
            const canBuy10 = this.money >= building.cost * 10;
            /* Хватает ли денег на 10 штук */
            const maxPossible = Math.floor(this.money / building.cost);
            /* Максимальное количество, которое можно купить */
            const canBuyMax = maxPossible > 0;
            /* Можно ли купить хотя бы 1 */

            const card = document.createElement('div');
            /* Создаём карточку здания */
            card.className = 'shop-item-card';
            /* Присваиваем CSS-класс */

            const nameStrong = document.createElement('strong');
            /* Создаём элемент для названия */
            nameStrong.textContent = building.name;
            /* Вставляем название здания */
            card.appendChild(nameStrong);
            /* Добавляем название в карточку */

            const iconDiv = document.createElement('div');
            /* Создаём контейнер для иконки */
            iconDiv.className = 'building-icon';
            const iconImg = document.createElement('img');
            /* Создаём элемент картинки */
            iconImg.src = `icons/${building.icon}`;
            /* Путь к иконке здания */
            iconImg.alt = building.name;
            /* Альтернативный текст */
            iconImg.className = 'building-icon-img';
            iconImg.onerror = function () {
                /* Если картинка не загрузилась — показываем заглушку */
                this.onerror = null;
                this.src = 'data:image/svg+xml,...';
                /* SVG-заглушка */
            };
            iconDiv.appendChild(iconImg);
            /* Добавляем картинку в контейнер */
            card.appendChild(iconDiv);
            /* Добавляем контейнер в карточку */

            const detailsDiv = document.createElement('div');
            /* Создаём контейнер для информации */
            detailsDiv.className = 'item-details';
            detailsDiv.innerHTML = `
                <span class="item-stats">💰 ${building.cost} монет</span>
                <span class="item-stats">⚡ +${building.income}/сек</span>
                <span class="item-count">📦 ${count}</span>
            `;
            card.appendChild(detailsDiv);
            /* Добавляем информацию в карточку */

            const buyLabel = document.createElement('div');
            /* Создаём надпись "Купить" */
            buyLabel.textContent = 'Купить';
            buyLabel.style.fontWeight = 'bold';
            buyLabel.style.margin = '8px 0 4px';
            buyLabel.style.textAlign = 'center';
            card.appendChild(buyLabel);
            /* Добавляем надпись в карточку */

            const selectorDiv = document.createElement('div');
            /* Контейнер для кнопок 1, 10, Max */
            selectorDiv.className = 'quantity-selector';

            // Кнопка "1"
            const btn1 = document.createElement('button');
            btn1.textContent = '1';
            btn1.className = 'qty-btn';
            if (!canBuy1) btn1.disabled = true;
            /* Если денег не хватает — кнопка неактивна */
            btn1.addEventListener('click', (e) => {
                e.stopPropagation();
                /* Предотвращаем всплытие события */
                this.buyBuilding(building.id, 1);
                /* Покупаем 1 здание */
            });
            selectorDiv.appendChild(btn1);

            // Кнопка "10"
            const btn10 = document.createElement('button');
            btn10.textContent = '10';
            btn10.className = 'qty-btn';
            if (!canBuy10) btn10.disabled = true;
            btn10.addEventListener('click', (e) => {
                e.stopPropagation();
                this.buyBuilding(building.id, 10);
                /* Покупаем 10 зданий (или сколько возможно) */
            });
            selectorDiv.appendChild(btn10);

            // Кнопка "Max"
            const btnMax = document.createElement('button');
            btnMax.textContent = 'Max';
            btnMax.className = 'qty-btn';
            if (!canBuyMax) btnMax.disabled = true;
            btnMax.addEventListener('click', (e) => {
                e.stopPropagation();
                this.buyBuilding(building.id, 'max');
                /* Покупаем максимально возможное количество */
            });
            selectorDiv.appendChild(btnMax);

            card.appendChild(selectorDiv);
            /* Добавляем кнопки в карточку */
            container.appendChild(card);
            /* Добавляем карточку в магазин */
        }
    }

    // =======================
    // ОТРИСОВКА ЗДАНИЙ НА ОСТРОВЕ
    // =======================
    renderBuildingsOnIsland() {
        /* Метод размещает иконки купленных зданий прямо на картинке острова */
        const container = document.getElementById('buildingsOnIsland');
        /* Находим контейнер на острове */
        if (!container) return;
        /* Если не найден — выходим */
        container.innerHTML = '';
        /* Очищаем */

        // Фиксированные позиции для каждого типа зданий (максимум 4 на тип)
        const positions = {
            /* Объект с координатами для каждого типа зданий */
            1: [
                { top: '35%', left: '30%' },
                { top: '35%', left: '35%' },
                { top: '40%', left: '30%' },
                { top: '40%', left: '35%' }
            ],
            2: [
                { top: '25%', left: '55%' },
                { top: '25%', left: '60%' },
                { top: '30%', left: '55%' },
                { top: '30%', left: '60%' }
            ],
            3: [
                { top: '55%', left: '45%' },
                { top: '55%', left: '50%' },
                { top: '60%', left: '45%' },
                { top: '60%', left: '50%' }
            ],
            4: [
                { top: '15%', left: '40%' },
                { top: '15%', left: '45%' },
                { top: '20%', left: '40%' },
                { top: '20%', left: '45%' }
            ],
            5: [
                { top: '40%', left: '50%' },
                { top: '40%', left: '55%' },
                { top: '45%', left: '50%' },
                { top: '45%', left: '55%' }
            ]
        };

        for (let building of this.buildingData) {
            const count = this.buildings[building.id] || 0;
            if (count === 0) continue;

            const displayCount = Math.min(count, 4);
            const buildingPositions = positions[building.id];
            if (!buildingPositions) continue;

            for (let i = 0; i < displayCount; i++) {
                const pos = buildingPositions[i];
                if (!pos) continue;

                const buildingEl = document.createElement('div');
                buildingEl.className = 'island-building';
                buildingEl.style.top = pos.top;
                buildingEl.style.left = pos.left;

                const img = document.createElement('img');
                img.src = `icons/${building.icon}`;
                img.alt = building.name;
                img.onerror = function () {
                    this.onerror = null;
                    this.src = 'data:image/svg+xml,...';
                };
                buildingEl.appendChild(img);
                container.appendChild(buildingEl);
            }
        }
    }

    // =======================
    // ОТРИСОВКА КУПЛЕННЫХ ЗДАНИЙ ПОД ОСТРОВОМ
    // =======================
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
                this.src = 'data:image/svg+xml,...';
            };

            const countSpan = document.createElement('span');
            countSpan.textContent = `×${count}`;

            itemDiv.appendChild(img);
            itemDiv.appendChild(countSpan);
            container.appendChild(itemDiv);
        }
    }

    // =======================
    // ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
    // =======================
    updateUI() {
        const moneyElem = document.getElementById('moneyDisp');
        if (moneyElem) moneyElem.textContent = `💰 Монеты: ${Math.floor(this.money)}`;

        const incomeElem = document.getElementById('incomePerSecDisp');
        if (incomeElem) incomeElem.textContent = `📈 Доход: ${this.incomePerSec}/сек`;

        this.renderShop();
    }

    // =======================
    // ПОКАЗАТЬ СТАТИСТИКУ
    // =======================
    showStats() {
        /* Заполняет модальное окно статистики актуальными данными и показывает его */
        const totalBuildings = this.getTotalBuildings();
        /* Получаем общее количество купленных зданий */

        document.getElementById('statsTotalEarned').textContent = Math.floor(this.totalEarned);
        /* Отображаем всего заработано */

        document.getElementById('statsIncome').textContent = this.incomePerSec;
        /* Отображаем доход в секунду */

        document.getElementById('statsBalance').textContent = Math.floor(this.money);
        /* Отображаем текущий баланс */

        document.getElementById('statsBuildings').textContent = totalBuildings;
        /* Отображаем всего куплено зданий */

        document.getElementById('statsModal').style.display = 'flex';
        /* Показываем модальное окно статистики */
    }

    // =======================
    // ПАССИВНЫЙ ДОХОД
    // =======================
    startIncomeLoop() {
        setInterval(() => {
            if (this.incomePerSec > 0) {
                this.money += this.incomePerSec;
                this.totalEarned += this.incomePerSec;
                /* Учитываем пассивный доход в общей статистике */
                this.updateUI();
                this.saveGame();
            }
        }, 1000);
    }

    // =======================
    // СОХРАНЕНИЕ И ЗАГРУЗКА
    // =======================
    saveGame() {
        const saveData = {
            money: this.money,
            incomePerSec: this.incomePerSec,
            buildings: this.buildings,
            totalEarned: this.totalEarned,
            /* Сохраняем общий заработок */
            totalClicks: this.totalClicks,
            /* Сохраняем количество кликов */
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
            /* Восстанавливаем общий заработок */
            this.totalClicks = data.totalClicks || 0;
            /* Восстанавливаем клики */

            const now = Date.now();
            const elapsed = Math.floor((now - (data.timestamp || now)) / 1000);
            if (elapsed > 0 && this.incomePerSec > 0) {
                const maxOffline = 24 * 60 * 60;
                const offlineTime = Math.min(elapsed, maxOffline);
                const offlineEarnings = offlineTime * this.incomePerSec;
                this.money += offlineEarnings;
                this.totalEarned += offlineEarnings;
                /* Учитываем оффлайн-доход в статистике */
            }
        } catch (e) {
            console.warn('Не удалось загрузить сохранение:', e);
        }
    }

    resetGame() {
        localStorage.removeItem('islandClickerSave');
        this.money = 0;
        this.incomePerSec = 0;
        this.buildings = {};
        this.totalEarned = 0;
        /* Сбрасываем статистику */
        this.totalClicks = 0;
        /* Сбрасываем клики */
        this.buildingData.forEach(b => {
            this.buildings[b.id] = 0;
        });
        this.updateUI();
        this.renderBuiltIcons();
        this.renderBuildingsOnIsland();
    }
}

// =======================
// ЗАПУСК ИГРЫ
// =======================

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.startIncomeLoop();

    // Клик по острову
    const islandImg = document.getElementById('islandImage');
    if (islandImg) {
        islandImg.addEventListener('click', () => {
            game.click();
        });
    }

    // =======================
    // ЭЛЕМЕНТЫ МЕНЮ
    // =======================
    const menuButton = document.getElementById('menuButton');
    /* Кнопка-гамбургер */
    const sideMenu = document.getElementById('sideMenu');
    /* Выезжающая панель */
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    /* Кнопка закрытия меню */
    const statsBtn = document.getElementById('statsBtn');
    /* Кнопка Статистика */
    const resetBtn = document.getElementById('resetBtn');
    /* Кнопка Сбросить */
    const helpBtn = document.getElementById('helpBtn');
    /* Кнопка Помощь */
    const closeGameBtn = document.getElementById('closeGameBtn');
    /* Кнопка Закрыть */

    const resetModal = document.getElementById('resetModal');
    /* Модальное окно сброса */
    const confirmResetBtn = document.getElementById('confirmResetBtn');
    /* Кнопка подтвердить сброс */
    const cancelResetBtn = document.getElementById('cancelResetBtn');
    /* Кнопка отменить сброс */

    const statsModal = document.getElementById('statsModal');
    /* Модальное окно статистики */
    const closeStatsBtn = document.getElementById('closeStatsBtn');
    /* Кнопка закрытия статистики */

    const helpModal = document.getElementById('helpModal');
    /* Модальное окно помощи */
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    /* Кнопка закрытия помощи */

    // Открытие меню
    menuButton.addEventListener('click', () => {
        sideMenu.classList.add('open');
    });

    // Закрытие меню (крестик)
    closeMenuBtn.addEventListener('click', () => {
        sideMenu.classList.remove('open');
    });

    // Кнопка Закрыть — просто закрывает меню
    closeGameBtn.addEventListener('click', () => {
        sideMenu.classList.remove('open');
        /* Закрываем выезжающую панель */
    });

    // Кнопка Статистика
    statsBtn.addEventListener('click', () => {
        game.showStats();
        /* Показываем окно статистики с актуальными данными */
        sideMenu.classList.remove('open');
        /* Закрываем меню */
    });

    // Кнопка Помощь
    helpBtn.addEventListener('click', () => {
        helpModal.style.display = 'flex';
        /* Показываем пустое окно помощи */
        sideMenu.classList.remove('open');
        /* Закрываем меню */
    });

    // Закрытие окна помощи
    closeHelpBtn.addEventListener('click', () => {
        helpModal.style.display = 'none';
        /* Прячем окно помощи */
    });

    // Закрытие помощи по клику на фон
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });

    // Кнопка Сбросить прогресс
    resetBtn.addEventListener('click', () => {
        resetModal.style.display = 'flex';
        sideMenu.classList.remove('open');
    });

    // Подтверждение сброса
    confirmResetBtn.addEventListener('click', () => {
        game.resetGame();
        resetModal.style.display = 'none';
    });

    // Отмена сброса
    cancelResetBtn.addEventListener('click', () => {
        resetModal.style.display = 'none';
    });

    // Закрытие модального окна сброса по клику на фон
    resetModal.addEventListener('click', (e) => {
        if (e.target === resetModal) {
            resetModal.style.display = 'none';
        }
    });

    // Закрытие окна статистики
    closeStatsBtn.addEventListener('click', () => {
        statsModal.style.display = 'none';
    });

    // Закрытие статистики по клику на фон
    statsModal.addEventListener('click', (e) => {
        if (e.target === statsModal) {
            statsModal.style.display = 'none';
        }
    });

    // Закрытие меню по клику вне его
    document.addEventListener('click', (e) => {
        if (!sideMenu.contains(e.target) && e.target !== menuButton) {
            sideMenu.classList.remove('open');
        }
    });

    // =======================
    // ГОРЯЧАЯ КЛАВИША F1 — СПРАВКА
    // =======================
    document.addEventListener('keydown', (e) => {
        /* Отслеживаем нажатие клавиш на всей странице */
        if (e.key === 'F1') {
            /* Если нажата клавиша F1 */
            e.preventDefault();
            /* Отменяем стандартное действие браузера (открытие своей справки) */
            window.open('help/index.html', '_blank');
            /* Открываем справку в новой вкладке. Поменяй путь на свой файл документации */
        }
    });
});