'use strict';
/* =========================================================
   Happ VPN — вся логика лендинга (vanilla JS, без зависимостей)
   Данные вынесены в начало файла — правка контента не требует
   чтения логики ниже.
   ========================================================= */

/* ---- Партнёрская ссылка — единственная точка выхода на оффер.
   Меняется здесь и больше нигде. ---- */
const PARTNER_URL = 'https://tuvp1.ru/5Sg5nF?sub1=happ-pc';

/* Добавлять ли метку блока в параметр sub2.
   Если партнёрская сеть режет лишний параметр — поставить false. */
const USE_SUB2 = true;

/* Идентификатор счётчика Яндекс.Метрики. Пока null — цели не отправляются.
   Вставить номер счётчика и раскомментировать сам счётчик в <head>. */
const METRIKA_ID = null;

/* ---- Цены. Полная стоимость периода в рублях. Ключ — число месяцев. ---- */
const PRICING = {
  1:  { total: 149,  label: '1 месяц',    days: 30  },
  3:  { total: 399,  label: '3 месяца',   days: 90  },
  6:  { total: 699,  label: '6 месяцев',  days: 180 },
  12: { total: 1190, label: '12 месяцев', days: 365 }
};
const DEVICES_INCLUDED = 10;  // столько устройств входит без доплаты
const EXTRA_DEVICE_FEE = 0;   // ₽/мес за каждое сверх; 0 — безлимит по устройствам
const TRIAL_LABEL = '3 дня';  // срок пробного (используется в тексте кнопок)

/* ---- Серверы (статичные данные, обновляются руками). load — нагрузка в %. ---- */
const SERVERS = [
  { code: 'NL', country: 'Нидерланды', city: 'Амстердам',    ping: 34,  load: 12, region: 'Европа' },
  { code: 'DE', country: 'Германия',   city: 'Франкфурт',    ping: 41,  load: 28, region: 'Европа' },
  { code: 'PL', country: 'Польша',     city: 'Варшава',      ping: 46,  load: 20, region: 'Европа' },
  { code: 'FR', country: 'Франция',    city: 'Париж',        ping: 49,  load: 35, region: 'Европа' },
  { code: 'SE', country: 'Швеция',     city: 'Стокгольм',    ping: 52,  load: 18, region: 'Европа' },
  { code: 'GB', country: 'Британия',   city: 'Лондон',       ping: 55,  load: 30, region: 'Европа' },
  { code: 'IT', country: 'Италия',     city: 'Милан',        ping: 57,  load: 27, region: 'Европа' },
  { code: 'FI', country: 'Финляндия',  city: 'Хельсинки',    ping: 58,  load: 22, region: 'Европа' },
  { code: 'ES', country: 'Испания',    city: 'Мадрид',       ping: 61,  load: 24, region: 'Европа' },
  { code: 'TR', country: 'Турция',     city: 'Стамбул',      ping: 72,  load: 40, region: 'Азия'    },
  { code: 'AE', country: 'ОАЭ',        city: 'Дубай',        ping: 95,  load: 33, region: 'Азия'    },
  { code: 'US', country: 'США',        city: 'Нью-Йорк',     ping: 118, load: 45, region: 'Америка' },
  { code: 'SG', country: 'Сингапур',   city: 'Сингапур',     ping: 135, load: 25, region: 'Азия'    },
  { code: 'HK', country: 'Гонконг',    city: 'Гонконг',      ping: 140, load: 28, region: 'Азия'    },
  { code: 'JP', country: 'Япония',     city: 'Токио',        ping: 145, load: 20, region: 'Азия'    },
  { code: 'US', country: 'США',        city: 'Лос-Анджелес', ping: 155, load: 30, region: 'Америка' }
];

