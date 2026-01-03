import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const monthlyData = [
  { month: 'Jan', profit: 450, trades: 12, winRate: 58 },
  { month: 'Feb', profit: 620, trades: 15, winRate: 62 },
  { month: 'Mar', profit: 380, trades: 10, winRate: 55 },
]

const pairData = [
  { name: 'EUR/USD', value: 45, profit: 680 },
  { name: 'GBP/USD', value: 30, profit: 450 },
  { name: 'USD/JPY', value: 15, profit: 220 },
  { name: 'AUD/USD', value: 10, profit: 150 },
]

const weeklyData = [
  { week: 'W1', profit: 120, loss: 50 },
  { week: 'W2', profit: 180, loss: 30 },
  { week: 'W3', profit: 95, loss: 40 },
  { week: 'W4', profit: 205, loss: 45 },
]

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState('2024-01')
  const [exportFormat, setExportFormat] = useState('pdf')

  const handleExport = (format: string) => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Analyze your trading performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01">January 2024</SelectItem>
              <SelectItem value="2024-02">February 2024</SelectItem>
              <SelectItem value="2024-03">March 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => handleExport('pdf')}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleExport('csv')}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$1,450</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from previous month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">37</div>
            <p className="text-xs text-muted-foreground mt-1">12 winning, 25 losing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">61.5%</div>
            <Badge className="mt-2 bg-green-100 text-green-800">Above Target</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$39.19</div>
            <p className="text-xs text-muted-foreground mt-1">Per trade</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly">Monthly Performance</TabsTrigger>
          <TabsTrigger value="pairs">Pair Distribution</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Results</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit Trend</CardTitle>
              <CardDescription>Monthly profit over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" name="Profit ($)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Win Rate Trend</CardTitle>
              <CardDescription>Win rate percentage by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="winRate" fill="#3b82f6" name="Win Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pairs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit by Currency Pair</CardTitle>
              <CardDescription>Distribution of trades across pairs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pairData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pairData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Pairs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pairData.map(pair => (
                  <div key={pair.name} className="flex items-center justify-between">
                    <div className="font-medium">{pair.name}</div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${pair.profit}</p>
                      <p className="text-xs text-muted-foreground">{pair.value}% of trades</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Profit/Loss</CardTitle>
              <CardDescription>Weekly performance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="profit" fill="#10b981" name="Profit" />
                  <Bar dataKey="loss" fill="#ef4444" name="Loss" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Best Trade</p>
              <p className="text-2xl font-bold text-green-600">+$250</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Worst Trade</p>
              <p className="text-2xl font-bold text-red-600">-$150</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Avg Win</p>
              <p className="text-2xl font-bold">+$65</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Avg Loss</p>
              <p className="text-2xl font-bold">-$42</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Largest Drawdown</p>
              <p className="text-2xl font-bold">-$380</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Profit Factor</p>
              <p className="text-2xl font-bold">2.15</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Winning Days</p>
              <p className="text-2xl font-bold">18</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Losing Days</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
