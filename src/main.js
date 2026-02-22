const { invoke } = window.__TAURI__.core;

const SHEET_COUNT = 3;
const EDGE_WIDTH = 14;
const MARGIN = 28;
const SWIPE_THRESHOLD = 50;
const SAVE_DEBOUNCE_MS = 1000;
const SWITCH_COOLDOWN_MS = 500;

let sheets = [];
let currentIndex = 0;
let swipeAccumulator = 0;
let swipeDecayTimer = null;
let saveTimers = new Array(SHEET_COUNT).fill(null);
let isAnimating = false;
let switchCooldown = false;

async function init() {
    const contents = await invoke('load_all_sheets');
    const container = document.getElementById('sheets-container');

    for (let i = 0; i < SHEET_COUNT; i++) {
        const sheetEl = document.createElement('div');
        sheetEl.className = 'sheet';

        const inner = document.createElement('div');
        inner.className = 'sheet-inner';

        const textarea = document.createElement('textarea');
        textarea.value = contents[i] || '';
        textarea.spellcheck = false;
        textarea.addEventListener('input', () => onInput(i));

        inner.appendChild(textarea);
        sheetEl.appendChild(inner);
        container.appendChild(sheetEl);
        sheets.push({ el: sheetEl, textarea });
    }

    updatePositions(false);
    sheets[currentIndex].textarea.focus();

    document.addEventListener('wheel', onWheel, { passive: false });

    const hint = document.getElementById('hint');
    setTimeout(() => hint.classList.add('fade-out'), 4000);
    setTimeout(() => hint.remove(), 5000);

    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
            e.preventDefault();
        }
    });
}

function updatePositions(animate) {
    sheets.forEach(({ el }, i) => {
        el.style.transition = animate
            ? 'transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)'
            : 'none';

        if (i < currentIndex) {
            // 下にある紙: 左上にずらして端を見せる
            const distance = currentIndex - i;
            el.style.transform = `translate(-${distance * EDGE_WIDTH}px, -${distance * 10}px)`;
            el.style.zIndex = i + 1;
            el.classList.remove('current');
        } else if (i === currentIndex) {
            el.style.transform = 'translateX(0)';
            el.style.zIndex = 10;
            el.classList.add('current');
        } else {
            // まだめくっていない紙: 右端にピークだけ見せる
            const peek = (SHEET_COUNT - i) * EDGE_WIDTH;
            el.style.transform = `translateX(calc(100% - ${peek + MARGIN}px))`;
            el.style.zIndex = SHEET_COUNT - i;
            el.classList.remove('current');
        }
    });
}

function switchTo(index) {
    if (index < 0 || index >= SHEET_COUNT || index === currentIndex) return;
    if (isAnimating || switchCooldown) return;

    saveSheet(currentIndex);
    currentIndex = index;
    isAnimating = true;

    updatePositions(true);

    setTimeout(() => {
        isAnimating = false;
        sheets[currentIndex].textarea.focus();
    }, 350);

    switchCooldown = true;
    setTimeout(() => { switchCooldown = false; }, SWITCH_COOLDOWN_MS);
}

function onWheel(e) {
    if (isAnimating || switchCooldown) return;
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

    e.preventDefault();
    swipeAccumulator += e.deltaX;

    clearTimeout(swipeDecayTimer);
    swipeDecayTimer = setTimeout(() => { swipeAccumulator = 0; }, 200);

    if (swipeAccumulator > SWIPE_THRESHOLD) {
        switchTo(currentIndex + 1);
        swipeAccumulator = 0;
    } else if (swipeAccumulator < -SWIPE_THRESHOLD) {
        switchTo(currentIndex - 1);
        swipeAccumulator = 0;
    }
}

function onInput(index) {
    if (saveTimers[index]) clearTimeout(saveTimers[index]);
    saveTimers[index] = setTimeout(() => saveSheet(index), SAVE_DEBOUNCE_MS);
}

async function saveSheet(index) {
    const contents = sheets[index].textarea.value;
    await invoke('save_sheet', { index, contents });
}

document.addEventListener('DOMContentLoaded', init);