/* ---- Тексты для конфигуратора ---- */
const INSTALL = {
  windows: 'Запустите скачанный установщик <code>.exe</code> и пройдите обычную установку. Если появится окно SmartScreen — «Подробнее» → «Выполнить в любом случае».',
  macos:   'Откройте <code>.dmg</code> и перетащите Happ в «Программы». macOS может запросить подтверждение запуска приложения от неизвестного разработчика — разрешите его в «Системных настройках» → «Конфиденциальность и безопасность».',
  linux:   'Установите пакет <code>.deb</code> / <code>.rpm</code> или сделайте <code>AppImage</code> исполняемым и запустите.',
  android: 'Установите «Happ - Proxy Utility» из Google Play или RuStore. Если магазины недоступны — поставьте <code>.apk</code> напрямую.',
  iphone:  'Установите «Happ - Proxy Utility» из App Store.'
};
const ADDKEY = {
  subscription: 'Скопируйте ключ — длинную ссылку-подписку, которая пришла после оформления. В Happ нажмите <code>+</code> → «Добавить из буфера обмена». Клиент сам увидит скопированную ссылку.',
  qr:           'Откройте страницу с ключом, где показан QR-код. В Happ нажмите <code>+</code> → «Сканировать QR-код» и наведите камеру на экран.',
  file:         'Сохраните присланный файл конфигурации. В Happ нажмите <code>+</code> → «Импорт из файла» и выберите его.'
};
const CONNECT = {
  windows: 'Переведите главный переключатель в положение «Подключено».',
  macos:   'Переведите главный переключатель в положение «Подключено».',
  linux:   'Переведите главный переключатель в положение «Подключено».',
  android: 'Нажмите «Подключиться». Android попросит разрешение на создание VPN-соединения — подтвердите, это стандартное системное окно.',
  iphone:  'Разрешите добавление конфигурации VPN — iOS покажет системный запрос, затем включите переключатель.'
};

/* =========================================================
   Утилита: отправка цели в Метрику (безопасно, если счётчика нет)
   ========================================================= */
function trackGoal(name) {
  if (!name) return;
  if (METRIKA_ID && typeof window.ym === 'function') {
    window.ym(METRIKA_ID, 'reachGoal', name);
  }
}

/* =========================================================
   Партнёрские ссылки: подставляем href из одной константы.
   href в HTML — запасной вариант на случай, если JS не отработал.
   ========================================================= */
function applyPartnerLinks(scope) {
  // Все партнёрские ссылки в scope получают href из одной константы + метку sub2
  scope.querySelectorAll('[data-partner]').forEach(function (el) {
    var label = el.getAttribute('data-partner');
    var url = PARTNER_URL;
    if (USE_SUB2 && label) {
      url += (url.indexOf('?') > -1 ? '&' : '?') + 'sub2=' + encodeURIComponent(label);
    }
    el.setAttribute('href', url);
  });
  // Цели Метрики на клик по любой размеченной ссылке
  scope.querySelectorAll('[data-goal]').forEach(function (el) {
    if (el.dataset.goalBound) return;      // не навешиваем повторно
    el.dataset.goalBound = '1';
    el.addEventListener('click', function () { trackGoal(el.getAttribute('data-goal')); });
  });
}
function initPartnerLinks() { applyPartnerLinks(document); }

/* =========================================================
   Hero: определяем ОС и меняем подпись главной кнопки
   ========================================================= */
function initHeroDownload() {
  var btn = document.getElementById('hero-download');
  if (!btn) return;
  var label = document.getElementById('hero-download-label');
  var sub = document.getElementById('hero-download-sub');
  var ua = navigator.userAgent || '';
  var os = 'windows';

  if (/Android/i.test(ua)) os = 'android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iphone';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macos';
  else if (/Linux/i.test(ua)) os = 'linux';

  var map = {
    windows: { t: 'Скачать для Windows', s: '.exe · x64 и ARM64 · 38 МБ',        g: 'click_download_win' },
    macos:   { t: 'Скачать для macOS',   s: '.dmg · Intel и Apple Silicon',      g: 'click_download_other' },
    linux:   { t: 'Скачать для Linux',   s: '.deb · .rpm · AppImage',            g: 'click_download_other' },
    android: { t: 'Скачать для Android', s: '.apk · Google Play · RuStore',      g: 'click_download_other' },
    iphone:  { t: 'Скачать для iPhone',  s: 'App Store · Happ - Proxy Utility',  g: 'click_download_other' }
  };
  var m = map[os];
  if (label) label.textContent = m.t;
  if (sub) sub.textContent = m.s;
  btn.setAttribute('data-goal', m.g);
  // href остаётся партнёрским (задан через data-partner в initPartnerLinks)
}

