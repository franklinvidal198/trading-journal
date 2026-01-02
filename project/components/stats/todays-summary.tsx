import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../Frontend/src/components/ui/card";
import { TrendingUp, TrendingDown, Target } from "lucide-react";

interface Stats {
  total_trades?: number;
  total_profit?: number;
  win_rate?: number;
  daily_profit?: number;
}

interface TodaysSummaryProps {
  stats: Stats | null;
}

export default function TodaysSummary({ stats }: TodaysSummaryProps) {
  const dailyProfit = stats?.daily_profit || 0;
  const isPositive = dailyProfit >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Today's Summary
        </CardTitle>
        <CardDescription>Your trading performance today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Daily P&L</p>
          <div className={`text-3xl font-bold flex items-center gap-2 ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
            ${dailyProfit.toFixed(2)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Trades Today</p>
            <p className="text-2xl font-semibold text-foreground">{stats?.total_trades ?? "-"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Win Rate</p>
            <p className="text-2xl font-semibold text-foreground">{stats?.win_rate !== undefined ? `${stats.win_rate.toFixed(1)}%` : "-"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
