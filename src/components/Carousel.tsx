import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselItem {
  id: string
  title: string
  description: string
  image?: string
  content: React.ReactNode
}

interface CarouselProps {
  items: CarouselItem[]
  autoPlay?: boolean
  autoPlayInterval?: number
  className?: string
}

export function Carousel({
  items,
  autoPlay = false,
  autoPlayInterval = 5000,
  className = ''
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex(prev => prev === 0 ? items.length - 1 : prev - 1)
  }

  const goToNext = () => {
    setCurrentIndex(prev => prev === items.length - 1 ? 0 : prev + 1)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No items to display
        </CardContent>
      </Card>
    )
  }

  const currentItem = items[currentIndex]

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="relative overflow-hidden">
        <CardContent className="pt-6">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {currentItem.image ? (
              <img 
                src={currentItem.image} 
                alt={currentItem.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {currentItem.content}
              </div>
            )}

            {/* Navigation Buttons */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2"
              onClick={goToPrevious}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onClick={goToNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Slide Info */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold">{currentItem.title}</h3>
            <p className="text-muted-foreground mt-1">{currentItem.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Indicators */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {items.length}
        </div>
      </div>
    </div>
  )
}
