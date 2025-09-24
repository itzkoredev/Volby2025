import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4 md:p-8">
      <div className="container mx-auto text-center max-w-4xl">
        <h1 className="text-6xl sm:text-8xl md:text-9xl font-bold text-gray-400 mb-4 md:mb-6 leading-tight">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
          Stránka nenalezena
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 px-4">
          Omlouváme se, ale stránka kterou hledáte neexistuje. 
          Možná byla přesunuta nebo smazána.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
          <Link 
            href="/"
            className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium touch-manipulation"
          >
            Zpět na hlavní stránku
          </Link>
          <Link 
            href="/calculator"
            className="border-2 border-blue-600 text-blue-600 px-6 py-4 rounded-lg hover:bg-blue-50 transition-colors text-center font-medium touch-manipulation"
          >
            Spustit kalkulačku
          </Link>
        </div>
      </div>
    </div>
  );
}
