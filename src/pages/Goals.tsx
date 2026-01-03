import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Plus, Trash2, Target, Flame, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { goalsAPI, TradingGoal, TradeStreak } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

export default function Goals() {
  const { toast } = useToast()
  const [goals, setGoals] = useState<TradingGoal[]>([])
  const [streaks, setStreaks] = useState<TradeStreak[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [newGoal, setNewGoal] = useState({
    goal_type: 'WIN_RATE',
    period: 'MONTHLY',
    target_value: 60,
    current_value: 0
  })

  // Fetch goals and streaks on mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [goalsData, streaksData] = await Promise.all([
        goalsAPI.getGoals({ limit: 50 }),
        goalsAPI.getStreaks({ limit: 50 })
      ])
      setGoals(goalsData.data)
      setStreaks(streaksData.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load goals and streaks',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddGoal = async () => {
    if (!newGoal.goal_type || !newGoal.period || newGoal.target_value <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    try {
      setSaving(true)
      const createdGoal = await goalsAPI.createGoal({
        goal_type: newGoal.goal_type,
        period: newGoal.period,
        target_value: newGoal.target_value,
        current_value: newGoal.current_value || 0
      })
      
      setGoals([createdGoal, ...goals])
      setNewGoal({
        goal_type: 'WIN_RATE',
        period: 'MONTHLY',
        target_value: 60,
        current_value: 0
      })
      setDialogOpen(false)
      
      toast({
        title: 'Success',
        description: 'Goal created successfully'
      })
    } catch (error) {
      console.error('Failed to create goal:', error)
      toast({
        title: 'Error',
        description: 'Failed to create goal',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteGoal = async (id: number) => {
    try {
      await goalsAPI.deleteGoal(id)
      setGoals(goals.filter(g => g.id !== id))
      toast({
        title: 'Success',
        description: 'Goal deleted successfully'
      })
    } catch (error) {
      console.error('Failed to delete goal:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete goal',
        variant: 'destructive'
      })
    }
  }

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'WIN_RATE': return 'Win Rate'
      case 'PNL': return 'Profit & Loss'
      case 'TRADES': return 'Number of Trades'
      default: return type
    }
  }

  const getGoalUnit = (type: string) => {
    switch (type) {
      case 'WIN_RATE': return '%'
      case 'PNL': return '$'
      case 'TRADES': return ''
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading goals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Goals</h1>
          <p className="text-muted-foreground">Set and track your trading objectives</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a trading goal to track your progress
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Goal Type</Label>
                <Select value={newGoal.goal_type} onValueChange={(value) => setNewGoal({...newGoal, goal_type: value})}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WIN_RATE">Win Rate (%)</SelectItem>
                    <SelectItem value="PNL">Profit & Loss ($)</SelectItem>
                    <SelectItem value="TRADES">Number of Trades</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Select value={newGoal.period} onValueChange={(value) => setNewGoal({...newGoal, period: value})}>
                  <SelectTrigger id="period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Target Value</Label>
                <Input 
                  id="target"
                  type="number"
                  placeholder="Enter target value"
                  value={newGoal.target_value}
                  onChange={(e) => setNewGoal({...newGoal, target_value: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddGoal} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Goal'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Section */}
      <ScrollArea className="h-[500px] rounded-lg border">
        <div className="space-y-4 p-4">
          {goals.length > 0 ? (
            goals.map(goal => (
              <Card key={goal.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <CardTitle className="text-lg">
                          {getGoalTypeLabel(goal.goal_type)} - {goal.period}
                        </CardTitle>
                        <Badge variant={goal.is_on_track ? "default" : "destructive"}>
                          {goal.is_on_track ? 'On Track' : 'Behind'}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {goal.current_value}{getGoalUnit(goal.goal_type)} / {goal.target_value}{getGoalUnit(goal.goal_type)}
                      </span>
                    </div>
                    <Progress value={goal.progress_percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                      {goal.progress_percentage.toFixed(1)}% complete
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No goals yet. Create your first goal!</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Streaks Section */}
      {streaks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Trading Streaks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {streaks.map(streak => (
              <Card key={streak.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flame className={`w-5 h-5 ${streak.current_count > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                    {streak.streak_type}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Streak</p>
                    <p className="text-3xl font-bold text-primary">{streak.current_count}</p>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-xs text-muted-foreground">Best Streak</p>
                    <p className="text-2xl font-bold">{streak.best_count}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
