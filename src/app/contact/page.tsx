'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Custom Design Commission');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Send message to the owner's email using FormSubmit AJAX API
      const response = await fetch('https://formsubmit.co/ajax/deepaksabari28@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          _subject: `New ARTINOVA Inquiry: ${subject}`
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        throw new Error(data.message || 'Failed to submit form.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to dispatch email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-24 px-6 bg-ambient-glow relative overflow-hidden">
      {/* Decorative ambient glowing circles */}
      <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] rounded-full bg-burgundy-glow/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-10%] w-[500px] h-[500px] rounded-full bg-deep-bronze/10 blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Title */}
        <div className="flex flex-col items-center text-center gap-2 mb-16">
          <span className="font-poppins text-xs text-royal-gold uppercase tracking-[0.3em] font-semibold">Get In Touch</span>
          <h1 className="font-cinzel text-4xl md:text-6xl font-bold tracking-wide text-gold-gradient">
            Connect with Artisans
          </h1>
          <div className="w-16 h-[1px] bg-royal-gold/60 mt-2" />
          <p className="font-poppins text-xs md:text-sm text-soft-ivory/50 max-w-md leading-relaxed mt-3">
            Inquire about custom sizing, custom engraving, and bespoke bulk wedding/milestone commissions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Contact info card (Left - 5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Core Info Panel */}
            <div className="glass-panel p-8 rounded-lg border border-champagne-gold/5 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-royal-gold/5 blur-[50px] pointer-events-none" />
              
              <h3 className="font-cinzel text-sm uppercase tracking-widest text-champagne-gold font-bold border-b border-champagne-gold/10 pb-4">
                Artisan Headquarters
              </h3>

              <div className="flex flex-col gap-5">
                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded bg-royal-gold/5 border border-royal-gold/20 text-royal-gold mt-1">
                    <MapPin size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-poppins text-[10px] uppercase tracking-widest text-soft-ivory/30">Head Office Location</span>
                    <span className="font-poppins text-xs text-soft-ivory/80 leading-relaxed mt-1">
                      Chennai / Kanchipuram / Vandavasi,<br />
                      Tamil Nadu, India
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded bg-royal-gold/5 border border-royal-gold/20 text-royal-gold mt-1">
                    <Mail size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-poppins text-[10px] uppercase tracking-widest text-soft-ivory/30">Email Correspondence</span>
                    <a href="mailto:deepaksabari28@gmail.com" className="font-poppins text-xs text-royal-gold hover:text-champagne-gold transition-colors mt-1 font-semibold">
                      deepaksabari28@gmail.com
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded bg-royal-gold/5 border border-royal-gold/20 text-royal-gold mt-1">
                    <Phone size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-poppins text-[10px] uppercase tracking-widest text-soft-ivory/30">Telephone Registry</span>
                    <span className="font-poppins text-xs text-soft-ivory/80 mt-1 font-semibold">
                      +91 99942 03670 (Akash)
                    </span>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded bg-royal-gold/5 border border-royal-gold/20 text-royal-gold mt-1">
                    <Clock size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-poppins text-[10px] uppercase tracking-widest text-soft-ivory/30">Atelier Hours</span>
                    <span className="font-poppins text-xs text-soft-ivory/70 mt-1">
                      Mon &ndash; Fri: 09:00 &ndash; 18:00 IST <br />
                      Sat: 10:00 &ndash; 16:00 IST
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Note */}
            <div className="glass-panel p-6 rounded-lg border border-champagne-gold/5 flex items-start gap-3">
              <ShieldCheck className="text-royal-gold shrink-0 mt-0.5" size={16} />
              <div className="flex flex-col gap-1 font-poppins text-[10px] leading-relaxed text-soft-ivory/50">
                <span className="uppercase text-champagne-gold font-bold tracking-wider">Secured Channel Enforced</span>
                <span>All custom inquiries are directly dispatched to the executive artisan database. A representative will contact you within 24 business hours.</span>
              </div>
            </div>

          </div>

          {/* Contact form (Right - 7 columns) */}
          <div className="lg:col-span-7">
            <div className="glass-card p-8 md:p-10 rounded-lg border border-champagne-gold/10">
              <h3 className="font-cinzel text-sm uppercase tracking-widest text-champagne-gold font-semibold mb-6 flex items-center gap-2">
                <MessageSquare size={16} className="text-royal-gold" /> Compose Inquiry Message
              </h3>

              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-200 text-xs p-6 rounded-lg flex flex-col gap-4 font-poppins text-center items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-2">
                    <Send size={18} />
                  </div>
                  <h4 className="font-cinzel text-sm uppercase tracking-wider text-emerald-300 font-bold">Message Dispatched</h4>
                  <p className="text-soft-ivory/60 max-w-sm">
                    Thank you. Your custom request has been successfully queued. A confirmation email has been forwarded to you.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-2 text-royal-gold font-bold text-xs uppercase tracking-wider hover:text-champagne-gold transition-colors"
                  >
                    Send Another Inquiry
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {error && (
                    <div className="bg-red-950/40 border border-red-500/20 text-red-200 text-xs p-4 rounded font-poppins">
                      {error}
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50 pl-1 font-semibold">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50 pl-1 font-semibold">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patron@luxury.com"
                      className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory"
                    />
                  </div>

                  {/* Subject Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50 pl-1 font-semibold">Inquiry Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory cursor-pointer"
                    >
                      <option value="Custom Design Commission">Custom Design Commission</option>
                      <option value="Wedding / Bulk Registry">Wedding / Bulk Registry</option>
                      <option value="Corporate Gifting Programs">Corporate Gifting Programs</option>
                      <option value="Material & Crafting Inquiries">Material & Crafting Inquiries</option>
                      <option value="Other Inquiries">Other Inquiries</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-poppins text-[10px] uppercase tracking-wider text-soft-ivory/50 pl-1 font-semibold">Your Message</label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Outline your bespoke request, sizing requirements, color options..."
                      className="bg-matte-black/55 border border-champagne-gold/15 py-3 px-4 text-xs font-poppins rounded focus:outline-none focus:border-royal-gold/60 text-soft-ivory resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-4 bg-royal-gold text-matte-black font-poppins text-xs font-bold uppercase tracking-[0.25em] rounded hover:bg-champagne-gold hover:shadow-[0_0_15px_rgba(214,175,55,0.4)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'SENDING INQUIRY...' : 'SEND MESSAGE'}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
