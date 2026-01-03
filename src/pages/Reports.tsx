import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { reportsAPI } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function Reports() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [pairStats, setPairStats] = useState<any>(null)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const [summaryData, pairData] = await Promise.all([
        reportsAPI.getSummary(),
        reportsAPI.getPairStats()
      ])
      setSummary(summaryData)
      setPairStats(pairData)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      toast({
        title: 'Error',
        description: 'Failed to load report data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  const pairChartData = pairStats ? Object.entries(pairStats).map(([pair, data]: any) => ({
    name: pair,
    value: data.win_rate || 0,
    profit: data.total_profit || 0
  })) : []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Analyze your trading performance</p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_trades}</div>
              <p className="text-xs text-muted-foreground">
                {summary.closed_trades} closed, {summary.open_trades} open
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.win_rate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.win_rate?.toFixed(1)}%
              </div>
              <Badge variant={summary.win_rate >= 50 ? "default" : "destructive"} className="mt-2">
                {summary.win_rate >= 50 ? 'Positive' : 'Negative'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit/Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${summary.total_profit?.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg: ${summary.average_profit?.toFixed(2)} per trade
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.roi?.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Return on investment</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="pair" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pair">By Pair</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="pair" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Currency Pair</CardTitle>
              <CardDescription>Win rate and profit by trading pair</CardDescription>
            </CardHeader>
            <CardContent>
              {pairChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pairChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, value}) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pairChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No pair data available
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pairStats && Object.entries(pairStats).map(([pair, data]: any) => (
              <Card key={pair}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{pair}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Trades</p>
                    <p className="text-2xl font-bold">{data.total_trades}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <p className={`text-lg font-semibold ${data.win_rate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.win_rate?.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Profit/Loss</p>
                    <p className={`text-lg font-semibold ${data.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${data.total_profit?.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Trading Performance</CardTitle>
              <CardDescription>Your trading metrics and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Closed Trades</p>
                    <p className="text-3xl font-bold">{summary?.closed_trades}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Open Trades</p>
                    <p className="text-3xl font-bold">{summary?.open_trades}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
