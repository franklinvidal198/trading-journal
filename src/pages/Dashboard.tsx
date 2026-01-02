import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import StatsCards from "../../../project/components/stats/stats-cards";
import TradesTable from "../../../project/components/trades/trades-table";
import TradeForm from "../../../project/components/trades/trade-form";
import TodaysSummary from "../../../project/components/stats/todays-summary";
import { statsAPI, tradesAPI } from "../lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, Target, Zap, Plus, Info, History, Award } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<import("../lib/api").TradingStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<import("../lib/api").Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openTradeDialog, setOpenTradeDialog] = useState(false);
  const [showTradeHistory, setShowTradeHistory] = useState(false);

  // Calculate key metrics for alerts and progress
  const winRate = stats ? Math.round((stats.total_trades > 0 ? (stats.winning_trades / stats.total_trades) * 100 : 0)) : 0;
  const dailyProfitGoal = 100; // Example goal
  const dailyProfit = stats?.daily_profit || 0;
  const profitProgress = Math.min((dailyProfit / dailyProfitGoal) * 100, 100);
  const hasHighDrawdown = stats?.max_loss && stats.max_loss > 200;

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const statsData = await statsAPI.getSummary();
      setStats(statsData);
      const tradesData = await tradesAPI.getTrades({ limit: 3 });
      setRecentTrades(tradesData);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Phase 9: Alert user when daily profit goal is achieved
  useEffect(() => {
    if (stats && profitProgress >= 100 && !loading) {
      toast.success("🎉 Daily profit goal achieved!", {
        description: "You've reached your daily target. Great trading!",
      });
    }
  }, [profitProgress, loading, stats]);

  return (
    <div className="space-y-8">
      {/* Loading/Error States */}
      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading dashboard...</div>
      )}
      
      {/* Phase 1: Performance Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {winRate < 50 && !loading && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Low Win Rate Alert</AlertTitle>
            <AlertDescription>
              Your win rate is {winRate}%, which is below the recommended 50%. Consider reviewing your trading strategy.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {hasHighDrawdown && !loading && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Alert variant="default" className="border-orange-500 bg-orange-50">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-900">Drawdown Warning</AlertTitle>
            <AlertDescription className="text-orange-800">
              Your maximum drawdown is ${stats?.max_loss}. Be cautious with position sizing.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Phase 1: Daily Profit Progress */}
      {!loading && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={profitProgress >= 100 ? "border-success/50 bg-success/5" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Daily Profit Goal
                </div>
                {profitProgress >= 100 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    className="flex items-center gap-1 text-success"
                  >
                    <Award className="h-5 w-5" />
                    <span className="text-sm font-semibold">Goal Achieved!</span>
                  </motion.div>
                )}
              </CardTitle>
              <CardDescription>Progress towards your daily profit target</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">${dailyProfit.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">${dailyProfitGoal.toFixed(2)}</span>
                </div>
                <Progress value={Math.min(profitProgress, 100)} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground">
                {profitProgress >= 100 
                  ? "✓ Daily goal complete - great job!" 
                  : `${profitProgress.toFixed(0)}% of daily goal achieved`}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards Placeholder - now uses modular component */}
      <StatsCards />

      {/* Phase 1: Win Rate Progress */}
      {!loading && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Win Rate Tracker
                </div>
                {/* Phase 4: Popover for win rate details */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Win Rate Analysis</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Current Rate:</strong> {winRate}%</p>
                        <p><strong>Target Rate:</strong> 50%</p>
                        <p><strong>Status:</strong> {winRate >= 50 ? "✓ Above target" : "✗ Below target"}</p>
                        <p className="text-muted-foreground">
                          {winRate >= 50 
                            ? "Excellent! You're trading with a profitable edge." 
                            : "Consider reviewing your entry/exit strategy."}
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </CardTitle>
              <CardDescription>Your trading performance this period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{winRate}%</span>
                  <span className="text-sm text-muted-foreground">50% Target</span>
                </div>
                <Progress 
                  value={Math.min(winRate, 100)} 
                  className="h-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {/* Phase 4: HoverCard for win/loss stats */}
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="cursor-pointer hover:opacity-80 transition">
                      <p className="text-muted-foreground">Wins</p>
                      <p className="font-semibold text-green-600">{stats?.winning_trades || 0}</p>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Winning Trades</h4>
                      <p className="text-sm text-muted-foreground">
                        You have {stats?.winning_trades || 0} profitable trades in your record.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="cursor-pointer hover:opacity-80 transition">
                      <p className="text-muted-foreground">Losses</p>
                      <p className="font-semibold text-red-600">{(stats?.total_trades || 0) - (stats?.winning_trades || 0)}</p>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Losing Trades</h4>
                      <p className="text-sm text-muted-foreground">
                        You have {(stats?.total_trades || 0) - (stats?.winning_trades || 0)} losing trades. This is a normal part of trading.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              {/* Phase 4: Quick action buttons */}
              <div className="flex gap-2 pt-4">
                <Dialog open={openTradeDialog} onOpenChange={setOpenTradeDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      New Trade
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record a New Trade</DialogTitle>
                      <DialogDescription>
                        Enter the details of your new trade below.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <TradeForm onSuccess={() => { fetchDashboardData(); setOpenTradeDialog(false); }} />
                    </div>
                  </DialogContent>
                </Dialog>
                <Drawer open={showTradeHistory} onOpenChange={setShowTradeHistory}>
                  <DrawerTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-1">
                      <History className="h-4 w-4 mr-2" />
                      History
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Trade History</DrawerTitle>
                      <DrawerDescription>
                        Your recent trading activity
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 max-h-96 overflow-auto">
                      {recentTrades.length > 0 ? (
                        <div className="space-y-2">
                          {recentTrades.map((trade) => (
                            <div key={trade.id} className="text-sm border-b pb-2">
                              <p className="font-medium">{trade.pair}</p>
                              <p className="text-muted-foreground">
                                Entry: ${trade.entry_price} | Exit: ${trade.exit_price || 'Open'}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No recent trades</p>
                      )}
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Trades - modular table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>Your last 3 trades</CardDescription>
            </CardHeader>
            <CardContent>
              <TradesTable trades={recentTrades} />
            </CardContent>
          </Card>
        </div>
        {/* Quick Actions - modular form */}
        <div>
          <TradeForm onSuccess={fetchDashboardData} />
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TodaysSummary stats={stats} />
      </div>
    </div>
  );
}
