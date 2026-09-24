import React, { useState } from 'react';
import { Certificate, Organization, Member, Sport } from '../types.ts';
import { MembershipCardModal } from './MembershipCardModal.tsx';
import { SportsCertificateModal, SportsCertTemplate } from './SportsCertificateModal.tsx';
import { getAthleteName, getAthleteCode, getAthleteMobile, getAthleteSports } from './MembersView.tsx';
import {
  Award,
  Plus,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  X,
  Search,
  ExternalLink,
  CreditCard,
  Printer,
  MessageCircle,
  Share2,
  Trophy,
  Filter,
  Sparkles,
  Layers,
  ChevronRight,
  FileCheck,
} from 'lucide-react';

interface CertificatesViewProps {
  certificates: Certificate[];
  activeOrg: Organization;
  members: Member[];
  sports: Sport[];
  onGenerateCertificate: (certData: any) => Promise<void>;
  onVerifyToken: (token: string) => Promise<any>;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  certificates,
  activeOrg,
  members,
  sports,
  onGenerateCertificate,
  onVerifyToken,
}) => {
  const [activeTab, setActiveTab] = useState<'certificates' | 'id_cards' | 'verify'>('certificates');
  const [isSportsCertModalOpen, setIsSportsCertModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<number | undefined>(undefined);
  const [selectedCertForView, setSelectedCertForView] = useState<Certificate | null>(null);

  // Search & filter state
  const [certSearch, setCertSearch] = useState('');
  const [selectedSportFilter, setSelectedSportFilter] = useState('all');
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      (cert.recipientName || '').toLowerCase().includes(certSearch.toLowerCase()) ||
      (cert.title || '').toLowerCase().includes(certSearch.toLowerCase()) ||
      (cert.verificationToken || '').toLowerCase().includes(certSearch.toLowerCase());
    const matchesSport =
      selectedSportFilter === 'all' ||
      (cert.sportOrProgram || '').toLowerCase().includes(selectedSportFilter.toLowerCase());
    return matchesSearch && matchesSport;
  });

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInput) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await onVerifyToken(verifyInput.trim());
      setVerifyResult(res);
    } catch (err: any) {
      setVerifyResult({ valid: false, message: err.message || 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const handleShareCertWhatsApp = (cert: Certificate) => {
    const member = members.find((m) => m.id === cert.memberId || getAthleteName(m) === cert.recipientName);
    const phone = member ? getAthleteMobile(member) : '+91 98300 00000';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const certVerifyUrl = `${window.location.origin}/#verify-${cert.verificationToken}`;
    const text = encodeURIComponent(
      `🏆 Official Certificate of Athletic Distinction\n\n` +
      `Recipient: *${cert.recipientName}*\n` +
      `Award: *${cert.title}*\n` +
      `Discipline: *${cert.sportOrProgram || 'Sports'}*\n` +
      `Issuing Academy: *${activeOrg.name}*\n` +
      `Verification Token: *${cert.verificationToken}*\n\n` +
      `Verify authentic issuance anytime on the registry:\n${certVerifyUrl}`
    );
    window.open(`https://wa.me/${cleanPhone || ''}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Official Credentials, ID Cards & Certificates</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
              Tamper-Proof
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue CR80 PVC membership ID cards with turnstile barcodes and 8 different sports certificate templates.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              setSelectedMemberForCard(members[0]?.id);
              setIsCardModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>Issue Membership Card</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSportsCertModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Award className="w-4 h-4 text-white" />
            <span>Issue Sports Certificate</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('certificates')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'certificates'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Sports Certificates ({certificates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('id_cards')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'id_cards'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Membership ID Cards ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('verify')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'verify'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Anti-Fraud Registry & Verification</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SPORTS CERTIFICATES */}
      {/* ========================================================================= */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          {/* Certificate Templates Highlight Banner */}
          <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-slate-900 text-white rounded-2xl p-5 border border-amber-800/40 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  8 Official Sports Templates
                </span>
                <span className="text-xs text-slate-300 font-mono">A4 Landscape Print-Ready</span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Specialized Sports Certificates Engine</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Includes Championship Gold, Silver Finalist, MVP Starburst, Coaching Camp Graduation, Martial Arts Dan/Belt Rank Promotion, Fitness Merit Grade, and Sportsmanship Awards.
              </p>
            </div>

            <button
              onClick={() => setIsSportsCertModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Certificate Studio</span>
            </button>
          </div>

          {/* Search & Sport Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                placeholder="Search athlete, title, or token..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedSportFilter}
                onChange={(e) => setSelectedSportFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
              >
                <option value="all">All Sports & Disciplines</option>
                {sports.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCertificates.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-extrabold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase font-mono tracking-wider">
                      {cert.certificateType}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Dated: {cert.issueDate}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base mt-2.5 leading-tight">
                    {cert.recipientName}
                  </h3>
                  <div className="text-xs font-semibold text-amber-700 mt-1">
                    {cert.rankOrPosition || 'Distinction'}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {cert.title}
                  </p>

                  <div className="mt-2.5 inline-flex items-center space-x-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    <span>Discipline:</span>
                    <strong className="text-slate-900">{cert.sportOrProgram || 'Athletics'}</strong>
                  </div>

                  {/* Verification Token */}
                  <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-mono text-slate-600 break-all">
                    <div className="text-[8px] uppercase font-bold text-slate-400 flex items-center justify-between">
                      <span>Verification Token</span>
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div className="font-bold text-slate-800">{cert.verificationToken}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleShareCertWhatsApp(cert)}
                    title="Deliver via WhatsApp"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-[11px]"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setSelectedCertForView(cert)}
                    className="text-blue-600 font-bold hover:text-blue-700 flex items-center space-x-1 hover:underline"
                  >
                    <span>View & Print</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MEMBERSHIP ID CARDS */}
      {/* ========================================================================= */}
      {activeTab === 'id_cards' && (
        <div className="space-y-4">
          {/* ID Card Studio Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-blue-500/20 text-cyan-300 border border-cyan-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  CR80 Plastic Card Format (85.6mm x 54mm)
                </span>
                <span className="text-xs text-slate-300 font-mono">Turnstile QR & Barcode</span>
              </div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span>Athlete & Club Membership Card Studio</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generate official PVC printable membership badges with high-resolution Code-128 turnstile barcode, encrypted gate QR matrix, 4 luxury finishes, emergency contact, and automated WhatsApp delivery.
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedMemberForCard(members[0]?.id);
                setIsCardModalOpen(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Open Card Studio</span>
            </button>
          </div>

          {/* Members Roster for Card Issuance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => {
              const athleteName = getAthleteName(member);
              const athleteCode = getAthleteCode(member);
              const athleteMobile = getAthleteMobile(member);
              const athleteSports = getAthleteSports(member);
              const primarySport = athleteSports[0]?.sportName || (member as any).sportName || 'Athletics';

              return (
                <div
                  key={member.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt={athleteName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                            {athleteName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate">{athleteName}</h4>
                        <div className="text-[11px] font-mono text-blue-700 font-bold">{athleteCode}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{primarySport}</div>
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Card Status:</span>
                        <span className="font-bold text-emerald-600">Active Pass</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Valid Thru:</span>
                        <span className="font-mono text-slate-800">{member.expiryDate || '2027-01-01'}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Blood Group:</span>
                        <span className="font-bold text-rose-600">{member.bloodGroup || 'B+'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedMemberForCard(member.id);
                        setIsCardModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                      <span>Issue Card</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedMemberForCard(member.id);
                        setIsCardModalOpen(true);
                      }}
                      title="Print Card"
                      className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PUBLIC ANTI-FRAUD VERIFICATION REGISTRY */}
      {/* ========================================================================= */}
      {activeTab === 'verify' && (
        <div className="space-y-6">
          <div className="bg-slate-950 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
            <div className="max-w-2xl">
              <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Universal Sports Credential & Card Verification Engine</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Cryptographic Anti-Fraud Authenticity Registry
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Universities, recruiters, state federations, and tournament scouts can verify any certificate token or athlete membership number issued by {activeOrg.name}.
              </p>

              <form onSubmit={handleManualVerify} className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Paste Certificate or Pass Token e.g. CERT-..."
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden font-mono"
                />
                <button
                  type="submit"
                  disabled={verifying}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
                >
                  {verifying ? 'Verifying...' : 'Verify Authenticity'}
                </button>
              </form>

              {verifyResult && (
                <div
                  className={`mt-4 p-4 rounded-2xl text-xs border ${
                    verifyResult.valid
                      ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
                      : 'bg-rose-950/70 border-rose-700 text-rose-200'
                  }`}
                >
                  {verifyResult.valid ? (
                    <div className="space-y-1.5">
                      <div className="font-black flex items-center space-x-1.5 text-emerald-300 text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>GENUINE OFFICIAL CREDENTIAL VERIFIED</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-800/40 text-slate-200">
                        <div>
                          Recipient: <strong className="text-white">{verifyResult.certificate.recipientName}</strong>
                        </div>
                        <div>
                          Honor: <strong className="text-white">{verifyResult.certificate.title}</strong>
                        </div>
                        <div>
                          Discipline: <span className="text-slate-300">{verifyResult.certificate.sportOrProgram || 'Athletics'}</span>
                        </div>
                        <div>
                          Issuing Academy: <span className="text-slate-300">{verifyResult.certificate.orgName || activeOrg.name}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>❌ {verifyResult.message}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Membership Card Studio Modal */}
      {isCardModalOpen && (
        <MembershipCardModal
          isOpen={isCardModalOpen}
          onClose={() => setIsCardModalOpen(false)}
          members={members}
          initialMemberId={selectedMemberForCard}
          activeOrg={activeOrg}
        />
      )}

      {/* Sports Certificate Studio Modal */}
      {isSportsCertModalOpen && (
        <SportsCertificateModal
          isOpen={isSportsCertModalOpen}
          onClose={() => setIsSportsCertModalOpen(false)}
          members={members}
          sports={sports}
          activeOrg={activeOrg}
          onIssueCertificate={onGenerateCertificate}
        />
      )}

      {/* Single Certificate Viewer Modal */}
      {selectedCertForView && (
        <SportsCertificateModal
          isOpen={Boolean(selectedCertForView)}
          onClose={() => setSelectedCertForView(null)}
          members={members}
          sports={sports}
          activeOrg={activeOrg}
          initialCertificate={selectedCertForView}
          onIssueCertificate={onGenerateCertificate}
        />
      )}
    </div>
  );
};
