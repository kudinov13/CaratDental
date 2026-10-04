export interface PriceService {
  name: string
  price: number
  priceLabel?: string
  durationMin: number
}

export interface PriceCategory {
  title: string
  services: PriceService[]
}

export const priceCategories: PriceCategory[] = [
  {
    title:"ОРТОДОНТИЯ",
    services: [
      { name: "Первичная консультация", price: 1200, durationMin: 30 },
      { name: "Повторная консультация", price: 600, durationMin: 30 },
      { name: "КПО - (анализ, слепки, модели)", price: 8100, durationMin: 60 },
      { name: "Фиксация брекет - системы металлические", price: 60000, durationMin: 60 },
      { name: "Фиксация брекет - системы керамические", price: 82800, durationMin: 60 },
      { name: "Фиксация брекет - системы самолигируемые", price: 78200, durationMin: 60 },
      { name: "Фиксация брекет - системы самолигируемые керамические", price: 123000, durationMin: 60 },
      { name: "Активация одна челюсть", price: 4000, durationMin: 60 },
      { name: "Активация две челюсти", price: 8000, durationMin: 60 },
      { name: "Смена дуги на одну челюсть:", price: 3000, durationMin: 60 },
      { name: "Брекет металлический", price: 5000, durationMin: 60 },
      { name: "Брекет керамический", price: 5400, durationMin: 60 },
      { name: "Брекет самолигируемый", price: 5000, durationMin: 60 },
      { name: "Брекет самолигируемый керамический", price: 5400, durationMin: 60 },
      { name: "Межчелюстная тяга", price: 900, durationMin: 60 },
      { name: "Фиксация кнопки", price: 850, durationMin: 60 },
      { name: "Повторная фиксация брекета", price: 2000, durationMin: 60 },
      { name: "Снятие брекет-системы (одна челюсть, ретейнер включен)", price: 17700, durationMin: 60 },
      { name: "Снятие брекет-системы (две челюсти, ретейнер включен)", price: 35400, durationMin: 90 },
      { name: "Установка ретейнера (одна челюсть)", price: 13700, durationMin: 60 },
      { name: "Установка ретейнера (один зуб)", price: 1200, durationMin: 30 },
      { name: "Снятие ретейнера (один зуб)", price: 550, durationMin: 30 },
      { name: "Ретенционная каппа", price: 15000, durationMin: 60 },
      { name: "Сдача ретенционной каппы / съемного аппарата", price: 650, durationMin: 30 },
      { name: "Окклюзионная накладка", price: 2000, durationMin: 60 },
      { name: "Аппарат съемный с расширяющим винтом", price: 37000, durationMin: 60 },
      { name: "Активация пластинки (коррекция)", price: 1500, durationMin: 60 },
      { name: "Починка пластинки", price: 0, priceLabel: "индивидуально", durationMin: 30 },
      { name: "Раскрытие ретенированного зуба", price: 10000, durationMin: 60 },
    ],
  },
  {
    title:"ТЕРАПЕВТИЧЕСКОЕ ЛЕЧЕНИЕ ПОСТОЯННЫХ ЗУБОВ",
    services: [
      { name: "Иной кариес постоянного зуба К028", price: 3000, durationMin: 60 },
      { name: "Поверхностный кариес постоянного зуба К020", price: 5000, durationMin: 60 },
      { name: "Средний кариес постоянного зуба К021", price: 6500, durationMin: 60 },
      { name: "Глубокий кариес постоянного зуба К022", price: 8000, durationMin: 60 },
    ],
  },
  {
    title:"ЭНДОТОНИЧЕСКОЕ ЛЕЧЕНИЕ ПОСТОЯННЫХ ЗУБОВ ПО ДИАГНОЗУ ПУЛЬПИТ",
    services: [
      { name: "Пульпит постоянного зуба 1к.к К040", price: 10000, durationMin: 90 },
      { name: "Пульпит постоянного зуба 2к.к К040", price: 13000, durationMin: 90 },
      { name: "Пульпит постоянного зуба 3к.к К040", price: 15500, durationMin: 90 },
      { name: "Пульпит постоянного зуба 4к.к К040", price: 18000, durationMin: 90 },
    ],
  },
  {
    title:"ЭНДОДОНТИЧЕСКОЕ ЛЕЧЕНИЕ ПОСТОЯННЫХ ЗУБОВ ПО ДИАГНОЗУ ПЕРИОДОНТИТ",
    services: [
      { name: "Периодонтит постоянного зуба 1к.к К045", price: 4000, durationMin: 90 },
      { name: "Периодонтит постоянного зуба 2к.к К045", price: 5000, durationMin: 60 },
      { name: "Периодонтит постоянного зуба 3к.к К045", price: 6000, durationMin: 60 },
      { name: "Периодонтит постоянного зуба 4к.к К045", price: 7000, durationMin: 60 },
      { name: "Периодонтит постоянного зуба 1к.к К045", price: 2700, durationMin: 90 },
      { name: "Периодонтит постоянного зуба 2к.к К045", price: 4000, durationMin: 90 },
      { name: "Периодонтит постоянного зуба 3к.к К045", price: 5000, durationMin: 90 },
      { name: "Периодонтит постоянного зуба 4к.к К045", price: 6600, durationMin: 90 },
      { name: "Периодонтит постоянного зуба 1к.к К045", price: 3100, durationMin: 90 },
      { name: "Периодонтит постоянного зуба 2к.к К045", price: 5000, durationMin: 90 },
      { name: "Периодонтит постоянного зуба 3к.к К045", price: 6800, durationMin: 90 },
      { name: "Периодонтит постоянного зуба 4к.к К045", price: 8600, durationMin: 90 },
      { name: "Периодонтит постоянного зуба 1к.к К045", price: 3000, durationMin: 90 },
    ],
  },
  {
    title:"РЕСТАВРАЦИЯ И ПЛОМБИРОВКА КАНАЛОВ ПО ДИАГНОЗУ ПЕРИОДОНТИТ",
    services: [
      { name: "Реставрация постоянного зуба 1к.к по диагнозу К045", price: 6300, durationMin: 90 },
      { name: "Реставрация постоянного зуба 2к.к по диагнозу К045", price: 8600, durationMin: 90 },
      { name: "Реставрация постоянного зуба 3к.к по диагнозу К045", price: 10900, durationMin: 90 },
      { name: "Реставрация постоянного зуба 4к.к по диагнозу К045", price: 13200, durationMin: 90 },
    ],
  },
  {
    title:"ТЕРАПЕВТИЧЕСКОЕ ЛЕЧЕНИЕ МОЛОЧНЫХ ЗУБОВ",
    services: [
      { name: "Поверхностный кариес молочного зуба К020", price: 4000, durationMin: 60 },
      { name: "Средний кариес молочного зуба К021", price: 5000, durationMin: 60 },
      { name: "Глубокий кариес молочного зуба К022", price: 6000, durationMin: 60 },
    ],
  },
  {
    title:"ЭНДОДОНТИЧЕСКОЕ ЛЕЧЕНИЕ МОЛОЧНЫХ ЗУБОВ ПО ДИАГНОЗУ ПУЛЬПИТ",
    services: [
      { name: "Пульпит молочного зуба К040", price: 10000, durationMin: 90 },
    ],
  },
  {
    title:"ХИРУРГИЧЕСКАЯ ЭКСТРАКЦИЯ ПОСТОЯННЫХ ЗУБОВ",
    services: [
      { name: "Сложное удаление зуба мудрости", price: 15000, durationMin: 40 },
      { name: "Удаление зуба мудрости", price: 10000, durationMin: 40 },
      { name: "Сложное удаление первого/второго моляра", price: 8000, durationMin: 40 },
      { name: "Удаление первого/второго моляра", price: 6000, durationMin: 40 },
      { name: "Сложное удаление резцов, клыков, первого/второго примоляра", price: 6000, durationMin: 40 },
      { name: "Удаление резцов, клыков, первого/второго примоляра", price: 6000, durationMin: 40 },
      { name: "Удаление подвижного зуба", price: 4000, durationMin: 40 },
      { name: "Лечение перикоронтита", price: 3500, durationMin: 60 },
      { name: "Коагуляция десны", price: 3500, durationMin: 60 },
      { name: "Вскрытие подслизистого/поднадкостничного очага воспаления", price: 3000, durationMin: 60 },
      { name: "Вскрытие и дренирование одонтогенного абсцесса", price: 3000, durationMin: 60 },
      { name: "Отсроченный кюретаж лунки ранее удаленного зуба", price: 3500, durationMin: 60 },
    ],
  },
  {
    title:"ХИРУРГИЧЕСКАЯ ЭКСТРАКЦИЯ МОЛОЧНЫХ ЗУБОВ",
    services: [
      { name: "Удаление молочного зуба", price: 4000, durationMin: 40 },
      { name: "Удаление подвижного молочного зуба с анестезией", price: 3000, durationMin: 40 },
      { name: "Удаление подвижного молочного зуба без анестезии", price: 2500, durationMin: 40 },
    ],
  },
  {
    title:"ПРОФЕССИОНАЛЬНАЯ ГИГИЕНА ПОЛОСТИ РТА ПОСТОЯННЫХ ЗУБОВ",
    services: [
      { name: "Комплексная гигиена Зубов с эффектом отбеливания", price: 5000, durationMin: 60 },
      { name: "Комплексная гигиена Зубов с брекет системой", price: 5000, durationMin: 60 },
      { name: "Комплексная гигиена Зубов с частичной адентией 1/2", price: 4000, durationMin: 60 },
      { name: "Экспресс гигиена с эффектом отбеливания всей полости рта", price: 4000, durationMin: 60 },
      { name: "Экспресс гигиена с эффектом отбеливания с частичной адентией зубного ряда 1/2", price: 3000, durationMin: 60 },
      { name: "Экспресс гигиена твердого минерализированного зубного налета с частичной адентией 1/2", price: 3000, durationMin: 60 },
      { name: "Экспресс гигиена с эффектом отбеливания одного зуба", price: 1000, durationMin: 60 },
      { name: "Экспресс гигиена твердого минерализированного зубного налета одного зуба", price: 1000, durationMin: 60 },
    ],
  },
  {
    title:"ПРОФЕССИОНАЛЬНАЯ ГИГИЕНА ПОЛОСТИ РТА МОЛОЧНЫХ ЗУБОВ / СМЕШАННОГО ЗУБНОГО РЯДА",
    services: [
      { name: "Комплексная гигиена молочных Зубов", price: 3000, durationMin: 60 },
      { name: "Экспресс гигиена молочных Зубов с налетом Пристли", price: 2000, durationMin: 60 },
      { name: "Комплексная гигиена смешенного зубного ряда", price: 3000, durationMin: 60 },
      { name: "Экспресс гигиена смешенного зубного ряда с налетом Пристли", price: 2500, durationMin: 60 },
      { name: "Комплексная гигиена Зубов с брекет системой со смешанным зубным рядом", price: 3000, durationMin: 60 },
    ],
  },
  {
    title:"ИМПЛАНТАЦИЯ",
    services: [
      { name: "Имплант (имплант + формирователь)", price: 45000, durationMin: 90 },
      { name: "Костная пластика (1 г кости + 1 г кости)", price: 50000, durationMin: 120 },
      { name: "Пин", price: 5000, durationMin: 30 },
      { name: "Несъемный протез на имплантатах (Candulor)", price: 90000, durationMin: 120 },
      { name: "Несъемный протез на имплантатах с металлокерамикой", price: 280000, durationMin: 120 },
      { name: "Несъемный протез на имплантатах с диоксидом циркония", price: 390000, durationMin: 120 },
      { name: "Операция синус-лифтинг", price: 80000, durationMin: 120 },
      { name: "+1 г костной ткани", price: 10000, durationMin: 30 },
      { name: "All-on-4", price: 290000, durationMin: 180 },
      { name: "All-on-6", price: 390000, durationMin: 180 },
      { name: "All-on-8", price: 490000, durationMin: 180 },
      { name: "Металлокерамическая коронка на имплантате", price: 43000, durationMin: 60 },
      { name: "Диоксид циркониевая коронка на имплантате", price: 45000, durationMin: 60 },
      { name: "Временная коронка на имплантате", price: 10000, durationMin: 60 },
    ],
  },
  {
    title:"ОРТОПЕДИЯ",
    services: [
      { name: "Съемный протез-бабочка", price: 17000, durationMin: 60 },
      { name: "+1 зуб на протез", price: 1000, durationMin: 30 },
      { name: "Съемный протез на одну челюсть", price: 25000, durationMin: 60 },
      { name: "Бюгельный протез на одну челюсть", price: 50000, durationMin: 60 },
      { name: "Металлокерамическая коронка", price: 25000, durationMin: 60 },
      { name: "Диоксид циркониевая коронка", price: 30000, durationMin: 60 },
      { name: "Временная коронка", price: 5000, durationMin: 60 },
    ],
  },
]