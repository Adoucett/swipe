mapboxgl.accessToken = 'pk.eyJ1IjoiYWRvdWNldHQiLCJhIjoiY2lvZDFsc2lwMDRnd3Zha2pneWpxcHh6biJ9.sbWgw2zPGyScsp-r4CYQnA';

const datasets = {
    'FP': {
        coordinates: [
            [-90.27096005, 38.63411217], // Top-left coordinates 
            [-90.2431005, 38.6303475], // Top-right coordinates 
            [-90.2470013, 38.6192146], // Bottom-right coordinates 
            [-90.27227390, 38.62250509] // Bottom-left coordinates 
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
        center: [-90.250721, 38.636425]  //38.636425,-90.250721
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
            [-90.408615, 38.787284], //
            [-90.366705, 38.743807], // 
            [-90.397779, 38.726356], // 
            [-90.438472, 38.769331]
        ],
        center: [-90.401009, 38.752261]
    },
    'DT': { 
        coordinates: [
            [-90.2156620, 38.6405990],
            [-90.1723459, 38.6309919],
            [-90.1818360, 38.6129030],
            [-90.2204370, 38.6207550]
        ],
        center: [-90.198697, 38.627324]
    },
    'BP': { 
        coordinates: [
            [-90.1956756, 38.6272824],
            [-90.1844485, 38.6244833],
            [-90.1866780, 38.6192019],
            [-90.1977077, 38.6220220]
        ],
        center: [-90.19115, 38.623208] 
    }
};

const years = [2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024];
const flyToSpeed = 0.75; // Adjust this value to control the flyTo speed

const updateDropdowns = (dataset) => {
    const options = years.map(year => `<option value="${dataset}_${year}.jpg">${year}</option>`).join('');
    document.getElementById('selectA').innerHTML = options;
    document.getElementById('selectB').innerHTML = years.map(year => `<option value="${dataset}_${year}.jpg" ${year === 2024 ? 'selected' : ''}>${year}</option>`).join('');
};

const updateMap = (map, dataset, year) => {
    const sourceId = `${map.getContainer().id}-overlay`;
    const imgUrl = `${dataset}_${year}.jpg`;
    const coordinates = datasets[dataset].coordinates;

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

const recenterMap = (map, center) => {
    map.flyTo({
        center: center,
        zoom: 14.5,
        speed: flyToSpeed
    });
};

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

const beforeMap = new mapboxgl.Map({
    container: 'before',
    style: 'mapbox://styles/adoucett/clysuaj18003u01paax2cd5da',
    center: [-90.258442, 38.626422],
    zoom: 15,
    maxZoom: 18.5,
    maxPitch: 45
});

const afterMap = new mapboxgl.Map({
    container: 'after',
    style: 'mapbox://styles/adoucett/clysuaj18003u01paax2cd5da',
    center: [-90.258442, 38.626422],
    zoom: 15,
    maxZoom: 18.5,
    maxPitch: 45
});

beforeMap.on('load', () => {
    const dataset = datasetSelect.value;
    updateMap(beforeMap, dataset, selectA.value.split('_')[1].split('.')[0]);
});

afterMap.on('load', () => {
    const dataset = datasetSelect.value;
    updateMap(afterMap, dataset, selectB.value.split('_')[1].split('.')[0]);
});

const container = '#comparison-container';
const map = new mapboxgl.Compare(beforeMap, afterMap, container, {
    // Set this to enable comparing two maps by mouse movement:
    // mousemove: true
});

document.addEventListener('DOMContentLoaded', () => {
    updateDropdowns(datasetSelect.value);
});
