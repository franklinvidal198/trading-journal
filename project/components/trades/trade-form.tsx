import { useState } from "react";
import { toast } from "sonner";
import { tradesAPI, Trade } from "../../../Frontend/src/lib/api";
import { Button } from "../../../Frontend/src/components/ui/button";
import { Input } from "../../../Frontend/src/components/ui/input";
import { Label } from "../../../Frontend/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../Frontend/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../Frontend/src/components/ui/select";
import { Textarea } from "../../../Frontend/src/components/ui/textarea";
import { AlertCircle } from "lucide-react";

const initialForm: Partial<Trade> = {
	pair: "",
	direction: "BUY",
	entry_price: 0,
	exit_price: undefined,
	stop_loss: 0,
	take_profit: 0,
	position_size: 0,
	notes: "",
	screenshot_url: "",
};

interface FormErrors {
	[key: string]: string;
}

export default function TradeForm({ onSuccess }: { onSuccess?: () => void }) {
	const [form, setForm] = useState<Partial<Trade>>(initialForm);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [validationErrors, setValidationErrors] = useState<FormErrors>({});

	function validateForm(): boolean {
		const errors: FormErrors = {};

		if (!form.pair || form.pair.trim() === "") {
			errors.pair = "Pair is required";
		}
		if (!form.entry_price || form.entry_price <= 0) {
			errors.entry_price = "Entry price must be greater than 0";
		}
		if (!form.stop_loss || form.stop_loss <= 0) {
			errors.stop_loss = "Stop loss must be greater than 0";
		}
		if (!form.take_profit || form.take_profit <= 0) {
			errors.take_profit = "Take profit must be greater than 0";
		}
		if (!form.position_size || form.position_size <= 0) {
			errors.position_size = "Position size must be greater than 0";
		}

		// Validate logical trade structure
		if (form.direction === "BUY") {
			if (form.entry_price && form.stop_loss && form.entry_price <= form.stop_loss) {
				errors.stop_loss = "Stop loss must be below entry price for BUY trades";
			}
			if (form.entry_price && form.take_profit && form.entry_price >= form.take_profit) {
				errors.take_profit = "Take profit must be above entry price for BUY trades";
			}
		} else {
			if (form.entry_price && form.stop_loss && form.entry_price >= form.stop_loss) {
				errors.stop_loss = "Stop loss must be above entry price for SELL trades";
			}
			if (form.entry_price && form.take_profit && form.entry_price <= form.take_profit) {
				errors.take_profit = "Take profit must be below entry price for SELL trades";
			}
		}

		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
		const { name, value } = e.target;
		
		// Convert numeric fields to numbers
		let finalValue: any = value;
		if (["entry_price", "exit_price", "stop_loss", "take_profit", "position_size"].includes(name)) {
			finalValue = value === "" ? 0 : parseFloat(value);
		}

		setForm((prev) => ({ ...prev, [name]: finalValue }));
		
		// Clear validation error for this field when user starts typing
		if (validationErrors[name]) {
			setValidationErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		
		// Validate form before submission
		if (!validateForm()) {
			setError("Please fix the validation errors below");
			return;
		}

		setLoading(true);
		setError("");
		try {
			await tradesAPI.createTrade(form);
			setForm(initialForm);
			setValidationErrors({});
			if (onSuccess) onSuccess();
		} catch (err: any) {
			const errorMessage = err?.response?.data?.detail || err?.message || "Failed to create trade.";
			setError(errorMessage);
			toast.error(errorMessage);
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
					{error && (
						<div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md border border-destructive/30">
							<AlertCircle className="h-4 w-4 flex-shrink-0" />
							<span className="text-sm">{error}</span>
						</div>
					)}

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="pair">Pair <span className="text-destructive">*</span></Label>
							<Input 
								id="pair"
								name="pair" 
								value={form.pair || ""} 
								onChange={handleChange} 
								placeholder="EUR/USD" 
								className={validationErrors.pair ? "border-destructive" : ""}
							/>
							{validationErrors.pair && (
								<p className="text-xs text-destructive">{validationErrors.pair}</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="direction">Direction <span className="text-destructive">*</span></Label>
							<select 
								id="direction"
								name="direction" 
								value={form.direction || "BUY"} 
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
							<Label htmlFor="entry_price">Entry Price <span className="text-destructive">*</span></Label>
							<Input 
								id="entry_price"
								name="entry_price" 
								type="number" 
								step="0.00001"
								value={form.entry_price === 0 ? "" : form.entry_price || ""} 
								onChange={handleChange} 
								placeholder="1.0500" 
								className={validationErrors.entry_price ? "border-destructive" : ""}
							/>
							{validationErrors.entry_price && (
								<p className="text-xs text-destructive">{validationErrors.entry_price}</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="exit_price">Exit Price (Optional)</Label>
							<Input 
								id="exit_price"
								name="exit_price" 
								type="number" 
								step="0.00001"
								value={form.exit_price ? form.exit_price : ""} 
								onChange={handleChange} 
								placeholder="1.0550" 
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="stop_loss">Stop Loss <span className="text-destructive">*</span></Label>
							<Input 
								id="stop_loss"
								name="stop_loss" 
								type="number" 
								step="0.00001"
								value={form.stop_loss === 0 ? "" : form.stop_loss || ""} 
								onChange={handleChange} 
								placeholder="1.0450" 
								className={validationErrors.stop_loss ? "border-destructive" : ""}
							/>
							{validationErrors.stop_loss && (
								<p className="text-xs text-destructive">{validationErrors.stop_loss}</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="take_profit">Take Profit <span className="text-destructive">*</span></Label>
							<Input 
								id="take_profit"
								name="take_profit" 
								type="number" 
								step="0.00001"
								value={form.take_profit === 0 ? "" : form.take_profit || ""} 
								onChange={handleChange} 
								placeholder="1.0600" 
								className={validationErrors.take_profit ? "border-destructive" : ""}
							/>
							{validationErrors.take_profit && (
								<p className="text-xs text-destructive">{validationErrors.take_profit}</p>
							)}
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="position_size">Position Size <span className="text-destructive">*</span></Label>
						<Input 
							id="position_size"
							name="position_size" 
							type="number" 
							step="0.01"
							value={form.position_size === 0 ? "" : form.position_size || ""} 
							onChange={handleChange} 
							placeholder="1.0" 
							className={validationErrors.position_size ? "border-destructive" : ""}
						/>
						{validationErrors.position_size && (
							<p className="text-xs text-destructive">{validationErrors.position_size}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="notes">Notes (Optional)</Label>
						<Textarea 
							id="notes"
							name="notes" 
							value={form.notes || ""} 
							onChange={handleChange} 
							placeholder="Any trade notes..." 
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="screenshot_url">Screenshot URL (Optional)</Label>
						<Input 
							id="screenshot_url"
							name="screenshot_url" 
							type="url"
							value={form.screenshot_url || ""} 
							onChange={handleChange} 
							placeholder="https://..." 
						/>
					</div>

					<Button 
						type="submit" 
						disabled={loading || Object.keys(validationErrors).length > 0} 
						className="w-full"
					>
						{loading ? "Saving..." : "Save Trade"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
