'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const faqs = [
  {
    question: 'How long does it take for my music to go live?',
    answer: 'Your music typically goes live on all major platforms within 24-48 hours after submission. Some stores like Spotify and Apple Music may take up to 5 business days for new releases.',
  },
  {
    question: 'Do I keep 100% of my royalties?',
    answer: 'Yes! RDistro does not take any percentage of your royalties. You keep 100% of what you earn from streaming and downloads. We only charge a small annual subscription fee.',
  },
  {
    question: 'Which platforms will my music be distributed to?',
    answer: 'Your music will be distributed to 150+ platforms including Spotify, Apple Music, Amazon Music, YouTube Music, Deezer, Tidal, TikTok, Instagram/Facebook, and many more.',
  },
  {
    question: 'Can I schedule my release date?',
    answer: 'Absolutely! You can schedule your release up to 6 months in advance. We recommend scheduling at least 2-3 weeks ahead to allow time for pre-save campaigns and playlist pitching.',
  },
  {
    question: 'How do I get paid?',
    answer: 'Royalties are collected monthly and paid out through your preferred payment method (PayPal, bank transfer, or Payoneer). You can view detailed earnings reports in your dashboard.',
  },
  {
    question: 'Can I remove my music from platforms?',
    answer: 'Yes, you have full control over your releases. You can request takedowns at any time through your dashboard, and your music will be removed from all platforms within 24-48 hours.',
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error')
      setErrorMessage('Please fill in all required fields.')
      return
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', message: '' })
      } else {
        throw new Error('Failed to send message')
      }
    } catch {
      setStatus('error')
      setErrorMessage('There was an error trying to submit your form. Please try again.')
    }
  }

  return (
    <>
      <Header />
      
      <main className="pt-24 min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="py-12 md:py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600 mb-6">
              💬 We&apos;d love to hear from you
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Get in Touch
            </h1>
            <div className="w-20 h-1 bg-black mx-auto rounded-full"></div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Left Column - Info */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">
                  Reach Out to Us
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  We&apos;re here to help you with all your music distribution needs. 
                  Don&apos;t hesitate to contact us today!
                </p>

                {/* Email Card */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <a 
                        href="mailto:support@rdistro.net" 
                        className="text-lg font-semibold text-black hover:text-gray-700"
                      >
                        support@rdistro.net
                      </a>
                    </div>
                  </div>
                </div>

                {/* Response time */}
                <div className="mb-8 p-5 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Fast Response</p>
                      <p className="text-sm text-green-600">Usually within 24 hours</p>
                    </div>
                  </div>
                </div>

                {/* Follow Us */}
                <div>
                  <h3 className="text-lg font-bold text-black mb-4">Follow Us</h3>
                  <div className="flex gap-3">
                    <a 
                      href="https://www.facebook.com/rdistro.official"
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="w-11 h-11 bg-white border border-gray-200 hover:bg-black hover:text-white rounded-lg flex items-center justify-center transition-all"
                      aria-label="Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a 
                      href="#"
                      className="w-11 h-11 bg-white border border-gray-200 hover:bg-black hover:text-white rounded-lg flex items-center justify-center transition-all"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    <a 
                      href="#"
                      className="w-11 h-11 bg-white border border-gray-200 hover:bg-black hover:text-white rounded-lg flex items-center justify-center transition-all"
                      aria-label="Twitter"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                    <a 
                      href="#"
                      className="w-11 h-11 bg-white border border-gray-200 hover:bg-black hover:text-white rounded-lg flex items-center justify-center transition-all"
                      aria-label="YouTube"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column - Contact Form */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
                <h3 className="text-xl font-bold text-black mb-6">Send us a message</h3>
                
                {status === 'success' ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold text-black mb-2">Message Sent!</h4>
                    <p className="text-gray-600 mb-6">Thank you for contacting us. We&apos;ll get back to you soon.</p>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="px-5 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {status === 'error' && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {errorMessage}
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none"
                        placeholder="john@example.com"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none resize-none"
                        placeholder="How can we help you?"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="w-full bg-black text-white py-3.5 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {status === 'sending' ? (
                        <>
                          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-20 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600">
                Find quick answers to common questions about our service.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium text-black">{faq.question}</span>
                    <svg 
                      className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${openFaq === index ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-4 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Still have questions */}
            <div className="mt-10 text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold text-black mb-2">Still have questions?</h3>
              <p className="text-gray-600 mb-4">Can&apos;t find the answer you&apos;re looking for? Reach out to our support team.</p>
              <a 
                href="mailto:support@rdistro.net"
                className="inline-block px-5 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
              >
                Contact Support
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
