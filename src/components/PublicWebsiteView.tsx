import React, { useState } from 'react';
import { Organization, Sport, Program, Coach, Tournament, EventItem } from '../types.ts';
import {
  Trophy,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Users,
  CheckCircle,
  ArrowRight,
  Send,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface PublicWebsiteViewProps {
  activeOrg: Organization;
  sports: Sport[];
  programs: Program[];
  coaches: Coach[];
  tournaments: Tournament[];
  events: EventItem[];
  onSubmitLead: (leadData: any) => Promise<void>;
}

export const PublicWebsiteView: React.FC<PublicWebsiteViewProps> = ({
  activeOrg,
  sports,
  programs,
  coaches,
  tournaments,
  events,
  onSubmitLead,
}) => {
  const [theme, setTheme] = useState<'sports_club' | 'community_org' | 'pro_association'>('sports_club');
  const [leadForm, setLeadForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    interestedSport: sports[0]?.name || 'Basketball',
    age: 15,
    notes: 'Interested in competitive team coaching',
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.fullName || !leadForm.phone) return;
    setIsSubmittingLead(true);
    setLeadSuccess(false);
    try {
      await onSubmitLead(leadForm);
      setLeadSuccess(true);
      setLeadForm({
        fullName: '',
        phone: '',
        email: '',
        interestedSport: sports[0]?.name || 'Basketball',
        age: 15,
        notes: '',
      });
      setTimeout(() => setLeadSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme Switcher Bar for the Tenant */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800">Public Website Theme Engine:</span>
          <span className="text-xs text-slate-500">Live preview of tenant's public landing page</span>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setTheme('sports_club')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              theme === 'sports_club' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sports Club
          </button>
          <button
            onClick={() => setTheme('community_org')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              theme === 'community_org' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Community Youth
          </button>
          <button
            onClick={() => setTheme('pro_association')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              theme === 'pro_association' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pro Academy
          </button>
        </div>
      </div>

      {/* Public Landing Page Container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Hero Section */}
        <div className="relative bg-slate-950 text-white min-h-[360px] flex items-center">
          {activeOrg.coverImage && (
            <img
              src={activeOrg.coverImage}
              alt={activeOrg.name}
              className="absolute inset-0 w-full h-full object-cover opacity-35"
            />
          )}
          <div className="relative max-w-4xl mx-auto px-6 py-16 text-center space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-semibold text-white/90">
              <span>{activeOrg.type}</span>
              <span>•</span>
              <span>{activeOrg.city}</span>
              <span>•</span>
              <span>Est. {activeOrg.establishedYear || '1948'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {activeOrg.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
              {activeOrg.description ||
                'Fostering athletic excellence, sportsmanship, and youth development across generations.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#apply"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <span>Join or Inquire</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="#sports"
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl backdrop-blur-xs border border-white/20 transition-colors"
              >
                Explore Sports Roster
              </a>
            </div>
          </div>
        </div>

        {/* Sports & Disciplines Section */}
        <section id="sports" className="py-12 px-6 max-w-5xl mx-auto space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">Sports & Athletic Disciplines</h2>
            <p className="text-xs text-slate-500 mt-1">
              Structured coaching, competitive squads, and open recreational practice.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sports.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-3">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{s.name}</h3>
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                  {s.description || 'Comprehensive training, beginner to elite tournament preparation.'}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                  <span>Scoring: {s.scoringType}</span>
                  <a href="#apply" className="text-blue-600 font-semibold hover:underline">
                    Enroll →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Programs Section */}
        {programs.length > 0 && (
          <section className="py-12 px-6 bg-slate-50 border-t border-b border-slate-200">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="text-center max-w-xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-900">Community Health & Programs</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Wellness, yoga, and seasonal conditioning for all age brackets.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.map((p) => (
                  <div key={p.id} className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {p.type}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">₹{p.fee}/mo</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-2">{p.name}</h3>
                    <p className="text-xs text-slate-600 mt-1.5">{p.description}</p>
                    <div className="mt-3 text-xs text-slate-500 font-medium">
                      Schedule: {p.scheduleNotes || 'Regular batches'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Coaches Roster */}
        <section className="py-12 px-6 max-w-5xl mx-auto space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">Certified Coaching Staff</h2>
            <p className="text-xs text-slate-500 mt-1">
              Mentoring youth and athletes with accredited physical education standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coaches.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 flex items-center space-x-3">
                <img
                  src={c.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                  alt={c.fullName}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{c.fullName}</h3>
                  <div className="text-xs text-blue-600 font-medium">{c.type}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{c.qualification || 'Certified Coach'}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Public Application Form (Seamless CRM Integration) */}
        <section id="apply" className="py-12 px-6 bg-slate-900 text-white">
          <div className="max-w-2xl mx-auto">
            <div className="text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold">Apply for Membership & Sports Coaching</h2>
              <p className="text-xs text-slate-300">
                Submit your inquiry. Once approved by our team, you'll receive a digital member pass via WhatsApp!
              </p>
            </div>

            {leadSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-200 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  Thank you! Your application has been submitted to the club desk. We will reach out shortly.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Candidate Name"
                    value={leadForm.fullName}
                    onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile / WhatsApp Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98300 00000"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Interested Sport / Program</label>
                  <select
                    value={leadForm.interestedSport}
                    onChange={(e) => setLeadForm({ ...leadForm, interestedSport: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-hidden"
                  >
                    {sports.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    {programs.map((p) => (
                      <option key={p.id} value={p.name}>{p.name} (Program)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Experience</label>
                <textarea
                  rows={2}
                  placeholder="Prior sports experience, preferred time slot..."
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden"
                />
              </div>

              <div className="text-[11px] text-slate-400">
                By submitting, you agree to receive official club updates & verification codes via WhatsApp.
              </div>

              <button
                type="submit"
                disabled={isSubmittingLead}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmittingLead ? 'Submitting Application...' : 'Submit Official Application'}</span>
              </button>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="p-8 bg-slate-950 text-slate-400 text-xs border-t border-slate-800 text-center space-y-2">
          <div className="font-bold text-slate-200">{activeOrg.name}</div>
          <div>{activeOrg.address}, {activeOrg.city}, {activeOrg.country || 'India'}</div>
          <div>Phone: {activeOrg.phone || '+91 33 2238 0000'} • Email: {activeOrg.email || 'info@sportorg.com'}</div>
          <div className="text-[10px] text-slate-600 pt-2">Powered by SportOrg Multi-Tenant SaaS Platform</div>
        </footer>
      </div>
    </div>
  );
};
