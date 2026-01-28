(() => {
  const bookingBtn = document.querySelector('.site-header__booking');
  const bookingModal = document.querySelector('.booking-modal');
  const bookingClose = document.querySelector('.booking-modal__close');
  const bookingForm = document.querySelector('.booking-form');
  const bookingSuccess = document.querySelector('.booking-form__success');
  const body = document.body;

  // === Модальное окно ===
  function closeBookingModal() {
    bookingModal.classList.remove('active');
    body.classList.remove('lock');
    bookingForm.reset();
    bookingSuccess.classList.remove('active');
    bookingForm.querySelectorAll('input').forEach(clearError);
  }

  if (bookingBtn && bookingModal && bookingClose && bookingForm) {
    bookingBtn.addEventListener('click', () => {
      bookingModal.classList.add('active');
      body.classList.add('lock');
    });

    bookingClose.addEventListener('click', closeBookingModal);
    bookingModal.querySelector('.booking-modal__overlay').addEventListener('click', closeBookingModal);
  }

  // === Получаем занятые слоты с сервера ===
  async function getBookedSlots() {
    try {
      const res = await fetch('/booking/booked');
      return res.ok ? await res.json() : [];
    } catch (err) {
      console.error('Ошибка получения занятых слотов:', err);
      return [];
    }
  }

  // === Flatpickr ===
  if (typeof flatpickr !== 'undefined') {
    (async () => {
      const booked = await getBookedSlots();

      // Преобразуем даты из формата YYYY-MM-DD в ISO для сравнения
      const disabledDates = booked.map(b => b.date);

      flatpickr("#date", {
        locale: "ru",
        minDate: "today",
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr) {
          const timesForDate = booked
            .filter(b => b.date === dateStr)
            .map(b => b.time);

          flatpickr("#time", {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true,
            disable: timesForDate
          });
        }
      });

      flatpickr("#time", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true
      });
    })();
  }

  // === Валидация и отправка формы ===
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
      if (!date.value) { showError(date, 'Выберите дату'); valid = false } else clearError(date);
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
    if(error){
      error.textContent = message;
      error.classList.add('active');
    }
  }

  function clearError(input) {
    const error = input.nextElementSibling;
    input.classList.remove('error');
    if(error){
      error.textContent = '';
      error.classList.remove('active');
    }
  }

  function isValidPhone(phone) {
    return phone.trim().length >= 10; // можно сделать более строгий regex при желании
  }

  async function submitForm(data) {
    try {
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      submitBtn.classList.add('loading');

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
        throw new Error(result.message || 'Ошибка сервера');
      }

    } catch(err) {
      console.error(err);
      alert('Ошибка отправки. Проверьте консоль');
    } finally {
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      submitBtn.classList.remove('loading');
    }
  }
})();
