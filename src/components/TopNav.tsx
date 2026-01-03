import { useLocation } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserMenu } from './UserMenu'
import { useState } from 'react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

const navigationLinks = [
  {
    title: 'Trading',
    href: '#',
    description: 'Access your trading tools and analysis',
    submenu: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Trades', href: '/trades' },
      { name: 'Stats', href: '/stats' },
    ]
  },
  {
    title: 'Learning',
    href: '#',
    description: 'Improve your trading skills',
    submenu: [
      { name: 'Journal', href: '/journal' },
      { name: 'Templates', href: '/templates' },
      { name: 'Goals', href: '/goals' },
    ]
  },
  {
    title: 'Analysis',
    href: '#',
    description: 'Analyze your performance',
    submenu: [
      { name: 'Reports', href: '/reports' },
      { name: 'Statistics', href: '/stats' },
    ]
  }
]

const ListItem = ({ 
  title, 
  href, 
  description 
}: { 
  title: string
  href: string
  description?: string
}) => (
  <li>
    <a
      href={href}
      className={cn(
        'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
      )}
    >
      <div className="text-sm font-medium leading-none">{title}</div>
      {description && (
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {description}
        </p>
      )}
    </a>
  </li>
)

export function TopNav() {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/dashboard') return 'Dashboard'
    if (path === '/trades') return 'Trades'
    if (path === '/stats') return 'Statistics'
    if (path === '/journal') return 'Journal'
    if (path === '/templates') return 'Templates'
    if (path === '/goals') return 'Goals'
    if (path === '/reports') return 'Reports'
    if (path === '/settings') return 'Settings'
    return 'Trading Journal'
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement global search
    console.log('Search for:', searchQuery)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 gap-4">
        {/* Left side - Navigation Menu */}
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold hidden md:block">
            {getPageTitle()}
          </h1>

          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navigationLinks.map(link => (
                <NavigationMenuItem key={link.title}>
                  <NavigationMenuTrigger className="text-sm">
                    {link.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="w-80 p-3 md:w-auto">
                      <li className="row-span-3">
                        <p className="text-xs font-semibold text-muted-foreground px-3 py-2">
                          {link.description}
                        </p>
                      </li>
                      {link.submenu?.map(item => (
                        <ListItem 
                          key={item.name}
                          title={item.name}
                          href={item.href}
                        />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Middle - Search */}
        <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search trades, pairs..."
              className="pl-8 h-9"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Right side - Actions & User */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          <UserMenu />
        </div>
      </div>
    </header>
  )
}
