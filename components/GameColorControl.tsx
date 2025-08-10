import { MuiColorInput } from "mui-color-input";
import { Box } from "@mui/material";
import React, { FC } from "react";

export type GameColorControlProps = {
  color: string;
  onColorChange: (color: string) => void;
}
const GameColorControl: FC<GameColorControlProps> = ({ color, onColorChange }) => (
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
    <MuiColorInput
      aria-label="color-picker"
      variant="outlined"
      format="hex"
      value={color}
      onChange={onColorChange}
    />
  </Box>
)

export default GameColorControl