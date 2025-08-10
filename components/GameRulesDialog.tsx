import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import React, { FC } from "react";
import appConfig from "@/appConfig";

export type GameRulesDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
const GameRulesDialog: FC<GameRulesDialogProps> = ({ open, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose} aria-labelledby="rules-dialog-title">
    <DialogTitle id="rules-dialog-title">Welcome to Redis Pixel War</DialogTitle>
    <DialogContent dividers>
      <Typography variant="body1" gutterBottom>
        Paint the shared {appConfig.canvas.width}×{appConfig.canvas.height} canvas with others in real-time. Pick a color and click a pixel to set it.
      </Typography>
      <Typography variant="subtitle1" sx={{ mt: 1 }}>How to play</Typography>
      <ul style={{ marginTop: 4, marginBottom: 8, paddingLeft: 18 }}>
        <li>
          <Typography variant="body2">Use the color picker (top-right) to choose your color.</Typography>
        </li>
        <li>
          <Typography variant="body2">Click on the canvas to color a pixel.</Typography>
        </li>
        <li>
          <Typography variant="body2">Use the zoom controls (bottom-right) to zoom in/out.</Typography>
        </li>
        <li>
          <Typography variant="body2">See who is online and the top conquerors in the right panel.</Typography>
        </li>
      </ul>
      <Typography variant="subtitle1" sx={{ mt: 1 }}>Rules</Typography>
      <ul style={{ marginTop: 4, marginBottom: 8, paddingLeft: 18 }}>
        <li>
          <Typography variant="body2">Be respectful. No offensive drawings or text.</Typography>
        </li>
        <li>
          <Typography variant="body2">Pixels update in real-time—collaborate or compete fairly.</Typography>
        </li>
        <li>
          <Typography variant="body2">Have fun and be creative!</Typography>
        </li>
      </ul>
    </DialogContent>
    <DialogActions>
      <Button
        variant="contained"
        onClick={onConfirm}
      >
        Got it
      </Button>
    </DialogActions>
  </Dialog>
)

export default GameRulesDialog