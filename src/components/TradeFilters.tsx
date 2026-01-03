import { useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X } from 'lucide-react'

export interface TradeFilterValues {
  type?: 'BUY' | 'SELL'
  pair?: string
  status?: 'OPEN' | 'CLOSED' | 'PENDING'
  pnlRange?: [number, number]
  winRateRange?: [number, number]
}

interface TradeFiltersProps {
  onFiltersChange: (filters: TradeFilterValues) => void
  onClear?: () => void
}

const currencyPairs = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'AUD/USD',
  'USD/CAD',
  'NZD/USD',
  'EUR/GBP',
  'EUR/JPY'
]

export function TradeFilters({ onFiltersChange, onClear }: TradeFiltersProps) {
  const [filters, setFilters] = useState<TradeFilterValues>({})
  const [pnlRange, setPnlRange] = useState<[number, number]>([0, 1000])
  const [winRateRange, setWinRateRange] = useState<[number, number]>([0, 100])

  const handleTypeChange = (type: 'BUY' | 'SELL') => {
    const newFilters = { ...filters, type: filters.type === type ? undefined : type }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handlePairChange = (pair: string) => {
    const newFilters = { ...filters, pair: filters.pair === pair ? undefined : pair }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleStatusChange = (status: 'OPEN' | 'CLOSED' | 'PENDING') => {
    const newFilters = { ...filters, status: filters.status === status ? undefined : status }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handlePnlRangeChange = (value: [number, number]) => {
    setPnlRange(value)
    const newFilters = { ...filters, pnlRange: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleWinRateChange = (value: [number, number]) => {
    setWinRateRange(value)
    const newFilters = { ...filters, winRateRange: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleClear = () => {
    setFilters({})
    setPnlRange([0, 1000])
    setWinRateRange([0, 100])
    onClear?.()
  }

  const isFiltered = Object.values(filters).some(v => v !== undefined) || 
                    pnlRange[0] !== 0 || pnlRange[1] !== 1000 ||
                    winRateRange[0] !== 0 || winRateRange[1] !== 100

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Filters</CardTitle>
            <CardDescription>Refine your trade search</CardDescription>
          </div>
          {isFiltered && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClear}
              className="gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Trade Type Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Trade Type</Label>
          <RadioGroup value={filters.type || ''} onValueChange={(v) => handleTypeChange(v as any)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="BUY" id="type-buy" />
              <Label htmlFor="type-buy" className="font-normal cursor-pointer">
                Buy Orders
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="SELL" id="type-sell" />
              <Label htmlFor="type-sell" className="font-normal cursor-pointer">
                Sell Orders
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Currency Pair Filter */}
        <div className="space-y-2">
          <Label htmlFor="pair" className="text-sm font-semibold">Currency Pair</Label>
          <Select value={filters.pair || ''} onValueChange={(v) => handlePairChange(v)}>
            <SelectTrigger id="pair">
              <SelectValue placeholder="Select a pair" />
            </SelectTrigger>
            <SelectContent>
              {currencyPairs.map(pair => (
                <SelectItem key={pair} value={pair}>
                  {pair}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Status</Label>
          <RadioGroup value={filters.status || ''} onValueChange={(v) => handleStatusChange(v as any)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="OPEN" id="status-open" />
              <Label htmlFor="status-open" className="font-normal cursor-pointer">
                Open Trades
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CLOSED" id="status-closed" />
              <Label htmlFor="status-closed" className="font-normal cursor-pointer">
                Closed Trades
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PENDING" id="status-pending" />
              <Label htmlFor="status-pending" className="font-normal cursor-pointer">
                Pending
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* P&L Range Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">P&L Range</Label>
          <div className="space-y-2">
            <Slider 
              min={-1000}
              max={1000}
              step={50}
              value={pnlRange}
              onValueChange={handlePnlRangeChange}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${pnlRange[0]}</span>
              <span>${pnlRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Win Rate Range Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Win Rate Range</Label>
          <div className="space-y-2">
            <Slider 
              min={0}
              max={100}
              step={5}
              value={winRateRange}
              onValueChange={handleWinRateChange}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{winRateRange[0]}%</span>
              <span>{winRateRange[1]}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
