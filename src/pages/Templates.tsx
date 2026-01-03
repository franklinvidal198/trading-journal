import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Copy, Edit2, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import { templatesAPI, TradeTemplate, TradeTemplateCreate } from '@/lib/api'

export default function Templates() {
  const { toast } = useToast()
  const [templates, setTemplates] = useState<TradeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    pair: '',
    trade_type: 'BUY',
    entry_strategy: '',
    exit_strategy: '',
    risk_reward: 1,
    description: '',
    tags: ''
  })

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const data = await templatesAPI.getTemplates({ limit: 50 })
      setTemplates(data.data)
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      toast({
        title: 'Error',
        description: 'Failed to load trading templates',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTemplate = async () => {
    if (!newTemplate.name || !newTemplate.pair || !newTemplate.entry_strategy || !newTemplate.exit_strategy) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    try {
      setSaving(true)
      
      if (editingId) {
        const updated = await templatesAPI.updateTemplate(editingId, {
          name: newTemplate.name,
          pair: newTemplate.pair,
          trade_type: newTemplate.trade_type,
          entry_strategy: newTemplate.entry_strategy,
          exit_strategy: newTemplate.exit_strategy,
          risk_reward: newTemplate.risk_reward,
          description: newTemplate.description,
          tags: newTemplate.tags
        })
        setTemplates(templates.map(t => t.id === editingId ? updated : t))
        toast({
          title: 'Success',
          description: 'Template updated successfully'
        })
      } else {
        const created = await templatesAPI.createTemplate({
          name: newTemplate.name,
          pair: newTemplate.pair,
          trade_type: newTemplate.trade_type,
          entry_strategy: newTemplate.entry_strategy,
          exit_strategy: newTemplate.exit_strategy,
          risk_reward: newTemplate.risk_reward,
          description: newTemplate.description || undefined,
          tags: newTemplate.tags || undefined
        })
        setTemplates([created, ...templates])
        toast({
          title: 'Success',
          description: 'Template created successfully'
        })
      }
      
      setNewTemplate({
        name: '',
        pair: '',
        trade_type: 'BUY',
        entry_strategy: '',
        exit_strategy: '',
        risk_reward: 1,
        description: '',
        tags: ''
      })
      setEditingId(null)
      setDialogOpen(false)
    } catch (error) {
      console.error('Failed to save template:', error)
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTemplate = async (id: number) => {
    try {
      await templatesAPI.deleteTemplate(id)
      setTemplates(templates.filter(t => t.id !== id))
      toast({
        title: 'Success',
        description: 'Template deleted successfully'
      })
    } catch (error) {
      console.error('Failed to delete template:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive'
      })
    }
  }

  const handleEditTemplate = (template: TradeTemplate) => {
    setNewTemplate({
      name: template.name,
      pair: template.pair,
      trade_type: template.trade_type,
      entry_strategy: template.entry_strategy || '',
      exit_strategy: template.exit_strategy || '',
      risk_reward: template.risk_reward || 1,
      description: template.description || '',
      tags: template.tags || ''
    })
    setEditingId(template.id)
    setDialogOpen(true)
  }

  const handleUseTemplate = async (template: TradeTemplate) => {
    // This would open a dialog to create a trade from the template
    toast({
      title: 'Use Template',
      description: `Using ${template.name} template to create new trade`,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    )
  }
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
                  <Select value={newTemplate.trade_type} onValueChange={(value) => setNewTemplate({...newTemplate, trade_type: value})}>
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
                    type="number"
                    step="0.1"
                    placeholder="1.5"
                    value={newTemplate.risk_reward}
                    onChange={(e) => setNewTemplate({...newTemplate, risk_reward: parseFloat(e.target.value) || 1})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry">Entry Strategy</Label>
                <Textarea 
                  id="entry"
                  placeholder="Describe your entry conditions..."
                  rows={3}
                  value={newTemplate.entry_strategy}
                  onChange={(e) => setNewTemplate({...newTemplate, entry_strategy: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exit">Exit Strategy</Label>
                <Textarea 
                  id="exit"
                  placeholder="Describe your exit conditions..."
                  rows={3}
                  value={newTemplate.exit_strategy}
                  onChange={(e) => setNewTemplate({...newTemplate, exit_strategy: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input 
                  id="description"
                  placeholder="Additional notes about this template..."
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setDialogOpen(false)
                  setEditingId(null)
                  setNewTemplate({
                    name: '',
                    pair: '',
                    trade_type: 'BUY',
                    entry_strategy: '',
                    exit_strategy: '',
                    risk_reward: 1,
                    description: '',
                    tags: ''
                  })
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddTemplate} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    `${editingId ? 'Update' : 'Save'} Template`
                  )}
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
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${template.trade_type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {template.trade_type}
                          </span>
                          {template.usage_count > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Used {template.usage_count}x
                            </span>
                          )}
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
                    <p className="text-sm">{template.entry_strategy}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Exit Strategy</p>
                    <p className="text-sm">{template.exit_strategy}</p>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold text-muted-foreground">Risk:Reward</p>
                    <p className="text-lg font-bold text-primary">1:{template.risk_reward?.toFixed(2) || '1.00'}</p>
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
