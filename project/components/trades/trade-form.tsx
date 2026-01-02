import { useState } from "react";
import { tradesAPI, Trade } from "../../../Frontend/src/lib/api";
import { Button } from "../../../Frontend/src/components/ui/button";
import { Input } from "../../../Frontend/src/components/ui/input";
import { Label } from "../../../Frontend/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../Frontend/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Frontend/src/components/ui/select";
import { Textarea } from "../../../Frontend/src/components/ui/textarea";

const initialForm: Partial<Trade> = {
	pair: "",
	direction: "BUY",
	entry_price: 0,
	exit_price: undefined,
	stop_loss: 0,
	take_profit: 0,
	position_size: 0,
	notes: "",
	screenshot: "",
};

export default function TradeForm({ onSuccess }: { onSuccess?: () => void }) {
	const [form, setForm] = useState<Partial<Trade>>(initialForm);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			await tradesAPI.createTrade(form);
			setForm(initialForm);
			if (onSuccess) onSuccess();
		} catch (err) {
			setError("Failed to create trade.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Add New Trade</CardTitle>
				<CardDescription>Record a new trade in your journal</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="pair">Pair</Label>
							<Input 
								id="pair"
								name="pair" 
								value={form.pair} 
								onChange={handleChange} 
								placeholder="EUR/USD" 
								required 
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="direction">Direction</Label>
							<select 
								id="direction"
								name="direction" 
								value={form.direction} 
								onChange={handleChange}
								className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
							>
								<option value="BUY">BUY</option>
								<option value="SELL">SELL</option>
							</select>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="entry_price">Entry Price</Label>
							<Input 
								id="entry_price"
								name="entry_price" 
								type="number" 
								step="0.00001"
								value={form.entry_price} 
								onChange={handleChange} 
								placeholder="1.0500" 
								required 
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="exit_price">Exit Price (Optional)</Label>
							<Input 
								id="exit_price"
								name="exit_price" 
								type="number" 
								step="0.00001"
								value={form.exit_price ?? ""} 
								onChange={handleChange} 
								placeholder="1.0550" 
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="stop_loss">Stop Loss</Label>
							<Input 
								id="stop_loss"
								name="stop_loss" 
								type="number" 
								step="0.00001"
								value={form.stop_loss} 
								onChange={handleChange} 
								placeholder="1.0450" 
								required 
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="take_profit">Take Profit</Label>
							<Input 
								id="take_profit"
								name="take_profit" 
								type="number" 
								step="0.00001"
								value={form.take_profit} 
								onChange={handleChange} 
								placeholder="1.0600" 
								required 
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="position_size">Position Size</Label>
						<Input 
							id="position_size"
							name="position_size" 
							type="number" 
							step="0.01"
							value={form.position_size} 
							onChange={handleChange} 
							placeholder="1.0" 
							required 
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="notes">Notes (Optional)</Label>
						<Textarea 
							id="notes"
							name="notes" 
							value={form.notes} 
							onChange={handleChange} 
							placeholder="Any trade notes..." 
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="screenshot">Screenshot URL (Optional)</Label>
						<Input 
							id="screenshot"
							name="screenshot" 
							value={form.screenshot} 
							onChange={handleChange} 
							placeholder="https://..." 
						/>
					</div>

					{error && <div className="text-sm text-destructive">{error}</div>}
					
					<Button type="submit" disabled={loading} className="w-full">
						{loading ? "Saving..." : "Save Trade"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
