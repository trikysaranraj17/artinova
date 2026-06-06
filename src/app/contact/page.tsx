'use client';

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://formsubmit.co/ajax/deepaksabari28@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: `New ARTINOVA Inquiry from ${name}`
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
    <div className="min-h-screen pt-32 pb-24 px-6 bg-[#0A0A0A] relative overflow-hidden font-body select-none">
      {/* Golden backdrop glow */}
      <div className="absolute top-1/4 left-[-10%] w-[400px] h-[400px] bg-[#C9A84C]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-10%] w-[400px] h-[400px] bg-[#C9A84C]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Title Section */}
        <div className="text-center mb-16 md:mb-24">
          <h1 className="text-3xl md:text-5xl font-display font-semibold tracking-[0.25em] text-[#F5F0E8] uppercase leading-none">
            GET IN <span className="text-[#C9A84C]">TOUCH</span>
          </h1>
          <div className="w-10 h-[1px] bg-[#C9A84C] mt-6 mx-auto" />
          <p className="text-xs md:text-sm text-[#9A8F7E]/70 max-w-lg mx-auto leading-relaxed mt-4 italic font-body">
            Connect with our curation team to bring luxury resin art to your doorstep.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:gap-24 items-start">
          
          {/* Left Column: LUXURY CONCIERGE */}
          <div className="bg-[#111111] border border-[#C9A84C]/10 p-8 md:p-12 rounded-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#C9A84C]/5 blur-[60px] pointer-events-none" />
            
            <h2 className="text-xl font-display font-bold text-[#F5F0E8] tracking-widest uppercase mb-8">
              LUXURY <span className="text-[#C9A84C]">CONCIERGE</span>
            </h2>

            <div className="flex flex-col gap-6 font-sans">
              <div>
                <h4 className="text-[10px] text-[#C9A84C] tracking-widest uppercase mb-1 font-bold">Curation Management</h4>
                <p className="text-lg font-display text-white font-medium">Mr. Akash</p>
              </div>

              <div>
                <h4 className="text-[10px] text-[#C9A84C] tracking-widest uppercase mb-1 font-bold">WhatsApp Concierge</h4>
                <p className="text-lg font-mono text-white font-semibold">+91 99942 03670</p>
              </div>

              <div>
                <h4 className="text-[10px] text-[#C9A84C] tracking-widest uppercase mb-1 font-bold">Direct Correspondence</h4>
                <p className="text-sm font-mono text-[#9A8F7E] font-medium break-all select-all">deepaksabari28@gmail.com</p>
              </div>

              <a 
                href="https://wa.me/919994203670" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full mt-6 py-4 bg-transparent border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0A0A0A] font-accent text-[10px] font-bold uppercase tracking-widest text-center transition-all duration-300 rounded shadow-md hover:shadow-[0_0_15px_rgba(201,168,76,0.3)] block cursor-pointer"
              >
                CONNECT ON WHATSAPP
              </a>
            </div>
          </div>

          {/* Right Column: DIRECT INQUIRY FORM */}
          <div className="bg-[#111111] border border-[#C9A84C]/10 p-8 md:p-12 rounded-xl shadow-2xl">
            {success ? (
              <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-200 text-xs p-6 rounded-lg flex flex-col gap-4 text-center items-center font-sans">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-2">
                  <Send size={18} />
                </div>
                <h4 className="font-display text-base uppercase tracking-wider text-emerald-300 font-bold">Inquiry Dispatched</h4>
                <p className="text-[#9A8F7E]/85 max-w-xs leading-relaxed font-body">
                  Thank you. Your bespoke inquiry has been sent to our desk. We will connect with you shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-2 text-[#C9A84C] font-accent font-bold text-[10px] uppercase tracking-widest hover:text-[#F5F0E8] transition-colors cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-sans">
                <h2 className="text-xl font-display font-bold text-[#F5F0E8] tracking-widest uppercase mb-2">
                  DIRECT <span className="text-[#C9A84C]">INQUIRY</span>
                </h2>

                {error && (
                  <div className="bg-red-950/30 border border-red-500/20 text-red-200 text-xs p-4 rounded">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="YOUR NAME"
                    className="bg-[#0A0A0A] border border-[#C9A84C]/15 py-3.5 px-4 text-xs rounded focus:outline-none focus:border-[#C9A84C]/60 text-white placeholder-[#9A8F7E]/45 uppercase font-medium tracking-wider"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="YOUR EMAIL"
                    className="bg-[#0A0A0A] border border-[#C9A84C]/15 py-3.5 px-4 text-xs rounded focus:outline-none focus:border-[#C9A84C]/60 text-white placeholder-[#9A8F7E]/45 uppercase font-medium tracking-wider"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="HOW CAN WE ASSIST YOU?"
                    className="bg-[#0A0A0A] border border-[#C9A84C]/15 py-3.5 px-4 text-xs rounded focus:outline-none focus:border-[#C9A84C]/60 text-white placeholder-[#9A8F7E]/45 resize-none uppercase font-medium tracking-wider leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-4 bg-[#C9A84C] text-[#0A0A0A] font-accent text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[#F5F0E8] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      SENDING INQUIRY...
                    </>
                  ) : (
                    'SEND INQUIRY'
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
