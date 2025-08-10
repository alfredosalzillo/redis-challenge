"use client";

import { createTheme, responsiveFontSizes } from "@mui/material";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0d1117",
      paper: "#0d1117",
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    fontSize: 12,
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: "small",
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: "small",
      },
    },
    MuiInputBase: {
      defaultProps: {
        size: "small",
      },
    },
  },
});

export default responsiveFontSizes(theme);