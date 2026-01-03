import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Loader2, Shield, Copy, Check } from 'lucide-react'
import { twoFAAPI } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

export default function Settings() {
  const { toast } = useToast()
  const [twoFAStatus, setTwoFAStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [setupDialogOpen, setSetupDialogOpen] = useState(false)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [otp, setOtp] = useState('')
  const [verifyOtp, setVerifyOtp] = useState('')
  const [disableOtp, setDisableOtp] = useState('')
  const [setupLoading, setSetupLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [disableLoading, setDisableLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchTwoFAStatus()
  }, [])

  const fetchTwoFAStatus = async () => {
    try {
      setLoading(true)
      const status = await twoFAAPI.getStatus()
      setTwoFAStatus(status)
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error)
      toast({
        title: 'Error',
        description: 'Failed to load 2FA settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSetup2FA = async () => {
    try {
      setSetupLoading(true)
      const setupData = await twoFAAPI.setupTwoFA()
      setQrCode(setupData.qr_code)
      setSecret(setupData.secret)
      setBackupCodes(setupData.backup_codes)
    } catch (error) {
      console.error('Failed to setup 2FA:', error)
      toast({
        title: 'Error',
        description: 'Failed to setup 2FA',
        variant: 'destructive'
      })
    } finally {
      setSetupLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive'
      })
      return
    }

    try {
      setVerifyLoading(true)
      await twoFAAPI.verifyTwoFA(otp)
      toast({
        title: 'Success',
        description: '2FA has been enabled on your account'
      })
      setSetupDialogOpen(false)
      setVerifyDialogOpen(false)
      setOtp('')
      fetchTwoFAStatus()
    } catch (error) {
      console.error('Failed to verify 2FA:', error)
      toast({
        title: 'Error',
        description: 'Invalid OTP. Please try again',
        variant: 'destructive'
      })
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!disableOtp || disableOtp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive'
      })
      return
    }

    try {
      setDisableLoading(true)
      await twoFAAPI.disableTwoFA(disableOtp)
      toast({
        title: 'Success',
        description: '2FA has been disabled'
      })
      setDisableDialogOpen(false)
      setDisableOtp('')
      fetchTwoFAStatus()
    } catch (error) {
      console.error('Failed to disable 2FA:', error)
      toast({
        title: 'Error',
        description: 'Failed to disable 2FA',
        variant: 'destructive'
      })
    } finally {
      setDisableLoading(false)
    }
  }

  const handleRegenerateBackupCodes = async () => {
    try {
      const newCodes = await twoFAAPI.regenerateBackupCodes()
      setBackupCodes(newCodes.backup_codes)
      toast({
        title: 'Success',
        description: 'Backup codes have been regenerated'
      })
    } catch (error) {
      console.error('Failed to regenerate backup codes:', error)
      toast({
        title: 'Error',
        description: 'Failed to regenerate backup codes',
        variant: 'destructive'
      })
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and security settings</p>
      </div>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </div>
            </div>
            <Badge variant={twoFAStatus?.is_enabled ? 'default' : 'secondary'}>
              {twoFAStatus?.is_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Two-factor authentication adds an additional layer of security to your account. You'll need to enter a code from your authenticator app in addition to your password when logging in.
          </p>

          {!twoFAStatus?.is_enabled ? (
            <Button onClick={() => {
              setSetupDialogOpen(true)
              handleSetup2FA()
            }}>
              {setupLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
              Enable 2FA
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <span className="text-sm font-medium">2FA is active on your account</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDisableDialogOpen(true)}
                >
                  Disable
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={handleRegenerateBackupCodes}
                className="w-full"
              >
                Regenerate Backup Codes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup 2FA Dialog */}
      <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app to get started
            </DialogDescription>
          </DialogHeader>

          {qrCode && (
            <div className="space-y-4">
              <div className="flex justify-center p-4 bg-secondary rounded-lg">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>

              {secret && (
                <div>
                  <Label htmlFor="secret" className="text-sm text-muted-foreground">
                    Or enter this code manually:
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="secret"
                      value={secret}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(secret)
                        toast({ title: 'Copied', description: 'Secret key copied to clipboard' })
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {backupCodes.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold">Backup Codes</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Save these codes in a safe place. You can use them if you lose access to your authenticator.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-secondary rounded text-xs font-mono"
                      >
                        <span>{code}</span>
                        <button
                          onClick={() => copyToClipboard(code, idx)}
                          className="hover:text-primary transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => setVerifyDialogOpen(true)}
                className="w-full"
                variant="outline"
              >
                Next: Verify Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verify 2FA Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Verify Your Code</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code from your authenticator app
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="otp">6-Digit Code</Label>
              <Input
                id="otp"
                type="text"
                maxLength="6"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="font-mono text-2xl tracking-widest text-center mt-2"
              />
            </div>

            <Button
              onClick={handleVerify2FA}
              disabled={verifyLoading || otp.length !== 6}
              className="w-full"
            >
              {verifyLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Verify & Enable 2FA
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <AlertDialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your 6-digit authenticator code to disable 2FA. Your account will be less secure.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label htmlFor="disableOtp">6-Digit Code</Label>
            <Input
              id="disableOtp"
              type="text"
              maxLength="6"
              placeholder="000000"
              value={disableOtp}
              onChange={(e) => setDisableOtp(e.target.value.replace(/\D/g, ''))}
              className="font-mono text-2xl tracking-widest text-center mt-2"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisable2FA}
              disabled={disableLoading || disableOtp.length !== 6}
              className="bg-red-600 hover:bg-red-700"
            >
              {disableLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Disable 2FA
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
