const container = document.getElementById('image-compare-container');
const slider = document.getElementById('slider');
const imgA = document.getElementById('imgA');
const imgB = document.getElementById('imgB');
const selectA = document.getElementById('selectA');
const selectB = document.getElementById('selectB');
const dataset = document.getElementById('dataset');
const zoomInBtn = document.getElementById('zoom-in');
const zoomOutBtn = document.getElementById('zoom-out');
const resetViewBtn = document.getElementById('reset-view');

const years = [2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024];
let startX = 0;
let active = false;
let zoomLevel = 1;
let sliderPosition = 0.5;
let panX = 0;
let panY = 0;

const updateDropdowns = (dataset) => {
    const options = years.map(year => `<option value="${dataset}_${year}.jpg">${year}</option>`).join('');
    selectA.innerHTML = options;
    selectB.innerHTML = years.map(year => `<option value="${dataset}_${year}.jpg" ${year === 2024 ? 'selected' : ''}>${year}</option>`).join('');
    imgA.src = `${dataset}_2002.jpg`;
    imgB.src = `${dataset}_2024.jpg`;
};

const setSliderPosition = (x) => {
    x = Math.max(0, Math.min(x, container.offsetWidth - slider.offsetWidth));
    sliderPosition = x / (container.offsetWidth - slider.offsetWidth);
    slider.style.left = `${x}px`;
    updateClip();
};

const onDrag = (e) => {
    if (!active) return;
    requestAnimationFrame(() => {
        const x = e.clientX - startX;
        setSliderPosition(x);
    });
};

const onStopDrag = () => {
    active = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onStopDrag);
};

const zoom = (clientX, clientY, delta) => {
    requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const offsetX = (clientX - rect.left - panX) / zoomLevel;
        const offsetY = (clientY - rect.top - panY) / zoomLevel;

        zoomLevel = Math.min(Math.max(1, zoomLevel + delta), 5);

        panX = clientX - rect.left - offsetX * zoomLevel;
        panY = clientY - rect.top - offsetY * zoomLevel;

        updateTransform();
        updateClip();
    });
};

const onPan = (e) => {
    if (!active) return;
    requestAnimationFrame(() => {
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        updateTransform();
    });
};

const onStopPan = () => {
    active = false;
    document.removeEventListener('mousemove', onPan);
    document.removeEventListener('mouseup', onStopPan);
};

const updateTransform = () => {
    const transform = `scale(${zoomLevel}) translate(${panX / zoomLevel}px, ${panY / zoomLevel}px)`;
    imgA.style.transform = transform;
    imgB.style.transform = transform;
};

const updateClip = () => {
    const rect = container.getBoundingClientRect();
    const clipWidth = sliderPosition * rect.width;
    imgA.style.clip = `rect(0, ${clipWidth}px, ${rect.height}px, 0)`;
};

const resetView = () => {
    zoomLevel = 1;
    panX = 0;
    panY = 0;
    sliderPosition = 0.5;
    slider.style.left = '50%';
    updateTransform();
    updateClip();
};

const debounce = (func, wait) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

// Event Listeners
slider.addEventListener('mousedown', (e) => {
    active = true;
    startX = e.clientX - slider.offsetLeft;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onStopDrag);
});

selectA.addEventListener('change', (e) => {
    imgA.src = e.target.value;
});

selectB.addEventListener('change', (e) => {
    imgB.src = e.target.value;
});

dataset.addEventListener('change', (e) => {
    updateDropdowns(e.target.value);
});

container.addEventListener('wheel', debounce((e) => {
    e.preventDefault();
    zoom(e.clientX, e.clientY, e.deltaY * -0.01);
}, 100), { passive: true });

zoomInBtn.addEventListener('click', () => {
    zoom(container.offsetWidth / 2, container.offsetHeight / 2, 0.1);
});

zoomOutBtn.addEventListener('click', () => {
    zoom(container.offsetWidth / 2, container.offsetHeight / 2, -0.1);
});

resetViewBtn.addEventListener('click', resetView);

container.addEventListener('mousedown', (e) => {
    if (e.target !== slider) {
        active = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        document.addEventListener('mousemove', onPan);
        document.addEventListener('mouseup', onStopPan);
    }
});

updateDropdowns('FP');
updateClip();