/* =========================================================
   05 · Конфигуратор подключения
   ========================================================= */
function initConfigurator() {
  var root = document.getElementById('configurator');
  if (!root) return;

  var state = { device: null, variant: null, method: null };
  var history = [];               // стек посещённых шагов
  var current = 'device';
  var finished = false;           // чтобы цель config_finished ушла один раз

  var segs = root.querySelectorAll('.config__seg');
  var steps = root.querySelectorAll('.config__step');
  var q2 = document.getElementById('config-q2');
  var variantsBox = document.getElementById('config-variants');
  var resultBox = document.getElementById('config-result');
  var nextBtn = document.getElementById('config-next');
  var backBtn = document.getElementById('config-back');
  var resetBtn = document.getElementById('config-reset');

  // Показ конкретного шага
  function show(name) {
    current = name;
    steps.forEach(function (s) { s.classList.toggle('is-active', s.getAttribute('data-step') === mapStep(name)); });
    // Прогресс
    var idx = { device: 1, variant: 2, method: 3, result: 3 }[name];
    segs.forEach(function (s, i) { s.classList.toggle('is-active', i < idx); });
    // Кнопки
    backBtn.hidden = history.length === 0;
    resetBtn.hidden = name !== 'result';
    nextBtn.hidden = name === 'result';
    updateNext();
  }
  function mapStep(name) { return name === 'device' ? '1' : name === 'variant' ? '2' : name === 'method' ? '3' : 'result'; }

  // Готов ли текущий шаг к переходу
  function updateNext() {
    var ok = false;
    if (current === 'device') ok = !!state.device;
    else if (current === 'variant') ok = !!state.variant;
    else if (current === 'method') ok = !!state.method;
    nextBtn.disabled = !ok;
  }

  // Выбор плитки внутри группы
  function bindTiles(container, key) {
    container.querySelectorAll('[data-' + key + ']').forEach(function (tile) {
      tile.addEventListener('click', function () {
        container.querySelectorAll('.tile').forEach(function (t) { t.setAttribute('aria-checked', 'false'); });
        tile.setAttribute('aria-checked', 'true');
        state[key] = tile.getAttribute('data-' + key);
        if (key === 'device') { state.variant = null; state.method = null; }
        updateNext();
      });
    });
  }

  // Клавиатура: стрелки между плитками
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var tiles = Array.prototype.slice.call(root.querySelector('.config__step.is-active').querySelectorAll('.tile'));
    var i = tiles.indexOf(document.activeElement);
    if (i === -1) return;
    e.preventDefault();
    var n = e.key === 'ArrowRight' ? (i + 1) % tiles.length : (i - 1 + tiles.length) % tiles.length;
    tiles[n].focus();
  });

  // Наполнение шага 2 в зависимости от устройства
  function buildVariants() {
    var opts, q;
    if (state.device === 'windows') {
      q = 'Какая у вас версия Windows?';
      opts = [{ v: 'win10', t: 'Windows 10 / 11' }, { v: 'win7', t: 'Windows 7 или 8' }];
    } else { // tv
      q = 'Какой у вас телевизор?';
      opts = [{ v: 'androidtv', t: 'Android TV' }, { v: 'appletv', t: 'Apple TV' }, { v: 'other', t: 'Другой (Samsung, LG)' }];
    }
    q2.textContent = q;
    variantsBox.innerHTML = opts.map(function (o) {
      return '<button class="tile" role="radio" aria-checked="false" data-variant="' + o.v + '">' + o.t + '</button>';
    }).join('');
    bindTiles(variantsBox, 'variant');
  }

  // Логика «Далее»
  nextBtn.addEventListener('click', function () {
    if (current === 'device') {
      history.push('device');
      if (state.device === 'windows' || state.device === 'tv') { buildVariants(); show('variant'); }
      else { show('method'); }
    } else if (current === 'variant') {
      history.push('variant');
      if (state.device === 'windows' && state.variant === 'win7') { renderResult(); show('result'); }
      else if (state.device === 'tv' && state.variant === 'other') { renderResult(); show('result'); }
      else {
        // на ТВ по умолчанию подсвечиваем QR
        if (state.device === 'tv' && !state.method) selectMethod('qr');
        show('method');
      }
    } else if (current === 'method') {
      history.push('method');
      renderResult(); show('result');
    }
  });

  backBtn.addEventListener('click', function () {
    var prev = history.pop();
    show(prev || 'device');
  });

  resetBtn.addEventListener('click', function () {
    state.device = null; state.variant = null; state.method = null;
    history = []; finished = false;
    root.querySelectorAll('.tile').forEach(function (t) { t.setAttribute('aria-checked', 'false'); });
    show('device');
  });

  // Программный выбор способа (для ТВ по умолчанию)
  function selectMethod(m) {
    state.method = m;
    var box = root.querySelector('[data-step="3"] .tiles');
    box.querySelectorAll('.tile').forEach(function (t) {
      t.setAttribute('aria-checked', t.getAttribute('data-method') === m ? 'true' : 'false');
    });
  }

  // Сборка обычной инструкции
  function buildSteps() {
    var s = [];
    s.push(INSTALL[state.device]);
    if (['windows', 'macos', 'linux'].indexOf(state.device) > -1) {
      s.push('Запустите Happ. При первом старте система спросит разрешение на сетевой доступ — разрешите, без него клиент не заработает.');
    }
    s.push(ADDKEY[state.method]);
    s.push('В списке появятся серверы. Нажмите на любой — рядом покажется пинг в мс. Выберите ближайший.');
    s.push(CONNECT[state.device]);
    return s;
  }

  var STATUS_HTML =
    '<div class="statusbar mono"><span class="statusbar__dot"></span>' +
    '<span>Подключено</span><span class="statusbar__sep">·</span>' +
    '<span>nl-01.amsterdam</span><span class="statusbar__sep">·</span>' +
    '<span>34 ms</span><span class="statusbar__sep">·</span>' +
    '<span>VLESS / Reality</span></div>' +
    '<p class="config__success-cap">Вот так выглядит успех</p>';

  function ctaHtml(showDownload) {
    // Обе кнопки ведут на партнёрскую ссылку (href проставит applyPartnerLinks)
    var dl = showDownload
      ? '<a class="btn btn--ghost" data-partner="config-download" href="' + PARTNER_URL + '" target="_blank" rel="noopener nofollow sponsored" data-goal="click_download_other">Скачать клиент</a>'
      : '';
    var key = '<a class="btn btn--accent" data-partner="config" href="' + PARTNER_URL + '" target="_blank" rel="noopener nofollow sponsored" data-goal="click_buy_key">Получить ключ</a>';
    return '<div class="config__result-cta">' + dl + key + '</div>';
  }

  function renderResult() {
    var html = '';

    // Windows 7 — особый экран
    if (state.device === 'windows' && state.variant === 'win7') {
      html =
        '<div class="config__warn"><h3>На Windows 7 десктопный Happ не запустится</h3>' +
        '<p>Настольные сборки собраны на Qt 6 — он не работает на устаревших системах. Файл скачается, но программа не стартует. ' +
        '<a class="link" href="#win7">Подробный разбор и что делать →</a></p>' +
        '<p>Хорошая новость: тот же ключ работает на телефоне, планшете и ТВ-приставке — там подключитесь без проблем.</p></div>' +
        ctaHtml(false);
    }
    // Samsung / LG — клиента нет
    else if (state.device === 'tv' && state.variant === 'other') {
      html =
        '<div class="config__warn"><h3>Под Tizen и webOS клиента Happ нет</h3>' +
        '<p>Эти системы закрыты для сторонних VPN-приложений. Два рабочих варианта:</p>' +
        '<ol><li>ТВ-приставка на Android TV — Happ ставится на приставку, телевизор работает как монитор.</li>' +
        '<li>Настройка на роутере — сложнее, но покрывает сразу все устройства в доме. Нужен роутер с поддержкой сторонних прошивок.</li></ol></div>' +
        ctaHtml(false);
    }
    // Apple TV
    else if (state.device === 'tv' && state.variant === 'appletv') {
      var appletv = [
        'Установите Happ из App Store прямо на Apple TV.',
        'При добавлении конфигурации tvOS покажет код — введите его на странице с ключом или отсканируйте QR с экрана телевизора телефоном.',
        'Подтвердите создание VPN-профиля в настройках Apple TV.',
        'Выберите сервер и подключитесь.'
      ];
      html = '<ol>' + appletv.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol>' + STATUS_HTML + ctaHtml(true);
    }
    // Android TV
    else if (state.device === 'tv' && state.variant === 'androidtv') {
      var atv = [
        'Установите Happ на телевизор: через Google Play на самом ТВ либо загрузите <code>.apk</code> на флешку и поставьте через файловый менеджер.',
        'Откройте Happ на телевизоре и перейдите к добавлению конфигурации.',
        'Удобнее всего показать QR-код с ключом камере телевизора. Если камеры нет — используйте «Ввести ссылку вручную» и наберите короткий код доступа с пульта.',
        'Выберите сервер и подключитесь.'
      ];
      html = '<ol>' + atv.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol>' + STATUS_HTML + ctaHtml(true);
    }
    // Обычный путь
    else {
      var steps2 = buildSteps();
      html = '<ol>' + steps2.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol>' + STATUS_HTML + ctaHtml(true);
    }

    resultBox.innerHTML = html;
    // проставить партнёрский href и цели только у новых кнопок результата
    applyPartnerLinks(resultBox);

    if (!finished) { finished = true; trackGoal('config_finished'); }
  }

  // Первичная привязка плиток шага 1 и 3
  bindTiles(root.querySelector('[data-step="1"] .tiles'), 'device');
  bindTiles(root.querySelector('[data-step="3"] .tiles'), 'method');
  show('device');
}

