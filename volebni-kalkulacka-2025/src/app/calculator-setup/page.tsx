'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, User, Clock, Target } from 'lucide-react'

interface UserProfile {
  age?: string
  education?: string
  employment?: string
  region?: string
  interests?: string[]
  testMode: 'quick' | 'full'
}

export default function CalculatorSetup() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>({
    testMode: 'quick'
  })

  const ageRanges = [
    '18-25 let', '26-35 let', '36-45 let', '46-55 let', '56-65 let', '65+ let'
  ]

  const educationLevels = [
    'Základní vzdělání', 'Střední škola', 'Vyšší odborné', 'Vysoká škola - bakalář', 'Vysoká škola - magistr/inženýr', 'Doktorské studium'
  ]

  const employmentTypes = [
    'Zaměstnanec - soukromá sféra', 'Zaměstnanec - veřejná sféra', 'Podnikatel/OSVČ', 
    'Student', 'Důchodce', 'Nezaměstnaný', 'Na mateřské/rodičovské'
  ]

  const regions = [
    'Praha', 'Středočeský kraj', 'Jihočeský kraj', 'Plzeňský kraj', 'Karlovarský kraj',
    'Ústecký kraj', 'Liberecký kraj', 'Královéhradecký kraj', 'Pardubický kraj',
    'Vysočina', 'Jihomoravský kraj', 'Olomoucký kraj', 'Zlínský kraj', 'Moravskoslezský kraj'
  ]

  const interestAreas = [
    'Ekonomika a finance', 'Sociální politika', 'Životní prostředí', 'Zdravotnictví',
    'Vzdělávání', 'Bezpečnost', 'Zahraniční politika', 'Kultura a sport',
    'Digitalizace a technologie', 'Doprava a infrastruktura'
  ]

  const handleStart = () => {
    // Uložíme profil do localStorage pro využití v kalkulačce
    localStorage.setItem('userProfile', JSON.stringify(profile))
    router.push(`/calculator?mode=${profile.testMode}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header s navigací zpět */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zpět na hlavní stránku
          </Button>
          <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
            🧮 Volební kalkulačka
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nastavení volební kalkulačky
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Než začneme s testem, pomožte nám lépe přizpůsobit doporučení vašemu profilu. 
            Všechny informace jsou nepovinné a zůstanou pouze ve vašem prohlížeči.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Výběr typu testu */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Délka testu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  className={`p-6 rounded-lg border-2 text-left transition-all ${
                    profile.testMode === 'quick' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setProfile({...profile, testMode: 'quick'})}
                >
                  <div className="font-semibold text-lg mb-2">⚡ Rychlý test</div>
                  <div className="text-gray-600 mb-2">10 nejdůležitějších otázek</div>
                  <div className="text-sm text-gray-500">⏱️ Cca 3-5 minut</div>
                </button>
                
                <button
                  className={`p-6 rounded-lg border-2 text-left transition-all ${
                    profile.testMode === 'full' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setProfile({...profile, testMode: 'full'})}
                >
                  <div className="font-semibold text-lg mb-2">🎯 Podrobný test</div>
                  <div className="text-gray-600 mb-2">30 otázek pokrývajících všechny oblasti</div>
                  <div className="text-sm text-gray-500">⏱️ Cca 12-15 minut</div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Demografické údaje */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Demografické údaje
                <span className="text-sm font-normal text-gray-500">(nepovinné)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Věk */}
              <div className="space-y-2">
                <Label>Věková kategorie</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ageRanges.map((age) => (
                    <button
                      key={age}
                      className={`p-2 text-sm rounded border transition-colors ${
                        profile.age === age 
                          ? 'border-blue-600 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setProfile({...profile, age: profile.age === age ? undefined : age})}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vzdělání */}
              <div className="space-y-2">
                <Label>Nejvyšší dosažené vzdělání</Label>
                <select 
                  className="w-full p-2 border border-gray-200 rounded-lg"
                  value={profile.education || ''}
                  onChange={(e) => setProfile({...profile, education: e.target.value || undefined})}
                >
                  <option value="">Nechci uvést</option>
                  {educationLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Zaměstnání */}
              <div className="space-y-2">
                <Label>Typ zaměstnání</Label>
                <select 
                  className="w-full p-2 border border-gray-200 rounded-lg"
                  value={profile.employment || ''}
                  onChange={(e) => setProfile({...profile, employment: e.target.value || undefined})}
                >
                  <option value="">Nechci uvést</option>
                  {employmentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div className="space-y-2">
                <Label>Kraj bydliště</Label>
                <select 
                  className="w-full p-2 border border-gray-200 rounded-lg"
                  value={profile.region || ''}
                  onChange={(e) => setProfile({...profile, region: e.target.value || undefined})}
                >
                  <option value="">Nechci uvést</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Zájmové oblasti */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Oblasti zájmu
                <span className="text-sm font-normal text-gray-500">(nepovinné)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Které oblasti vás zajímají nejvíce? (max 3)</Label>
                <div className="space-y-2">
                  {interestAreas.map((area) => {
                    const isSelected = profile.interests?.includes(area) || false
                    const canSelect = !profile.interests || profile.interests.length < 3 || isSelected
                    
                    return (
                      <button
                        key={area}
                        disabled={!canSelect}
                        className={`w-full p-3 text-left rounded border transition-colors ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50 text-blue-700' 
                            : canSelect
                            ? 'border-gray-200 hover:border-gray-300'
                            : 'border-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={() => {
                          const interests = profile.interests || []
                          if (isSelected) {
                            setProfile({
                              ...profile, 
                              interests: interests.filter(i => i !== area)
                            })
                          } else if (interests.length < 3) {
                            setProfile({
                              ...profile, 
                              interests: [...interests, area]
                            })
                          }
                        }}
                      >
                        {area}
                        {isSelected && <span className="float-right">✓</span>}
                      </button>
                    )
                  })}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Vybrané oblasti: {profile.interests?.length || 0}/3
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tlačítko pro spuštění */}
        <div className="text-center mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Připraveno ke startu!</h3>
              <p className="text-gray-600">
                {profile.testMode === 'quick' ? 'Rychlý test - 10 otázek' : 'Podrobný test - 30 otázek'}
              </p>
            </div>
            <Button 
              onClick={handleStart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Spustit volební kalkulačku
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4 max-w-2xl mx-auto">
            🔒 Všechny vaše údaje zůstanou pouze ve vašem prohlížeči a nebudou nikam odesílány. 
            Slouží pouze k lepšímu přizpůsobení doporučení.
          </p>
        </div>
      </main>
    </div>
  )
}