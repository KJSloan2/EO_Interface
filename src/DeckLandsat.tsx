import React, { useEffect, useState } from 'react';
import { DeckGL, GeoJsonLayer, ColumnLayer } from 'deck.gl';
import * as turf from '@turf/turf';
import {Map} from 'react-map-gl/maplibre';
import './App.css';
import type { Color, PickingInfo, MapViewState } from '@deck.gl/core';
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -100,
  latitude: 40,
  zoom: 9.3,
  maxZoom: 15,
  pitch: 45,
  bearing: 45,
};

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

export function DeckLstf({ selectedTile }: { selectedTile: string }) {
  const [layers, setLayers] = useState<any[]>([]);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  const loadGeoJSON = async (filePath: string) => {
    try {
      console.log(`Loading GeoJSON from ${filePath}`);
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Error loading GeoJSON: ${response.status}`);
      const data = await response.json();
      console.log('GeoJSON loaded successfully');
      return data;
    } catch (error) {
      console.error('Error loading GeoJSON file:', error);
      throw error;
    }
  };
//////////////////////////////////////////////////////////////////////////////////////
  const loadTileData = async (filePath: string) => {
    try {
      console.log(`Loading JSON from ${filePath}`);
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Error loading JSON: ${response.status}`);
      const data = await response.json();
      console.log('JSON loaded successfully');

      const centerCoordinates = turf.centroid({
        type: 'FeatureCollection',
        features: data.map((entry: any) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: entry.centroid },
        })),
      }).geometry.coordinates;

      const minLstf = Math.min(...data.map((e: any) => e.lstf));
      const maxLstf = Math.max(...data.map((e: any) => e.lstf));

      const normalizedData = data.map((entry: any) => ({
        ...entry,
        value_normalized: (entry.lstf - minLstf) / (maxLstf - minLstf),
      }));

      const columnLayer = new ColumnLayer({
        id: 'columnLayer',
        data: normalizedData,
        diskResolution: 6,
        radius: 50,
        elevationScale: 3000,
        getPosition: (d: any) => d.centroid,
        getFillColor: (d: any) => [d.value_normalized * 255, 50, 50, 100],
        getElevation: (d: any) => d.value_normalized,
      });

      const geoJson = await loadGeoJSON('/A0_tileReferencePolygons.geojson');
      const geoJsonLayer = new GeoJsonLayer({
        id: 'geoJsonLayer',
        data: geoJson,
        pickable: true,
        stroked: true,
        filled: true,
        lineWidthMinPixels: 1,
        getLineColor: [255, 255, 255],
        getFillColor: [255, 51, 51, 25],
      });

      setLayers([columnLayer, geoJsonLayer]);
      setViewState({
        ...INITIAL_VIEW_STATE,
        longitude: centerCoordinates[0],
        latitude: centerCoordinates[1],
      });
    } catch (error) {
      console.error('Error loading tile data:', error);
    }
  };
//////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    if (selectedTile) {
      loadTileData(selectedTile).catch(error => {
        console.error('Error in useEffect loadTileData:', error);
      });
    }
  }, [selectedTile]);
//////////////////////////////////////////////////////////////////////////////////////
  return (
    <div className="deck-container">
      <div className="deck-input-panel">
        <input type="range" min="0" max="100" />
        <input type="range" min="0" max="100" />
      </div>
      <div className="deck">
        <DeckGL
          initialViewState={viewState}
          controller={true}
          layers={layers}
          mapStyle={MAP_STYLE}
          onViewStateChange={({ viewState }) => setViewState(viewState)}
        >
          <Map reuseMaps mapStyle={MAP_STYLE} />
        </DeckGL>
      </div>
    </div>
  );
}
