import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { BookingModal } from './components/BookingModal'
import { PageLoader } from './components/PageLoader'
import { SkipLink } from './components/SkipLink'
import { Cases } from './components/sections/Cases'
import { CTA } from './components/sections/CTA'
import { Doctors } from './components/sections/Doctors'
import { Footer } from './components/sections/Footer'
import { Header } from './components/sections/Header'
import { Hero } from './components/sections/Hero'
import { Prices } from './components/sections/Prices'
import { Services } from './components/sections/Services'
import { Testimonials } from './components/sections/Testimonials'

function LandingPage() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const openBooking = () => setBookingOpen(true)

  return (
    <>
      <Header onBook={openBooking} />
      <main id="main-content">
        <Hero onBook={openBooking} />
        <Services />
        <Doctors onBook={openBooking} />
        <Cases />
        <div className="relative z-20 -mt-6 rounded-t-[1.75rem] bg-bg-primary py-5 md:py-8 lg:-mt-9 lg:rounded-t-[2.5rem]">
          <div className="shell grid gap-5 lg:grid-cols-2">
            <Prices />
            <Testimonials />
          </div>
        </div>
        <CTA onBook={openBooking} />
      </main>
      <Footer onBook={openBooking} />
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} />
    </>
  )
}

function App() {
  const [loading, setLoading] = useState(true)

  return (
    <BrowserRouter>
      {loading && <PageLoader onDone={() => setLoading(false)} />}
      <SkipLink />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Future routes: /services, /doctors, /cases, /contacts */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
