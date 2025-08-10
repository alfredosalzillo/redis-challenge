import { Box, IconButton, Typography } from "@mui/material";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import React, { FC } from "react";

export type CanvasZoomControlProps = {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}
const CanvasZoomControl: FC<CanvasZoomControlProps> = ({ zoom, onZoomChange }) => (
  <Box
    sx={{
      bgcolor: 'background.paper',
      borderRadius: 1,
      boxShadow: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      p: 0.5,
    }}
  >
    <IconButton
      aria-label="zoom out"
      size="small"
      onClick={() => onZoomChange(Math.max(0.1, +(zoom - 0.1).toFixed(2)))}
    >
      <ZoomOutIcon fontSize="small" />
    </IconButton>
    <Typography variant="caption" sx={{ mr: 0.5 }}>{Math.round(zoom * 100)}%</Typography>
    <IconButton
      aria-label="zoom in"
      size="small"
      onClick={() => onZoomChange(Math.min(8, +(zoom + 0.1).toFixed(2)))}
    >
      <ZoomInIcon fontSize="small" />
    </IconButton>
  </Box>
)

export default CanvasZoomControl;