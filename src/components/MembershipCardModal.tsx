import React, { useState } from 'react';
import { Member, Organization, MembershipCardTheme } from '../types.ts';
import { getAthleteName, getAthleteCode, getAthleteMobile, getAthleteSports } from './MembersView.tsx';
import {
  printIsolatedHtml,
  downloadCanvas,
  generateCardCanvas,
  generateA4PrintSheetCanvas,
  PrintCardData,
} from '../lib/printUtils.ts';
import {
  X,
  Printer,
  RotateCw,
  Share2,
  Download,
  QrCode,
  ShieldCheck,
  Sparkles,
  Phone,
  Calendar,
  CheckCircle2,
  Layers,
  ChevronDown,
  Award,
  CreditCard,
  MessageCircle,
  Loader2,
  AlertCircle,
  Eye,
  FileDown,
  ExternalLink,
} from 'lucide-react';

interface MembershipCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  initialMemberId?: number;
  activeOrg: Organization;
}

export const MembershipCardModal: React.FC<MembershipCardModalProps> = ({
  isOpen,
  onClose,
  members,
  initialMemberId,
  activeOrg,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<number>(
    initialMemberId || members[0]?.id || 1
  );
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [theme, setTheme] = useState<MembershipCardTheme>('elite_gold');
  const [printLayout, setPrintLayout] = useState<'single' | 'both'>('both');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'sheet'>('card');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [printFeedback, setPrintFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentMember =
    members.find((m) => m.id === selectedMemberId) || members[0] || ({} as Member);

  const athleteName = getAthleteName(currentMember);
  const athleteCode = getAthleteCode(currentMember);
  const athleteMobile = getAthleteMobile(currentMember);
  const athleteSports = getAthleteSports(currentMember);
  const primarySport = athleteSports[0]?.sportName || (currentMember as any).sportName || 'All-Round Athletics';
  const skillLevel = athleteSports[0]?.skillLevel || (currentMember as any).skillLevel || 'Squad Athlete';
  const bloodGroup = currentMember.bloodGroup || 'B+';
  const joinDate = currentMember.joiningDate || (currentMember as any).joinDate || '2026-01-01';
  const validUntil = currentMember.expiryDate || (currentMember as any).validUntil || '2027-01-01';
  const guardianInfo = currentMember.guardianName
    ? `${currentMember.guardianName} (${currentMember.guardianPhone || athleteMobile || 'Emergency'})`
    : athleteMobile || '+91 98300 00000';

  const themeStyles: Record<
    MembershipCardTheme,
    {
      cardBg: string;
      accentBorder: string;
      accentText: string;
      badgeBg: string;
      badgeText: string;
      headerBg: string;
      glowColor: string;
      name: string;
    }
  > = {
    elite_gold: {
      cardBg: 'from-slate-950 via-slate-900 to-neutral-900',
      accentBorder: 'border-amber-500/40',
      accentText: 'text-amber-400',
      badgeBg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-500/30',
      badgeText: 'text-amber-300',
      headerBg: 'from-amber-600 to-amber-800',
      glowColor: 'shadow-amber-500/10',
      name: 'Elite Onyx & Gold',
    },
    sapphire_pro: {
      cardBg: 'from-slate-950 via-blue-950 to-slate-900',
      accentBorder: 'border-cyan-500/40',
      accentText: 'text-cyan-400',
      badgeBg: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
      badgeText: 'text-cyan-300',
      headerBg: 'from-blue-600 to-cyan-700',
      glowColor: 'shadow-cyan-500/10',
      name: 'Sapphire Cyber Pro',
    },
    crimson_champion: {
      cardBg: 'from-slate-950 via-rose-950 to-neutral-900',
      accentBorder: 'border-rose-500/40',
      accentText: 'text-rose-400',
      badgeBg: 'bg-gradient-to-r from-rose-500/20 to-amber-500/10 border-rose-500/30',
      badgeText: 'text-rose-300',
      headerBg: 'from-rose-600 to-red-800',
      glowColor: 'shadow-rose-500/10',
      name: 'Crimson Champion',
    },
    emerald_classic: {
      cardBg: 'from-slate-950 via-emerald-950 to-slate-900',
      accentBorder: 'border-emerald-500/40',
      accentText: 'text-emerald-400',
      badgeBg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      badgeText: 'text-emerald-300',
      headerBg: 'from-emerald-600 to-teal-800',
      glowColor: 'shadow-emerald-500/10',
      name: 'Emerald Varsity',
    },
  };

  const currentTheme = themeStyles[theme];

  const cardData: PrintCardData = {
    orgName: activeOrg.name,
    orgLogo: activeOrg.logo,
    athleteName,
    athleteCode,
    athleteMobile,
    sport: primarySport,
    roleOrRank: skillLevel,
    bloodGroup,
    validPeriod: `${joinDate.slice(0, 7)} — ${validUntil.slice(0, 7)}`,
    guardianInfo,
    city: activeOrg.city || 'Central Sports Hub',
    website: `${window.location.host}/#${activeOrg.slug || 'club'}`,
    theme,
    photoUrl: currentMember.photoUrl,
  };

  // Build clean standalone printable HTML
  const generateStandaloneCardHtml = () => {
    return `
      <div style="max-width: 800px; margin: 0 auto; text-align: center;">
        <div style="margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="text-align: left;">
            <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0;">${activeOrg.name}</h2>
            <div style="font-size: 11px; color: #64748b; font-family: monospace;">OFFICIAL ATHLETE PASS • CR80 IDENTIFICATION</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #64748b; font-family: monospace;">
            MEMBER: ${athleteCode} • ISSUED: ${new Date().toISOString().split('T')[0]}
          </div>
        </div>

        <div style="display: flex; flex-direction: column; align-items: center; gap: 24px;">
          <!-- FRONT CARD -->
          <div style="width: 380px; height: 240px; border-radius: 16px; background: linear-gradient(135deg, #090d16 0%, #161e2e 70%, #020617 100%); border: 2px solid #d97706; padding: 18px; color: #ffffff; position: relative; box-sizing: border-box; text-align: left; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 8px;">
              <div>
                <div style="font-weight: 800; font-size: 13px; color: #ffffff; text-transform: uppercase;">${activeOrg.name}</div>
                <div style="font-size: 8px; color: #94a3b8; font-family: monospace; letter-spacing: 1px;">OFFICIAL ATHLETE PASS</div>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 28px; height: 22px; background: linear-gradient(135deg, #fef08a, #eab308, #a16207); border-radius: 4px; border: 1px solid #ca8a04;"></div>
                <span style="font-size: 12px; color: rgba(255,255,255,0.7);">RFID )))</span>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 14px; margin: auto 0;">
              <div style="width: 68px; height: 68px; border-radius: 12px; background: #2563eb; border: 2px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 22px; color: #ffffff; overflow: hidden; flex-shrink: 0;">
                ${athleteName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style="display: inline-block; font-size: 9px; font-weight: 800; background: #78350f; color: #fef3c7; border: 1px solid #d97706; border-radius: 9999px; padding: 2px 8px; text-transform: uppercase; margin-bottom: 4px;">
                  ${primarySport}
                </div>
                <div style="font-size: 16px; font-weight: 900; color: #ffffff; line-height: 1.1;">${athleteName}</div>
                <div style="font-size: 11px; font-family: monospace; color: #cbd5e1; margin-top: 3px;">
                  ID: <strong style="color: #ffffff;">${athleteCode}</strong> • Blood: <strong style="color: #fda4af;">${bloodGroup}</strong>
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 6px; font-size: 8px;">
              <div>
                <div style="color: #94a3b8; text-transform: uppercase;">VALID PERIOD</div>
                <div style="font-family: monospace; font-weight: bold; color: #e2e8f0; font-size: 10px;">${joinDate.slice(0, 7)} — ${validUntil.slice(0, 7)}</div>
              </div>
              <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 4px; padding: 2px 6px; color: #34d399; font-weight: 800;">
                ✓ AUTHENTICATED
              </div>
              <div style="text-align: right;">
                <div style="color: #94a3b8; text-transform: uppercase;">ROLE / SQUAD</div>
                <div style="font-weight: bold; color: #e2e8f0; font-size: 9px;">${skillLevel}</div>
              </div>
            </div>
          </div>

          ${
            printLayout === 'both'
              ? `
          <!-- BACK CARD -->
          <div style="width: 380px; height: 240px; border-radius: 16px; background: linear-gradient(135deg, #030712 0%, #0b1120 70%, #020617 100%); border: 2px solid #d97706; padding: 18px; color: #ffffff; position: relative; box-sizing: border-box; text-align: left; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
            <div style="height: 24px; background: #000000; margin: -18px -18px 0 -18px; border-top-left-radius: 14px; border-top-right-radius: 14px; display: flex; align-items: center; padding: 0 16px; font-family: monospace; font-size: 7px; color: #64748b;">
              MAGNETIC TRACK 1 & 2 ENCODED • TURNSTILE ACCESS • ${athleteCode}
            </div>

            <div style="display: flex; gap: 12px; align-items: center; margin-top: 8px;">
              <div style="background: #ffffff; border-radius: 8px; padding: 6px; width: 68px; height: 68px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0;">
                <div style="font-size: 8px; font-weight: 900; color: #000; text-align: center;">[ GATE QR ]</div>
                <div style="font-size: 6px; font-family: monospace; color: #475569; margin-top: 2px;">SCAN IN</div>
              </div>
              <div style="font-size: 9px; color: #cbd5e1; space-y: 2px; flex: 1;">
                <div><span style="color: #94a3b8; font-size: 7px; text-transform: uppercase; display: block;">EMERGENCY CONTACT</span><strong>${guardianInfo}</strong></div>
                <div style="margin-top: 3px;"><span style="color: #94a3b8; font-size: 7px; text-transform: uppercase; display: block;">FACILITY LOCATION</span>${activeOrg.city || 'Central Sports Hub'}</div>
              </div>
            </div>

            <!-- Barcode strip -->
            <div style="background: #ffffff; border-radius: 6px; padding: 6px 12px; text-align: center; margin-top: 4px;">
              <div style="font-family: monospace; font-weight: 900; font-size: 14px; letter-spacing: 4px; color: #000000;">
                || | ||| | || |||| | ||| | ||
              </div>
              <div style="font-family: monospace; font-size: 9px; font-weight: bold; color: #334155;">* ${athleteCode} *</div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 8px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
              <div>Turnstile ID: ${athleteCode}</div>
              <div style="border-top: 1px solid #64748b; width: 100px; text-align: center; padding-top: 2px; font-size: 7px;">Authorized Signature</div>
            </div>
          </div>
          `
              : ''
          }
        </div>

        <div style="margin-top: 24px; font-size: 10px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 12px;">
          ✂️ Cut along outer card edges for CR80 standard badge holders (85.6mm × 54mm) • Official Authenticated Record
        </div>
      </div>
    `;
  };

  // High-reliability print handler
  const handlePrint = async () => {
    setIsPrinting(true);
    setPrintFeedback({
      type: 'info',
      message: 'Generating print document & triggering system print dialog...',
    });

    try {
      const html = generateStandaloneCardHtml();
      const res = await printIsolatedHtml(
        html,
        `${athleteName} - ${activeOrg.name} Athlete Card`,
        false
      );

      if (res.success) {
        setPrintFeedback({
          type: 'success',
          message: 'Print dialog triggered! (If blocked by browser, click "Download PNG Card" or "A4 Sheet View").',
        });
      } else {
        setPrintFeedback({
          type: 'info',
          message: 'Browser restricted direct print. Use the "Download PNG Card" or "A4 Sheet View" options below.',
        });
      }
    } catch (err: any) {
      console.error('Print trigger error', err);
      setPrintFeedback({
        type: 'error',
        message: 'Direct print was blocked. Please click "Download PNG Card" to save and print the high-res file.',
      });
    } finally {
      setIsPrinting(false);
      setTimeout(() => {
        // keep feedback visible for 6 seconds
      }, 6000);
    }
  };

  // Download high-resolution PNG
  const handleDownloadCardPng = async () => {
    setIsDownloading(true);
    try {
      const canvas = await generateCardCanvas(cardData, activeSide);
      downloadCanvas(
        canvas,
        `${athleteName.replace(/\s+/g, '_')}_ID_${activeSide.toUpperCase()}_CR80.png`
      );
      setPrintFeedback({
        type: 'success',
        message: `High-resolution ${activeSide.toUpperCase()} card downloaded successfully! Ready for PVC printing.`,
      });
    } catch (err) {
      console.error('Failed to download card PNG', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Download complete A4 sheet PNG
  const handleDownloadA4SheetPng = async () => {
    setIsDownloading(true);
    try {
      const canvas = await generateA4PrintSheetCanvas(cardData);
      downloadCanvas(
        canvas,
        `${athleteName.replace(/\s+/g, '_')}_A4_Print_Sheet.png`
      );
      setPrintFeedback({
        type: 'success',
        message: 'Print-ready A4 sheet with cut marks downloaded! Open and print at 100% scale.',
      });
    } catch (err) {
      console.error('Failed to download A4 sheet', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendWhatsAppPass = () => {
    const phoneClean = athleteMobile.replace(/[^0-9]/g, '');
    const passUrl = `${window.location.origin}/#verify-${athleteCode}`;
    const text = encodeURIComponent(
      `Hello ${athleteName}!\n\nHere is your official *${activeOrg.name}* Athlete Membership Digital Card.\n\n` +
      `*Member ID:* ${athleteCode}\n` +
      `*Discipline:* ${primarySport}\n` +
      `*Squad / Rank:* ${skillLevel}\n` +
      `*Blood Group:* ${bloodGroup}\n` +
      `*Valid Until:* ${validUntil}\n\n` +
      `Access your digital pass and turnstile gate barcode here:\n${passUrl}\n\n` +
      `Welcome to the team!`
    );
    window.open(`https://wa.me/${phoneClean || ''}?text=${text}`, '_blank');
  };

  const handleCopyPassLink = () => {
    const passUrl = `${window.location.origin}/#verify-${athleteCode}`;
    navigator.clipboard.writeText(passUrl);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Card Front Component
  const renderCardFront = () => (
    <div
      className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${currentTheme.cardBg} border ${currentTheme.accentBorder} shadow-2xl p-5 text-white flex flex-col justify-between select-none w-full max-w-sm sm:w-[380px] h-[240px]`}
      style={{ aspectRatio: '1.586' }}
    >
      {/* Background Decorative Lattice & Hologram Shimmer */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-start justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shrink-0">
            {activeOrg.logo ? (
              <img src={activeOrg.logo} alt={activeOrg.name} className="w-full h-full object-contain" />
            ) : (
              <span className="font-black text-xs text-amber-400">
                {activeOrg.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-extrabold text-xs tracking-tight truncate text-white leading-tight">
              {activeOrg.name}
            </h4>
            <div className="text-[9px] text-slate-300 uppercase tracking-wider font-mono">
              Official Athlete Pass
            </div>
          </div>
        </div>

        {/* Chip & Contactless RFID Icon */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <div className="w-6 h-5 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-0.5 shadow-xs border border-amber-300 flex items-center justify-center">
            <div className="w-full h-full border border-amber-800/40 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
              <div className="bg-amber-700/30 rounded-2xs" />
              <div className="bg-amber-700/30 rounded-2xs" />
            </div>
          </div>
          <div className="text-white/60 font-mono text-[10px]" title="NFC Contactless Check-in">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8.5 16.5a5 5 0 0 1 0-9M12 19a8.5 8.5 0 0 0 0-14M15.5 21.5a12 12 0 0 0 0-19" />
            </svg>
          </div>
        </div>
      </div>

      {/* Middle Section: Photo & Athlete Profile */}
      <div className="relative z-10 my-auto flex items-center space-x-3.5 pt-1">
        {/* Athlete Photo with Gold Frame */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden border-2 border-white/20 p-0.5 bg-white/5 shrink-0 shadow-md">
          {currentMember.photoUrl ? (
            <img
              src={currentMember.photoUrl}
              alt={athleteName}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-700 to-slate-800 flex items-center justify-center text-white font-bold text-base">
              {athleteName.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center space-x-1.5">
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${currentTheme.badgeBg} ${currentTheme.badgeText} uppercase tracking-wider`}
            >
              {primarySport}
            </span>
            <span className="text-[9px] font-mono text-slate-300">
              {currentMember.status || 'Active'}
            </span>
          </div>

          <h3 className="font-black text-sm sm:text-base text-white tracking-tight truncate leading-tight">
            {athleteName}
          </h3>

          <div className="flex items-center space-x-2 text-[10px] text-slate-300 font-mono">
            <span>ID: <strong className="text-white">{athleteCode}</strong></span>
            <span>•</span>
            <span>Blood: <strong className="text-rose-300">{bloodGroup}</strong></span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="relative z-10 pt-2 border-t border-white/10 flex items-end justify-between text-[9px]">
        <div>
          <div className="text-slate-400 uppercase tracking-wider text-[8px]">Valid Period</div>
          <div className="font-mono font-bold text-slate-200">
            {joinDate.slice(0, 7)} — {validUntil.slice(0, 7)}
          </div>
        </div>

        {/* Verified Hologram Badge */}
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white/10 border border-white/20 backdrop-blur-xs">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span className="font-bold uppercase tracking-widest text-[8px] text-slate-200">VERIFIED</span>
        </div>

        <div className="text-right">
          <div className="text-slate-400 uppercase tracking-wider text-[8px]">Role / Rank</div>
          <div className="font-semibold text-slate-200 truncate max-w-[100px]">
            {skillLevel}
          </div>
        </div>
      </div>
    </div>
  );

  // Card Back Component
  const renderCardBack = () => (
    <div
      className={`relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black border ${currentTheme.accentBorder} shadow-2xl p-5 text-white flex flex-col justify-between select-none w-full max-w-sm sm:w-[380px] h-[240px]`}
      style={{ aspectRatio: '1.586' }}
    >
      {/* Top Magnetic Stripe Simulation */}
      <div className="absolute top-3 left-0 right-0 h-7 bg-black/90 border-y border-white/10 flex items-center px-4 justify-between">
        <span className="text-[8px] font-mono text-slate-400 tracking-widest">
          MAGNETIC ENCODING • TURNSTILE ACCESS • {athleteCode}
        </span>
      </div>

      <div className="pt-8 flex-1 flex flex-col justify-between">
        {/* Mid Section: QR Code & Emergency Details */}
        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Turnstile Access QR */}
          <div className="bg-white p-2 rounded-xl shrink-0 shadow-inner flex flex-col items-center">
            <QrCode className="w-16 h-16 sm:w-18 sm:h-18 text-slate-950" />
            <span className="text-[7px] font-mono text-slate-700 font-bold mt-0.5">GATE SCAN</span>
          </div>

          {/* Details & Emergency Info */}
          <div className="flex-1 space-y-1 text-[9px] text-slate-300">
            <div>
              <span className="text-slate-400 uppercase text-[8px] block">Emergency Contact</span>
              <span className="font-semibold text-white truncate block">{guardianInfo}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[8px] block">Facility Address</span>
              <span className="text-slate-200 truncate block">{activeOrg.city || 'Central Sports Hub'}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[8px] block">Official Website</span>
              <span className="text-cyan-400 font-mono text-[8px] truncate block">
                {window.location.host}/#{activeOrg.slug || 'club'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Turnstile Barcode & Signature */}
        <div className="space-y-1.5 pt-2 border-t border-white/10">
          {/* Code-128 Turnstile Barcode */}
          <div className="bg-white/95 rounded-lg p-1.5 flex flex-col items-center justify-center">
            <div className="font-mono text-slate-950 font-black text-xs tracking-widest leading-none select-none">
              ||| | |||| | ||| |||| | ||||| | |||
            </div>
            <span className="text-[8px] font-mono text-slate-700 font-semibold mt-0.5">
              *{athleteCode}*
            </span>
          </div>

          <div className="flex items-center justify-between text-[7px] text-slate-400">
            <span>Scan at gate turnstile for facility entry</span>
            <div className="italic font-serif border-t border-slate-500 pt-0.5 px-2">
              Authorized Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <span>Official Membership Card Studio</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  CR80 Format
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Generate high-density digital passes, barcode badges, and print-ready PVC membership ID cards.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status / Feedback Banner */}
        {printFeedback && (
          <div
            className={`px-5 py-2.5 text-xs flex items-center justify-between border-b ${
              printFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : printFeedback.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {printFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : printFeedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span className="font-medium">{printFeedback.message}</span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadCardPng}
                className="underline font-bold text-[11px] hover:opacity-80"
              >
                Download PNG
              </button>
              <button
                type="button"
                onClick={() => setPrintFeedback(null)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
          {/* Left Column: Card Interactive Preview & Action Dock */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-4 bg-slate-900/5 p-4 sm:p-6 rounded-2xl border border-slate-200/60">
            {/* View Mode Toggle & Flip Control */}
            <div className="w-full flex items-center justify-between pb-1">
              <div className="flex items-center space-x-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setViewMode('card')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                    viewMode === 'card'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('sheet')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                    viewMode === 'sheet'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>A4 Print Sheet</span>
                </button>
              </div>

              {viewMode === 'card' && (
                <button
                  type="button"
                  onClick={() => setActiveSide((prev) => (prev === 'front' ? 'back' : 'front'))}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <RotateCw className="w-3.5 h-3.5 text-blue-600" />
                  <span>Flip {activeSide === 'front' ? 'to Back (QR)' : 'to Front (Photo)'}</span>
                </button>
              )}
            </div>

            {/* Active Card Preview or A4 Sheet View */}
            {viewMode === 'card' ? (
              <div className="transition-all duration-300 transform">
                {activeSide === 'front' ? renderCardFront() : renderCardBack()}
              </div>
            ) : (
              /* A4 Printable Sheet Preview */
              <div className="w-full max-w-sm sm:w-[380px] bg-white rounded-xl shadow-lg border border-slate-300 p-4 space-y-3 text-slate-900">
                <div className="border-b border-slate-200 pb-2 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>A4 SHEET LAYOUT (100% SCALE)</span>
                  <span className="font-bold text-blue-700">CR80 POCKETS</span>
                </div>
                {/* Scaled preview of both cards */}
                <div className="space-y-2">
                  <div className="border border-dashed border-slate-400 p-1 rounded-xl bg-slate-50 text-center">
                    <div className="text-[8px] font-bold text-slate-500 uppercase">Card Front (Cut Guide)</div>
                    <div className="transform scale-90 origin-top -mb-4">
                      {renderCardFront()}
                    </div>
                  </div>
                  <div className="border border-dashed border-slate-400 p-1 rounded-xl bg-slate-50 text-center">
                    <div className="text-[8px] font-bold text-slate-500 uppercase">Card Back (Cut Guide)</div>
                    <div className="transform scale-90 origin-top -mb-4">
                      {renderCardBack()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Action Buttons Bar */}
            <div className="w-full max-w-md flex flex-wrap items-center justify-center gap-2 pt-2">
              {/* PRINT BUTTON */}
              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex-1 min-w-[150px] py-2.5 px-3.5 bg-slate-950 hover:bg-slate-800 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer"
              >
                {isPrinting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Preparing Print...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Print Card (A4 / PVC)</span>
                  </>
                )}
              </button>

              {/* DOWNLOAD PNG BUTTON */}
              <button
                type="button"
                onClick={handleDownloadCardPng}
                disabled={isDownloading}
                className="py-2.5 px-3.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer"
                title="Download high-resolution image of this card for card printer or mobile wallet"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download PNG</span>
              </button>

              {/* WHATSAPP BUTTON */}
              <button
                type="button"
                onClick={handleSendWhatsAppPass}
                className="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>

            {/* Secondary Option: Download Full A4 Sheet */}
            <div className="w-full flex items-center justify-center pt-1">
              <button
                type="button"
                onClick={handleDownloadA4SheetPng}
                disabled={isDownloading}
                className="text-[11px] font-semibold text-slate-600 hover:text-blue-700 flex items-center space-x-1.5 py-1 px-3 rounded-lg hover:bg-white transition-colors"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-600" />
                <span>Download Printable A4 Sheet Image (Front + Back with Cut Guides)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Customizer & Member Selector */}
          <div className="lg:col-span-5 space-y-4">
            {/* Member Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Athlete / Cardholder
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {getAthleteName(m)} ({getAthleteCode(m)})
                  </option>
                ))}
              </select>
            </div>

            {/* Theme / Palette Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Card Luxury Finish & Security Accent
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(themeStyles) as MembershipCardTheme[]).map((tKey) => {
                  const t = themeStyles[tKey];
                  const isSelected = theme === tKey;
                  return (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setTheme(tKey)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-gradient-to-br ${t.cardBg} border ${t.accentBorder} shrink-0`}
                      />
                      <span className="text-xs font-medium text-slate-900 truncate">
                        {t.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Print Options */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
              <label className="block text-xs font-bold text-slate-800">
                Printer Layout Options
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPrintLayout('both')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    printLayout === 'both'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Both Sides (A4 Sheet)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintLayout('single')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                    printLayout === 'single'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Front Face Only
                </button>
              </div>

              <div className="text-[10px] text-slate-500 font-mono space-y-1 pt-1">
                <div>Card Standard: <strong className="text-slate-800">ISO/IEC 7810 ID-1 (CR80)</strong></div>
                <div>Dimensions: <strong className="text-slate-800">85.60 mm × 53.98 mm</strong></div>
                <div>Turnstile Barcode: <strong className="text-slate-800">Code-128 Optical Matrix</strong></div>
                <div>Turnstile RFID: <strong className="text-slate-800">13.56 MHz NFC Emulation</strong></div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCopyPassLink}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{copiedNotification ? 'Pass Link Copied!' : 'Copy Digital Verification URL'}</span>
              </button>

              <div className="text-[11px] text-slate-500 text-center leading-relaxed">
                Tip: When printing on standard PVC card printers (Zebra, Evolis, Fargo), select borderless CR80 layout with 100% scale.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs text-slate-500">
            Total active members eligible for card issuance: <strong className="text-slate-800">{members.length}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
          >
            Close Studio
          </button>
        </div>
      </div>
    </div>
  );
};
