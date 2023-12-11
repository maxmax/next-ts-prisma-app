// src/components/Map.tsx
import { MapContainer, Marker, TileLayer, Tooltip, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { Box, Typography } from '@mui/material'

type PositionProps = {
  latitude: string;
  longitude: string;
}

type Props = {
  position: PositionProps;
  zoom: number;
}

export default function GeoPoint({ position, zoom }: Props) {

  return (
    <>
      <Box className="leaflet-container">
        <MapContainer className="leaflet-container" center={position} zoom={13} scrollWheelZoom={false} attributionControl={false}>
          <TileLayer
            attribution='&copy; <a href="/">Next-ts-prisma-app</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>
      </Box>
    </>
  )
}