/* =========================================================
   07 · Калькулятор ключа
   ========================================================= */
function initCalculator() {
  var root = document.getElementById('calc');
  if (!root) return;

  var termBox = document.getElementById('calc-terms');
  var slider = document.getElementById('calc-devices');
  var devVal = document.getElementById('calc-devval');
  var devHint = document.getElementById('calc-devhint');
  var tvCheck = document.getElementById('calc-tv');
  var elPerMonth = document.getElementById('calc-permonth');
  var elTotal = document.getElementById('calc-total');
  var elSave = document.getElementById('calc-save');
  var elPerDay = document.getElementById('calc-perday');
  var elTvHint = document.getElementById('calc-tvhint');
  var elCta = document.getElementById('calc-cta');

  var term = 1;
  var used = false;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Бейджи скидок на кнопках срока
  var base = PRICING[1].total;
  document.querySelectorAll('[data-badge]').forEach(function (b) {
    var t = parseInt(b.getAttribute('data-badge'), 10);
    var disc = Math.round((1 - (PRICING[t].total / t) / base) * 100);
    if (disc > 0) b.textContent = '−' + disc + '%';
  });

  function plural(n) {
    var a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return 'устройство';
    if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return 'устройства';
    return 'устройств';
  }

  function flash(el) {
    if (reduce) return;
    el.style.opacity = '0.4';
    requestAnimationFrame(function () { el.style.opacity = '1'; });
  }

  function markUsed() { if (!used) { used = true; trackGoal('calc_used'); } }

  function render() {
    var devices = parseInt(slider.value, 10);
    var p = PRICING[term];
    var monthlyExtra = Math.max(0, devices - DEVICES_INCLUDED) * EXTRA_DEVICE_FEE;
    var perMonth = Math.round(p.total / term + monthlyExtra);
    var grandTotal = Math.round((p.total / term + monthlyExtra) * term);

    devVal.textContent = devices;
    // Подпись под ползунком
    if (EXTRA_DEVICE_FEE === 0) {
      devHint.textContent = devices + ' ' + plural(devices) + ' — входит в любой тариф, доплачивать не нужно';
    } else {
      devHint.textContent = devices + ' ' + plural(devices) + ': сверх ' + DEVICES_INCLUDED + ' — по ' + EXTRA_DEVICE_FEE + ' ₽/мес';
    }

    elPerMonth.textContent = perMonth; flash(elPerMonth);
    elTotal.textContent = 'Списывается разом: ' + grandTotal + ' ₽ за ' + p.label;

    // Экономия против помесячной оплаты (только для срока > 1)
    var save = base * term - p.total;
    if (term > 1 && save > 0) {
      elSave.hidden = false;
      elSave.textContent = 'Экономия против помесячной оплаты — ' + save + ' ₽';
    } else { elSave.hidden = true; }

    var perDay = Math.round(grandTotal / p.days);
    elPerDay.textContent = 'Это примерно ' + perDay + ' ₽ в день — дешевле подписки на музыку';

    elTvHint.hidden = !tvCheck.checked;

    elCta.textContent = 'Оформить ключ на ' + p.label;
  }

  // Переключатель срока
  termBox.querySelectorAll('.seg').forEach(function (seg) {
    seg.addEventListener('click', function () {
      termBox.querySelectorAll('.seg').forEach(function (s) { s.setAttribute('aria-pressed', 'false'); });
      seg.setAttribute('aria-pressed', 'true');
      term = parseInt(seg.getAttribute('data-term'), 10);
      markUsed(); render();
    });
  });
  slider.addEventListener('input', function () { markUsed(); render(); });
  tvCheck.addEventListener('change', function () { markUsed(); render(); });

  render();
}

