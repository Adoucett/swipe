const container = document.getElementById('image-compare-container');
const slider = document.getElementById('slider');
const imgA = document.getElementById('imgA');
const imgB = document.getElementById('imgB');
const selectA = document.getElementById('selectA');
const selectB = document.getElementById('selectB');
const dataset = document.getElementById('dataset');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');

const years = [2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024];
let startX = 0;
let startY = 0;
let active = false;
let zoomLevel = 1;
let sliderPosition = 0.5;
let panX = 0;
let panY = 0;

function updateDropdowns(dataset) {
    selectA.innerHTML = years.map(year => `<option value="${dataset}_${year}.jpg">${year}</option>`).join('');
    selectB.innerHTML = years.map(year => `<option value="${dataset}_${year}.jpg" ${year === 2024 ? 'selected' : ''}>${year}</option>`).join('');
    imgA.src = `${dataset}_2002.jpg`;
    imgB.src = `${dataset}_2024.jpg`;
}

slider.addEventListener('mousedown', (e) => {
    active = true;
    startX = e.clientX - slider.offsetLeft;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onStopDrag);
});

function onDrag(e) {
    if (!active) return;
    let x = e.clientX - startX;
    x = Math.max(0, Math.min(x, container.offsetWidth - slider.offsetWidth));
    sliderPosition = x / (container.offsetWidth - slider.offsetWidth);
    slider.style.left = `${x}px`;
    updateClip();
}

function onStopDrag() {
    active = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onStopDrag);
}

selectA.addEventListener('change', (e) => {
    imgA.src = e.target.value;
});

selectB.addEventListener('change', (e) => {
    imgB.src = e.target.value;
});

dataset.addEventListener('change', (e) => {
    updateDropdowns(e.target.value);
});

container.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoom(e.clientX, e.clientY, e.deltaY * -0.01);
});

zoomInBtn.addEventListener('click', () => {
    zoom(container.offsetWidth / 2, container.offsetHeight / 2, 0.1);
});

zoomOutBtn.addEventListener('click', () => {
    zoom(container.offsetWidth / 2, container.offsetHeight / 2, -0.1);
});

function zoom(clientX, clientY, delta) {
    const rect = container.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    const prevZoomLevel = zoomLevel;
    zoomLevel = Math.min(Math.max(1, zoomLevel + delta), 5);

    const scaleChange = zoomLevel / prevZoomLevel;

    const newOffsetX = offsetX * scaleChange;
    const newOffsetY = offsetY * scaleChange;

    const dx = newOffsetX - offsetX;
    const dy = newOffsetY - offsetY;

    panX -= dx;
    panY -= dy;

    updateTransform();
    updateClip();
}

container.addEventListener('mousedown', (e) => {
    if (e.target !== slider) {
        active = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        document.addEventListener('mousemove', onPan);
        document.addEventListener('mouseup', onStopPan);
    }
});

function onPan(e) {
    if (!active) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    updateTransform();
}

function onStopPan() {
    active = false;
    document.removeEventListener('mousemove', onPan);
    document.removeEventListener('mouseup', onStopPan);
}

function updateTransform() {
    imgA.style.transform = `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)`;
    imgB.style.transform = `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)`;
}

function updateClip() {
    imgA.style.clip = `rect(0, ${sliderPosition * (container.offsetWidth - slider.offsetWidth)}px, 100vh, 0)`;
}

updateDropdowns('FP');
updateClip();
