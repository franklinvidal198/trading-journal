import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Target,
  DollarSign,
  Activity,
  Calendar,
  Award,
  BarChart3,
  PieChart,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import PerformanceCalendar from "@/components/PerformanceCalendar";
import RunningPLV2 from "@/components/RunningPLV2";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import { statsAPI } from "@/lib/api";

// Remove hardcoded demo data. Fetch stats and equity curve from backend.

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [equityData, setEquityData] = useState([]);
  const [equityCurveV2, setEquityCurveV2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [riskTolerance, setRiskTolerance] = useState([50]);
  const [viewMode, setViewMode] = useState("detailed");

  useEffect(() => {
    async function fetchStatsData() {
      setLoading(true);
      setError("");
      try {
        const statsData = await statsAPI.getSummary();
        setStats(statsData);
        const equityCurve = await statsAPI.getEquityCurve();
        setEquityData(equityCurve);
        
        // Fetch institutional equity curve (Running P&L V2)
        // Use sensible default starting balance (50 for testing, 100000 for production)
        try {
          const startingBalance = 50; // Match our test seed data
          const equityCurveV2Data = await statsAPI.getEquityCurveV2(startingBalance);
          setEquityCurveV2(equityCurveV2Data);
        } catch (err) {
          console.warn("Could not fetch equity curve V2:", err);
        }
      } catch (err) {
        setError("Failed to load stats data.");
      } finally {
        setLoading(false);
      }
    }
    fetchStatsData();
  }, []);

  // Prepare pie chart data for win/loss distribution
  const pieData = stats ? [
    { name: "Wins", value: stats.winning_trades || 0, fill: "#10b981" },
    { name: "Losses", value: (stats.total_trades || 0) - (stats.winning_trades || 0), fill: "#ef4444" }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Loading/Error States */}
      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading statistics...</div>
      )}
      {error && (
        <div className="text-center py-8 text-destructive">{error}</div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Statistics</h1>
          <p className="text-muted-foreground">Analyze your trading performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="border-border/50">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm" className="border-border/50">
            Export Report
          </Button>
        </div>
      </div>

      {/* Phase 3: Multi-View Stats with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="pairs">By Pair</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0 }}
                >
                  <Card className="glass border-border/50 hover:glow-primary transition-smooth">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
                      <div className="h-8 w-8 bg-gradient-success rounded-lg flex items-center justify-center glow-success">
                        <DollarSign className="h-4 w-4 text-background" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">${stats.total_profit?.toFixed(2) ?? "-"}</div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card className="glass border-border/50 hover:glow-primary transition-smooth">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
                      <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center glow-primary">
                        <Target className="h-4 w-4 text-background" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{stats.win_rate ? `${stats.win_rate.toFixed(1)}%` : "-"}</div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card className="glass border-border/50 hover:glow-primary transition-smooth">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Avg R:R Ratio</CardTitle>
                      <div className="h-8 w-8 bg-gradient-accent rounded-lg flex items-center justify-center glow-accent">
                        <TrendingUp className="h-4 w-4 text-background" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{stats.avg_risk_reward?.toFixed(2) ?? "-"}</div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Card className="glass border-border/50 hover:glow-primary transition-smooth">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
                      <div className="h-8 w-8 bg-gradient-secondary rounded-lg flex items-center justify-center glow-secondary">
                        <Activity className="h-4 w-4 text-background" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{stats.total_trades ?? "-"}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </div>

          {/* Running P&L V2 - Institutional Cumulative Equity Curve */}
          {equityCurveV2 && (
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Running P&L (Cumulative Equity)
                </CardTitle>
                <CardDescription>
                  Real-time cumulative profit/loss progression with precision analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {equityCurveV2.curve.length > 0 ? (
                  <RunningPLV2 data={equityCurveV2} />
                ) : (
                  <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <p>No trades yet. Start trading to see your equity progression.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Phase 3: Accordion for Analytics Sections */}
          <Accordion type="single" collapsible className="w-full space-y-4">
            {/* Equity Curve Section */}
            <AccordionItem value="equity-curve" className="border border-border/50 rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Account Growth - Equity Curve
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <Card className="glass border-border/50">
                  <CardContent className="p-0">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={equityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="date" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="balance"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Win/Loss Distribution */}
            <AccordionItem value="win-loss" className="border border-border/50 rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-accent" />
                  Win/Loss Distribution
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <Card className="glass border-border/50">
                  <CardContent className="p-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Wins</p>
                        <p className="text-2xl font-bold text-success">{stats?.winning_trades}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Losses</p>
                        <p className="text-2xl font-bold text-destructive">{(stats?.total_trades || 0) - (stats?.winning_trades || 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>

            {/* Best & Worst Trades */}
            <AccordionItem value="best-worst" className="border border-border/50 rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-success" />
                  Best & Worst Trades
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="glass border-border/50">
                    <CardHeader>
                      <CardTitle className="text-green-600">Best Trade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-success">+$500.00</div>
                        <div className="text-sm text-muted-foreground">EURUSD - Buy</div>
                        <div className="text-xs text-muted-foreground">2024-01-15</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="glass border-border/50">
                    <CardHeader>
                      <CardTitle className="text-red-600">Worst Trade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-destructive">-$200.00</div>
                        <div className="text-sm text-muted-foreground">GBPUSD - Sell</div>
                        <div className="text-xs text-muted-foreground">2024-01-10</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PerformanceCalendar />
          </motion.div>
        </TabsContent>

        {/* Monthly Tab */}
        <TabsContent value="monthly">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <BarChart3 className="h-5 w-5 mr-2 text-accent" />
                Monthly Performance
              </CardTitle>
              <CardDescription>Monthly profit and trading activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar 
                      dataKey="profit" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Pair Tab */}
        <TabsContent value="pairs">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Trading Pair Analysis</CardTitle>
              <CardDescription>Performance breakdown by currency pair</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  Pair analytics coming soon...
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Strategy Comparison</CardTitle>
              <CardDescription>Compare performance across different trading strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  Strategy analysis coming soon...
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Tab */}
        <TabsContent value="risk">
          <div className="space-y-6">
            {/* Phase 8: Risk Metrics Cards */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Risk Metrics</CardTitle>
                <CardDescription>Detailed risk analysis and exposure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="glass border-border/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Max Drawdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">{stats?.max_loss ? `$${stats.max_loss.toFixed(2)}` : "-"}</div>
                    </CardContent>
                  </Card>

                  <Card className="glass border-border/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Profit Factor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">2.5</div>
                    </CardContent>
                  </Card>

                  <Card className="glass border-border/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Risk Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-accent">Medium</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Phase 8: Risk Tolerance Slider */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Risk Tolerance Settings</CardTitle>
                <CardDescription>Adjust your acceptable risk level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-foreground">Risk Tolerance</Label>
                    <span className="text-sm font-semibold text-accent">{riskTolerance[0]}%</span>
                  </div>
                  <Slider 
                    value={riskTolerance}
                    onValueChange={setRiskTolerance}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    {riskTolerance[0] <= 30 ? "Conservative - Low risk, steady growth" : 
                     riskTolerance[0] <= 60 ? "Moderate - Balanced risk and reward" : 
                     "Aggressive - High potential, higher volatility"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Phase 8: View Mode Radio Group */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Analytics View Mode</CardTitle>
                <CardDescription>Choose how to display your risk analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={viewMode} onValueChange={setViewMode} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="detailed" id="detailed" />
                    <Label htmlFor="detailed" className="cursor-pointer flex-1">
                      <div className="font-medium">Detailed View</div>
                      <p className="text-sm text-muted-foreground">See all metrics and breakdowns</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="summary" id="summary" />
                    <Label htmlFor="summary" className="cursor-pointer flex-1">
                      <div className="font-medium">Summary View</div>
                      <p className="text-sm text-muted-foreground">Focus on key metrics only</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="charts" id="charts" />
                    <Label htmlFor="charts" className="cursor-pointer flex-1">
                      <div className="font-medium">Charts View</div>
                      <p className="text-sm text-muted-foreground">Visualized data with trends</p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
