/**
 * RUNNING P&L CHART - INSTITUTIONAL GRADE
 * 
 * DESIGN PRINCIPLE:
 * - Backend owns ALL financial calculations
 * - Frontend renders what backend provides
 * - No downstream P&L calculations or inferences
 * - All visual behavior is transparent and auditable
 * 
 * CRITICAL DECISIONS:
 * 1. Input is EquityCurveResponse from backend (not raw trades)
 * 2. No date formatting (backend provides display_date)
 * 3. No cumulative math (already done server-side)
 * 4. No synthetic point generation (backend handles all interpolation)
 * 5. Design tokens enforce color consistency across app
 * 
 * PERFORMANCE:
 * - Viewport-aware decimation for >200 points
 * - Memoization on response object, not calculations
 * - Linear interpolation only for data provided by backend
 */

import { useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { AlertCircle, TrendingDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TRADING_COLORS, CHART_DEFAULTS } from "@/theme/colors";
import { EquityCurveResponse, EquityCurvePoint } from "@/lib/api";

interface RunningPLProps {
  data: EquityCurveResponse;
  title?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  animated?: boolean;
}

interface EnhancedPoint extends EquityCurvePoint {
  balance_positive?: number | null;
  balance_negative?: number | null;
  isSynthetic?: boolean;
}

/**
 * DATA ENHANCEMENT: Zero-crossing interpolation and null masking.
 * 
 * PURPOSE:
 * - Inject synthetic points at exact zero crossings
 * - Eliminate area fill artifacts at sign changes
 * - Use null masking to control which areas render
 * - Preserve X-domain continuity for tooltips and animation
 * 
 * INVARIANTS:
 * - Every point has balance_total (source of truth)
 * - Synthetic points marked with isSynthetic = true
 * - balance_positive = balance_total >= 0 ? balance_total : null
 * - balance_negative = balance_total <= 0 ? balance_total : null
 * - No filtering: full dataset preserved for all series
 * 
 * WHY THIS WORKS:
 * - Profit Area uses balance_positive (renders nothing when < 0)
 * - Loss Area uses balance_negative (renders nothing when > 0)
 * - Synthetic points at zero satisfy both conditions
 * - Linear interpolation ensures smooth, honest continuity
 */
function enhanceEquityCurveData(points: EquityCurvePoint[]): EnhancedPoint[] {
  if (points.length === 0) return [];

  const enhanced: EnhancedPoint[] = [];

  for (let i = 0; i < points.length; i++) {
    const current = points[i];

    // Add the current point with masking
    const enhancedCurrent: EnhancedPoint = {
      ...current,
      balance_positive: current.balance_total >= 0 ? current.balance_total : null,
      balance_negative: current.balance_total <= 0 ? current.balance_total : null,
    };
    enhanced.push(enhancedCurrent);

    // Check for zero crossing to next point
    if (i < points.length - 1) {
      const next = points[i + 1];
      const currentSign = Math.sign(current.balance_total);
      const nextSign = Math.sign(next.balance_total);

      // Zero crossing detected (sign change, excluding 0 → positive or negative)
      if (currentSign !== nextSign && currentSign !== 0 && nextSign !== 0) {
        // Linear interpolation: find exact timestamp where balance_total == 0
        // balance_total = current + (next - current) * t
        // 0 = current + (next - current) * t
        // t = -current / (next - current)

        const t = -current.balance_total / (next.balance_total - current.balance_total);
        const interpolatedTimestamp =
          current.timestamp_unix_us + t * (next.timestamp_unix_us - current.timestamp_unix_us);

        // Create synthetic point at exact zero crossing
        const syntheticPoint: EnhancedPoint = {
          ...current,
          timestamp_unix_us: interpolatedTimestamp,
          timestamp_iso: new Date(interpolatedTimestamp / 1000).toISOString(),
          display_date: current.display_date, // Use current's date label
          balance_total: 0,
          balance_realized: current.balance_realized, // Preserve for audit
          balance_unrealized: current.balance_unrealized,
          return_percent: 0,
          sequence_id: current.sequence_id + 0.5, // Between current and next
          event: undefined, // Not a real trade event
          isSynthetic: true,
          balance_positive: 0, // Zero is >= 0
          balance_negative: 0, // Zero is <= 0
        };

        enhanced.push(syntheticPoint);
      }
    }
  }

  return enhanced;
}

/**
 * Helper: Downsample data while preserving extrema + slope continuity.
 * 
 * STRATEGY:
 * - If points <= 200, render all
 * - If points > 200, bin into ~200 segments
 * - Preserve min/max values within each segment (extrema preservation)
 * - ALSO preserve slope changes (direction continuity) to avoid zig-zag artifacts
 * - Keep chronological order to prevent misleading visual patterns
 * 
 * SLOPE AWARENESS:
 * - Detect significant direction changes within bins
 * - Include points where P&L changes from up→down or down→up
 * - Prevents sharp zig-zag when zoomed out (visual noise)
 * - No synthetic interpolation (backend provides all real data)
 * 
 * WHY: Recharts renders every DOM node. 1000+ points = performance issues.
 * Decimation must be transparent: chart looks identical at any zoom level.
 */
function decimate(
  points: EnhancedPoint[],
  maxPoints: number = 200
): EnhancedPoint[] {
  if (points.length <= maxPoints) {
    return points;
  }

  const decimated: EquityCurvePoint[] = [];
  const binSize = Math.ceil(points.length / maxPoints);

  // Preserve first point (important for starting context)
  decimated.push(points[0]);

  // Process bins
  for (let i = binSize; i < points.length; i += binSize) {
    const binStart = i - binSize;
    const binEnd = Math.min(i + binSize, points.length);
    const bin = points.slice(binStart, binEnd);

    if (bin.length === 0) continue;

    // Find extrema in this bin
    let minPoint = bin[0];
    let maxPoint = bin[0];

    for (const point of bin) {
      if (point.balance_total < minPoint.balance_total) {
        minPoint = point;
      }
      if (point.balance_total > maxPoint.balance_total) {
        maxPoint = point;
      }
    }

    // Detect slope changes (direction changes) within bin
    // This preserves directional continuity without fabricating data
    const slopePoints: EquityCurvePoint[] = [];
    for (let j = 1; j < bin.length - 1; j++) {
      const prev = bin[j - 1].balance_total;
      const curr = bin[j].balance_total;
      const next = bin[j + 1].balance_total;
      
      // Direction change: up→down or down→up
      if ((prev < curr && curr > next) || (prev > curr && curr < next)) {
        slopePoints.push(bin[j]);
      }
    }

    // Add extrema in chronological order (prevents visual artifacts)
    const candidatePoints = [minPoint, maxPoint, ...slopePoints];
    const uniquePoints = Array.from(new Map(
      candidatePoints.map(p => [p.timestamp_unix_us, p])
    ).values()).sort((a, b) => a.timestamp_unix_us - b.timestamp_unix_us);

    for (const point of uniquePoints) {
      if (point !== decimated[decimated.length - 1]) {
        decimated.push(point);
      }
    }

    // Always include last point of bin
    const lastPoint = bin[bin.length - 1];
    if (lastPoint !== decimated[decimated.length - 1]) {
      decimated.push(lastPoint);
    }
  }

  // Ensure last point is included
  const finalPoint = points[points.length - 1];
  if (finalPoint !== decimated[decimated.length - 1]) {
    decimated.push(finalPoint);
  }

  return decimated;
}

/**
 * Custom tooltip: Show full date and balance information.
 * 
 * CRITICAL: Display the ACTUAL balance_total value ONLY.
 * - Never show area series values (balance_positive, balance_negative)
 * - Suppress "Profit Zone" / "Loss Zone" labels
 * - Mark synthetic points for transparency
 * - Tooltip is the authority on true P&L
 */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  // Use the actual data point (contains balance_total)
  const point: EnhancedPoint = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="bg-slate-950 dark:bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
      <p className="text-sm text-slate-300">
        {point.display_date || point.timestamp_iso}
        {point.isSynthetic && <span className="text-xs text-slate-500 ml-1">(interpolated)</span>}
      </p>
      <p
        className={`text-lg font-bold ${
          point.balance_total >= 0
            ? "text-green-400"
            : "text-red-400"
        }`}
      >
        ${point.balance_total.toFixed(2)}
      </p>
      <p className="text-xs text-slate-400">
        {point.return_percent >= 0 ? "+" : ""}
        {point.return_percent.toFixed(2)}% return
      </p>
      {point.event && (
        <p className="text-xs text-slate-500 mt-1">
          {point.event.type === "TRADE_CLOSE" && `Trade #${point.event.trade_id}`}
        </p>
      )}
    </div>
  );
}

