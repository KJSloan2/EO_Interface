import React, { useEffect, useState, useMemo } from 'react';
import { DeckGL, GeoJsonLayer } from 'deck.gl';
import * as turf from '@turf/turf';
import { Map } from 'react-map-gl/maplibre';
import './App.css';
import type { MapViewState } from '@deck.gl/core';

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -100,
  latitude: 40,
  zoom: 9.3,
  maxZoom: 15,
  pitch: 45,
  bearing: 45,
};
const dRanges = { "lstf": [50, 130], "ndvi": [0, 1] };
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

const availableTiles = [
  'A0_2013_0-0_V1.json',
  'A0_2013_0-1_V1.json',
  'A0_2013_0-2_V1.json',
  'A0_2013_0-3_V1.json',
  'A0_2013_0-4_V1.json',
  'A0_2013_0-5_V1.json',
  'A0_2013_0-6_V1.json',
  'A0_2013_1-0_V1.json',
  'A0_2013_1-1_V1.json',
  'A0_2013_1-2_V1.json',
  'A0_2013_1-3_V1.json',
  'A0_2013_1-4_V1.json',
  'A0_2013_1-5_V1.json',
  'A0_2013_1-6_V1.json',
  'A0_2013_2-0_V1.json',
  'A0_2013_2-1_V1.json',
  'A0_2013_2-2_V1.json',
  'A0_2013_2-3_V1.json',
  'A0_2013_2-4_V1.json',
  'A0_2013_2-5_V1.json',
  'A0_2013_2-6_V1.json'
];

const availableSpectralAnalysis = ["ndvi", "lstf"];

