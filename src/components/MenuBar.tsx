import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
} from '@/components/ui/menubar'
import { Download, FileText, Settings, Palette, HelpCircle, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function AppMenuBar() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <Menubar className="border-b">
      <MenubarMenu>
        <MenubarMenu>File</MenubarMenu>
        <MenubarContent>
          <MenubarItem onClick={() => navigate('/trades')}>
            <FileText className="w-4 h-4 mr-2" />
            New Trade <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={() => window.print()}>
            Print <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>
              <Download className="w-4 h-4 mr-2" />
              Export
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Export as PDF</MenubarItem>
              <MenubarItem>Export as CSV</MenubarItem>
              <MenubarItem>Export as Excel</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Quit <MenubarShortcut>⌘Q</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarMenu>Edit</MenubarMenu>
        <MenubarContent>
          <MenubarItem onClick={() => document.execCommand('undo')}>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={() => document.execCommand('redo')}>
            Redo <MenubarShortcut>⌘⇧Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={() => document.execCommand('cut')}>
            Cut <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={() => document.execCommand('copy')}>
            Copy <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={() => document.execCommand('paste')}>
            Paste <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarMenu>View</MenubarMenu>
        <MenubarContent>
          <MenubarCheckboxItem>Full Screen</MenubarCheckboxItem>
          <MenubarCheckboxItem defaultChecked>Toggle Sidebar</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>
              <Palette className="w-4 h-4 mr-2" />
              Theme
            </MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarRadioGroup value="light">
                <MenubarRadioItem value="light">Light</MenubarRadioItem>
                <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
                <MenubarRadioItem value="auto">Auto</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarMenu>Tools</MenubarMenu>
        <MenubarContent>
          <MenubarItem onClick={() => navigate('/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Settings <MenubarShortcut>⌘,</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Preferences</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarMenu>Help</MenubarMenu>
        <MenubarContent>
          <MenubarItem onClick={() => window.open('/docs', '_blank')}>
            <HelpCircle className="w-4 h-4 mr-2" />
            Documentation
          </MenubarItem>
          <MenubarItem onClick={() => window.open('https://github.com/franklinvidal198/trading-journal', '_blank')}>
            GitHub Issues
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>About</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
