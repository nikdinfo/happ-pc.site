Сюда положить локальные woff2-шрифты (subset: кириллица + латиница).
Имена файлов должны совпадать с @font-face в style.css:

  manrope-800.woff2
  manrope-700.woff2
  inter-400.woff2
  inter-500.woff2
  inter-600.woff2
  jetbrains-mono-400.woff2
  jetbrains-mono-500.woff2

Где взять:
  Manrope        — https://github.com/sharanda/manrope (OFL)
  Inter          — https://github.com/rsms/inter (OFL)
  JetBrains Mono — https://github.com/JetBrains/JetBrainsMono (OFL)

Как получить subset woff2 (пример на pyftsubset из fonttools):
  pyftsubset Manrope-ExtraBold.ttf --output-file=manrope-800.woff2 \
    --flavor=woff2 --layout-features="*" \
    --unicodes="U+0000-00FF,U+0400-045F,U+0490-0491,U+2010-2027,U+2030-205E,U+20BD"

Google Fonts НЕ подключать — только локальные файлы (требование ТЗ).
Пока файлов нет, страница работает на системном фолбэк-стеке.
