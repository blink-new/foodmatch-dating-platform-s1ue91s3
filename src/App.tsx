import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthForm } from './components/auth/AuthForm'
import { ProfileSetup } from './components/profile/ProfileSetup'
import { MatchingInterface } from './components/matching/MatchingInterface'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Heart, Users, MapPin, Utensils, Star, ChefHat, Coffee, Pizza, Salad } from 'lucide-react'
import { supabase } from './lib/supabase'
import toast from 'react-hot-toast'

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'profile-setup' | 'matching'>('landing')
  const [profileExists, setProfileExists] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  const cuisineTypes = [
    { name: 'Italian', icon: Pizza, color: 'bg-red-100 text-red-700' },
    { name: 'Asian', icon: Utensils, color: 'bg-orange-100 text-orange-700' },
    { name: 'Mexican', icon: ChefHat, color: 'bg-green-100 text-green-700' },
    { name: 'Mediterranean', icon: Salad, color: 'bg-blue-100 text-blue-700' },
    { name: 'American', icon: Coffee, color: 'bg-purple-100 text-purple-700' },
    { name: 'French', icon: Star, color: 'bg-pink-100 text-pink-700' }
  ]

  const features = [
    {
      icon: Heart,
      title: 'Food-Based Matching',
      description: 'Connect with people who share your culinary passions and dietary preferences'
    },
    {
      icon: MapPin,
      title: 'Restaurant Discovery',
      description: 'Find perfect date spots that match both your food preferences'
    },
    {
      icon: Users,
      title: 'Meaningful Connections',
      description: 'Bond over shared meals and create lasting relationships through food'
    }
  ]

  useEffect(() => {
    if (user && !authLoading) {
      checkProfile()
    } else if (!user && !authLoading) {
      setCurrentView('landing')
    }
  }, [user, authLoading])

  const checkProfile = async () => {
    if (!user) return

    setProfileLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Error checking profile:', error)
        // If it's a 406 error, it might be a header issue - try to continue
        if (error.code === '406' || error.message?.includes('406')) {
          console.log('Got 406 error, treating as no profile exists')
          setProfileExists(false)
          setCurrentView('profile-setup')
          return
        }
        toast.error('Failed to load profile')
        return
      }

      if (data && data.full_name && data.age && data.favorite_cuisines?.length > 0) {
        setProfileExists(true)
        setCurrentView('matching')
      } else {
        setProfileExists(false)
        setCurrentView('profile-setup')
      }
    } catch (error) {
      console.error('Error checking profile:', error)
      // On any error, default to profile setup
      setProfileExists(false)
      setCurrentView('profile-setup')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setCurrentView('landing')
      setProfileExists(false)
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (currentView === 'auth') {
    return (
      <AuthForm
        onBack={() => setCurrentView('landing')}
        onSuccess={() => {
          // Will be handled by useEffect when user state changes
        }}
      />
    )
  }

  if (currentView === 'profile-setup') {
    return (
      <ProfileSetup
        onComplete={() => {
          setProfileExists(true)
          setCurrentView('matching')
        }}
      />
    )
  }

  if (currentView === 'matching' && user && profileExists) {
    return (
      <MatchingInterface
        onProfileClick={() => {
          // TODO: Navigate to profile edit
          toast.info('Profile editing coming soon!')
        }}
        onMatchesClick={() => {
          // TODO: Navigate to matches/chat
          toast.info('Matches and chat coming soon!')
        }}
      />
    )
  }

  // Landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">FoodMatch</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.email}
                  </span>
                  <Button variant="ghost" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => setCurrentView('auth')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20">
                  🍽️ Find Love Through Food
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Match with people who share your
                  <span className="text-primary"> taste</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Connect with food lovers, discover amazing restaurants together, and create meaningful relationships over shared meals.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
                  onClick={() => setCurrentView('auth')}
                >
                  Start Matching
                  <Heart className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-6 border-2"
                >
                  How It Works
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">10K+</div>
                  <div className="text-sm text-muted-foreground">Food Lovers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">500+</div>
                  <div className="text-sm text-muted-foreground">Restaurants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">95%</div>
                  <div className="text-sm text-muted-foreground">Match Rate</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="transform rotate-3 hover:rotate-6 transition-transform duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Pizza className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Italian Cuisine</h3>
                    <p className="text-sm text-muted-foreground">Pasta, pizza, and authentic flavors</p>
                  </CardContent>
                </Card>
                
                <Card className="transform -rotate-2 hover:-rotate-3 transition-transform duration-300 mt-8">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                      <Coffee className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-semibold mb-2">Coffee Dates</h3>
                    <p className="text-sm text-muted-foreground">Perfect first meeting spots</p>
                  </CardContent>
                </Card>
                
                <Card className="transform rotate-1 hover:rotate-2 transition-transform duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Salad className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Healthy Options</h3>
                    <p className="text-sm text-muted-foreground">Fresh, organic, and nutritious</p>
                  </CardContent>
                </Card>
                
                <Card className="transform -rotate-1 hover:-rotate-2 transition-transform duration-300 mt-4">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <ChefHat className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Fine Dining</h3>
                    <p className="text-sm text-muted-foreground">Special occasions and experiences</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              How FoodMatch Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to find your perfect dining companion
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cuisine Types Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Explore Cuisines Together
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From street food to fine dining, discover new flavors with someone special
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cuisineTypes.map((cuisine, index) => (
              <Card key={index} className="hover:scale-105 transition-transform duration-300 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${cuisine.color}`}>
                    <cuisine.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-medium text-sm">{cuisine.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Find Your Food Soulmate?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of food lovers who have found meaningful connections through shared meals
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-6 bg-white text-primary hover:bg-gray-50"
            onClick={() => setCurrentView('auth')}
          >
            Start Your Journey
            <Heart className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">FoodMatch</span>
              </div>
              <p className="text-gray-400">
                Connecting food lovers, one meal at a time.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FoodMatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App