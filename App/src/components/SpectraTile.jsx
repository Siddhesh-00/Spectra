import React from 'react';
import { TileLayer } from 'react-leaflet';

/**
 * SPECTRA Map Tile Layer
 * Spec §58.2: "No paid map tiles"
 *
 * variant: 'osm'       — OpenStreetMap (default)
 * variant: 'satellite' — ESRI World Imagery (free, no API key)
 * variant: 'terrain'   — OpenTopoMap (free, no API key)
 */
export default function SpectraTile({ variant = 'osm' }) {
  if (variant === 'satellite') {
    return (
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        maxZoom={19}
      />
    );
  }

  if (variant === 'terrain') {
    return (
      <TileLayer
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        attribution='Map data: &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
        maxZoom={17}
        subdomains="abc"
      />
    );
  }

  // default: OSM
  return (
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      maxZoom={19}
      subdomains="abc"
    />
  );
}
