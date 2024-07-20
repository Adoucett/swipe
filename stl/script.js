mapboxgl.accessToken = 'pk.eyJ1IjoiYWRvdWNldHQiLCJhIjoiY2lvZDFsc2lwMDRnd3Zha2pneWpxcHh6biJ9.sbWgw2zPGyScsp-r4CYQnA';

const datasets = {
    'FP': {
        coordinates: [
            [-90.27096005, 38.63411217],
            [-90.2431005, 38.6303475],
            [-90.2470013, 38.6192146],
            [-90.27227390, 38.62250509]
        ],
        center: [-90.258442, 38.626422]
    },
    'CWE': { 
        coordinates: [
            [-90.265791, 38.648148],
            [-90.230907, 38.641031],
            [-90.236500, 38.625070],
            [-90.270842, 38.631979]
        ],
        center: [-90.250721, 38.636425]
    },
    'BH': { 
        coordinates: [
            [-90.258256, 38.624445],
            [-90.236446, 38.622666],
            [-90.240030, 38.613929],
            [-90.257021, 38.615561]
        ],
        center: [-90.247296, 38.618804]
    },
    'North': { 
        coordinates: [
            [-90.253454, 38.670463],
            [-90.190976, 38.657448],
            [-90.200687, 38.631054],
            [-90.261727, 38.643822]
        ],
        center: [-90.226696, 38.651965]
    },
    'BR': { 
        coordinates: [
            [-90.408615, 38.787284],
            [-90.366705, 38.743807],
            [-90.397779, 38.726356],
            [-90.438472, 38.769331]
        ],
        center: [-90.401009, 38.752261]
    },
    'DT': { 
        coordinates: [
            [-90.215662, 38.640599],
            [-90.1723459, 38.6309919],
            [-90.181836, 38.612903],
            [-90.220437, 38.620755]
        ],
        center: [-90.198697, 38.627324]
    }
};

const years = [2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024];
const flyToSpeed = 0.8;

const updateDropdowns = (dataset) => {
    const options = years.map(year => `<option value="${dataset}_${year}.jpg">${year}</option>`).join('');
    document.getElementById('selectA').innerHTML = options;
    document.getElementById('selectB').innerHTML = years.map(year => `<option value="${dataset}_${year}.jpg" ${year === 2024 ? 'selected' : ''}>${year}</option>`).join('');
};

const updateMap = (map, dataset, year) => {
    const sourceId = `${map.getContainer().id}-overlay`;
    const imgUrl = `https://adoucett.github.io/swipe/stl/${dataset}_${year}.jpg`;
    const coordinates = datasets[dataset].coordinates;

    const image = new Image();
    image.onload = () => {
        if (map.getSource(sourceId)) {
            map.getSource(sourceId).updateImage({ url: imgUrl, coordinates });
        } else {
            map.addSource(sourceId, {
                type: 'image',
                url: imgUrl,
                coordinates: coordinates
            });
            map.addLayer({
                id: sourceId,
                source: sourceId,
                type: 'raster',
                paint: { 'raster-opacity': 1 }
            });
        }
    };
    image.src = imgUrl;
};

const recenterMap = (map, center) => {
    map.flyTo({
        center: center,
        zoom: 14,
        speed: flyToSpeed
    });
};

const handleContextLoss = (map) => {
    map.on('webglcontextlost', (event) => {
        event.preventDefault();
        console.warn('WebGL context lost. Attempting to restore...');
        map.resize(); // Trigger a resize to force a re-render
    });

    map.on('webglcontextrestored', () => {
        console.log('WebGL context restored.');
        const dataset = datasetSelect.value;
        updateMap(map, dataset, selectA.value.split('_')[1].split('.')[0]);
        updateMap(map, dataset, selectB.value.split('_')[1].split('.')[0]);
    });
};

const initializeMap = (containerId) => {
    const map = new mapboxgl.Map({
        container: containerId,
        style: 'mapbox://styles/adoucett/clysuaj18003u01paax2cd5da',
        center: [-90.258442, 38.626422],
        zoom: 14,
        maxZoom: 18,
        maxPitch: 45
    });

    handleContextLoss(map);

    map.on('load', () => {
        const dataset = datasetSelect.value;
        updateMap(map, dataset, selectA.value.split('_')[1].split('.')[0]);
        updateMap(map, dataset, selectB.value.split('_')[1].split('.')[0]);
    });

    return map;
};

const beforeMap = initializeMap('before');
const afterMap = initializeMap('after');

const container = '#comparison-container';
const compare = new mapboxgl.Compare(beforeMap, afterMap, container, {
    mousemove: true,
    orientation: 'vertical'
});

const datasetSelect = document.getElementById('dataset');
const selectA = document.getElementById('selectA');
const selectB = document.getElementById('selectB');

datasetSelect.addEventListener('change', () => {
    const dataset = datasetSelect.value;
    updateDropdowns(dataset);
    updateMap(beforeMap, dataset, selectA.value.split('_')[1].split('.')[0]);
    updateMap(afterMap, dataset, selectB.value.split('_')[1].split('.')[0]);
    recenterMap(beforeMap, datasets[dataset].center);
    recenterMap(afterMap, datasets[dataset].center);
});

selectA.addEventListener('change', () => {
    const dataset = datasetSelect.value;
    updateMap(beforeMap, dataset, selectA.value.split('_')[1].split('.')[0]);
});

selectB.addEventListener('change', () => {
    const dataset = datasetSelect.value;
    updateMap(afterMap, dataset, selectB.value.split('_')[1].split('.')[0]);
});

document.addEventListener('DOMContentLoaded', () => {
    updateDropdowns(datasetSelect.value);
});
