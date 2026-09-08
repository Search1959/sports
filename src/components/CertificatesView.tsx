import React, { useState } from 'react';
import { Certificate, Organization, Member, Sport } from '../types.ts';
import {
  Award,
  Plus,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  X,
  Search,
  ExternalLink,
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
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedCertForView, setSelectedCertForView] = useState<Certificate | null>(null);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  // Form state
  const [form, setForm] = useState({
    recipientName: members[0]?.fullName || 'Aarav Sharma',
    certificateType: 'Achievement',
    title: 'Outstanding Performance in Youth Championship 2026',
    sportOrProgram: sports[0]?.name || 'Basketball',
    issueDate: new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.recipientName || !form.title) return;
    setIsSubmitting(true);
    try {
      await onGenerateCertificate(form);
      setIsGenerateOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Certificates & Digital Credentials</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue authenticated participation & achievement certificates with tamper-proof verification tokens.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Certificate</span>
        </button>
      </div>

      {/* Public Verification Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800">
        <div className="max-w-2xl">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Public Certificate Verification Engine</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Anyone (universities, scouts, employers) can enter a certificate token to verify authentic issuance.
          </p>

          <form onSubmit={handleManualVerify} className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Paste Token e.g. CERT-1-..."
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-hidden font-mono"
            />
            <button
              type="submit"
              disabled={verifying}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
            >
              {verifying ? 'Checking...' : 'Verify Token'}
            </button>
          </form>

          {verifyResult && (
            <div
              className={`mt-3 p-3 rounded-xl text-xs border ${
                verifyResult.valid
                  ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
                  : 'bg-rose-950/70 border-rose-700 text-rose-200'
              }`}
            >
              {verifyResult.valid ? (
                <div className="space-y-1">
                  <div className="font-bold flex items-center space-x-1 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>AUTHENTIC CERTIFICATE VERIFIED</span>
                  </div>
                  <div>
                    Recipient: <span className="font-bold text-white">{verifyResult.certificate.recipientName}</span>
                  </div>
                  <div>Title: {verifyResult.certificate.title}</div>
                  <div>Issuing Body: {verifyResult.certificate.orgName}</div>
                  <div>Verified Count: {verifyResult.certificate.verifiedCount} times</div>
                </div>
              ) : (
                <div>❌ {verifyResult.message}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Certificates Roster */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase font-mono">
                  {cert.certificateType}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Issue: {cert.issueDate}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-2">{cert.recipientName}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{cert.title}</p>
              <div className="text-xs text-slate-400 mt-1">Sport / Program: {cert.sportOrProgram}</div>

              {/* Verification Token */}
              <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] font-mono text-slate-600 break-all">
                <div className="text-[9px] uppercase font-bold text-slate-400">Verification Token</div>
                <div>{cert.verificationToken}</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Verified: {cert.verifiedCount}x</span>
              <button
                onClick={() => setSelectedCertForView(cert)}
                className="text-blue-600 font-semibold hover:underline flex items-center space-x-1"
              >
                <span>View Certificate</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Printable Certificate Modal */}
      {selectedCertForView && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border-4 border-amber-500/30 p-8 relative text-center">
            <button
              onClick={() => setSelectedCertForView(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-2 border-amber-600/40 p-8 rounded-xl bg-amber-50/20">
              <div className="text-xs uppercase font-bold tracking-widest text-amber-700">
                Official Certificate of {selectedCertForView.certificateType}
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mt-2">
                {activeOrg.name}
              </h2>
              <p className="text-xs text-slate-500">{activeOrg.city}, Est. {activeOrg.establishedYear || '1948'}</p>

              <div className="text-sm text-slate-600 mt-6 italic">This is proudly presented to</div>
              <div className="text-2xl font-bold text-blue-900 mt-1 font-serif">
                {selectedCertForView.recipientName}
              </div>

              <div className="text-xs text-slate-700 max-w-md mx-auto mt-4 leading-relaxed">
                For exemplary commitment and outstanding performance in{' '}
                <span className="font-semibold">{selectedCertForView.sportOrProgram}</span> -{' '}
                {selectedCertForView.title}.
              </div>

              <div className="mt-8 pt-6 border-t border-amber-200/80 flex items-center justify-between text-xs text-slate-600">
                <div className="text-left">
                  <div className="font-bold text-slate-900">Authorized Signature</div>
                  <div className="text-[10px] text-slate-400">Head of Athletics & Sports</div>
                </div>

                {/* QR stamp */}
                <div className="text-center font-mono text-[9px] text-slate-500">
                  <QrCode className="w-10 h-10 mx-auto text-slate-800" />
                  <div className="mt-0.5">{selectedCertForView.verificationToken.slice(0, 16)}...</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900">Issue Date</div>
                  <div className="text-[10px] text-slate-400">{selectedCertForView.issueDate}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedCertForView(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Certificate Modal */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Issue Authenticated Certificate</h3>
                <p className="text-xs text-slate-500">Generates tamper-proof verification token</p>
              </div>
              <button
                onClick={() => setIsGenerateOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={form.recipientName}
                  onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={form.certificateType}
                    onChange={(e) => setForm({ ...form, certificateType: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Achievement">Achievement</option>
                    <option value="Participation">Participation</option>
                    <option value="Winner">Winner</option>
                    <option value="Runner-Up">Runner-Up</option>
                    <option value="MVP">Most Valuable Player (MVP)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sport / Program</label>
                  <select
                    value={form.sportOrProgram}
                    onChange={(e) => setForm({ ...form, sportOrProgram: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {sports.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winner of State Youth Basketball Cup"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsGenerateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Generating...' : 'Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
