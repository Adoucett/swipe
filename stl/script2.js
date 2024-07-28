//Styleset: mapbox://styles/adoucett/clytjfrff006j01pafko44d0y


mapboxgl.accessToken = 'your_mapbox_access_token';

const datasets = {
    'FP': { center: [-90.258442, 38.626422] },
    'CWE': { center: [-90.250721, 38.636425] },
    'BH': { center: [-90.247296, 38.618804] },
    'North': { center: [-90.226696, 38.651965] },
    'BR': { center: [-90.401009, 38.752261] },
    'DT': { center: [-90.198697, 38.627324] },
    'BP': { center: [-90.19115, 38.623208] },
    'DU': { center: [-90.2492363, 38.5764495] }
};

const years = [2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024];
const flyToSpeed = 0.75;

const arcgisUrls = {
    2018: 'https://maps.stlouisco.com/arcgis/rest/services/Aerials/Aerials2018/MapServer'
    // Add more URLs for different years as needed
};

const updateDropdowns = (dataset) => {
    const options = years.map(year => `<option value="${year}">${year}</option>`).join('');
    document.getElementById('selectA').innerHTML = options;
    document.getElementById('selectB').innerHTML = years.map(year => `<option value="${year}" ${year === 2024 ? 'selected' : ''}>${year}</option>`).join('');
};

const updateMap = (map, year) => {
    const sourceId = `${map.getContainer().id}-arcgis`;

    if (map.getSource(sourceId)) {
        map.removeLayer(sourceId);
        map.removeSource(sourceId);
    }

    map.addSource(sourceId, {
        type: 'raster',
        tiles: [`${arcgisUrls[year]}/tile/{z}/{y}/{x}`],
        tileSize: 256
    });

    map.addLayer({
        id: sourceId,
        source: sourceId,
        type: 'raster',
        paint: { 'raster-opacity': 1 }
    });
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
    updateMap(beforeMap, selectA.value);
    updateMap(afterMap, selectB.value);
    recenterMap(beforeMap, datasets[dataset].center);
    recenterMap(afterMap, datasets[dataset].center);
});

selectA.addEventListener('change', () => {
    updateMap(beforeMap, selectA.value);
});

selectB.addEventListener('change', () => {
    updateMap(afterMap, selectB.value);
});

const beforeMap = new mapboxgl.Map({
    container: 'before',
    style: 'mapbox://styles/adoucett/clytjfrff006j01pafko44d0y',
    center: [-90.258442, 38.626422],
    zoom: 15,
    maxZoom: 18.5,
    maxPitch: 45
});

const afterMap = new mapboxgl.Map({
    container: 'after',
    style: 'mapbox://styles/adoucett/clytjfrff006j01pafko44d0y',
    center: [-90.258442, 38.626422],
    zoom: 15,
    maxZoom: 18.5,
    maxPitch: 45
});

beforeMap.on('load', () => {
    updateMap(beforeMap, selectA.value);
});

afterMap.on('load', () => {
    updateMap(afterMap, selectB.value);
});

const container = '#comparison-container';
const map = new mapboxgl.Compare(beforeMap, afterMap, container, {
    // Set this to enable comparing two maps by mouse movement:
    // mousemove: true
});

document.addEventListener('DOMContentLoaded', () => {
    updateDropdowns(datasetSelect.value);
});

///
