import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  useZoomPan,
  Line
} from "react-simple-maps";

import { useState, useEffect } from 'react'

const geoUrl = process.env.PUBLIC_URL + '/assets/world-110m.json';

const width = 450;
const height = 430;


const CustomZoomableGroup = ({ children, ...restProps }) => {
    const { mapRef, transformString, position } = useZoomPan(restProps);
    return (
      <g ref={mapRef}>
        <rect width={width} height={height} fill="transparent" />
        <g transform={transformString}>{children(position)}</g>
      </g>
    );
  };


// Component to display the Map
const Map = ({ locations, lines, handleMouseOver, handleMouseOut, handleClick }) => {

    return (
        <ComposableMap width={width} height={height}>
            <CustomZoomableGroup center={[4, 3]}>
            { position => (
                <>
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                        geographies
                            .map(geo => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="#EAEAEC"
                                stroke="#D6D6DA"
                                style={{
                                default: { outline: "none" },
                                hover: { outline: "none" },
                                pressed: { outline: "none" },
                                }}
                            />
                            ))
                        }
                    </Geographies>
                    {
                    locations.map((location) => (
                    <Marker style={{hover: {cursor: "pointer"}}} key={location.key} coordinates={[location.lon, location.lat]}>
                    <circle r={4 / position.k} fill={location.color} stroke="#000" id={location.uuid} onClick={handleClick} onMouseOver={handleMouseOver} onMouseLeave={handleMouseOut} strokeWidth={0.2} />
                    <text
                        textAnchor="middle"
                        y={-15}
                        style={{ fontFamily: "system-ui", fill: "#5D5A6D" }}
                    >
                    </text>
                    </Marker>
                    ))
                    }

                    {
                        lines.map((line) => (
                            <Line
                                from={line.from}
                                to={line.to}
                                stroke="#FF5533"
                                strokeWidth={2 / position.k}
                                strokeLinecap="round"
                                className={line.id}
                                style={{ display: "none"}}
                        />
                        ))
                    }

                </>
                )}
                
            </CustomZoomableGroup>
        </ComposableMap>
    );
};

export default Map;