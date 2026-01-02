import { useEffect, useState } from "react";
import { statsAPI, TradingStats } from "../../../Frontend/src/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../Frontend/src/components/ui/card";
import { TrendingUp, DollarSign, Target, Zap } from "lucide-react";

export default function StatsCards() {
	const [stats, setStats] = useState<TradingStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		async function fetchStats() {
			setLoading(true);
			setError("");
			try {
				const data = await statsAPI.getSummary();
				setStats(data);
			} catch (err) {
				setError("Failed to load trading statistics.");
			} finally {
				setLoading(false);
			}
		}
		fetchStats();
	}, []);

	if (loading) return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{[1, 2, 3, 4].map(i => (
				<Card key={i}>
					<CardHeader className="pb-2">
						<div className="h-4 bg-muted rounded w-1/2"></div>
					</CardHeader>
					<CardContent>
						<div className="h-8 bg-muted rounded w-1/3"></div>
					</CardContent>
				</Card>
			))}
		</div>
	);

	if (error) return <div className="text-destructive text-sm">{error}</div>;
	if (!stats) return <div className="text-muted-foreground">No statistics available.</div>;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{/* Total Profit Card */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Profit</CardTitle>
					<DollarSign className="h-4 w-4 text-success opacity-70" />
				</CardHeader>
				<CardContent>
					<div className={`text-2xl font-bold ${stats.total_profit >= 0 ? 'text-success' : 'text-destructive'}`}>
						${stats.total_profit.toFixed(2)}
					</div>
					<p className="text-xs text-muted-foreground">Total earnings</p>
				</CardContent>
			</Card>

			{/* Win Rate Card */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Win Rate</CardTitle>
					<Target className="h-4 w-4 text-primary opacity-70" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.win_rate.toFixed(1)}%</div>
					<p className="text-xs text-muted-foreground">Of closed trades</p>
				</CardContent>
			</Card>

			{/* Avg Risk/Reward Card */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Avg Risk/Reward</CardTitle>
					<Zap className="h-4 w-4 text-secondary opacity-70" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.avg_risk_reward.toFixed(2)}</div>
					<p className="text-xs text-muted-foreground">Risk to reward ratio</p>
				</CardContent>
			</Card>

			{/* Total Trades Card */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Total Trades</CardTitle>
					<TrendingUp className="h-4 w-4 text-accent opacity-70" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{stats.total_trades}</div>
					<p className="text-xs text-muted-foreground">
						{stats.winning_trades} wins, {stats.losing_trades} losses
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