export function DeckLandsat() {
  const [selectedTile, setSelectedTile] = useState<string>(availableTiles[0]);
  const [selectedSpectralAnalysis, setSelectedSpectralAnalysis] = useState<string>(availableSpectralAnalysis[0]);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [radius, setRadius] = useState(50);
  const [zScale, setZScale] = useState(1);
  const [minRange, setMinRange] = useState(dRanges["lstf"][0]);
  const [maxRange, setMaxRange] = useState(dRanges["lstf"][1]);
  const [minLst, setMinLst] = useState(minRange);
  const [maxLst, setMaxLst] = useState(maxRange);
  const [tileData, setTileData] = useState<any[]>([]);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  const palettes = { 
    "lstf": [
      [255, 255, 204, 255],
      [255, 237, 160, 255],
      [254, 217, 118, 255],
      [254, 178, 76, 255],
      [253, 141, 60, 255],
      [252, 78, 42, 255],
      [227, 26, 28, 255],
      [189, 0, 38, 255],
      [128, 0, 38, 255],
      [77, 0, 75, 255]
    ],
    "ndvi": [
      [247, 252, 245, 255],
      [229, 245, 224, 255],
      [199, 233, 192, 255],
      [161, 217, 155, 255],
      [116, 196, 118, 255],
      [65, 171, 93, 255],
      [35, 139, 69, 255],
      [0, 109, 44, 255],
      [0, 68, 27, 255],
      [0, 39, 0, 255]
    ]
  };

  const getColorFromPalette = (normalizedValue: number) => {
    const index = Math.floor(normalizedValue * 10);
    const color = palettes[selectedSpectralAnalysis][Math.min(index, 9)];
    return [...color.slice(0, 3), 80]; // Set alpha to 128 for 50% opacity
  };

  useEffect(() => {
    const [min, max] = dRanges[selectedSpectralAnalysis];
    setMinRange(min);
    setMaxRange(max);
    setMinLst(min);
    setMaxLst(max);
  }, [selectedSpectralAnalysis]);

  const loadGeoJSON = async (filePath: string) => {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Error loading GeoJSON: ${response.status}`);
    const data = await response.json();
    setGeoJsonData(data); // Store the GeoJSON data
  };

  const loadTileData = async (filePath: string) => {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Error loading JSON: ${response.status}`);
    const data = await response.json();

    const centerCoordinates = turf.centroid({
      type: 'FeatureCollection',
      features: data.map((entry: any) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: entry.centroid },
      })),
    }).geometry.coordinates;

    setTileData(data);
    setViewState({
      ...INITIAL_VIEW_STATE,
      longitude: centerCoordinates[0],
      latitude: centerCoordinates[1],
    });
  };

  useEffect(() => {
    if (selectedTile) {
      loadTileData(selectedTile).catch(error => console.error(error));
      loadGeoJSON('/A0_cellSummaries.geojson').catch(error => console.error(error));
    }
  }, [selectedTile]);

  const layers = useMemo(() => {
    if (!geoJsonData) return []; // Ensure GeoJSON is loaded
  
    // Normalize the mean_lstf values
    const normalizedGeoJsonData = geoJsonData.features.map((feature: any) => {
      const value = feature.properties.mean_lstf || 0;
      const normalizedValue =
        (value - dRanges[selectedSpectralAnalysis][0]) /
        (dRanges[selectedSpectralAnalysis][1] - dRanges[selectedSpectralAnalysis][0]);
  
      return {
        ...feature,
        properties: {
          ...feature.properties,
          value_normalized: Math.min(Math.max(normalizedValue, 0), 1), // Clamp between 0 and 1
        },
      };
    });

    const geoJsonLayer = new GeoJsonLayer({
      id: 'geoJsonLayer',
      data: { ...geoJsonData, features: normalizedGeoJsonData },
      pickable: true,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 1,
      getLineColor: [36, 39, 48],
      getFillColor: (feature: any) => {
        const color = getColorFromPalette(feature.properties.value_normalized);
        console.log(`Feature ID: ${feature.id}, Normalized Value: ${feature.properties.value_normalized}, Color: ${color}`);
        return color;
      }, // Use palette color
    });
  
    return [geoJsonLayer];
  }, [geoJsonData, selectedSpectralAnalysis]);

  
  return (
    <div className="deck-container">
      <div className="deck-input-panel">
        <div className="deck-input-panel-description">
          <div className="text">
            <h4>Landsat Temporal Analysis - V1.0</h4>
            <br></br>
            <p>
            Retrieve temporally analyzed land surface temperature (lstf) and normalized difference vegetation index (ndvi). 
            <br></br>
            Select which spectral analysis to view.
            <br></br>
            Select a tile using the Select Tile dropdown.
            <br></br>
            Customize the visualization with radius and height scalers.
            </p>
          </div>
        </div>
        <br></br>
        <label>
          Threshold Min: {minLst}
          <input
            type="range"
            min={minRange}
            max={maxRange}
            step={0.1}
            value={minLst}
            onChange={(e) => setMinLst(Number(e.target.value))}
          />
        </label>

        <label>
          Threshold Max: {maxLst}
          <input
            type="range"
            min={minRange}
            max={maxRange}
            step={0.1}
            value={maxLst}
            onChange={(e) => setMaxLst(Number(e.target.value))}
          />
        </label>
        <label>
          <br></br>
          Radius: {radius}
          <br></br>
          <input
            type="range"
            min="10"
            max="100"
            step={10}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          />
        </label>
        <br></br>
        <label>
          Z Scale: {zScale}
          <input
            type="range"
            min="1"
            max="10"
            step={1}
            value={zScale}
            onChange={(e) => setZScale(Number(e.target.value))}
          />
        </label>
        <br></br>
        <label>
          Spectral Analysis:
          <br></br>
          <select
            value={selectedSpectralAnalysis}
            onChange={(e) => setSelectedSpectralAnalysis(e.target.value)}
          >
            {availableSpectralAnalysis.map((sa) => (
              <option key={sa} value={sa}>
                {sa}
              </option>
            ))}
          </select>
        </label>
        <br></br>
        <label>
          Select Tile:
          <br></br>
          <select
            value={selectedTile}
            onChange={(e) => setSelectedTile(e.target.value)}
          >
            {availableTiles.map((tile) => (
              <option key={tile} value={tile}>
                {tile}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="deck">
        <DeckGL
          layers={layers}
          initialViewState={viewState}
          controller={true}
          mapStyle={MAP_STYLE}
          onViewStateChange={({ viewState }) => setViewState(viewState)}
        >
          <Map reuseMaps mapStyle={MAP_STYLE} />
        </DeckGL>
      </div>
    </div>
  );
}
