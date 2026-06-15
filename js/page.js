/**
 * Логика демо-страницы:
 *  - подтягивает abacus.css и abacus.js, собирает из них готовые блоки кода для Tilda;
 *  - кнопки «Копировать»;
 *  - переключатель темы.
 */
(function () {

    // Разметка одного абакуса — выдаётся в Шаге 2.
    var markupBlock =
        '<div class="abacus-instance">\n' +
        '    <div class="abacus-wrapper">\n' +
        '        <div class="abacus">\n' +
        '            <div class="bar"></div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '    <div class="controls">\n' +
        '        <div class="left-controls">\n' +
        '            <button class="btn-reset">Сброс</button>\n' +
        '            <button class="btn-hint">Подсказка</button>\n' +
        '        </div>\n' +
        '        <div class="right-controls">\n' +
        '            <button class="btn-minus">−</button>\n' +
        '            <div class="rod-count">1</div>\n' +
        '            <button class="btn-plus">+</button>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</div>';

    document.getElementById("code-markup").textContent = markupBlock;

    // Подтягиваем исходники абакуса и собираем единый блок «стили + скрипт».
    Promise.all([
        fetch("css/abacus.css").then(function (r) { return r.text(); }),
        fetch("js/abacus.js").then(function (r) { return r.text(); })
    ]).then(function (parts) {
        var css = parts[0].trim();
        var js = parts[1].trim();

        var scriptBlock =
            "<style>\n" + css + "\n</style>\n\n" +
            "<script>\n" + js + "\n<\/script>";

        document.getElementById("code-script").textContent = scriptBlock;
    }).catch(function () {
        document.getElementById("code-script").textContent =
            "Не удалось загрузить исходники. Открой страницу через локальный сервер " +
            "(например `npx serve`) или с GitHub Pages — file:// блокирует fetch.";
    });

    // Кнопки копирования.
    var buttons = document.querySelectorAll(".copy-btn");
    buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var targetId = btn.getAttribute("data-target");
            var text = document.getElementById(targetId).textContent;
            var labelEl = btn.querySelector(".label");

            function done() {
                labelEl.textContent = "Скопировано";
                btn.classList.add("done");
                setTimeout(function () {
                    labelEl.textContent = "Копировать";
                    btn.classList.remove("done");
                }, 1600);
            }

            function fallback() {
                var ta = document.createElement("textarea");
                ta.value = text;
                ta.style.position = "fixed";
                ta.style.left = "-9999px";
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand("copy"); } catch (e) {}
                document.body.removeChild(ta);
                done();
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, fallback);
            } else {
                fallback();
            }
        });
    });

    // Переключатель темы.
    var toggle = document.getElementById("themeToggle");
    toggle.addEventListener("click", function () {
        document.documentElement.classList.toggle("dark");
    });

})();
