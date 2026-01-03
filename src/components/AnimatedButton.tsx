import { motion } from 'framer-motion'
import { Button, ButtonProps } from '@/components/ui/button'
import { forwardRef } from 'react'

interface AnimatedButtonProps extends ButtonProps {
  isLoading?: boolean
  loadingText?: string
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ isLoading, loadingText = 'Loading...', children, disabled, ...props }, ref) => {
    return (
      <motion.div
        whileHover={{ scale: !disabled ? 1.05 : 1 }}
        whileTap={{ scale: !disabled ? 0.95 : 1 }}
      >
        <Button 
          ref={ref}
          disabled={disabled || isLoading}
          {...props}
        >
          {isLoading ? (
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {loadingText}
            </motion.div>
          ) : (
            children
          )}
        </Button>
      </motion.div>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'

export { AnimatedButton }
