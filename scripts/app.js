'use strict';

let habits = [];
let globalActiveHabitId;
const HABIT_KEY = 'HABIT_KEY';

/* page */
const page = {
    menu: document.querySelector('.menu__list'),
    header: {
        h1: document.querySelector('.h1'),
        progressPercent: document.querySelector('.progress__percent'),
        progressCoverBar: document.querySelector('.progress__cover-bar')
    },
    body: document.querySelector('.habits__body'),
    popup: document.querySelector('.cover')
}

/* utils */

function loadData() {
    const habitsString = localStorage.getItem(HABIT_KEY);
    const habitsArray = JSON.parse(habitsString);
    if (Array.isArray(habitsArray)) {
        habits = habitsArray;
    }
}

function saveData() {
    localStorage.setItem(HABIT_KEY, JSON.stringify(habits));
}

/*function formGetData(event) {
    const form = event.target;
    event.preventDefault();
    const data = new FormData(form);
    return data;
}*/

/* render */

function rerenderMenu(activeHabit) {
    if (!activeHabit) {
        return;
    }
    document.querySelector('.menu__list').innerHTML = '';
    for (const habit of habits) {
        const existed = document.querySelector(`[menu-habit-id="${habit.id}"]`);
        if (!existed) {
            const element = document.createElement('button');
            element.setAttribute('menu-habit-id', habit.id);
            element.classList.add('menu__item');
            element.addEventListener('click', () => rerender(habit.id));
            element.innerHTML = `<img src="./images/${habit.icon}.svg" alt="${habit.name}">`;
            if (activeHabit.id === habit.id) {
                element.classList.add('menu_item_active');
            }
            page.menu.appendChild(element);
            continue;
        }
        if (activeHabit.id === habit.id) {
            existed.classList.add('menu_item_active');
        } else {
            existed.classList.remove('menu_item_active');
        }
    }
}

function rerenderHead(activeHabit) {
    if (!activeHabit) {
        return;
    }
    page.header.h1.innerText = activeHabit.name;
    const progress = activeHabit.days.length / activeHabit.target > 1
        ? 100
        : activeHabit.days.length / activeHabit.target * 100;
    page.header.progressPercent.innerText = progress.toFixed(0) + '%';
    page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function rerenderBody(activeHabit) {
    if (!activeHabit) {
        return;
    }
    page.body.innerHTML = '';
    let dayCounter = 1;
    for (const day of activeHabit.days) {
        const habitElement = document.createElement('div');
        habitElement.setAttribute('class', 'habit');
        habitElement.innerHTML = `
            <div class="day__container">
                <div class="habit__day">Day ${dayCounter}</div>
            </div>
            <div class="habit__comment">${day.comment}</div>
            <button class="habit__delete" onclick="deleteDays(${dayCounter - 1})">
                <img src="./images/trash.svg" alt="delete this day">
            </button>
        `;
        dayCounter++;
        page.body.appendChild(habitElement);
    }
    const lastDay = document.createElement('div');
    lastDay.setAttribute('class', 'habit');
    lastDay.innerHTML = `
        <div class="day__container">
            <div class="habit__day">Day ${dayCounter}</div>
        </div>
        <form class="habit__form" onsubmit="addDays(event)">
            <input name="comment" class="input_icon" type="text" placeholder="Comment">
            <img class="input__icon" src="./images/comment.svg" alt="Comment icon">
            <button class="button" type="submit">Ready</button>
        </form>
    `;
    page.body.appendChild(lastDay);
}

function rerender(activeHabitId) {
    globalActiveHabitId = activeHabitId;
    const activeHabit = habits.find(habit => habit.id === activeHabitId)
    if (!activeHabit) {
        return;
    }
    document.location.replace(document.location.pathname + '#' + activeHabitId);
    rerenderMenu(activeHabit);
    rerenderHead(activeHabit);
    rerenderBody(activeHabit);
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
    console.log(globalActiveHabitId);
    habits = habits.map(habit => {
        if (habit.id === globalActiveHabitId) {
            return {
                ...habit,
                days: habit.days.concat([{ comment }])
            }
        }
        return habit;
    });
    rerender(globalActiveHabitId); 
    saveData();
}

function deleteDays(dayIndex) {
    habits = habits.map(habit => {
        if (habit.id === globalActiveHabitId) {
            const days1 = habit.days.slice(0, dayIndex);
            const days2 = habit.days.slice(dayIndex + 1);
            return {
                ...habit,
                days: days1.concat(days2)
            }
        }
        return habit;
    });
    rerender(globalActiveHabitId);
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

function addHabit(event) {
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
    habits = habits.concat([{
        id: habits.length + 1,
        icon: document.querySelector('.icon.icon-active').name,
        name: name,
        target: Number(target),
        days: []
    }]);
    console.log(habits);
    saveData();
    changePopupSatate();
    rerender(habits.length);
}

/* init */
(() => {
    if (!localStorage.getItem(HABIT_KEY)) {
        habits = [
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
        console.log(habits);
        saveData();
    }
    loadData();
    const hashId = Number(document.location.hash.replace('#', ''));
    const urlHabit = habits.find(habit => habit.id == hashId)
    if (urlHabit) rerender(urlHabit.id);
    else rerender(habits[0].id);
    
    /*document.querySelectorAll('*').forEach(el => {
    el.style.outline = '1px solid red';
    });*/

})();
