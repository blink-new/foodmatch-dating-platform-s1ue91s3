import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Heart, Upload, MapPin, User, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

interface ProfileSetupProps {
  onComplete: () => void
}

const cuisineOptions = [
  'Italian', 'Asian', 'Mexican', 'Mediterranean', 'American', 'French',
  'Indian', 'Thai', 'Japanese', 'Chinese', 'Korean', 'Vietnamese',
  'Greek', 'Spanish', 'Lebanese', 'Turkish', 'Moroccan', 'Ethiopian'
]

const diningStyleOptions = [
  'Fine Dining', 'Casual Dining', 'Street Food', 'Food Trucks',
  'Brunch Spots', 'Coffee Shops', 'Wine Bars', 'Rooftop Dining',
  'Outdoor Seating', 'Cozy Atmosphere', 'Trendy Spots', 'Local Gems'
]

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Halal',
  'Kosher', 'Dairy-Free', 'Nut-Free', 'Low-Carb', 'Organic', 'Raw Food'
]

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    bio: '',
    location: '',
    favorite_cuisines: [] as string[],
    dining_style: [] as string[],
    dietary_restrictions: [] as string[],
    avatar_url: ''
  })

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: formData.full_name,
          age: parseInt(formData.age),
          bio: formData.bio,
          location: formData.location,
          favorite_cuisines: formData.favorite_cuisines,
          dining_style: formData.dining_style,
          dietary_restrictions: formData.dietary_restrictions,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating profile:', error)
        toast.error('Failed to save profile')
      } else {
        toast.success('Profile created successfully!')
        onComplete()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (array: string[], item: string, setter: (items: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.full_name && formData.age && formData.location
      case 2:
        return formData.favorite_cuisines.length > 0
      case 3:
        return formData.dining_style.length > 0
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground">Help us find your perfect dining matches</p>
            
            {/* Progress indicator */}
            <div className="flex justify-center mt-6 space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i <= step ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="full_name"
                      placeholder="Enter your full name"
                      className="pl-10"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="age">Age</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter your age"
                      className="pl-10"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="City, State"
                      className="pl-10"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself and what you're looking for..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">Favorite Cuisines</h2>
              <p className="text-center text-muted-foreground">Select at least one cuisine you love</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {cuisineOptions.map((cuisine) => (
                  <Button
                    key={cuisine}
                    variant={formData.favorite_cuisines.includes(cuisine) ? "default" : "outline"}
                    className="h-auto p-4 text-sm"
                    onClick={() => toggleSelection(
                      formData.favorite_cuisines,
                      cuisine,
                      (items) => setFormData({ ...formData, favorite_cuisines: items })
                    )}
                  >
                    {cuisine}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">Dining Style</h2>
              <p className="text-center text-muted-foreground">What kind of dining experiences do you enjoy?</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {diningStyleOptions.map((style) => (
                  <Button
                    key={style}
                    variant={formData.dining_style.includes(style) ? "default" : "outline"}
                    className="h-auto p-4 text-sm"
                    onClick={() => toggleSelection(
                      formData.dining_style,
                      style,
                      (items) => setFormData({ ...formData, dining_style: items })
                    )}
                  >
                    {style}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">Dietary Preferences</h2>
              <p className="text-center text-muted-foreground">Any dietary restrictions or preferences? (Optional)</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {dietaryOptions.map((diet) => (
                  <Button
                    key={diet}
                    variant={formData.dietary_restrictions.includes(diet) ? "default" : "outline"}
                    className="h-auto p-4 text-sm"
                    onClick={() => toggleSelection(
                      formData.dietary_restrictions,
                      diet,
                      (items) => setFormData({ ...formData, dietary_restrictions: items })
                    )}
                  >
                    {diet}
                  </Button>
                ))}
              </div>

              <div className="mt-8 p-4 bg-primary/5 rounded-lg">
                <h3 className="font-semibold mb-2">Profile Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {formData.full_name}, {formData.age}</p>
                  <p><strong>Location:</strong> {formData.location}</p>
                  <p><strong>Favorite Cuisines:</strong> {formData.favorite_cuisines.join(', ')}</p>
                  <p><strong>Dining Style:</strong> {formData.dining_style.join(', ')}</p>
                  {formData.dietary_restrictions.length > 0 && (
                    <p><strong>Dietary Preferences:</strong> {formData.dietary_restrictions.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Back
            </Button>
            
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-primary hover:bg-primary/90"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? 'Creating Profile...' : 'Complete Profile'}
                <Heart className="ml-2 w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}