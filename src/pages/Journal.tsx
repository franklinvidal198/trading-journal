import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Calendar } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface JournalEntry {
  id: string
  tradeId: string
  pair: string
  type: 'ANALYSIS' | 'MISTAKE' | 'SUCCESS' | 'STRATEGY'
  title: string
  content: string
  createdAt: string
  date: string
}

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      tradeId: 'TRADE001',
      pair: 'EUR/USD',
      type: 'ANALYSIS',
      title: 'Post-Trade Analysis',
      content: 'Trade closed with 25 pips profit. Good risk-reward ratio maintained throughout.',
      createdAt: '2024-01-15',
      date: '2024-01-15'
    },
    {
      id: '2',
      tradeId: 'TRADE002',
      pair: 'GBP/USD',
      type: 'MISTAKE',
      title: 'Overtrading Issue',
      content: 'Entered too early without waiting for confirmation. Set strict entry rules.',
      createdAt: '2024-01-14',
      date: '2024-01-14'
    }
  ])

  const [newEntry, setNewEntry] = useState({
    pair: '',
    type: 'ANALYSIS' as const,
    title: '',
    content: ''
  })

  const [dialogOpen, setDialogOpen] = useState(false)

  const handleAddEntry = () => {
    if (newEntry.title && newEntry.content) {
      const entry: JournalEntry = {
        id: Date.now().toString(),
        tradeId: `TRADE${Date.now()}`,
        pair: newEntry.pair,
        type: newEntry.type,
        title: newEntry.title,
        content: newEntry.content,
        createdAt: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      }
      setEntries([entry, ...entries])
      setNewEntry({
        pair: '',
        type: 'ANALYSIS',
        title: '',
        content: ''
      })
      setDialogOpen(false)
    }
  }

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'MISTAKE':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'ANALYSIS':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'STRATEGY':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
          <p className="text-muted-foreground">Document and learn from your trades</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Journal Entry</DialogTitle>
              <DialogDescription>
                Document your trade analysis, mistakes, or successful patterns
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pair">Currency Pair</Label>
                  <Select value={newEntry.pair} onValueChange={(value) => setNewEntry({...newEntry, pair: value})}>
                    <SelectTrigger id="pair">
                      <SelectValue placeholder="Select pair" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR/USD">EUR/USD</SelectItem>
                      <SelectItem value="GBP/USD">GBP/USD</SelectItem>
                      <SelectItem value="USD/JPY">USD/JPY</SelectItem>
                      <SelectItem value="AUD/USD">AUD/USD</SelectItem>
                      <SelectItem value="USD/CAD">USD/CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Entry Type</Label>
                  <RadioGroup value={newEntry.type} onValueChange={(value) => setNewEntry({...newEntry, type: value as any})}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ANALYSIS" id="analysis" />
                      <Label htmlFor="analysis" className="font-normal">Analysis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="MISTAKE" id="mistake" />
                      <Label htmlFor="mistake" className="font-normal">Mistake</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="SUCCESS" id="success" />
                      <Label htmlFor="success" className="font-normal">Success</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="STRATEGY" id="strategy" />
                      <Label htmlFor="strategy" className="font-normal">Strategy</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title"
                  placeholder="Entry title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea 
                  id="content"
                  placeholder="Write your journal entry..."
                  rows={6}
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEntry}>
                  Save Entry
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Entries List */}
      <ScrollArea className="h-[600px] rounded-lg border">
        <div className="space-y-4 p-4">
          {entries.length > 0 ? (
            entries.map(entry => (
              <Card key={entry.id} className="mb-4">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{entry.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(entry.type)}`}>
                          {entry.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium text-primary">{entry.pair}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(entry.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{entry.content}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No journal entries yet. Create your first one!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
