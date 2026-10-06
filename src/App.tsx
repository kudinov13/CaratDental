import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
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
import { usePageMeta } from './seo/usePageMeta'

const BookingModal = lazy(() =>
  import('./components/BookingModal').then((m) => ({ default: m.BookingModal }))
)
const ChatBot = lazy(() => import('./components/ChatBot').then((m) => ({ default: m.ChatBot })))
const ServicesPage = lazy(() =>
  import('./pages/ServicesPage').then((m) => ({ default: m.ServicesPage }))
)
const DoctorsPage = lazy(() =>
  import('./pages/DoctorsPage').then((m) => ({ default: m.DoctorsPage }))
)
const PricesPage = lazy(() =>
  import('./pages/PricesPage').then((m) => ({ default: m.PricesPage }))
)
const CasesPage = lazy(() =>
  import('./pages/CasesPage').then((m) => ({ default: m.CasesPage }))
)
const ReviewsPage = lazy(() =>
  import('./pages/ReviewsPage').then((m) => ({ default: m.ReviewsPage }))
)
const ContactsPage = lazy(() =>
  import('./pages/ContactsPage').then((m) => ({ default: m.ContactsPage }))
)
const PrivacyPage = lazy(() =>
  import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage }))
)
const AdminPage = lazy(() =>
  import('./pages/admin/AdminPage').then((m) => ({ default: m.AdminPage }))
)

function Layout() {
  usePageMeta()
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingMounted, setBookingMounted] = useState(false)
  const [preselectDoctor, setPreselectDoctor] = useState('')
  const [chatMounted, setChatMounted] = useState(false)

  const openBooking = (doctorId?: string) => {
    setPreselectDoctor(doctorId || '')
    setBookingMounted(true)
    setBookingOpen(true)
  }

  // Чат монтируем после простоя / первого взаимодействия — не грузим его код на старте
  useEffect(() => {
    const mount = () => setChatMounted(true)
    const idleId = window.requestIdleCallback?.(mount)
    const timeoutId = idleId === undefined ? window.setTimeout(mount, 4000) : undefined
    const onInteract = () => mount()
    window.addEventListener('pointerdown', onInteract, { once: true })
    return () => {
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId)
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
      window.removeEventListener('pointerdown', onInteract)
    }
  }, [])

  return (
    <>
      <Header onBook={() => openBooking()} />
      <Outlet context={{ openBooking }} />
      <Footer />
      {bookingMounted && (
        <Suspense fallback={null}>
          <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} initialDoctorId={preselectDoctor} />
        </Suspense>
      )}
      {chatMounted && (
        <Suspense fallback={null}>
          <ChatBot onBook={() => openBooking()} />
        </Suspense>
      )}
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
            <Route path="/uslugi" element={<Suspense fallback={null}><ServicesPage /></Suspense>} />
            <Route path="/vrachi" element={<Suspense fallback={null}><DoctorsPage /></Suspense>} />
            <Route path="/tseny" element={<Suspense fallback={null}><PricesPage /></Suspense>} />
            <Route path="/kejsy" element={<Suspense fallback={null}><CasesPage /></Suspense>} />
            <Route path="/otzyvy" element={<Suspense fallback={null}><ReviewsPage /></Suspense>} />
            <Route path="/kontakty" element={<Suspense fallback={null}><ContactsPage /></Suspense>} />
            <Route path="/politika-konfidencialnosti" element={<Suspense fallback={null}><PrivacyPage /></Suspense>} />
            <Route path="/admin" element={<Suspense fallback={null}><AdminPage /></Suspense>} />
            <Route path="*" element={<LandingPage />} />
          </Route>
        </Routes>
      </ClinicProvider>
      </BranchProvider>
    </BrowserRouter>
  )
}

export default App
