'use strict';

let habbits = [];
let globalActiveHabbitId;
const HABBIT_KEY = 'HABBIT_KEY';

/* page */
const page = {
    menu: document.querySelector('.menu__list'),
    header: {
        h1: document.querySelector('.h1'),
        progressPercent: document.querySelector('.progress__percent'),
        progressCoverBar: document.querySelector('.progress__cover-bar')
    },
    body: document.querySelector('.habbits__body'),
    popup: document.querySelector('.cover')
}

/* utils */

function loadData() {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    const habbitsArray = JSON.parse(habbitsString);
    if (Array.isArray(habbitsArray)) {
        habbits = habbitsArray;
    }
}

function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

/*function formGetData(event) {
    const form = event.target;
    event.preventDefault();
    const data = new FormData(form);
    return data;
}*/

/* render */

function rerenderMenu(activeHabbit) {
    if (!activeHabbit) {
        return;
    }
    document.querySelector('.menu__list').innerHTML = '';
    for (const habbit of habbits) {
        const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
        if (!existed) {
            const element = document.createElement('button');
            element.setAttribute('menu-habbit-id', habbit.id);
            element.classList.add('menu__item');
            element.addEventListener('click', () => rerender(habbit.id));
            element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}">`;
            if (activeHabbit.id === habbit.id) {
                element.classList.add('menu_item_active');
            }
            page.menu.appendChild(element);
            continue;
        }
        if (activeHabbit.id === habbit.id) {
            existed.classList.add('menu_item_active');
        } else {
            existed.classList.remove('menu_item_active');
        }
    }
}

function rerenderHead(activeHabbit) {
    if (!activeHabbit) {
        return;
    }
    page.header.h1.innerText = activeHabbit.name;
    const progress = activeHabbit.days.length / activeHabbit.target > 1
        ? 100
        : activeHabbit.days.length / activeHabbit.target * 100;
    page.header.progressPercent.innerText = progress.toFixed(0) + '%';
    page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function rerenderBody(activeHabbit) {
    if (!activeHabbit) {
        return;
    }
    page.body.innerHTML = '';
    let dayCounter = 1;
    for (const day of activeHabbit.days) {
        const habbitElement = document.createElement('div');
        habbitElement.setAttribute('class', 'habbit');
        habbitElement.innerHTML = `
            <div class="day__container">
                <div class="habbit__day">Day ${dayCounter}</div>
            </div>
            <div class="habbit__comment">${day.comment}</div>
            <button class="habbit__delete" onclick="deleteDays(${dayCounter - 1})">
                <img src="./images/trash.svg" alt="delete this day">
            </button>
        `;
        dayCounter++;
        page.body.appendChild(habbitElement);
    }
    const lastDay = document.createElement('div');
    lastDay.setAttribute('class', 'habbit');
    lastDay.innerHTML = `
        <div class="day__container">
            <div class="habbit__day">Day ${dayCounter}</div>
        </div>
        <form class="habbit__form" onsubmit="addDays(event)">
            <input name="comment" class="input_icon" type="text" placeholder="Comment">
            <img class="input__icon" src="./images/comment.svg" alt="Comment icon">
            <button class="button" type="submit">Ready</button>
        </form>
    `;
    page.body.appendChild(lastDay);
}

function rerender(activeHabbitId) {
    globalActiveHabbitId = activeHabbitId;
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId)
    if (!activeHabbit) {
        return;
    }
    document.location.replace(document.location.pathname + '#' + activeHabbitId);
    rerenderMenu(activeHabbit);
    rerenderHead(activeHabbit);
    rerenderBody(activeHabbit);
}

/* days manipulation */

function addDays(event) {
    const form = event.target;
    event.preventDefault();
    const data = new FormData(form);
    const comment = (data.get('comment'));
    form['comment'].classList.remove('error');
    if (!comment) {
        form['comment'].classList.add('error');
        return; 
    }
    form['comment'].value = '';
    console.log(globalActiveHabbitId);
    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            return {
                ...habbit,
                days: habbit.days.concat([{ comment }])
            }
        }
        return habbit;
    });
    rerender(globalActiveHabbitId); 
    saveData();
}

function deleteDays(dayIndex) {
    habbits = habbits.map(habbit => {
        if (habbit.id === globalActiveHabbitId) {
            const days1 = habbit.days.slice(0, dayIndex);
            const days2 = habbit.days.slice(dayIndex + 1);
            return {
                ...habbit,
                days: days1.concat(days2)
            }
        }
        return habbit;
    });
    rerender(globalActiveHabbitId);
    saveData();
}

/* popup */

function changePopupSatate() {
    if (page.popup.classList.contains('cover_hidden')) {
        page.popup.classList.remove('cover_hidden');
        return;
    }
    page.popup.classList.add('cover_hidden');
}

function setIcon(context, icon) {
    document.querySelector('.popup__form input[name="icon"]').value = icon;
    const iconActive = document.querySelector('.icon.icon-active');
    iconActive.classList.remove('icon-active');
    context.classList.add('icon-active');
}

function addHabbit(event) {
    const form = event.target;
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get('name');
    const target = data.get('target');
    console.log(name, target);
    form['name'].classList.remove('error');
    form['target'].classList.remove('error');
    if (!name) {
        form['name'].classList.add('error');
        return;
    }
    habbits = habbits.concat([{
        id: habbits.length + 1,
        icon: document.querySelector('.icon.icon-active').name,
        name: name,
        target: Number(target),
        days: []
    }]);
    console.log(habbits);
    saveData();
    changePopupSatate();
    rerender(habbits.length);
}

/* init */
(() => {
    if (!localStorage.getItem(HABBIT_KEY)) {
        habbits = [
        {
            id: 1,
            icon: "dashboard",
            name: "Blind typing",
            target: 21,
            days: [
                { comment: "Not easy at all!" },
                { comment: "Today much better, 8 letters)" }
            ]
        },
        {
            id: 2,
            icon: "fingerprint",
            name: "Blockchain basics",
            target: 10,
            days: [{ comment: "Cool!" }]
        }
        ];
        console.log(habbits);
        saveData();
    }
    loadData();
    const hashId = Number(document.location.hash.replace('#', ''));
    const urlHabbit = habbits.find(habbit => habbit.id == hashId)
    if (urlHabbit) rerender(urlHabbit.id);
    else rerender(habbits[0].id);
    
    /*document.querySelectorAll('*').forEach(el => {
    el.style.outline = '1px solid red';
    });*/

})();
