import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { SwipeCard } from './SwipeCard'
import { Heart, RotateCcw, Settings, MessageCircle, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

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

interface MatchingInterfaceProps {
  onProfileClick: () => void
  onMatchesClick: () => void
}

export const MatchingInterface: React.FC<MatchingInterfaceProps> = ({ 
  onProfileClick, 
  onMatchesClick 
}) => {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showProfileDetail, setShowProfileDetail] = useState<Profile | null>(null)
  const [matchCount, setMatchCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadProfiles()
      loadMatchCount()
    }
  }, [user])

  const loadProfiles = async () => {
    if (!user) return

    try {
      // Get profiles that haven't been swiped on yet
      const { data: swipedProfiles } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id)

      const swipedIds = swipedProfiles?.map(s => s.swiped_id) || []

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .not('id', 'in', `(${swipedIds.length > 0 ? swipedIds.join(',') : 'null'})`)
        .limit(10)

      if (error) {
        console.error('Error loading profiles:', error)
        toast.error('Failed to load profiles')
      } else {
        setProfiles(data || [])
      }
    } catch (error) {
      console.error('Error loading profiles:', error)
      toast.error('Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }

  const loadMatchCount = async () => {
    if (!user) return

    try {
      const { count } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

      setMatchCount(count || 0)
    } catch (error) {
      console.error('Error loading match count:', error)
    }
  }

  const handleSwipe = async (profileId: string, liked: boolean) => {
    if (!user) return

    try {
      // Record the swipe
      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: profileId,
          liked
        })

      if (error) {
        console.error('Error recording swipe:', error)
        toast.error('Failed to record swipe')
        return
      }

      // Check if it's a match (the trigger will handle match creation)
      if (liked) {
        // Check if the other user has already liked this user
        const { data: mutualLike } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', profileId)
          .eq('swiped_id', user.id)
          .eq('liked', true)
          .single()

        if (mutualLike) {
          toast.success("It's a match! 🎉")
          setMatchCount(prev => prev + 1)
        }
      }

      // Move to next profile
      setCurrentIndex(prev => prev + 1)
    } catch (error) {
      console.error('Error handling swipe:', error)
      toast.error('Failed to process swipe')
    }
  }

  const resetStack = () => {
    setCurrentIndex(0)
    loadProfiles()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Finding your perfect matches...</p>
        </div>
      </div>
    )
  }

  const currentProfile = profiles[currentIndex]
  const hasMoreProfiles = currentIndex < profiles.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Button variant="ghost" size="sm" onClick={onProfileClick}>
              <User className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">FoodMatch</span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={onMatchesClick} className="relative">
              <MessageCircle className="w-5 h-5" />
              {matchCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs bg-primary">
                  {matchCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 h-[calc(100vh-4rem)]">
        {hasMoreProfiles ? (
          <div className="relative h-full">
            {/* Card Stack */}
            <div className="relative h-full">
              {profiles.slice(currentIndex, currentIndex + 3).map((profile, index) => (
                <div
                  key={profile.id}
                  className="absolute inset-0"
                  style={{
                    zIndex: 3 - index,
                    transform: `scale(${1 - index * 0.05}) translateY(${index * 8}px)`,
                    opacity: 1 - index * 0.2
                  }}
                >
                  {index === 0 ? (
                    <SwipeCard
                      profile={profile}
                      onSwipe={handleSwipe}
                      onInfoClick={setShowProfileDetail}
                    />
                  ) : (
                    <Card className="h-full w-full overflow-hidden shadow-lg">
                      <div className="relative h-2/3">
                        <img
                          src={profile.avatar_url || `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face`}
                          alt={profile.full_name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h3 className="text-2xl font-bold">
                            {profile.full_name}, {profile.age}
                          </h3>
                        </div>
                      </div>
                      <CardContent className="p-6 h-1/3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {profile.bio || 'Food lover looking for someone to share amazing meals with!'}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">No more profiles!</h3>
              <p className="text-muted-foreground mb-6">
                You've seen all available profiles. Check back later for new matches!
              </p>
              <Button onClick={resetStack} className="bg-primary hover:bg-primary/90">
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Detail Modal */}
      {showProfileDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="relative h-64">
              <img
                src={showProfileDetail.avatar_url || `https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face`}
                alt={showProfileDetail.full_name}
                className="w-full h-full object-cover"
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-4 right-4 rounded-full"
                onClick={() => setShowProfileDetail(null)}
              >
                ✕
              </Button>
            </div>
            
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {showProfileDetail.full_name}, {showProfileDetail.age}
                </h2>
                {showProfileDetail.location && (
                  <p className="text-muted-foreground">{showProfileDetail.location}</p>
                )}
              </div>

              {showProfileDetail.bio && (
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">{showProfileDetail.bio}</p>
                </div>
              )}

              {showProfileDetail.favorite_cuisines && showProfileDetail.favorite_cuisines.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Favorite Cuisines</h3>
                  <div className="flex flex-wrap gap-2">
                    {showProfileDetail.favorite_cuisines.map((cuisine, index) => (
                      <Badge key={index} variant="secondary">
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {showProfileDetail.dining_style && showProfileDetail.dining_style.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Dining Style</h3>
                  <div className="flex flex-wrap gap-2">
                    {showProfileDetail.dining_style.map((style, index) => (
                      <Badge key={index} variant="outline">
                        {style}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    handleSwipe(showProfileDetail.id, false)
                    setShowProfileDetail(null)
                  }}
                >
                  Pass
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    handleSwipe(showProfileDetail.id, true)
                    setShowProfileDetail(null)
                  }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Like
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}