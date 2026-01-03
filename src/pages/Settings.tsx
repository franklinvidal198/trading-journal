import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, AlertTriangle, Save } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    theme: 'auto',
    darkMode: localStorage.getItem('darkMode') === 'true',
    notifications: true,
    emailNotifications: false,
    riskTolerance: 'medium',
    defaultPair: 'EURUSD',
    defaultPositionSize: '0.1',
    twoFactorEnabled: false,
  })

  const [saveMessage, setSaveMessage] = useState('')

  const handleSave = () => {
    localStorage.setItem('darkMode', String(settings.darkMode))
    localStorage.setItem('theme', settings.theme)
    localStorage.setItem('riskTolerance', settings.riskTolerance)
    localStorage.setItem('defaultPair', settings.defaultPair)
    localStorage.setItem('defaultPositionSize', settings.defaultPositionSize)
    
    setSaveMessage('Settings saved successfully!')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and account settings</p>
      </div>

      {saveMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{saveMessage}</AlertDescription>
        </Alert>
      )}

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Display</CardTitle>
          <CardDescription>Customize how the app looks for you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Theme</Label>
              <Select value={settings.theme} onValueChange={(value) => setSettings({...settings, theme: value})}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch 
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings({...settings, darkMode: checked})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Defaults</CardTitle>
          <CardDescription>Set default values for new trades</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-pair">Default Currency Pair</Label>
              <Select value={settings.defaultPair} onValueChange={(value) => setSettings({...settings, defaultPair: value})}>
                <SelectTrigger id="default-pair">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EURUSD">EUR/USD</SelectItem>
                  <SelectItem value="GBPUSD">GBP/USD</SelectItem>
                  <SelectItem value="USDJPY">USD/JPY</SelectItem>
                  <SelectItem value="AUDUSD">AUD/USD</SelectItem>
                  <SelectItem value="USDCAD">USD/CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position-size">Default Position Size (Lots)</Label>
              <Input 
                id="position-size"
                type="number"
                step="0.01"
                value={settings.defaultPositionSize}
                onChange={(e) => setSettings({...settings, defaultPositionSize: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
            <Select value={settings.riskTolerance} onValueChange={(value) => setSettings({...settings, riskTolerance: value})}>
              <SelectTrigger id="risk-tolerance">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative (1-2% per trade)</SelectItem>
                <SelectItem value="moderate">Moderate (2-3% per trade)</SelectItem>
                <SelectItem value="aggressive">Aggressive (3-5% per trade)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Control how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Push Notifications</Label>
            <Switch 
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch 
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication (2FA)</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {settings.twoFactorEnabled 
                  ? 'Your account is protected with 2FA' 
                  : 'Protect your account with 2FA'}
              </p>
            </div>
            {!settings.twoFactorEnabled ? (
              <Button 
                onClick={() => window.location.href = '/settings/two-factor'}
              >
                Enable 2FA
              </Button>
            ) : (
              <Button 
                variant="destructive"
                onClick={() => setSettings({...settings, twoFactorEnabled: false})}
              >
                Disable 2FA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-red-100 border-red-300">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Once you delete your account, there is no going back. Please be certain.
            </AlertDescription>
          </Alert>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and all your trading data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600">Delete</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">Reset</Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
