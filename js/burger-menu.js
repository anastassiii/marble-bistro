// Находим кнопку меню "гамбургер"
let menu_button = document.querySelector('.nav-toggle');

// Находим сам блок меню
let menu_itself = document.querySelector('.site-nav');

// Находим список пунктов меню
let menu_list = document.querySelector('.site-nav__list');

// Находим body, чтобы управлять блокировкой прокрутки при открытом меню
let body = document.querySelector('body');

// Добавляем обработчик клика на кнопку меню
menu_button.onclick = function() {
  menu_button.classList.toggle('active'); // Меняем состояние кнопки (анимация "X")
  menu_itself.classList.toggle('active'); // Показываем или скрываем меню
  body.classList.toggle('lock');          // Блокируем прокрутку страницы при открытом меню
};

// Добавляем обработчик клика на сам список меню
menu_list.onclick = function() {
  menu_button.classList.toggle('active'); // Закрываем кнопку меню
  menu_itself.classList.toggle('active'); // Скрываем меню
  body.classList.toggle('lock');          // Разблокируем прокрутку страницы
};