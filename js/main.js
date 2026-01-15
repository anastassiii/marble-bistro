// Кнопка открытия формы
const bookingBtn = document.querySelector('.site-header__booking');
const bookingModal = document.querySelector('.booking-modal');
const bookingClose = document.querySelector('.booking-modal__close');
const bookingForm = document.querySelector('.booking-form');
const bookingSuccess = document.querySelector('.booking-form__success');

bookingBtn.addEventListener('click', () => {
  bookingModal.classList.add('active');
  document.body.classList.add('lock');

  // Перезапуск анимации полей
  bookingForm.querySelectorAll('label').forEach(label => {
    label.style.opacity = '0';
    label.style.transform = 'translateY(20px)';
    label.offsetHeight; // триггер перезапуска анимации
    label.style.animationPlayState = 'running';
  });
});

// Инициализация календаря
flatpickr("#booking-date", {
  locale: "ru",
  minDate: "today",
  dateFormat: "d.m.Y",
  altInput: true,
  altFormat: "d F Y",
});

// Инициализация времени
flatpickr("#booking-time", {
  locale: "ru",
  enableTime: true,
  noCalendar: true,
  dateFormat: "H:i",
  time_24hr: true,
  altInput: true,
  altFormat: "H:i",
});

// Закрытие модалки
bookingClose.addEventListener('click', closeBookingModal);
bookingModal.querySelector('.booking-modal__overlay').addEventListener('click', closeBookingModal);

function closeBookingModal() {
  bookingModal.classList.remove('active');
  document.body.classList.remove('lock');
  bookingForm.reset();
  bookingSuccess.classList.remove('active');
}

// Отправка формы
bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  bookingSuccess.classList.add('active');

  setTimeout(() => {
    closeBookingModal();
  }, 2000);
});

const form = document.querySelector('.booking-form');
const successMsg = document.querySelector('.booking-form__success');

function showError(input, message) {
  const error = input.nextElementSibling;
  input.classList.add('error');
  error.textContent = message;
  error.classList.add('active');
}

function clearError(input) {
  const error = input.nextElementSibling;
  input.classList.remove('error');
  error.textContent = '';
  error.classList.remove('active');
}

function isValidPhone(phone) {
  return /^\+7\s?\(?\d{3}\)?\s?\d{3}[- ]?\d{2}[- ]?\d{2}$/.test(phone);
}

function isValidDate(dateStr) {
  const today = new Date();
  const selected = new Date(dateStr.split('.').reverse().join('-'));
  today.setHours(0,0,0,0);
  return selected >= today;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = form.name;
  const phone = form.phone;
  const date = form.date;
  const time = form.time;
  const guests = form.guests;

  let valid = true;

  // Имя
  if (!name.value.trim()) {
    showError(name, 'Введите имя');
    valid = false;
  } else clearError(name);

  // Телефон
  if (!isValidPhone(phone.value)) {
    showError(phone, 'Введите корректный телефон');
    valid = false;
  } else clearError(phone);

  // Дата
  if (!isValidDate(date.value)) {
    showError(date, 'Дата не может быть в прошлом');
    valid = false;
  } else clearError(date);

  // Время
  if (!time.value) {
    showError(time, 'Выберите время');
    valid = false;
  } else clearError(time);

  // Гости
  if (+guests.value < 1) {
    showError(guests, 'Минимум 1 гость');
    valid = false;
  } else clearError(guests);

  if (!valid) return;

  submitForm();
});

function submitForm() {
  const btn = form.querySelector('.booking-form__submit');
  btn.classList.add('loading');

  const data = {
    name: form.name.value,
    phone: form.phone.value,
    date: form.date.value,
    time: form.time.value,
    guests: +form.guests.value
  };

  console.log('FORM DATA:', data);

  setTimeout(() => {
    btn.classList.remove('loading');
    form.reset();
    successMsg.classList.add('active');
  }, 1200);
}

function toISO(date) {
  const [d, m, y] = date.split('.');
  return `${y}-${m}-${d}`;
}

date: toISO(form.date.value) 