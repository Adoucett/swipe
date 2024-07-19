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
            [-90.26590405, 38.64820128],
            [-90.2309325, 38.6409926],
            [-90.2710217, 38.6319911],
            [-90.2365457, 38.6249927]
        ],
        center: [-90.250721, 38.636425]  //38.636425,-90.250721
    },
    'BH': { 
        coordinates: [
            [-90.26590405, 38.64820128],
            [-90.2309325, 38.6409926],
            [-90.2710217, 38.6319911],
            [-90.2365457, 38.6249927]
        ],
        center: [-90.250721, 38.636425]
    },
    'North': { 
        coordinates: [
            [-90.26590405, 38.64820128],
            [-90.2309325, 38.6409926],
            [-90.2710217, 38.6319911],
            [-90.2365457, 38.6249927]
        ],
        center: [-90.250721, 38.636425]
    },
    'BR': { 
        coordinates: [
            [-90.26590405, 38.64820128],
            [-90.2309325, 38.6409926],
            [-90.2710217, 38.6319911],
            [-90.2365457, 38.6249927]
        ],
        center: [-90.250721, 38.636425]
    },
    'DT': { 
        coordinates: [
            [-90.26590405, 38.64820128],
            [-90.2309325, 38.6409926],
            [-90.2710217, 38.6319911],
            [-90.2365457, 38.6249927]
        ],
        center: [-90.250721, 38.636425]
    }
};

const years = [2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024];

const updateDropdowns = (dataset) => {
    const options = years.map(year => `<option value="${dataset}_${year}.jpg">${year}</option>`).join('');
    document.getElementById('selectA').innerHTML = options;
    document.getElementById('selectB').innerHTML = years.map(year => `<option value="${dataset}_${year}.jpg" ${year === 2024 ? 'selected' : ''}>${year}</option>`).join('');
};

const updateMap = (map, dataset, year) => {
    const sourceId = `${map.getContainer().id}-overlay`;
    const imgUrl = `https://adoucett.github.io/swipe/stl/${dataset}_${year}.jpg`;
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
        zoom: 12
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
    zoom: 12
});

const afterMap = new mapboxgl.Map({
    container: 'after',
    style: 'mapbox://styles/adoucett/clysuaj18003u01paax2cd5da',
    center: [-90.258442, 38.626422],
    zoom: 12
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
