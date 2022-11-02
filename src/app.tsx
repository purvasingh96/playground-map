import * as React from 'react';

import {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import {render} from 'react-dom';
import Map, {Source, Layer, MapRef, MapLayerMouseEvent} from 'react-map-gl';

import {dataLayer} from './map-style';
import bbox from '@turf/bbox';

const MAPBOX_TOKEN = "pk.eyJ1IjoicHVydmFzaW5naCIsImEiOiJjbDQ4amRrYjQwc3RwM2NsbGttbnlpaTRmIn0.djnJ9PjVpJ7g8aIWHHnPGA"; // Set your mapbox token here

export default function PlaygroundApp() {
  const mapRef = useRef<MapRef>();
  const [allData, setAllData] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [viewport, setViewPort] = useState(null);

  useEffect(() => {
    /* global fetch */
    fetch(
      'https://raw.githubusercontent.com/purvasingh96/Mapbox-react-app/main/src/data/playground.json'
    )
      .then(resp => resp.json())
      .then(json => setAllData(json))
      .catch(err => console.error('Could not load data', err)); // eslint-disable-line
  }, []);

  

  const onHover = useCallback(event => {
    const {
      features,
      point: {x, y}
    } = event;
    const hoveredFeature = features && features[0];

    // prettier-ignore
    setHoverInfo(hoveredFeature && {feature: hoveredFeature, x, y});
  }, []);

  const onClick = (event:MapLayerMouseEvent) => {
    const feature = event.features[0];
    if(feature) {
      console.log(feature);
      const [minLng, minLat, maxLng, maxLat] = bbox(feature);
      console.log(minLng, minLat, maxLng, maxLat);
      
        mapRef.current.fitBounds(
            [
              [minLng, minLat],
              [maxLng, maxLat]
            ],
            {padding: 40, duration: 1000}
          );
    }
  };

  const data = useMemo(() => {
    return allData;
  }, [allData]);

  

  return (
    <>
      <Map
      ref={mapRef}
      initialViewState = {{
        longitude: 42.7339,
        latitude: 25.4858,
        zoom: 1
      }}
        style={{width: '40vw', height: '80vh'}}
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['data']}
        onMouseMove={onHover}
        renderWorldCopies={false}
        onClick={onClick}
      >
        <Source type="geojson" data={data}>
          <Layer {...dataLayer} 
            paint={
              {
                  "fill-outline-color": "white",
                  "fill-color": "red",
                  "fill-opacity": 0.5
              }
            }
          />
        </Source>
        {hoverInfo && (
          <div className="tooltip" style={{left: hoverInfo.x, top: hoverInfo.y}}>
            <div>State: {hoverInfo.feature.properties.name}</div>
          </div>
        )}
      </Map>

      {/* <ControlPanel year={year} onChange={value => setYear(value)} /> */}
    </>
  );
}

export function renderToDom(container) {
  render(<PlaygroundApp />, container);
}