/* =========================================================
   09 · Сравнение клиентов
   ========================================================= */
function initCompare() {
  var table = document.getElementById('compare-table');
  if (!table) return;
  var modes = document.getElementById('compare-modes');
  var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr'));
  var activeCol = null;

  // Какие строки одинаковы у всех клиентов (для режима «Только отличия»)
  function isSame(row) {
    var cells = row.querySelectorAll('td[data-col]');
    var first = cells[0].textContent.trim();
    for (var i = 1; i < cells.length; i++) {
      if (cells[i].textContent.trim() !== first) return false;
    }
    return true;
  }

  function applyMode(mode) {
    rows.forEach(function (row) {
      var visible = true;
      if (mode === 'diff') visible = !isSame(row);
      else if (mode === 'pc') visible = row.getAttribute('data-pc') === '1';
      row.hidden = !visible;
    });
  }

  modes.querySelectorAll('.seg').forEach(function (seg) {
    seg.addEventListener('click', function () {
      modes.querySelectorAll('.seg').forEach(function (s) { s.setAttribute('aria-pressed', 'false'); });
      seg.setAttribute('aria-pressed', 'true');
      applyMode(seg.getAttribute('data-mode'));
    });
  });

  // Подсветка колонки по клику на клиента
  function highlight(col) {
    activeCol = (activeCol === col) ? null : col;
    table.querySelectorAll('[data-col]').forEach(function (cell) {
      var c = cell.getAttribute('data-col');
      cell.classList.remove('col-hl', 'col-dim');
      if (activeCol === null) return;
      cell.classList.add(c === activeCol ? 'col-hl' : 'col-dim');
    });
  }
  table.querySelectorAll('.ctable__toggle').forEach(function (btn) {
    btn.addEventListener('click', function () { highlight(btn.parentNode.getAttribute('data-col')); });
  });

  applyMode('all');
}

