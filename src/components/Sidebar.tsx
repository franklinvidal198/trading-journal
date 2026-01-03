import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, TrendingUp, BarChart3, BookOpen, Target, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar as SidebarUI } from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  href: string
  icon: JSX.Element
  badge?: number
  subsection?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'TRADING',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: <TrendingUp className="w-5 h-5" /> },
      { name: 'Trades', href: '/trades', icon: <BarChart3 className="w-5 h-5" /> },
      { name: 'Stats', href: '/stats', icon: <BarChart3 className="w-5 h-5" /> },
    ]
  },
  {
    title: 'LEARNING',
    items: [
      { name: 'Journal', href: '/journal', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'Templates', href: '/templates', icon: <BookOpen className="w-5 h-5" /> },
      { name: 'Goals', href: '/goals', icon: <Target className="w-5 h-5" /> },
    ]
  },
  {
    title: 'TOOLS',
    items: [
      { name: 'Reports', href: '/reports', icon: <BarChart3 className="w-5 h-5" /> },
      { name: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
    ]
  }
]

interface SidebarProps {
  className?: string
}

export function AppSidebar({ className }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(true)
  const [expandedSections, setExpandedSections] = useState<string[]>(['TRADING'])

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(s => s !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => location.pathname === href

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleNavigation = (href: string) => {
    navigate(href)
  }

  if (!isOpen) {
    return (
      <div className={cn('fixed left-0 top-0 z-40 h-screen w-20 border-r bg-sidebar flex flex-col items-center py-4', className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="mb-4"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Collapsed sidebar icons */}
        <div className="space-y-4 flex-1">
          {navSections.map(section =>
            section.items.map(item => (
              <Button
                key={item.href}
                variant={isActive(item.href) ? 'default' : 'ghost'}
                size="icon"
                onClick={() => handleNavigation(item.href)}
                title={item.name}
                className="w-12 h-12"
              >
                {item.icon}
              </Button>
            ))
          )}
        </div>

        {/* Bottom actions */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Logout"
          className="w-12 h-12 mt-auto text-red-500 hover:text-red-600"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('fixed left-0 top-0 z-40 h-screen w-64 border-r bg-sidebar flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">Trading Journal</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-2">
        {navSections.map(section => (
          <div key={section.title} className="mb-2">
            <Collapsible open={expandedSections.includes(section.title)}>
              <CollapsibleTrigger asChild>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {section.title}
                  <span className="text-xs">
                    {expandedSections.includes(section.title) ? '−' : '+'}
                  </span>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-1 space-y-1">
                {section.items.map(item => (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>
            {section !== navSections[navSections.length - 1] && <Separator className="my-2" />}
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="border-t p-3 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => handleNavigation('/settings')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}
