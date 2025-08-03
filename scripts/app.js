"use strict";

let habits = [];
let globalActiveHabitId;
const HABIT_KEY = "HABIT_KEY";

/* page */
const page = {
  menu: document.querySelector(".menu__list"),
  header: {
    h1: document.querySelector(".h1"),
    progressPercent: document.querySelector(".progress__percent"),
    progressCoverBar: document.querySelector(".progress__cover-bar"),
  },
  body: document.querySelector(".habits__body"),
  popup: document.querySelector(".cover"),
};

/* utils */
function initCheck() {
  if (!localStorage.getItem(HABIT_KEY)) {
    page.header.h1.innerHTML = "Create your first habbit!";
    document
      .querySelector(".habit__delete")
      .setAttribute("style", "display: none");
    return false;
  }

  return true;
}

function resignId() {
  let id = 1;

  for (const habit of habits) {
    habit.id = id++;
  }
}

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

function getFormData(form, fields) {
  const data = new FormData(form);
  const formInfo = {};

  for (const field of fields) {
    form[field].classList.remove("error");
    const info = data.get(field);

    if (!info) {
      form[field].classList.add("error");
    }

    formInfo[field] = info;
  }

  for (const field of fields) {
    if (!formInfo[field]) {
      return;
    }
  }

  return formInfo;
}

function deleteHabbit() {
  habits.splice(globalActiveHabitId - 1, 1);
  console.log(globalActiveHabitId);

  if (habits.length < 1) {
    console.log(globalActiveHabitId);
    console.log(habits.length);
    localStorage.removeItem(HABIT_KEY);
    initCheck();

    page.body.innerHTML = "";
    page.menu.innerHTML = "";
    page.header.progressCoverBar.setAttribute('style', 'width: 0%');
    page.header.progressPercent.innerHTML = "0%";

    return;
  }

  resignId();

  globalActiveHabitId = 1;
  saveData();
  rerender(globalActiveHabitId);
}

/* render */
function rerenderMenu(activeHabit) {
  document.querySelector(".menu__list").innerHTML = "";

  for (const habit of habits) {
    const element = document.createElement("button");
    element.setAttribute("menu-habit-id", habit.id);
    element.classList.add("menu__item");
    element.addEventListener("click", () => rerender(habit.id));
    element.innerHTML = `<img src="./images/${habit.icon}.svg" alt="${habit.name}">`;

    if (activeHabit.id === habit.id) {
      element.classList.add("menu_item_active");
    }

    page.menu.appendChild(element);
  }
}

function rerenderHead(activeHabit) {
  page.header.h1.innerText = activeHabit.name;
  const progressNum = activeHabit.days.length / activeHabit.target;
  const progress = progressNum > 1 ? 100 : progressNum * 100;
  page.header.progressPercent.innerText = progress.toFixed(0) + "%";
  page.header.progressCoverBar.setAttribute("style", `width: ${progress}%`);
}

function rerenderBody(activeHabit) {
  page.body.innerHTML = "";

  for (const day in activeHabit.days) {
    const habitElement = document.createElement("div");
    habitElement.setAttribute("class", "habit");
    habitElement.innerHTML = `
            <div class="day__container">
                <div class="habit__day">Day ${Number(day) + 1}</div>
            </div>
            <div class="habit__comment">${activeHabit.days[day].comment}</div>
            <button class="habit__delete" onclick="deleteDays(${day})">
                <img src="./images/trash.svg" alt="delete this day">
            </button>
        `;
    page.body.appendChild(habitElement);
  }

  const lastDay = document.createElement("div");
  lastDay.setAttribute("class", "habit");
  lastDay.innerHTML = `
        <div class="day__container">
            <div class="habit__day">Day ${activeHabit.days.length + 1}</div>
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
  const activeHabit = habits.find((habit) => habit.id === activeHabitId);

  if (!activeHabit) {
    return;
  }

  document.location.replace(document.location.pathname + "#" + activeHabitId);
  rerenderMenu(activeHabit);
  rerenderHead(activeHabit);
  rerenderBody(activeHabit);
}

/* days manipulation */
function addDays(event) {
  const form = event.target;
  event.preventDefault();
  const formValues = getFormData(form, ["comment"]);

  if (!formValues) return;

  habits = habits.map((habit) => {
    if (habit.id === globalActiveHabitId) {
      return {
        ...habit,
        days: habit.days.concat([formValues]),
      };
    }
    return habit;
  });

  rerender(globalActiveHabitId);
  saveData();
}

function deleteDays(dayIndex) {
  habits = habits.map((habit) => {
    if (habit.id === globalActiveHabitId) {
      habit.days.splice(dayIndex, 1);
      return {
        ...habit,
      };
    }

    return habit;
  });

  rerender(globalActiveHabitId);
  saveData();
}

/* popup of info page*/
function infoPopupStateChange() {
  if (document.querySelector('.info_wrapper').classList.contains('cover_hidden')) {
    document.querySelector('.info_wrapper').classList.remove('cover_hidden');
    return;
  }

  document.querySelector('.info_wrapper').classList.add('cover_hidden');
}

/* popup of adding habbit*/
function changePopupSatate() {
  if (page.popup.classList.contains("cover_hidden")) {
    page.popup.classList.remove("cover_hidden");
    return;
  }

  page.popup.classList.add("cover_hidden");
  page.popup.querySelector('form input[name="name"]').classList.remove("error");
  page.popup
    .querySelector('form input[name="target"]')
    .classList.remove("error");
  page.popup.querySelector('form input[name="name"]').value = "";
  page.popup.querySelector('form input[name="target"]').value = "";
}

function setIcon(context, icon) {
  document.querySelector('.popup__form input[name="icon"]').value = icon;
  const iconActive = document.querySelector(".icon.icon-active");
  iconActive.classList.remove("icon-active");
  context.classList.add("icon-active");
}

function addHabit(event) {
  const form = event.target;
  event.preventDefault();

  if (habits.length >= 5) {
    changePopupSatate();
    alert("Limit - you have maximum quantity of habits!");
    return;
  }

  const formValues = getFormData(form, ["name", "target"]);

  if (!formValues) return;

  habits = habits.concat([
    {
      id: habits.length + 1,
      icon: document.querySelector(".icon.icon-active").name,
      name: formValues["name"],
      target: Number(formValues["target"]),
      days: [],
    },
  ]);

  document.querySelector(".habit__delete").removeAttribute("style");
  saveData();
  changePopupSatate();
  rerender(habits.length);
}

/* init */
(() => {
  loadData();

  if (!initCheck()) {
    return;
  }

  const hashId = Number(document.location.hash.replace("#", ""));
  const urlHabit = habits.find((habit) => habit.id == hashId);

  if (urlHabit) rerender(urlHabit.id);
  else rerender(habits[0].id);
})();