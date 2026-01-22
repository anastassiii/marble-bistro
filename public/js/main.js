(() => {
  const bookingBtn = document.querySelector('.site-header__booking');
  const bookingModal = document.querySelector('.booking-modal');
  const bookingClose = document.querySelector('.booking-modal__close');
  const bookingForm = document.querySelector('.booking-form');
  const bookingSuccess = document.querySelector('.booking-form__success');
  const body = document.body;

  function closeBookingModal() {
    bookingModal.classList.remove('active');
    body.classList.remove('lock');
    bookingForm.reset();
    bookingSuccess.classList.remove('active');
    bookingForm.querySelectorAll('input').forEach(input => clearError(input));
  }

  if (bookingBtn && bookingModal && bookingClose && bookingForm) {
    bookingBtn.addEventListener('click', () => {
      bookingModal.classList.add('active');
      body.classList.add('lock');
    });

    bookingClose.addEventListener('click', closeBookingModal);
    bookingModal.querySelector('.booking-modal__overlay').addEventListener('click', closeBookingModal);
  }

  // ==============================
  // Flatpickr с блокировкой занятых слотов
  // ==============================
  async function getBookedSlots() {
    const res = await fetch('/booked');
    return res.json();
  }

  if (typeof flatpickr !== 'undefined') {
    (async () => {
      const booked = await getBookedSlots();

      const disabledDates = [...new Set(booked.map(b => b.date))];

      flatpickr("#booking-date", {
        locale: "ru",
        minDate: "today",
        dateFormat: "d.m.Y",
        altInput: true,
        altFormat: "d F Y",
        disable: disabledDates,
        onChange: function(selectedDates, dateStr) {
          const timesForDate = booked.filter(b => b.date === dateStr).map(b => b.time);
          flatpickr("#booking-time", {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true,
            altInput: true,
            altFormat: "H:i",
            disable: timesForDate
          });
        }
      });
    })();
  }

  // ==============================
  // Валидация и отправка формы
  // ==============================
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = bookingForm.name;
      const phone = bookingForm.phone;
      const date = bookingForm.date;
      const time = bookingForm.time;
      const guests = bookingForm.guests;

      let valid = true;

      if (!name.value.trim()) { showError(name, 'Введите имя'); valid = false } else clearError(name);
      if (!isValidPhone(phone.value)) { showError(phone, 'Введите корректный телефон'); valid = false } else clearError(phone);
      if (!isValidDate(date.value)) { showError(date, 'Дата не может быть в прошлом'); valid = false } else clearError(date);
      if (!time.value) { showError(time, 'Выберите время'); valid = false } else clearError(time);
      if (+guests.value < 1) { showError(guests, 'Минимум 1 гость'); valid = false } else clearError(guests);

      if (!valid) return;

      const data = {
        name: name.value.trim(),
        phone: phone.value.trim(),
        date: date.value,
        time: time.value,
        guests: +guests.value
      };

      await submitForm(data);
    });
  }

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
    const [d, m, y] = dateStr.split('.');
    const selected = new Date(`${y}-${m}-${d}`);
    today.setHours(0,0,0,0);
    return selected >= today;
  }

  async function submitForm(data) {
    try {
      bookingBtn.classList.add('loading');

      const response = await fetch('/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if(result.status === 'ok') {
        bookingForm.reset();
        bookingSuccess.classList.add('active');
      } else {
        throw new Error(result.message);
      }

    } catch(err) {
      console.error(err);
      alert('Ошибка отправки. Проверьте консоль');
    } finally {
      bookingBtn.classList.remove('loading');
    }
  }
})();
