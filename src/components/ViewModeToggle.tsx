import { Grip, List } from 'lucide-react'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'

export type ViewMode = 'list' | 'grid'

interface ViewModeToggleProps {
  value: ViewMode
  onValueChange: (value: ViewMode) => void
}

export function ViewModeToggle({ value, onValueChange }: ViewModeToggleProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={value}
      onValueChange={(newValue: string) => {
        if (newValue) {
          onValueChange(newValue as ViewMode)
        }
      }}
    >
      <ToggleGroupItem 
        value="list" 
        aria-label="List view"
        title="List view"
      >
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="grid" 
        aria-label="Grid view"
        title="Grid view"
      >
        <Grip className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
