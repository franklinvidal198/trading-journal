import { Edit2, Trash2, X, Copy, Copy2, FileText } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useState } from 'react'

interface TradeContextMenuProps {
  tradeId: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onClose: (id: string) => void
  onClone: (id: string) => void
  onAnalyze: (id: string) => void
  children: React.ReactNode
}

export function TradeContextMenu({
  tradeId,
  onEdit,
  onDelete,
  onClose,
  onClone,
  onAnalyze,
  children
}: TradeContextMenuProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={() => onEdit(tradeId)}>
            <Edit2 className="mr-2 h-4 w-4" />
            <span>Edit Trade</span>
          </ContextMenuItem>

          <ContextMenuItem onClick={() => onAnalyze(tradeId)}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Analyze Trade</span>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem onClick={() => onClone(tradeId)}>
            <Copy2 className="mr-2 h-4 w-4" />
            <span>Clone Trade</span>
          </ContextMenuItem>

          <ContextMenuItem onClick={() => onClose(tradeId)}>
            <X className="mr-2 h-4 w-4" />
            <span>Close Trade</span>
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete Trade</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trade</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The trade and all its data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-red-600"
            onClick={() => {
              onDelete(tradeId)
              setDeleteDialogOpen(false)
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
