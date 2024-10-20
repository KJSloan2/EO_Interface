import React, { useRef, useEffect } from 'react';
import './App.css';

const Description = () => {
  return (
    <div className="description">
            <div className="text">
            <h1>Earth Observer</h1>
            <h2>Spatiotemporal Analysis Tools</h2>
            <br></br>
            <p>
              EO (Earth Observer) is an ongoing project that aims to layer geospatial data from disparate 
              sources and topics into a unified analysis and visualization platform. Currently, EO is focused 
              on using Landsat, 3DEP and Dynamic World data to quantify temporal changes in land surface 
              temperature, vegetation health and density (NDVI), elevation terrain and urban materials.
            </p>
            </div>
            <br></br>
            <br></br>
            <div className="text">
            <h2>Landsat Toolkit</h2>
            <p>
              This toolkit is being developed the streamline the acquisition, preprocessing, 
              spatial and temporal analysis of multispectral raster data from the USGS's Landsat 8 and 9 missions. 
              The toolkit also incorporates other spatial features such as slope, 
              elevation, catalogued features (water bodies, land formations, forests, built structures etc.), 
              and socioeconomic and demographic data such as population, income and various other indicators. 
              The intent of this project is to provide comprehensive descriptions of land characteristics and changing land dynamics over time. 
              An example of this toolkit's usage may be to determine the suitability of land for purposes like homesteading 
              or small scale farming by analyzing how land surface temperature and vegetation health have changed in an given area 
              over time and if terrane characteristics such as topography are suitable for the intended land use.
            </p>
            <button
              className="button"
              onClick={() => window.open('https://github.com/KJSloan2/EO', '_blank', 'noopener,noreferrer')}
            >
              Landsat Toolkit
            </button>
            </div>
            
            <div className="text">
            <h2>3DEP</h2>
            <p>
                Earth Engine is also used to acquire elevation from the USGS 3DEP 10m National Map Seamless (1/3 Arc-Second) collection. 
                3Dep elevation data is preprocessed with local Python tools in this repo and integrated with Landsat data to map land surface 
                temperature and vegetation data to 3D points (Lat, Lon, Elv) rather than just 2D (Lat, Lon) points.
            </p>
            <button
              className="button"
              onClick={() => window.open('https://github.com/KJSloan2/EO', '_blank', 'noopener,noreferrer')}
            >
              3DEP Toolkit
            </button>
            </div>
    </div>
  );
};

export default Description;
