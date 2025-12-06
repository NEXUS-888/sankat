import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Heart, Shield, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header showNavigation />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Hero */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              About Global Problems Map
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              A platform connecting people who care with crises that matter, enabling direct support
              to vetted organizations responding to global emergencies.
            </p>
          </div>

          {/* Mission */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Our Mission</h2>
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                Every day, millions of people are affected by conflicts, natural disasters, health crises,
                and humanitarian emergencies around the world. While these crises are often reported in the news,
                it can be difficult to find reliable information about what's happening and how to help.
              </p>
              <p>
                Global Problems Map exists to bridge that gap. We aggregate real-time crisis data, verify
                responding organizations, and provide a secure, transparent way for anyone to make a difference
                through direct donations to trusted charities on the ground.
              </p>
            </div>
          </section>

          {/* How It Works */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white">1. Explore Crises</h3>
                <p className="text-sm text-slate-400">
                  Browse an interactive map and list of active global crises. Filter by category,
                  severity, and location to find causes that matter to you.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white">2. Learn Details</h3>
                <p className="text-sm text-slate-400">
                  Read comprehensive information about each crisis, including the situation on the ground,
                  people affected, and organizations responding.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white">3. Support Charities</h3>
                <p className="text-sm text-slate-400">
                  Make secure donations directly to verified charities via Stripe. Track your impact
                  and see exactly where your support goes.
                </p>
              </div>
            </div>
          </section>

          {/* Data & Vetting */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Data & Charity Vetting</h2>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                We take data accuracy and charity vetting seriously:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <strong className="text-white">Crisis Data:</strong> Aggregated from reputable sources
                    including international organizations, NGOs, and verified news outlets. Updated regularly
                    to reflect current situations.
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <strong className="text-white">Charity Verification:</strong> All listed charities are
                    reviewed for legitimacy, transparency, and direct involvement in crisis response. We
                    prioritize organizations with proven track records.
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <strong className="text-white">Continuous Monitoring:</strong> We regularly review and
                    update our database to ensure information remains accurate and organizations maintain
                    their standards.
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Security & Privacy */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">Security & Privacy</h2>
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                <div className="space-y-3">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Your security and privacy are paramount:
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>All payments are processed by <strong className="text-white">Stripe</strong>, 
                      an industry-leading payment platform with bank-level security.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>We <strong className="text-white">never see or store</strong> your card details. 
                      Stripe handles all payment information securely.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>Your personal information is encrypted and stored securely. We only collect 
                      what's necessary to provide our service.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>We never sell or share your data with third parties for marketing purposes.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="pt-8 border-t border-white/5">
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>Disclaimer:</strong> Global Problems Map is a demonstration platform created
              for educational and informational purposes. While we strive for accuracy, this is not
              an official United Nations, government, or NGO product. Crisis data is aggregated from
              publicly available sources and may not be comprehensive or real-time. Always verify
              information with official sources before making decisions. Donations are processed
              securely through Stripe, but we recommend conducting your own due diligence on
              recipient organizations.
            </p>
          </section>

          {/* Back to Map Button */}
          <div className="flex justify-center pt-8">
            <Link to="/">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Map
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
