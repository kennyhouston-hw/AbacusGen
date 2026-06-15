/**
 * Универсальный движок абакуса.
 * Находит все элементы .abacus-instance на странице и запускает каждый независимо.
 * Никаких id и глобальных функций — конфликтов между блоками нет.
 */
(function () {

    function createAbacus(root) {

        if (root.dataset.abacusInit === "1") {
            return;
        }
        root.dataset.abacusInit = "1";

        var abacus     = root.querySelector(".abacus");
        var hintBtn    = root.querySelector(".btn-hint");
        var resetBtn   = root.querySelector(".btn-reset");
        var minusBtn   = root.querySelector(".btn-minus");
        var plusBtn    = root.querySelector(".btn-plus");
        var rodCountEl = root.querySelector(".rod-count");

        var lowerCount = 4;
        var rodWidth = 60;
        var SIDE_PADDING = 12;

        var cols = 1;
        var state = [];
        var hintOn = false;

        function createRodState() {
            return { upper: false, lower: [false, false, false, false] };
        }

        function ensureStateSize(newCols) {
            if (newCols > state.length) {
                while (state.length < newCols) {
                    state.push(createRodState());
                }
            } else {
                state = state.slice(0, newCols);
            }
        }

        function rebuildDOM() {
            var gap = 10;
            var contentWidth = cols * rodWidth + (cols - 1) * gap;
            var width = contentWidth + SIDE_PADDING * 2;
            abacus.style.width = width + "px";
            abacus.innerHTML = '<div class="bar"></div>';
            var startX = SIDE_PADDING;

            for (var c = 0; c < cols; c++) {
                var rod = document.createElement("div");
                rod.className = "rod";
                var visualIndex = (cols - 1) - c;
                rod.style.left = (startX + visualIndex * (rodWidth + gap)) + "px";

                var spine = document.createElement("div");
                spine.className = "spine";
                rod.appendChild(spine);

                var label = document.createElement("div");
                label.className = "rod-label";
                rod.appendChild(label);

                var upper = document.createElement("div");
                upper.className = "bead upper";
                upper.onclick = (function (idx) {
                    return function () {
                        state[idx].upper = !state[idx].upper;
                        render();
                    };
                })(c);
                rod.appendChild(upper);

                for (var i = 0; i < lowerCount; i++) {
                    var bead = document.createElement("div");
                    bead.className = "bead lower";
                    bead.onclick = (function (rodIdx, beadIdx) {
                        return function () {
                            var arr = state[rodIdx].lower;
                            if (arr[beadIdx]) {
                                for (var j = beadIdx; j < lowerCount; j++) {
                                    arr[j] = false;
                                }
                            } else {
                                for (var j = 0; j <= beadIdx; j++) {
                                    arr[j] = true;
                                }
                            }
                            render();
                        };
                    })(c, i);
                    rod.appendChild(bead);
                }

                abacus.appendChild(rod);
            }

            render();
        }

        function calculateRodValue(r) {
            var v = 0;
            if (r.upper) {
                v += 5;
            }
            for (var i = 0; i < r.lower.length; i++) {
                if (r.lower[i]) {
                    v += 1;
                }
            }
            return v;
        }

        function toggleHint() {
            hintOn = !hintOn;
            hintBtn.classList.toggle("active", hintOn);
            render();
        }

        function changeRods(delta) {
            cols = Math.max(1, Math.min(12, cols + delta));
            ensureStateSize(cols);
            updateRodCountUI();
            rebuildDOM();
        }

        function updateRodCountUI() {
            rodCountEl.innerText = cols;
        }

        function reset() {
            state = [];
            ensureStateSize(cols);
            render();
        }

        function render() {
            var rods = abacus.querySelectorAll(".rod");

            var barY = 180;
            var gap = 55;
            var step = 28;
            var upperRestY = barY - gap;
            var upperDownY = barY - 28;
            var lowerStart = barY + gap;
            var barBottom = barY + 6;
            var lowerLastY = lowerStart + (lowerCount - 1) * step;
            var TOP_LIMIT = upperRestY - 20;
            var BOTTOM_LIMIT = lowerLastY + 40;

            abacus.style.setProperty("--frame-top", TOP_LIMIT + "px");
            abacus.style.setProperty("--frame-bottom", (420 - BOTTOM_LIMIT) + "px");

            rods.forEach(function (rod, c) {
                var children = rod.querySelectorAll(".bead");
                var spine = rod.querySelector(".spine");
                var label = rod.querySelector(".rod-label");
                var upper = children[0];

                upper.classList.toggle("active", state[c].upper);
                spine.style.top = TOP_LIMIT + "px";
                spine.style.height = (BOTTOM_LIMIT - TOP_LIMIT) + "px";
                upper.style.top = state[c].upper ? upperDownY + "px" : upperRestY + "px";
                label.innerText = hintOn ? calculateRodValue(state[c]) : "";

                var activeIndex = 0;
                for (var i = 0; i < lowerCount; i++) {
                    var bead = children[i + 1];
                    var isActive = state[c].lower[i];
                    bead.classList.toggle("active", isActive);
                    if (isActive) {
                        bead.style.top = (barBottom + activeIndex * step) + "px";
                        activeIndex++;
                    } else {
                        bead.style.top = (lowerStart + i * step) + "px";
                    }
                }
            });
        }

        resetBtn.addEventListener("click", reset);
        hintBtn.addEventListener("click", toggleHint);
        minusBtn.addEventListener("click", function () { changeRods(-1); });
        plusBtn.addEventListener("click", function () { changeRods(1); });

        ensureStateSize(cols);
        rebuildDOM();
        updateRodCountUI();
    }

    function initAll() {
        var nodes = document.querySelectorAll(".abacus-instance");
        for (var k = 0; k < nodes.length; k++) {
            createAbacus(nodes[k]);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAll);
    } else {
        initAll();
    }

    setTimeout(initAll, 500);
    setTimeout(initAll, 1500);

    window.AbacusInit = initAll;

})();
