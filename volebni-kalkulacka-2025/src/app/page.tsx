'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Bot, ArrowRight } from 'lucide-react'

export default function Home() {
  const [statsVisible, setStatsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const features = [
    {
      icon: '🧮',
      title: 'Volební kalkulačka',
      description: 'Zjistěte, která politická strana nejlépe odpovídá vašim názorům. 26 stran, 20 témat, 100% transparentnost.',
      href: '/calculator-setup',
      status: '✅ Hotovo',
      statusColor: 'bg-green-500'
    },
    {
      icon: '🤖',
      title: 'AI Chatbot',
      description: 'Ptejte se AI na cokoliv o volbách, programech stran a politických tématech. Rychlé a přesné odpovědi.',
      href: '#',
      status: '🚧 Připravujeme',
      statusColor: 'bg-orange-500'
    },
    {
      icon: '👥',
      title: 'Profily stran',
      description: 'Detailní profily všech 26 politických stran s grafy, statistikami a programovými prioritami.',
      href: '/party-profiles',
      status: '✅ Hotovo',
      statusColor: 'bg-green-500'
    },
    {
      icon: '🗺️',
      title: 'Interaktivní mapa',
      description: 'Zjistěte volební preference ve vašem regionu, výsledky z minulých voleb a průzkumy veřejného mínění.',
      href: '#',
      status: '🚧 Připravujeme',
      statusColor: 'bg-orange-500'
    },
    {
      icon: '📊',
      title: 'Volební průzkumy',
      description: 'Aktuální preference od STEM, Median a NMS v interaktivních grafech a trendech.',
      href: '/stem-polls',
      status: '✅ Hotovo',
      statusColor: 'bg-green-500'
    },
    {
      icon: '📅',
      title: 'Volební události',
      description: 'Kalendář předvolebních debat, meetingů s kandidáty a dalších důležitých událostí ve vašem regionu.',
      href: '#',
      status: '🚧 Připravujeme',
      statusColor: 'bg-orange-500'
    }
  ]

  const stats = [
    { number: '26', label: 'Politických stran' },
    { number: '20', label: 'Klíčových témat' },
    { number: '100%', label: 'Transparentnost' },
    { number: '0', label: 'Politické předsudky' }
  ]

  return (
    <div className="min-h-screen">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 -z-10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-20 h-20 bg-white/10 rounded-full top-[10%] left-[10%] animate-pulse"></div>
          <div className="absolute w-16 h-16 bg-white/10 rounded-full top-[70%] right-[20%] animate-bounce delay-200"></div>
          <div className="absolute w-24 h-24 bg-white/10 rounded-full top-[40%] right-[10%] animate-pulse delay-500"></div>
          <div className="absolute w-12 h-12 bg-white/10 rounded-full bottom-[20%] left-[20%] animate-bounce delay-700"></div>
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
            🗳️ Volby 2025
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Funkce</a>
            <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">O projektu</a>
            <a href="/calculator" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Kalkulačka</a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative pt-24 pb-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              🗳️ Volby 2025 - Hlavní rozcestník
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
              Vítejte v kompletním volebním portálu pro české volby 2025. 
              Vyberte si, co vás zajímá - kalkulačka, AI chatbot, profily stran a mnoho dalšího.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <a 
                href="/calculator-setup"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all transform hover:-translate-y-1 hover:shadow-xl text-center font-medium text-lg"
              >
                🧮 Volební kalkulačka
              </a>
              <a 
                href="#features"
                className="bg-white/20 text-white border-2 border-white/30 px-8 py-4 rounded-lg hover:bg-white/30 transition-all transform hover:-translate-y-1 hover:shadow-xl text-center font-medium text-lg backdrop-blur-sm"
              >
                📋 Všechny funkce
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
              Vyberte si, co vás zajímá
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 cursor-pointer border border-gray-100 relative group"
                  onClick={() => {
                    if (feature.href === '#') {
                      alert(`${feature.title} bude brzy k dispozici! 🚀\n\nPracujeme na této funkci a bude přidána v následujících týdnech. Zatím si můžete vyzkoušet Volební kalkulačku.`)
                    } else if (feature.title === 'Volební kalkulačka') {
                      window.location.href = '/calculator-setup'
                    } else if (feature.title === 'Profily stran') {
                      window.location.href = '/party-profiles'
                    } else {
                      window.location.href = feature.href
                    }
                  }}
                >
                  <div className={`absolute top-4 right-4 ${feature.statusColor} text-white text-xs px-2 py-1 rounded-full font-semibold`}>
                    {feature.status}
                  </div>
                  
                  <div className="text-5xl mb-4 group-hover:animate-bounce">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className={`container mx-auto px-4 transition-all duration-1000 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sekce Politický Asistent */}
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <Bot className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Zeptejte se našeho Politického Asistenta</h2>
            <p className="text-lg text-gray-600 mb-6">
              Máte konkrétní dotaz? Náš AI asistent, postavený na datech z volebních programů a ověřených zdrojů, vám pomůže najít odpověď. Zeptejte se na cokoliv od daní po zahraniční politiku.
            </p>
            <Link href="/chat">
              <Button size="lg" className="text-lg px-8 py-6">
                Spustit asistenta
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Jak to funguje */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Jak to funguje?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Náš volební portál je navržen tak, aby vám poskytl všechny potřebné informace a nástroje pro snadné a informované rozhodování ve volbách. Zde je několik klíčových funkcí, které nabízíme:
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                1. Volební kalkulačka
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Naše kalkulačka vám pomůže zjistit, která politická strana nejlépe odpovídá vašim názorům na základě vašich odpovědí na klíčové otázky.
              </p>
              
              <Link href="/calculator-setup" className="text-blue-600 hover:underline">
                Vyzkoušejte kalkulačku
              </Link>
            </div>

            <div className="text-left">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                2. AI Chatbot
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Náš AI chatbot je tu pro vás, aby odpověděl na jakékoliv dotazy ohledně voleb, politických stran a témat. Stačí se zeptat!
              </p>
              
              <Link href="/chat" className="text-blue-600 hover:underline">
                Zeptejte se chatbota
              </Link>
            </div>

            <div className="text-left">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                3. Profily stran
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Podívejte se na detailní profily všech politických stran, které se účastní voleb. Zjistěte více o jejich programech a prioritách.
              </p>
              
              <Link href="/party-profiles" className="text-blue-600 hover:underline">
                Prozkoumat profily stran
              </Link>
            </div>

            <div className="text-left">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                4. Volební události
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Sledujte kalendář předvolebních událostí ve vašem regionu, včetně debat, meetingů a dalších akcí.
              </p>
              
              <Link href="#" className="text-blue-600 hover:underline">
                Zobrazit události
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <a href="/calculator" className="hover:text-blue-400 transition-colors">Kalkulačka</a>
            <a href="#about" className="hover:text-blue-400 transition-colors">O projektu</a>
            <a href="#privacy" className="hover:text-blue-400 transition-colors">Ochrana dat</a>
            <a href="#contact" className="hover:text-blue-400 transition-colors">Kontakt</a>
          </div>
          <p className="text-gray-400">
            &copy; 2025 Volby 2025. Nestranný nástroj pro informované volby.
          </p>
        </div>
      </footer>
    </div>
  )
}
