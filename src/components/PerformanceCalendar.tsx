import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { statsAPI, PerformanceCalendarDay } from "@/lib/api";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface DayMetrics {
  date: string;
  pnl: number;
  trades: number;
  winRate: number;
}

interface WeekSummary {
  weekStart: string;
  weekEnd: string;
  pnl: number;
  trades: number;
  winDays: number;
  lossDays: number;
  weekNumber: number;
}

// Format large numbers with K/M suffix
function formatCurrency(value: number): string {
  if (value === 0) return "$0";
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  if (absValue >= 1000000) {
    return `${sign}$${(absValue / 1000000).toFixed(2)}M`;
  }
  if (absValue >= 1000) {
    return `${sign}$${(absValue / 1000).toFixed(2)}K`;
  }
  return `${sign}$${absValue.toFixed(2)}`;
}

export default function PerformanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0)); // January 2025
  const [calendarData, setCalendarData] = useState<DayMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate min/max PnL for color scaling
  const profitDays = calendarData.filter(d => d.pnl > 0);
  const lossDays = calendarData.filter(d => d.pnl < 0);
  const maxProfit = Math.max(...profitDays.map(d => d.pnl), 1);
  const maxLoss = Math.abs(Math.min(...lossDays.map(d => d.pnl), -1));

  async function fetchCalendarData() {
    setLoading(true);
    setError(null);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const data = await statsAPI.getPerformanceCalendar(month, year);
      setCalendarData(data);
    } catch (err) {
      setError("Failed to load performance calendar data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  function getBackgroundColor(day: DayMetrics): string {
    if (day.trades === 0) {
      // Empty days: subtle but visible - shows structure without noise
      return "bg-slate-400/20 dark:bg-slate-500/15";
    }

    if (day.pnl > 0) {
      // Green gradient: 3-tier based on profit magnitude (perceptual scale)
      const intensity = Math.min(day.pnl / maxProfit, 1);
      if (intensity > 0.67) return "bg-green-600/85";      // Tier 3: High profit
      if (intensity > 0.33) return "bg-green-400/70";      // Tier 2: Medium profit
      return "bg-green-200/50";                              // Tier 1: Low profit
    } else if (day.pnl < 0) {
      // Red gradient: 3-tier based on loss magnitude (perceptual scale)
      const intensity = Math.min(Math.abs(day.pnl) / maxLoss, 1);
      if (intensity > 0.67) return "bg-red-600/85";        // Tier 3: High loss
      if (intensity > 0.33) return "bg-red-400/70";        // Tier 2: Medium loss
      return "bg-red-200/50";                                // Tier 1: Low loss
    }

    return "bg-slate-500/8 dark:bg-slate-400/5";
  }

  function getTextColor(day: DayMetrics): string {
    if (day.trades === 0) {
      return "text-muted-foreground";
    }

    const intensity = Math.max(
      Math.abs(day.pnl) / Math.max(maxProfit, maxLoss),
      0
    );

    // Higher intensity (Tier 2/3) gets white text for contrast
    if (intensity > 0.5) return "text-white font-semibold";
    // Lower intensity (Tier 1) uses foreground color
    return "text-foreground font-medium";
  }

  function getMetricTextColor(day: DayMetrics): string {
    // Muted version of primary text color - for secondary metrics
    if (day.trades === 0) {
      return "text-muted-foreground/60";
    }

    const intensity = Math.abs(day.pnl) / Math.max(maxProfit, maxLoss);
    if (intensity > 0.5) return "text-white/80";
    return "text-muted-foreground";
  }

  // Smart border styling based on performance
  function getBorderStyle(day: DayMetrics): React.CSSProperties {
    if (day.trades === 0) {
      // No trades: nearly invisible - just a hairline grid hint, no accent bar
      return {
        borderLeft: "4px solid transparent",
        border: "1px solid rgba(209, 213, 219, 0.1)",
      };
    }

    const intensity = Math.min(Math.abs(day.pnl) / Math.max(maxProfit, maxLoss), 1);

    if (day.pnl > 0) {
      // Profit: green border with intensity-based opacity
      const accentOpacity = 0.5 + intensity * 0.5; // 0.5-1.0
      const borderOpacity = 0.3 + intensity * 0.5; // 0.3-0.8
      return {
        borderLeft: `4px solid rgba(34, 197, 94, ${accentOpacity})`,
        border: `1px solid rgba(34, 197, 94, ${borderOpacity})`,
      };
    } else if (day.pnl < 0) {
      // Loss: red border with intensity-based opacity
      const accentOpacity = 0.5 + intensity * 0.5; // 0.5-1.0
      const borderOpacity = 0.3 + intensity * 0.5; // 0.3-0.8
      return {
        borderLeft: `4px solid rgba(239, 68, 68, ${accentOpacity})`,
        border: `1px solid rgba(239, 68, 68, ${borderOpacity})`,
      };
    }

    // Break even (pnl === 0 but has trades)
    return {
      borderLeft: "4px solid rgba(107, 114, 128, 0.3)",
      border: "1px solid rgba(107, 114, 128, 0.2)",
    };
  }

  // Get all dates in the month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Build calendar grid with week structure
  const firstDayOfWeek = monthStart.getDay(); // 0 = Sunday
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = new Array(firstDayOfWeek).fill(null);

  daysInMonth.forEach(day => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  // Summary calculations
  const monthTotal = calendarData.reduce((sum, d) => sum + d.pnl, 0);
  const monthTrades = calendarData.reduce((sum, d) => sum + d.trades, 0);
  const winningDays = calendarData.filter(d => d.pnl > 0).length;
  const losingDays = calendarData.filter(d => d.pnl < 0).length;
  const activeDays = calendarData.filter(d => d.trades > 0).length;
  const monthWinRate = monthTrades > 0 ? ((calendarData.filter(d => d.pnl > 0).length / activeDays) * 100) : 0;

  // Calculate weekly summaries
  function getWeeklySummaries(): WeekSummary[] {
    const summaries: WeekSummary[] = [];
    weeks.forEach((week, weekIndex) => {
      const validDates = week.filter((day): day is Date => day !== null);
      
      const weekDays = validDates
        .map(day => {
          const dayStr = format(day, "yyyy-MM-dd");
          return calendarData.find(d => d.date === dayStr);
        })
        .filter((day): day is DayMetrics => day !== undefined);

      if (weekDays.length > 0 && validDates.length > 0) {
        const weekPnL = weekDays.reduce((sum, d) => sum + d.pnl, 0);
        summaries.push({
          weekStart: format(validDates[0], "MMM d"),
          weekEnd: format(validDates[validDates.length - 1], "MMM d"),
          pnl: weekPnL,
          trades: weekDays.reduce((sum, d) => sum + d.trades, 0),
          winDays: weekDays.filter(d => d.pnl > 0).length,
          lossDays: weekDays.filter(d => d.pnl < 0).length,
          weekNumber: weekIndex + 1,
        });
      }
    });
    return summaries;
  }

  const weeklySummaries = getWeeklySummaries();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthName = format(currentDate, "MMMM yyyy");

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trading Performance Calendar</CardTitle>
            <CardDescription>Daily P&L and trade activity heatmap</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold min-w-40 text-center">{monthName}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="text-center py-8 text-muted-foreground">Loading calendar data...</div>
        )}

        {!loading && !error && (
          <>
            {/* Compact Monthly Summary */}
            <div className="flex items-center justify-between pb-2 border-b">
              <div>
                <h3 className="text-sm font-medium">Monthly Stats</h3>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className={`font-bold ${monthTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(monthTotal)}
                </div>
                <div className="text-muted-foreground">{activeDays} days</div>
              </div>
            </div>

            {/* Calendar Grid + Weekly Sidebar */}
            <div className="flex gap-6">
              {/* Calendar on left */}
              <div className="flex-1">
                {/* Day names header */}
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar weeks */}
                <div className="space-y-1">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 gap-1">
                      {week.map((day, dayIndex) => {
                        if (!day) {
                          return <div key={`empty-${dayIndex}`} className="h-20" />;
                        }

                        const dayStr = format(day, "yyyy-MM-dd");
                        const dayData = calendarData.find(d => d.date === dayStr);

                        if (!dayData) {
                          return <div key={dayStr} className="h-20" />;
                        }

                        return (
                          <div
                            key={dayStr}
                            className={`
                              h-20 p-2 rounded-md
                              ${getBackgroundColor(dayData)}
                              flex flex-col justify-between
                              cursor-pointer hover:shadow-md
                              transition-all duration-150
                              group relative
                            `}
                            style={{
                              ...getBorderStyle(dayData),
                            }}
                            onMouseEnter={(e) => {
                              const el = e.currentTarget as HTMLElement;
                              if (dayData.pnl > 0) {
                                el.style.borderColor = "rgba(34, 197, 94, 0.9)";
                                el.style.borderLeftColor = "rgba(34, 197, 94, 1)";
                              } else if (dayData.pnl < 0) {
                                el.style.borderColor = "rgba(239, 68, 68, 0.9)";
                                el.style.borderLeftColor = "rgba(239, 68, 68, 1)";
                              } else {
                                el.style.borderColor = "rgba(209, 213, 219, 0.6)";
                                el.style.borderLeftColor = "rgba(209, 213, 219, 0.7)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              const el = e.currentTarget as HTMLElement;
                              const borderStyle = getBorderStyle(dayData);
                              Object.assign(el.style, borderStyle);
                            }}
                          >
                            {/* Date in top-right corner */}
                            <div className="text-xs text-muted-foreground/60 self-end">
                              {day.getDate()}
                            </div>

                            {/* PnL - Primary (center, large) */}
                            <div className="flex flex-col items-center justify-center flex-1 gap-1">
                              <div className={`font-bold text-sm leading-none ${getTextColor(dayData)}`}>
                                {dayData.trades > 0 ? formatCurrency(dayData.pnl) : "—"}
                              </div>

                              {/* Trade count + Win Rate - Secondary */}
                              {dayData.trades > 0 && (
                                <div className={`text-[10px] font-medium ${getMetricTextColor(dayData)}`}>
                                  {dayData.trades}t • {dayData.winRate.toFixed(0)}%
                                </div>
                              )}
                            </div>

                            {/* Enhanced Hover Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex z-50 bg-popover border border-border rounded-md px-3 py-2 text-xs whitespace-nowrap shadow-lg flex-col gap-1">
                              <div className="font-semibold text-foreground">{dayData.date}</div>
                              <div className={`font-medium ${dayData.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {formatCurrency(dayData.pnl)}
                              </div>
                              <div className="text-muted-foreground">
                                {dayData.trades} trade{dayData.trades !== 1 ? "s" : ""} • {dayData.winRate.toFixed(1)}% W/R
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Summary Sidebar */}
              <div className="w-40 space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground mb-3">Weekly</h4>
                {weeklySummaries.map(week => (
                  <div
                    key={week.weekNumber}
                    className={`
                      p-3 rounded-md text-xs space-y-1 
                      border-l-4 border
                      transition-colors duration-150
                      ${
                        week.pnl >= 0
                          ? "border-l-green-500/70 border-green-500/15 bg-green-50/20 dark:bg-green-950/10"
                          : "border-l-red-500/70 border-red-500/15 bg-red-50/20 dark:bg-red-950/10"
                      }
                      hover:bg-green-50/35 dark:hover:bg-green-950/20
                    `}
                  >
                    <div className="text-muted-foreground font-medium">Week {week.weekNumber}</div>
                    <div className={`font-bold ${week.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(week.pnl)}
                    </div>
                    <div className="text-muted-foreground">
                      {week.winDays}W {week.lossDays}L • {week.trades}t
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend - 3-Tier Intensity Scale */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-600/85" />
                <span className="text-muted-foreground text-xs">High Profit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-400/70" />
                <span className="text-muted-foreground text-xs">Mid Profit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-200/50" />
                <span className="text-muted-foreground text-xs">Low Profit</span>
              </div>

              <div className="h-3 border-l border-border/30" />

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-200/50" />
                <span className="text-muted-foreground text-xs">Low Loss</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-400/70" />
                <span className="text-muted-foreground text-xs">Mid Loss</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-600/85" />
                <span className="text-muted-foreground text-xs">High Loss</span>
              </div>

              <div className="h-3 border-l border-border/30" />

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-100/40 dark:bg-gray-800/30" />
                <span className="text-muted-foreground text-xs">No Activity</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
