import Nav from './components/Nav'
import Footer from './components/Footer'
import Hero from './sections/Hero'
import QuestionSection from './sections/QuestionSection'
import DataSection from './sections/DataSection'
import MethodSection from './sections/MethodSection'
import ResultsSection from './sections/ResultsSection'
import TakeawaySection from './sections/TakeawaySection'

function App() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <QuestionSection />
        <DataSection />
        <MethodSection />
        <ResultsSection />
        <TakeawaySection />
      </main>
      <Footer />
    </div>
  )
}

export default App
