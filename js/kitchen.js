// Данные для секций кухни
const kitchenData = [
  {
    subtitle: "Кухня",
    title: "Основное меню",
    text: "Авторская интерпретация европейской и русской кухни, где классика соседствует с неожиданными сочетаниями вкусов. Команда шеф-повара создаёт блюда на открытой кухне — каждое движение становится частью вашего гастрономического опыта.",
    img: "./img/kitchen1.png"
  },
  {
    subtitle: "Кухня",
    title: "Завтраки",
    text: "Начните день с хрустящих круассанов, пышных сырников или омлета с любимыми добавками. Шведский стол до 10:30 или меню a la carte для индивидуального выбора.",
    img: "./img/kitchen2.png"
  },
  {
    subtitle: "Кухня",
    title: "Бизнес-ланчи",
    text: "Быстро, вкусно, удобно: шведский стол с 12:00 до 15:00 в будние дни. Идеально для деловых встреч в центре Москвы.",
    img: "./img/kitchen3.png"
  },
  {
    subtitle: "Кухня",
    title: "Бар",
    text: "Европейские вина, фирменные коктейли, разнообразные сорта пива. Каждое блюдо найдёт свою идеальную пару.",
    img: "./img/kitchen4.png"
  }
];

// Селектор, куда вставлять секции
const kitchenContainer = document.querySelector(".kitchen-container");

// Функция для создания секции кухни
function createKitchenSection(data) {
  const section = document.createElement("section");
  section.className = "kitchen";

  section.innerHTML = `
    <div class="container">
      <div class="kitchen__inner">
        <div class="kitchen__left">
          <p class="kitchen__subtitle">${data.subtitle}</p>
          <h2 class="kitchen__title">${data.title}</h2>
          <p class="kitchen__discr">${data.text}</p>
        </div>
        <div class="kitchen__right">
          <img src="${data.img}" alt="${data.title}">
        </div>
      </div>
    </div>
  `;

  return section;
}

// Генерация всех секций
kitchenData.forEach(item => {
  const section = createKitchenSection(item);
  kitchenContainer.appendChild(section);
});