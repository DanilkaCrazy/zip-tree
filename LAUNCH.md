# Launch Guide · Руководство по запуску

This document explains every way to launch the ZIP Project Tree Visualizer. Each section is written first in English, then in Russian so newcomers can follow along without prior experience.

---

## English

### Option A — 1‑click Client Mode (Recommended)
Best for: designers, documentation writers, anyone who just wants to visualize archives.

1. Double‑click `launch-browser.ps1` **or** run:
   ```powershell
   .\launch-browser.ps1
   ```
2. Wait for the script to confirm that the app opened in your default browser.
3. Upload a ZIP file → wait for the tree → export to JPG/PNG/PDF.

**Manual alternative:** open `frontend/index.html` via drag & drop into the browser. No scripts needed.

> **Why choose this mode?**  
> Works offline, zero installation, files never leave your computer.

### Option B — Python Helper Server
Useful if you prefer `http://localhost:8080`.

1. Install [Python 3](https://www.python.org/downloads/) and ensure `python` is in PATH.  
   _Beginner tip:_ during installation, tick “Add Python to PATH”.
2. From the project root run:
   ```powershell
   python server.py
   ```
3. Visit http://localhost:8080 and use the web UI exactly the same way.

### Option C — Node.js Server
Ideal when deploying to a JavaScript-friendly environment.

```powershell
npm install
npm start
```
Then browse to http://localhost:8080.

### Option D — Native C++ Backend (Advanced)
For teams that want the original C++ ZIP parser and HTTP server.

1. Install CMake ≥ 3.10, a C++17 compiler, and libzip (see `SETUP_REQUIREMENTS.md`).
2. Run:
   ```powershell
   .\launch.ps1
   ```
3. Open http://localhost:8080.

### How to confirm everything works
1. The upload card should show “Selected: your-file.zip”.
2. The tree renders below with folders/files.
3. `Download as PDF` saves a multi-page document without errors.

### Troubleshooting (English)
| Symptom | Fix |
| --- | --- |
| `python` or `npm` not recognized | Install Python/Node.js and reopen the terminal so PATH updates. |
| Blank page after opening `index.html` | Use a modern browser (Chromium, Firefox, Edge, Safari ≥ 15). |
| “Failed to export PDF” | Refresh the page so the jsPDF library loads, then try again. |
| Upload never finishes | Large archives depend on available RAM. Close other heavy apps and retry. |

---

## Русский

### Вариант A — Клиентский режим в один клик (рекомендуется)
Для дизайнеров, техписателей и всех, кому важно быстро визуализировать структуру проекта.

1. Дважды щёлкните `launch-browser.ps1` **или** выполните:
   ```powershell
   .\launch-browser.ps1
   ```
2. Дождитесь сообщения о запуске и перехода в браузер.
3. Загрузите ZIP → дождитесь построения дерева → экспортируйте в JPG/PNG/PDF.

**Альтернатива:** перетащите `frontend/index.html` в окно браузера и работайте офлайн.

### Вариант B — Встроенный сервер на Python

1. Установите [Python 3](https://www.python.org/downloads/) (не забудьте поставить галочку «Add Python to PATH»).
2. В корневой папке проекта выполните:
   ```powershell
   python server.py
   ```
3. Откройте http://localhost:8080 и пользуйтесь приложением.

### Вариант C — Сервер на Node.js

```powershell
npm install
npm start
```
Затем откройте http://localhost:8080.

### Вариант D — Нативный C++ (для продвинутых)

1. Установите CMake, компилятор C++17 и libzip (см. `SETUP_REQUIREMENTS.md`).
2. Запустите:
   ```powershell
   .\launch.ps1
   ```
3. Перейдите по адресу http://localhost:8080.

### Как понять, что всё работает
1. Под кнопкой видно название выбранного ZIP.
2. Ниже отображается дерево папок и файлов.
3. Кнопки экспорта создают рабочие JPG/PNG/PDF без ошибок.

### Частые проблемы и решения
| Проблема | Решение |
| --- | --- |
| Сообщение «python не является внутренней командой» | Установите Python и заново откройте PowerShell. |
| Пустой экран после открытия `index.html` | Используйте современный браузер (Chrome, Edge, Firefox, Safari 15+). |
| Ошибка «Failed to export PDF» | Обновите страницу, чтобы заново загрузить библиотеки, и повторите попытку. |
| Большие ZIP не загружаются | Закройте ресурсоёмкие программы – браузеру нужно больше памяти. |

Удачного запуска! / Happy launching!

