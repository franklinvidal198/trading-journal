
import { Trade } from "../../../Frontend/src/lib/api";
import { Badge } from "../../../Frontend/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../Frontend/src/components/ui/table";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TradesTableProps {
	trades: Trade[];
}

export default function TradesTable({ trades }: TradesTableProps) {
	if (!trades || trades.length === 0) return (
		<div className="text-center py-8 text-muted-foreground">No trades available yet.</div>
	);

	const formatPrice = (price: number | undefined) => {
		if (!price) return "-";
		return `$${parseFloat(String(price)).toFixed(5)}`;
	};

	const formatDate = (date: string | undefined) => {
		if (!date) return "-";
		return new Date(date).toLocaleDateString();
	};

	return (
		<div className="overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Pair</TableHead>
						<TableHead>Direction</TableHead>
						<TableHead className="text-right">Entry</TableHead>
						<TableHead className="text-right">Exit</TableHead>
						<TableHead className="text-right">P&L</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Opened</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{trades.map((trade) => {
						const isProfit = trade.result_usd && trade.result_usd > 0;
						return (
							<TableRow key={trade.id}>
								<TableCell className="font-medium">{trade.pair}</TableCell>
								<TableCell>
									<Badge variant={trade.direction === "BUY" ? "default" : "secondary"}>
										{trade.direction === "BUY" ? (
											<><TrendingUp className="h-3 w-3 mr-1" /> BUY</>
										) : (
											<><TrendingDown className="h-3 w-3 mr-1" /> SELL</>
										)}
									</Badge>
								</TableCell>
								<TableCell className="text-right">{formatPrice(trade.entry_price)}</TableCell>
								<TableCell className="text-right">{formatPrice(trade.exit_price)}</TableCell>
								<TableCell className={`text-right font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
									{trade.result_usd ? `$${trade.result_usd.toFixed(2)}` : "-"}
								</TableCell>
								<TableCell>
									<Badge variant={trade.status === "CLOSED" ? "outline" : "default"}>
										{trade.status}
									</Badge>
								</TableCell>
								<TableCell className="text-sm">{formatDate(trade.opened_at)}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
