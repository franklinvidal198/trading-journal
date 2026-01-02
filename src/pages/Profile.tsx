import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Camera, Save, Bell, Shield, Heart } from "lucide-react";
import { authAPI, statsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Profile() {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [accountStats, setAccountStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openAvatarDialog, setOpenAvatarDialog] = useState(false);
  const [preferredPairs, setPreferredPairs] = useState({
    eurusd: true,
    gbpusd: false,
    usdjpy: true,
    audusd: false,
    nzdusd: false,
    usdcad: true,
  });

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        const user = await authAPI.getProfile();
        setProfileData(prev => ({
          ...prev,
          name: user.name,
          email: user.email,
        }));
        const stats = await statsAPI.getSummary();
        setAccountStats(stats);
      } catch (err) {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const [notifications, setNotifications] = useState({
    email: true,
    tradeAlerts: true,
    weeklyReport: false,
    marketNews: true,
  });

  const handleProfileChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleNotificationChange = (field: string) => (checked: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: checked }));
  };

  const handlePreferredPairChange = (pair: string) => (checked: boolean) => {
    setPreferredPairs(prev => ({ ...prev, [pair]: checked }));
  };

  const handleSaveProfile = () => {
    console.log("Saving profile:", profileData);
  };

  const handleChangePassword = () => {
    console.log("Changing password");
  };

  return (
    <div className="space-y-6">
      {/* Loading/Error States */}
      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading profile...</div>
      )}
      {error && (
        <div className="text-center py-8 text-destructive">{error}</div>
      )}
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <User className="h-5 w-5 mr-2 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Phase 5: Profile Picture with Avatar and Dialog */}
              <div className="flex items-center space-x-6">
                <Dialog open={openAvatarDialog} onOpenChange={setOpenAvatarDialog}>
                  <div className="relative group">
                    <Avatar className="h-20 w-20 border-2 border-primary">
                      <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                        {profileData.name ? profileData.name.substring(0, 2).toUpperCase() : "US"}
                      </AvatarFallback>
                    </Avatar>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-accent p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </div>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Profile Picture</DialogTitle>
                      <DialogDescription>
                        Upload a new profile picture. Max size: 1MB (JPG, GIF, or PNG)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <Input type="file" accept="image/*" />
                      <div className="flex gap-2">
                        <Button className="flex-1">Upload</Button>
                        <Button variant="outline" className="flex-1" onClick={() => setOpenAvatarDialog(false)}>Cancel</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <div>
                  <h3 className="font-medium text-foreground">{profileData.name || "Your Profile"}</h3>
                  <p className="text-sm text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={handleProfileChange("name")}
                    className="bg-input/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange("email")}
                    className="bg-input/50 border-border/50"
                  />
                </div>
              </div>

              <Button 
                onClick={handleSaveProfile}
                className="bg-gradient-primary hover:glow-primary transition-smooth"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Lock className="h-5 w-5 mr-2 text-accent" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-foreground">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={profileData.currentPassword}
                  onChange={handleProfileChange("currentPassword")}
                  className="bg-input/50 border-border/50"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={profileData.newPassword}
                    onChange={handleProfileChange("newPassword")}
                    className="bg-input/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={handleProfileChange("confirmPassword")}
                    className="bg-input/50 border-border/50"
                  />
                </div>
              </div>
              <Button 
                onClick={handleChangePassword}
                variant="outline" 
                className="border-border/50"
              >
                <Shield className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preferences Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Notifications */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Bell className="h-5 w-5 mr-2 text-secondary" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">Receive updates via email</div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={handleNotificationChange("email")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Trade Alerts</div>
                  <div className="text-sm text-muted-foreground">Get notified about trade status</div>
                </div>
                <Switch
                  checked={notifications.tradeAlerts}
                  onCheckedChange={handleNotificationChange("tradeAlerts")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Weekly Report</div>
                  <div className="text-sm text-muted-foreground">Weekly performance summary</div>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={handleNotificationChange("weeklyReport")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Market News</div>
                  <div className="text-sm text-muted-foreground">Important market updates</div>
                </div>
                <Switch
                  checked={notifications.marketNews}
                  onCheckedChange={handleNotificationChange("marketNews")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Phase 5: Preferred Trading Pairs with Checkboxes */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Heart className="h-5 w-5 mr-2 text-red-500" />
                Preferred Trading Pairs
              </CardTitle>
              <CardDescription>Select the pairs you trade most frequently</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(preferredPairs).map(([pair, checked]) => (
                  <div key={pair} className="flex items-center space-x-2">
                    <Checkbox 
                      id={pair}
                      checked={checked}
                      onCheckedChange={handlePreferredPairChange(pair)}
                    />
                    <Label htmlFor={pair} className="text-foreground capitalize cursor-pointer">
                      {pair.toUpperCase()}
                    </Label>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => console.log("Saving preferred pairs:", preferredPairs)}
                size="sm"
                className="bg-gradient-primary hover:glow-primary transition-smooth"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium text-foreground">{accountStats?.created_at ? new Date(accountStats.created_at).toLocaleDateString() : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total trades</span>
                <span className="font-medium text-foreground">{accountStats?.total_trades ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Success rate</span>
                <span className="font-medium text-success">{accountStats?.win_rate ? `${accountStats.win_rate.toFixed(1)}%` : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account level</span>
                <span className="font-medium text-primary">{accountStats?.account_level ?? "-"}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}