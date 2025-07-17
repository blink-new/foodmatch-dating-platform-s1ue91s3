import React, { useState, useRef } from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Heart, X, MapPin, Utensils, Star, Info } from 'lucide-react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'

interface Profile {
  id: string
  full_name: string
  age: number
  bio: string
  avatar_url: string
  location: string
  favorite_cuisines: string[]
  dining_style: string[]
  food_preferences: string[]
}

interface SwipeCardProps {
  profile: Profile
  onSwipe: (profileId: string, liked: boolean) => void
  onInfoClick: (profile: Profile) => void
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipe, onInfoClick }) => {
  const [exitX, setExitX] = useState(0)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])
  const cardRef = useRef<HTMLDivElement>(null)

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    
    if (info.offset.x > threshold) {
      // Swiped right (like)
      setExitX(200)
      onSwipe(profile.id, true)
    } else if (info.offset.x < -threshold) {
      // Swiped left (pass)
      setExitX(-200)
      onSwipe(profile.id, false)
    }
  }

  const handleLike = () => {
    setExitX(200)
    onSwipe(profile.id, true)
  }

  const handlePass = () => {
    setExitX(-200)
    onSwipe(profile.id, false)
  }

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX } : {}}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full w-full overflow-hidden shadow-xl">
        <div className="relative h-2/3">
          <img
            src={profile.avatar_url || `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face`}
            alt={profile.full_name}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Info button */}
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-4 right-4 rounded-full w-10 h-10 p-0"
            onClick={() => onInfoClick(profile)}
          >
            <Info className="w-4 h-4" />
          </Button>
          
          {/* Basic info overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-2xl font-bold mb-1">
              {profile.full_name}, {profile.age}
            </h3>
            {profile.location && (
              <div className="flex items-center text-sm opacity-90 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                {profile.location}
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-6 h-1/3 flex flex-col justify-between">
          <div className="space-y-3">
            {profile.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {profile.bio}
              </p>
            )}
            
            {profile.favorite_cuisines && profile.favorite_cuisines.length > 0 && (
              <div>
                <div className="flex items-center text-sm font-medium mb-2">
                  <Utensils className="w-4 h-4 mr-1" />
                  Favorite Cuisines
                </div>
                <div className="flex flex-wrap gap-1">
                  {profile.favorite_cuisines.slice(0, 3).map((cuisine, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {cuisine}
                    </Badge>
                  ))}
                  {profile.favorite_cuisines.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.favorite_cuisines.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center space-x-4 mt-4">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-14 h-14 p-0 border-2 hover:bg-red-50 hover:border-red-200"
              onClick={handlePass}
            >
              <X className="w-6 h-6 text-red-500" />
            </Button>
            
            <Button
              size="lg"
              className="rounded-full w-14 h-14 p-0 bg-primary hover:bg-primary/90"
              onClick={handleLike}
            >
              <Heart className="w-6 h-6 text-white" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}