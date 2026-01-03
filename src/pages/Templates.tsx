import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Copy, Edit2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'

interface Template {
  id: string
  name: string
  pair: string
  type: 'BUY' | 'SELL'
  entryStrategy: string
  exitStrategy: string
  riskReward: string
  createdAt: string
}

export default function Templates() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Breakout Entry',
      pair: 'EUR/USD',
      type: 'BUY',
      entryStrategy: 'Enter on breakout of resistance level with volume confirmation',
      exitStrategy: 'Take profit at 1.5:1 risk-reward, stop loss below support',
      riskReward: '1:1.5',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Pullback Strategy',
      pair: 'GBP/USD',
      type: 'SELL',
      entryStrategy: 'Wait for pullback to moving average, sell on rejection',
      exitStrategy: 'Target support level or 1:2 RR',
      riskReward: '1:2',
      createdAt: '2024-01-14'
    }
  ])

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    pair: '',
    type: 'BUY' as const,
    entryStrategy: '',
    exitStrategy: '',
    riskReward: '1:1'
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAddTemplate = () => {
    if (newTemplate.name && newTemplate.entryStrategy && newTemplate.exitStrategy) {
      if (editingId) {
        setTemplates(templates.map(t => 
          t.id === editingId 
            ? {...newTemplate, id: editingId, createdAt: t.createdAt}
            : t
        ))
        toast({
          title: "Template Updated",
          description: "Your template has been updated successfully."
        })
      } else {
        const template: Template = {
          id: Date.now().toString(),
          ...newTemplate,
          createdAt: new Date().toISOString().split('T')[0]
        }
        setTemplates([template, ...templates])
        toast({
          title: "Template Created",
          description: "Your new template has been saved."
        })
      }
      setNewTemplate({
        name: '',
        pair: '',
        type: 'BUY',
        entryStrategy: '',
        exitStrategy: '',
        riskReward: '1:1'
      })
      setEditingId(null)
      setDialogOpen(false)
    }
  }

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id))
    toast({
      title: "Template Deleted",
      description: "The template has been removed."
    })
  }

  const handleEditTemplate = (template: Template) => {
    setNewTemplate({
      name: template.name,
      pair: template.pair,
      type: template.type,
      entryStrategy: template.entryStrategy,
      exitStrategy: template.exitStrategy,
      riskReward: template.riskReward
    })
    setEditingId(template.id)
    setDialogOpen(true)
  }

  const handleUseTemplate = (template: Template) => {
    // TODO: Navigate to new trade with template data
    toast({
      title: "Loading Template",
      description: `Creating new trade with ${template.name} template...`
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trade Templates</h1>
          <p className="text-muted-foreground">Save and reuse your proven trading setups</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Template' : 'New Template'}</DialogTitle>
              <DialogDescription>
                Save your trading strategy for quick access
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input 
                    id="name"
                    placeholder="e.g., Breakout Entry"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pair">Currency Pair</Label>
                  <Select value={newTemplate.pair} onValueChange={(value) => setNewTemplate({...newTemplate, pair: value})}>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Trade Type</Label>
                  <Select value={newTemplate.type} onValueChange={(value) => setNewTemplate({...newTemplate, type: value as any})}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">BUY</SelectItem>
                      <SelectItem value="SELL">SELL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskReward">Risk:Reward Ratio</Label>
                  <Input 
                    id="riskReward"
                    placeholder="1:1.5"
                    value={newTemplate.riskReward}
                    onChange={(e) => setNewTemplate({...newTemplate, riskReward: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry">Entry Strategy</Label>
                <Textarea 
                  id="entry"
                  placeholder="Describe your entry conditions..."
                  rows={3}
                  value={newTemplate.entryStrategy}
                  onChange={(e) => setNewTemplate({...newTemplate, entryStrategy: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exit">Exit Strategy</Label>
                <Textarea 
                  id="exit"
                  placeholder="Describe your exit conditions..."
                  rows={3}
                  value={newTemplate.exitStrategy}
                  onChange={(e) => setNewTemplate({...newTemplate, exitStrategy: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setDialogOpen(false)
                  setEditingId(null)
                  setNewTemplate({
                    name: '',
                    pair: '',
                    type: 'BUY',
                    entryStrategy: '',
                    exitStrategy: '',
                    riskReward: '1:1'
                  })
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddTemplate}>
                  {editingId ? 'Update' : 'Save'} Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <ScrollArea className="h-[600px] rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {templates.length > 0 ? (
            templates.map(template => (
              <Card key={template.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">{template.pair}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${template.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {template.type}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Entry Strategy</p>
                    <p className="text-sm">{template.entryStrategy}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Exit Strategy</p>
                    <p className="text-sm">{template.exitStrategy}</p>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold text-muted-foreground">Risk:Reward</p>
                    <p className="text-lg font-bold text-primary">{template.riskReward}</p>
                  </div>
                </CardContent>
                <div className="border-t p-3">
                  <Button 
                    onClick={() => handleUseTemplate(template)}
                    className="w-full gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Use Template
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center h-64">
              <p className="text-muted-foreground">No templates yet. Create your first one!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
