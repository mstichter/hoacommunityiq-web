import ContactForm from './components/ContactForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1A5C38] flex items-center justify-center">
            <span className="text-white font-bold text-sm">IQ</span>
          </div>
          <span className="font-bold text-lg text-[#1A5C38]">CommunityIQ</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#features" className="hover:text-[#1A5C38] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#1A5C38] transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-[#1A5C38] transition-colors">Pricing</a>
        </div>
        <a href="#contact" className="bg-[#1A5C38] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#154d30] transition-colors">
          Get Started
        </a>
      </nav>

      {/* Hero */}
      <section className="px-8 pt-20 pb-24 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-[#EAF3DE] text-[#1A5C38] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <span>🏘️</span> Built for HOA boards and residents
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Modern HOA management,{" "}
          <span className="text-[#1A5C38]">finally simple</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          CommunityIQ gives your HOA a mobile app for residents and a web dashboard for your board — all connected in real time. No spreadsheets. No email chains. Just clarity.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#contact" className="bg-[#1A5C38] text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-[#154d30] transition-colors w-full sm:w-auto">
            Request a Demo
          </a>
          <a href="#features" className="border border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-base font-semibold hover:border-gray-300 hover:bg-gray-50 transition-colors w-full sm:w-auto">
            See Features →
          </a>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#1A5C38] py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-8 text-center">
          {[
            { value: "< 24h", label: "Setup time" },
            { value: "100%", label: "Mobile + web" },
            { value: "Real-time", label: "Push notifications" },
            { value: "$0", label: "Per-resident fees" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-green-200">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything your HOA needs</h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">One platform. Two interfaces. Built for boards who want to spend less time managing and more time leading.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "🏊", title: "Pool Management", desc: "Real-time status updates, incident reports, water feature controls, and pool closure notifications — all from the app." },
            { icon: "🏗️", title: "ARC Requests", desc: "Residents submit architectural requests with photos. Board reviews and approves with automatic push notifications." },
            { icon: "📅", title: "Amenity Booking", desc: "Residents book the clubhouse and amenities. Board approves or denies with one click." },
            { icon: "📰", title: "Newsletters & Minutes", desc: "Upload PDFs or type content directly. Residents are notified instantly and can read from the app." },
            { icon: "🔔", title: "Push Notifications", desc: "Targeted alerts for pool incidents, ARC decisions, booking updates, and community announcements." },
            { icon: "📋", title: "Rules & Documents", desc: "CC&Rs, bylaws, and HOA rules are searchable by AI. Residents get instant answers — not a 40-page PDF." },
            { icon: "🚨", title: "Violation Reports", desc: "Board members log violations with photos, addresses, and descriptions. Tracked and documented." },
            { icon: "👥", title: "Resident Directory", desc: "Secure resident profiles with roles, contact info, and notification preferences — managed by the board." },
            { icon: "📊", title: "Board Dashboard", desc: "A web portal for your board to manage everything — requests, bookings, residents, documents, and more." },
          ].map((f) => (
            <div key={f.title} className="bg-gray-50 rounded-2xl p-6 hover:bg-[#EAF3DE] transition-colors group">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#1A5C38]">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 px-8 py-24">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Up and running in a day</h2>
          <p className="text-lg text-gray-500">We handle the setup. Your board handles the community.</p>
        </div>
        <div className="max-w-3xl mx-auto">
          {[
            { step: "01", title: "Tell us about your HOA", desc: "Share your community name, resident count, and what features matter most. We configure everything for you." },
            { step: "02", title: "We set up your platform", desc: "Your branded app and board dashboard are ready within 24 hours. We import your resident list and documents." },
            { step: "03", title: "Residents download the app", desc: "Send one email. Residents sign up, get verified, and are immediately connected to your community." },
            { step: "04", title: "Your board takes over", desc: "The board dashboard lets your team manage everything — no technical knowledge required." },
          ].map((s, i) => (
            <div key={s.step} className="flex gap-6 mb-10 last:mb-0">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1A5C38] text-white flex items-center justify-center font-bold text-sm">
                {s.step}
              </div>
              <div className="pt-2">
                <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                {i < 3 && <div className="ml-[-31px] mt-4 w-px h-6 bg-gray-200" />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-8 py-24 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, flat pricing</h2>
          <p className="text-lg text-gray-500">No per-resident fees. No hidden charges. Just one monthly rate for your whole community.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Starter */}
          <div className="border border-gray-200 rounded-2xl p-8">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Starter</div>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-5xl font-bold text-gray-900">$99</span>
              <span className="text-gray-400 pb-2">/month</span>
            </div>
            <p className="text-sm text-gray-500 mb-8">Perfect for smaller HOAs up to 150 homes.</p>
            <ul className="space-y-3 mb-8">
              {["Mobile app for residents", "Board web dashboard", "Pool management", "ARC requests", "Amenity booking", "Newsletter & meeting minutes", "Push notifications", "Document library"].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="text-[#1A5C38]">✓</span> {f}
                </li>
              ))}
            </ul>
            <a href="#contact" className="block text-center border border-[#1A5C38] text-[#1A5C38] px-6 py-3 rounded-xl font-semibold hover:bg-[#EAF3DE] transition-colors">
              Get Started
            </a>
          </div>

          {/* Community */}
          <div className="bg-[#1A5C38] rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white text-[#1A5C38] text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
            <div className="text-sm font-semibold text-green-200 uppercase tracking-wide mb-4">Community</div>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-5xl font-bold text-white">$199</span>
              <span className="text-green-200 pb-2">/month</span>
            </div>
            <p className="text-sm text-green-200 mb-8">For larger HOAs and communities with active boards.</p>
            <ul className="space-y-3 mb-8">
              {["Everything in Starter", "Unlimited residents", "AI rules assistant", "Violation tracking", "Custom branding", "Priority support", "Onboarding call included", "Data migration assistance"].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-white">
                  <span className="text-green-300">✓</span> {f}
                </li>
              ))}
            </ul>
            <a href="#contact" className="block text-center bg-white text-[#1A5C38] px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors">
              Get Started
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-gray-50 px-8 py-24">
        <div className="max-w-xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to modernize your HOA?</h2>
          <p className="text-lg text-gray-500">Fill out the form and we'll be in touch within one business day.</p>
        </div>
        <ContactForm />
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1A5C38] flex items-center justify-center">
              <span className="text-white font-bold text-xs">IQ</span>
            </div>
            <span className="font-semibold text-[#1A5C38]">CommunityIQ</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 CommunityIQ. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="mailto:hello@hoacommunityiq.com" className="hover:text-[#1A5C38] transition-colors">hello@hoacommunityiq.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
