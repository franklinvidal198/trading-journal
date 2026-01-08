/**
 * DESIGN TOKENS FOR TRADING CHARTS
 * 
 * Single source of truth for all chart colors.
 * Used across Running P&L, Trading Calendar, and other visualizations.
 * 
 * PRINCIPLE: Never hard-code colors. Always import from this file.
 */

export const TRADING_COLORS = {
  // Primary profit/loss colors (match Trading Calendar)
  profit: {
    primary: "#22c55e",    // Green-500: For positive P&L areas
    light: "#dcfce7",      // Green-100: For light backgrounds
    dark: "#15803d",       // Green-700: For dark mode accents
  },
  
  loss: {
    primary: "#ef4444",    // Red-500: For negative P&L areas
    light: "#fee2e2",      // Red-100: For light backgrounds
    dark: "#991b1b",       // Red-700: For dark mode accents
  },
  
  // Neutral colors
  neutral: {
    dark: "#1e293b",       // Slate-800: Dark backgrounds
    medium: "#64748b",     // Slate-500: Grid lines, borders
    light: "#e2e8f0",      // Slate-200: Light backgrounds
  },
  
  // Text colors
  text: {
    primary: "#1e293b",    // Dark text (light mode)
    secondary: "#64748b",  // Secondary text
    inverse: "#f1f5f9",    // Light text (dark mode)
  },
  
  // Semantic colors
  breakeven: "#94a3b8",    // Slate-400: Zero line
  background: {
    light: "#f8fafc",      // Slate-50: Light mode
    dark: "#0f172a",       // Slate-900: Dark mode
  },
} as const;

export const CHART_DEFAULTS = {
  // Grid and axis styling
  gridStroke: TRADING_COLORS.neutral.light,
  axisStroke: TRADING_COLORS.neutral.medium,
  axisTextSize: 11,
  
  // Area fill opacity
  areaOpacity: 0.2,          // Reduced: fills support, don't dominate
  areaDenseOpacity: 0.12,    // Further reduced for 100+ points
  
  // Line styling
  lineStroke: 3,
  lineOpacity: 1.0,
  
  // Reference line styling (EMPHASIZED: zero line must dominate)
  referenceLineStroke: TRADING_COLORS.breakeven,
  referenceLineDasharray: "0",   // Solid line (no dashes)
  referenceLineWidth: 2.5,       // Increased from 2
  referenceLineOpacity: 0.8,     // Higher contrast
  
  // Dot/point styling
  dotRadius: 2.5,
  activeDotRadius: 4,
  terminalDotRadius: 5,      // Emphasized last point
  terminalDotStroke: 2,
} as const;

export type TradingColorsType = typeof TRADING_COLORS;
export type ChartDefaultsType = typeof CHART_DEFAULTS;
