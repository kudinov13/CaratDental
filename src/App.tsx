import { useState } from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { BookingModal } from './components/BookingModal'
import { ChatBot } from './components/ChatBot'
import { PageLoader } from './components/PageLoader'
import { ScrollToTop } from './components/ScrollToTop'
import { SkipLink } from './components/SkipLink'
import { About } from './components/sections/About'
import { Cases } from './components/sections/Cases'
import { CTA } from './components/sections/CTA'
import { Doctors } from './components/sections/Doctors'
import { FAQ } from './components/sections/FAQ'
import { Footer } from './components/sections/Footer'
import { Header } from './components/sections/Header'
import { Hero } from './components/sections/Hero'
import { Prices } from './components/sections/Prices'
import { Services } from './components/sections/Services'
import { Technology } from './components/sections/Technology'
import { Testimonials } from './components/sections/Testimonials'
import { BranchProvider } from './context/BranchContext'
import { ClinicProvider } from './context/ClinicContext'
import { useBooking } from './hooks/useBooking'
import { CasesPage } from './pages/CasesPage'
import { ContactsPage } from './pages/ContactsPage'
import { DoctorsPage } from './pages/DoctorsPage'
import { PricesPage } from './pages/PricesPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { AdminPage } from './pages/admin/AdminPage'
import { ReviewsPage } from './pages/ReviewsPage'
import { ServicesPage } from './pages/ServicesPage'

function Layout() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const openBooking = () => setBookingOpen(true)

  return (
    <>
      <Header onBook={openBooking} />
      <Outlet context={{ openBooking }} />
      <Footer />
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} />
      <ChatBot onBook={openBooking} />
    </>
  )
}

function LandingPage() {
  const { openBooking } = useBooking()

  return (
    <main id="main-content">
      <Hero onBook={openBooking} />
      <About />
      <Services />
      <Doctors onBook={openBooking} />
      <Cases />
      <div className="relative z-20 -mt-6 rounded-t-[1.75rem] bg-bg-primary py-5 md:py-8 lg:-mt-9 lg:rounded-t-[2.5rem]">
        <div className="shell grid gap-5 lg:grid-cols-2">
          <Prices />
          <Testimonials />
        </div>
      </div>
      <Technology />
      <FAQ />
      <CTA onBook={openBooking} />
    </main>
  )
}

function App() {
  const [loading, setLoading] = useState(true)

  return (
    <BrowserRouter>
      <BranchProvider>
      <ClinicProvider>
        {loading && <PageLoader onDone={() => setLoading(false)} />}
        <SkipLink />
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/uslugi" element={<ServicesPage />} />
            <Route path="/vrachi" element={<DoctorsPage />} />
            <Route path="/tseny" element={<PricesPage />} />
            <Route path="/kejsy" element={<CasesPage />} />
            <Route path="/otzyvy" element={<ReviewsPage />} />
            <Route path="/kontakty" element={<ContactsPage />} />
            <Route path="/politika-konfidencialnosti" element={<PrivacyPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<LandingPage />} />
          </Route>
        </Routes>
      </ClinicProvider>
      </BranchProvider>
    </BrowserRouter>
  )
}

export default App
