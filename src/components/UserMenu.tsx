import { useNavigate } from 'react-router-dom'
import { User, Settings, Lock, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'

interface UserData {
  id: number
  email: string
  name?: string
}

export function UserMenu() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(user || null)

  useEffect(() => {
    if (user) {
      setUserData(user)
    }
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  if (!userData) {
    return null
  }

  const initials = (userData.name || userData.email)
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={`https://avatar.vercel.sh/${userData.email}`}
              alt={userData.name || userData.email}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        {/* User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userData.name || 'Trader'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userData.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Menu Items */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleNavigation('/settings#security')}>
            <Lock className="mr-2 h-4 w-4" />
            <span>Security & 2FA</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