export default function RunningPL({
  data,
  title = "Running P&L",
  height = 350,
  showGrid = true,
  showLegend = true,
  animated = true,
}: RunningPLProps) {
  // VALIDATION: Check that backend provided good data
  const validationIssues = useMemo(() => {
    const issues: string[] = [];

    if (!data?.curve || data.curve.length === 0) {
      issues.push("No equity curve data provided");
    }

    if (data?.data_quality?.warnings && data.data_quality.warnings.length > 0) {
      issues.push(...data.data_quality.warnings);
    }

    if (!data?.data_quality?.is_complete) {
      issues.push(
        "Data is incomplete (missing trades or positions)"
      );
    }

    return issues;
  }, [data]);

  // ENHANCEMENT: Inject synthetic points at zero crossings
  const enhancedData = useMemo(() => {
    if (!data?.curve) return [];
    return enhanceEquityCurveData(data.curve);
  }, [data?.curve]);

  // DECIMATION: Optimize for rendering performance (works on enhanced data)
  const decimatedData = useMemo(() => {
    if (enhancedData.length === 0) return [];
    return decimate(enhancedData, 200);
  }, [enhancedData]);

  // DENSITY ASSESSMENT: Determine if dataset is large (affects opacity and dots)
  const isDenseDataset = useMemo(() => {
    return decimatedData.length > 100;
  }, [decimatedData.length]);

  // TERMINAL POINT: Highlight the last data point for "where am I now?"
  const terminalPoint = useMemo(() => {
    return decimatedData.length > 0 ? decimatedData[decimatedData.length - 1] : null;
  }, [decimatedData]);

  // SUMMARY: Extract ending state
  const summary = useMemo(() => {
    if (!data?.summary) {
      return {
        endingBalance: 0,
        returnPercent: 0,
        maxDrawdown: 0,
        isPositive: false,
      };
    }

    return {
      endingBalance: data.summary.ending_balance,
      returnPercent: data.summary.total_return_percent,
      maxDrawdown: data.summary.max_drawdown_percent,
      isPositive: data.summary.ending_balance >= 0,
    };
  }, [data?.summary]);

  // COLOR SELECTION: Based on ending balance
  const colors = useMemo(() => {
    return {
      line: summary.isPositive
        ? TRADING_COLORS.profit.primary
        : TRADING_COLORS.loss.primary,
      profitArea: TRADING_COLORS.profit.primary,
      lossArea: TRADING_COLORS.loss.primary,
      grid: TRADING_COLORS.neutral.light,
      axis: TRADING_COLORS.neutral.medium,
      reference: TRADING_COLORS.breakeven,
    };
  }, [summary.isPositive]);

  // Y-AXIS RANGE: Pad slightly for visual breathing room
  const yAxisDomain = useMemo(() => {
    if (!data?.summary) return ["dataMin - 10%", "dataMax + 10%"];

    const { min_balance, max_balance } = data.summary;
    const padding = Math.max(
      Math.abs(max_balance - min_balance) * 0.1,
      100
    );

    return [
      Math.floor((min_balance - padding) / 100) * 100,
      Math.ceil((max_balance + padding) / 100) * 100,
    ];
  }, [data?.summary]);

  // X-AXIS INTERVAL: Show ~8 readable labels
  const xAxisInterval = useMemo(() => {
    const pointCount = decimatedData.length;
    return Math.max(0, Math.floor(pointCount / 8) - 1);
  }, [decimatedData.length]);

  // Empty state
  if (!data?.curve || data.curve.length === 0) {
    return (
      <div
        className="w-full bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <p className="text-slate-500">No equity curve data available</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header with title and stats */}
      {title && (
        <div className="flex items-end justify-between px-2">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {decimatedData.length > data.curve.length
                ? `Showing ${decimatedData.length} of ${data.curve.length} points (decimated for performance)`
                : `${data.curve.length} trades`}
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-2xl font-bold ${
                summary.isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              ${summary.endingBalance.toFixed(2)}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {summary.isPositive ? "+" : ""}
              {summary.returnPercent.toFixed(2)}%
            </p>
            {summary.maxDrawdown < 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 justify-end">
                <TrendingDown size={12} />
                {summary.maxDrawdown.toFixed(2)}% DD
              </p>
            )}
          </div>
        </div>
      )}

      {/* Data quality warnings */}
      {validationIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validationIssues.map((issue, i) => (
                <p key={i} className="text-sm">
                  {issue}
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Chart */}
      <div className="w-full">
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={decimatedData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.grid}
                opacity={0.5}
              />
            )}

            {/* X-AXIS: Display dates provided by backend */}
            <XAxis
              dataKey="display_date"
              stroke={colors.axis}
              tick={{ fontSize: 11 }}
              interval={xAxisInterval}
              angle={-45}
              textAnchor="end"
              height={80}
            />

            {/* Y-AXIS: Currency formatting */}
            <YAxis
              stroke={colors.axis}
              tick={{ fontSize: 12 }}
              tickFormatter={(value: number) => `$${value.toLocaleString()}`}
              label={{
                value: "P&L ($)",
                angle: -90,
                position: "insideLeft",
              }}
              domain={yAxisDomain as any}
              type="number"
            />

            {/* Tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* Legend */}
            {showLegend && (
              <Legend wrapperStyle={{ paddingTop: "12px" }} />
            )}

            {/* PROFIT AREA: Shows P&L >= 0 using null masking */}
            {/* 
            WHY null masking instead of baseLine tricks:
            - balance_positive = balance_total >= 0 ? balance_total : null
            - When null, Recharts skips the point (no artificial geometry)
            - Synthetic points at zero satisfy both positive and negative domains
            - Guarantees no visual artifacts at sign changes
            - Linear type prevents interpolation within masked regions
            */}
            <Area
              data={decimatedData}
              type="linear"
              dataKey="balance_positive"
              stroke="none"
              fill={colors.profitArea}
              fillOpacity={isDenseDataset ? CHART_DEFAULTS.areaDenseOpacity : CHART_DEFAULTS.areaOpacity}
              isAnimationActive={animated}
              animationDuration={1000}
              dot={false}
              name="P&L Zone"
              legendType="none"
            />

            {/* LOSS AREA: Shows P&L < 0 using null masking */}
            <Area
              data={decimatedData}
              type="linear"
              dataKey="balance_negative"
              stroke="none"
              fill={colors.lossArea}
              fillOpacity={isDenseDataset ? CHART_DEFAULTS.areaDenseOpacity : CHART_DEFAULTS.areaOpacity}
              isAnimationActive={animated}
              animationDuration={1000}
              dot={false}
              name="P&L Zone"
              legendType="none"
            />

            {/* EQUITY LINE: Dominates visually with smooth curve */}
            <Line
              type="monotone"
              dataKey="balance_total"
              stroke={colors.line}
              strokeWidth={CHART_DEFAULTS.lineStroke}
              name="Running P&L"
              isAnimationActive={animated}
              animationDuration={1000}
              dot={isDenseDataset ? false : {
                fill: colors.line,
                r: CHART_DEFAULTS.dotRadius,
                strokeWidth: 1.5,
                stroke: "#fff",
              }}
              activeDot={{
                r: CHART_DEFAULTS.activeDotRadius,
                strokeWidth: 1.5,
              }}
            />

            {/* TERMINAL POINT EMPHASIS: Highlight "where am I now?" */}
            {terminalPoint && (
              <Line
                data={[terminalPoint]}
                type="monotone"
                dataKey="balance_total"
                stroke="none"
                dot={{
                  fill: colors.line,
                  r: CHART_DEFAULTS.terminalDotRadius,
                  strokeWidth: CHART_DEFAULTS.terminalDotStroke,
                  stroke: "#fff",
                }}
                isAnimationActive={false}
              />
            )}

            {/* ZERO LINE EMPHASIS: Must visually dominate as psychological boundary */}
            {/* Solid line (no dashes), higher stroke weight, higher opacity */}
            <ReferenceLine
              y={0}
              stroke={colors.reference}
              strokeDasharray={CHART_DEFAULTS.referenceLineDasharray}
              strokeWidth={CHART_DEFAULTS.referenceLineWidth}
              strokeOpacity={CHART_DEFAULTS.referenceLineOpacity}
              label={{
                value: "Breakeven",
                position: "right",
                fill: colors.reference,
                fontSize: 12,
                fontWeight: 600,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Data source attribution */}
      <p className="text-xs text-slate-500 dark:text-slate-400 px-2">
        Generated {new Date(data.generated_at_iso).toLocaleString()} UTC
      </p>
    </div>
  );
}