/* =========================================================
   10 · Серверы
   ========================================================= */
function initServers() {
  var body = document.getElementById('servers-body');
  if (!body) return;
  var search = document.getElementById('servers-search');
  var regionsBox = document.getElementById('servers-regions');
  var sortBtn = document.getElementById('servers-sort');

  var region = 'all';
  var query = '';
  var sortDir = 0; // 0 — как есть, 1 — по возрастанию, -1 — по убыванию

  function render() {
    var list = SERVERS.filter(function (s) {
      var okRegion = region === 'all' || s.region === region;
      var q = query.toLowerCase();
      var okQuery = !q || s.country.toLowerCase().indexOf(q) > -1 || s.city.toLowerCase().indexOf(q) > -1;
      return okRegion && okQuery;
    });
    if (sortDir !== 0) list = list.slice().sort(function (a, b) { return (a.ping - b.ping) * sortDir; });

    body.innerHTML = list.map(function (s) {
      var hi = s.load >= 65 ? ' load__bar--hi' : '';
      return '<tr>' +
        '<td class="mono">' + s.code + '</td>' +
        '<td>' + s.country + '</td>' +
        '<td>' + s.city + '</td>' +
        '<td class="mono">' + s.ping + ' ms</td>' +
        '<td><span class="load"><span class="load__bar' + hi + '" style="width:' + s.load + '%"></span></span></td>' +
        '</tr>';
    }).join('');

    if (!list.length) {
      body.innerHTML = '<tr><td colspan="5" class="muted">Ничего не найдено — попробуйте другой запрос.</td></tr>';
    }
  }

  search.addEventListener('input', function () { query = search.value.trim(); render(); });
  regionsBox.querySelectorAll('.seg').forEach(function (seg) {
    seg.addEventListener('click', function () {
      regionsBox.querySelectorAll('.seg').forEach(function (s) { s.setAttribute('aria-pressed', 'false'); });
      seg.setAttribute('aria-pressed', 'true');
      region = seg.getAttribute('data-region');
      render();
    });
  });
  sortBtn.addEventListener('click', function () {
    sortDir = sortDir === 1 ? -1 : 1;
    sortBtn.textContent = 'Пинг ' + (sortDir === 1 ? '↑' : '↓');
    render();
  });

  render();
}

/* =========================================================
   11 · Копирование команды WinGet
   ========================================================= */
function initCopy() {
  var btn = document.getElementById('winget-copy');
  var pre = document.getElementById('winget-cmd');
  if (!btn || !pre) return;
  btn.addEventListener('click', function () {
    var text = pre.textContent.trim();
    var done = function () { btn.textContent = 'Скопировано'; setTimeout(function () { btn.textContent = 'Скопировать'; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {});
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
  });
}

/* =========================================================
   Появление секций при скролле + цель scroll_75
   ========================================================= */
function initReveal() {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sections = document.querySelectorAll('.section');
  if (!reduce && 'IntersectionObserver' in window) {
    sections.forEach(function (s) { s.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    sections.forEach(function (s) { io.observe(s); });
  }

  // Цель scroll_75 — один раз
  var fired = false;
  window.addEventListener('scroll', function () {
    if (fired) return;
    var scrolled = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
    if (scrolled >= 0.75) { fired = true; trackGoal('scroll_75'); }
  }, { passive: true });
}

/* =========================================================
   Инициализация
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
  initPartnerLinks();
  initHeroDownload();
  initConfigurator();
  initCalculator();
  initCompare();
  initServers();
  initCopy();
  initReveal();
});
