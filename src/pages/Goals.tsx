import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Plus, Trash2, Target, Flame } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface Goal {
  id: string
  type: 'WIN_RATE' | 'PNL' | 'TRADES'
  period: 'MONTHLY' | 'QUARTERLY'
  targetValue: number
  currentValue: number
  unit: string
  createdAt: string
}

interface Streak {
  type: string
  count: number
  percentage: number
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      type: 'WIN_RATE',
      period: 'MONTHLY',
      targetValue: 60,
      currentValue: 58,
      unit: '%',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      type: 'PNL',
      period: 'MONTHLY',
      targetValue: 500,
      currentValue: 320,
      unit: '$',
      createdAt: '2024-01-15'
    },
    {
      id: '3',
      type: 'TRADES',
      period: 'MONTHLY',
      targetValue: 20,
      currentValue: 13,
      unit: 'trades',
      createdAt: '2024-01-15'
    }
  ])

  const [streaks] = useState<Streak[]>([
    { type: 'Consecutive Wins', count: 3, percentage: 100 },
    { type: 'Days Without Loss', count: 5, percentage: 100 },
    { type: 'Profitable Weeks', count: 2, percentage: 100 },
  ])

  const [newGoal, setNewGoal] = useState({
    type: 'WIN_RATE' as const,
    period: 'MONTHLY' as const,
    targetValue: 60
  })

  const [dialogOpen, setDialogOpen] = useState(false)

  const handleAddGoal = () => {
    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      currentValue: 0,
      unit: newGoal.type === 'WIN_RATE' ? '%' : newGoal.type === 'PNL' ? '$' : 'trades',
      createdAt: new Date().toISOString().split('T')[0]
    }
    setGoals([goal, ...goals])
    setNewGoal({
      type: 'WIN_RATE',
      period: 'MONTHLY',
      targetValue: 60
    })
    setDialogOpen(false)
  }

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id))
  }

  const getGoalLabel = (type: string) => {
    switch (type) {
      case 'WIN_RATE':
        return 'Win Rate Target'
      case 'PNL':
        return 'Profit Target'
      case 'TRADES':
        return 'Trade Count Target'
      default:
        return 'Goal'
    }
  }

  const getProgressPercentage = (goal: Goal) => {
    return Math.round((goal.currentValue / goal.targetValue) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals & Streaks</h1>
          <p className="text-muted-foreground">Track your trading goals and achievements</p>
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
              <DialogTitle>New Trading Goal</DialogTitle>
              <DialogDescription>
                Set a goal to keep yourself motivated and accountable
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Goal Type</Label>
                <RadioGroup value={newGoal.type} onValueChange={(value) => setNewGoal({...newGoal, type: value as any})}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="WIN_RATE" id="win-rate" />
                    <Label htmlFor="win-rate" className="font-normal">Win Rate (%)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PNL" id="pnl" />
                    <Label htmlFor="pnl" className="font-normal">Profit Target ($)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="TRADES" id="trades" />
                    <Label htmlFor="trades" className="font-normal">Number of Trades</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Time Period</Label>
                <Select value={newGoal.period} onValueChange={(value) => setNewGoal({...newGoal, period: value as any})}>
                  <SelectTrigger id="period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="target">Target Value: {newGoal.targetValue}</Label>
                <Slider 
                  id="target"
                  min={newGoal.type === 'WIN_RATE' ? 50 : 1}
                  max={newGoal.type === 'WIN_RATE' ? 100 : newGoal.type === 'PNL' ? 5000 : 100}
                  step={newGoal.type === 'WIN_RATE' ? 5 : 10}
                  value={[newGoal.targetValue]}
                  onValueChange={(value) => setNewGoal({...newGoal, targetValue: value[0]})}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddGoal}>
                  Create Goal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Goals */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Current Goals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map(goal => (
            <Card key={goal.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{getGoalLabel(goal.type)}</CardTitle>
                    <CardDescription className="text-xs mt-1">{goal.period}</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-red-500 hover:text-red-600 h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-2xl font-bold">
                      {goal.currentValue}{goal.unit}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      / {goal.targetValue}{goal.unit}
                    </span>
                  </div>
                  <Progress value={getProgressPercentage(goal)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {getProgressPercentage(goal)}% Complete
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Streaks */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Streaks
        </h2>
        <ScrollArea className="rounded-lg border">
          <div className="space-y-3 p-4">
            {streaks.map((streak, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Flame className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-semibold">{streak.type}</p>
                        <p className="text-2xl font-bold text-orange-500">{streak.count}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {streak.percentage}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Active Goals</p>
              <p className="text-3xl font-bold">{goals.length}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">On Track</p>
              <p className="text-3xl font-bold text-green-600">
                {goals.filter(g => getProgressPercentage(g) >= 80).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Average Progress</p>
              <p className="text-3xl font-bold">
                {Math.round(
                  goals.reduce((acc, g) => acc + getProgressPercentage(g), 0) / goals.length
                )}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
