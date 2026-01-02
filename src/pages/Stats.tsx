import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { statsAPI, DailyPerformance, PnLByPair, EquityPoint, WinLossDistribution } from "@/lib/api";
import { format } from "date-fns";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

function Stats() {
  const [equityCurve, setEquityCurve] = useState<EquityPoint[]>([]);
  const [dailyPerformance, setDailyPerformance] = useState<DailyPerformance[]>([]);
  const [pnlByPair, setPnlByPair] = useState<PnLByPair[]>([]);
  const [winLoss, setWinLoss] = useState<WinLossDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState(30);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchStats();
  }, [selectedDays]);

  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);

      const [equity, daily, pnl, distribution] = await Promise.all([
        statsAPI.getEquityCurve(),
        statsAPI.getDailyPerformance(selectedDays),
        statsAPI.getPnLByPair(),
        statsAPI.getWinLossDistribution(),
      ]);

      setEquityCurve(equity);
      setDailyPerformance(daily);
      setPnlByPair(pnl);
      setWinLoss(distribution);
    } catch (err) {
      setError("Failed to load statistics. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDateRangeFilter = async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      const stats = await statsAPI.getStatsByDateRange(
        format(startDate, "yyyy-MM-dd"),
        format(endDate, "yyyy-MM-dd")
      );
      
      console.log("Filtered stats:", stats);
      alert(
        `Stats from ${format(startDate, "MMM dd")} to ${format(endDate, "MMM dd")}:\n` +
        `Win Rate: ${stats.win_rate.toFixed(1)}%\n` +
        `Total Profit: $${stats.total_profit.toFixed(2)}\n` +
        `Trades: ${stats.total_trades}`
      );
    } catch (err) {
      setError("Failed to filter stats by date range.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#10b981", "#ef4444"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trading Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive performance metrics and insights</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex gap-2">
              {[7, 14, 30, 60, 90].map((days) => (
                <Button
                  key={days}
                  variant={selectedDays === days ? "default" : "outline"}
                  onClick={() => setSelectedDays(days)}
                  size="sm"
                >
                  {days}D
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    Start: {startDate ? format(startDate, "MMM dd") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    End: {endDate ? format(endDate, "MMM dd") : "Select"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                </PopoverContent>
              </Popover>

              <Button
                onClick={handleDateRangeFilter}
                disabled={!startDate || !endDate}
                size="sm"
              >
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="equity">Equity Curve</TabsTrigger>
          <TabsTrigger value="daily">Daily Performance</TabsTrigger>
          <TabsTrigger value="pairs">By Pair</TabsTrigger>
          <TabsTrigger value="distribution">Win/Loss</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Equity Curve Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Equity Growth</CardTitle>
                <CardDescription>Account balance over time</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 bg-gray-100 rounded animate-pulse" />
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={equityCurve}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="#888" style={{ fontSize: "12px" }} />
                      <YAxis stroke="#888" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                        formatter={(value) => `$${value.toFixed(2)}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Win/Loss Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Win/Loss Ratio</CardTitle>
                <CardDescription>Trade outcome distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 bg-gray-100 rounded animate-pulse" />
                ) : winLoss ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Wins", value: winLoss.wins },
                          { name: "Losses", value: winLoss.losses },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* Stats Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {winLoss ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Winning Trades</p>
                    <p className="text-2xl font-bold text-green-600">{winLoss.wins}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Losing Trades</p>
                    <p className="text-2xl font-bold text-red-600">{winLoss.losses}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Win Rate</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {winLoss.win_percentage.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Trades</p>
                    <p className="text-2xl font-bold">{winLoss.wins + winLoss.losses}</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equity Curve Tab */}
        <TabsContent value="equity">
          <Card>
            <CardHeader>
              <CardTitle>Equity Curve</CardTitle>
              <CardDescription>Account balance progression over all closed trades</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-96 bg-gray-100 rounded animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={equityCurve}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                      formatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Account Balance"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Performance Tab */}
        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle>Daily Performance</CardTitle>
              <CardDescription>Daily P&L for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-96 bg-gray-100 rounded animate-pulse" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dailyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                      formatter={(value) => [
                        `$${Number(value).toFixed(2)}`,
                        "Profit/Loss",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="profit"
                      fill="#3b82f6"
                      name="Daily P&L"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Pair Tab */}
        <TabsContent value="pairs">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Pair</CardTitle>
              <CardDescription>Win rate and total P&L for each trading pair</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {pnlByPair.map((pair) => {
                    const total = pair.wins + pair.losses;
                    const winRate = total > 0 ? (pair.wins / total) * 100 : 0;
                    const isProfit = pair.total_pnl > 0;

                    return (
                      <div key={pair.pair} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-lg">{pair.pair}</h4>
                          <div className="flex items-center gap-2">
                            {isProfit ? (
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-600" />
                            )}
                            <span
                              className={`text-lg font-bold ${
                                isProfit ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              ${pair.total_pnl.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Wins</p>
                            <p className="text-xl font-bold text-green-600">{pair.wins}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Losses</p>
                            <p className="text-xl font-bold text-red-600">{pair.losses}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Win Rate</p>
                            <p className="text-xl font-bold text-blue-600">
                              {winRate.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Win/Loss Distribution</CardTitle>
                <CardDescription>Pie chart of all trade outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-96 bg-gray-100 rounded animate-pulse" />
                ) : winLoss ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Wins", value: winLoss.wins },
                          { name: "Losses", value: winLoss.losses },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {winLoss ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Trades</p>
                      <p className="text-3xl font-bold">
                        {winLoss.wins + winLoss.losses}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Winning Trades</p>
                      <p className="text-3xl font-bold text-green-600">{winLoss.wins}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Losing Trades</p>
                      <p className="text-3xl font-bold text-red-600">{winLoss.losses}</p>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600">Win Rate</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {winLoss.win_percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Stats;
