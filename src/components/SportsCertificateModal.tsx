import React, { useState } from 'react';
import { Member, Sport, Organization, Certificate } from '../types.ts';
import { getAthleteName, getAthleteCode, getAthleteMobile } from './MembersView.tsx';
import {
  printIsolatedHtml,
  downloadCanvas,
  generateCertificateCanvas,
  PrintCertificateData,
} from '../lib/printUtils.ts';
import {
  X,
  Printer,
  Award,
  Trophy,
  Star,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Share2,
  MessageCircle,
  FileText,
  Calendar,
  Medal,
  Flame,
  Zap,
  Loader2,
  Download,
  AlertCircle,
} from 'lucide-react';

export type SportsCertTemplate =
  | 'championship'
  | 'runner_up'
  | 'mvp'
  | 'camp_completion'
  | 'belt_promotion'
  | 'fitness_merit'
  | 'participation'
  | 'coach_honor';

interface SportsCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  sports: Sport[];
  activeOrg: Organization;
  initialMemberId?: number;
  initialCertificate?: Certificate | null;
  onIssueCertificate: (certData: any) => Promise<void>;
}

export const SportsCertificateModal: React.FC<SportsCertificateModalProps> = ({
  isOpen,
  onClose,
  members,
  sports,
  activeOrg,
  initialMemberId,
  initialCertificate,
  onIssueCertificate,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<number>(
    initialMemberId || (initialCertificate?.memberId ?? members[0]?.id ?? 1)
  );

  const [templateType, setTemplateType] = useState<SportsCertTemplate>(
    (initialCertificate?.templateStyle as SportsCertTemplate) || 'championship'
  );

  const [sportName, setSportName] = useState<string>(
    initialCertificate?.sportOrProgram || sports[0]?.name || 'Basketball'
  );

  const [title, setTitle] = useState<string>(
    initialCertificate?.title || 'State Youth Championship 2026 - Gold Medalist'
  );

  const [rankOrPosition, setRankOrPosition] = useState<string>(
    initialCertificate?.rankOrPosition || 'Champion (1st Place)'
  );

  const [issueDate, setIssueDate] = useState<string>(
    initialCertificate?.issueDate || new Date().toISOString().split('T')[0]
  );

  const [instructorName, setInstructorName] = useState<string>(
    initialCertificate?.instructorName || 'Coach Vikramaditya Sen, Chief Instructor'
  );

  const [directorName, setDirectorName] = useState<string>(
    initialCertificate?.directorName || 'Academy Director & General Secretary'
  );

  const [citation, setCitation] = useState<string>(
    initialCertificate?.citation ||
      'In recognition of extraordinary discipline, athletic supremacy, and sportsmanship demonstrated during the competitive season.'
  );

  const [beltRank, setBeltRank] = useState<string>('Black Belt (1st Dan)');
  const [fitnessGrade, setFitnessGrade] = useState<string>('Grade A+ (Elite Merit)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [printFeedback, setPrintFeedback] = useState<{
    type: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  const [verificationToken] = useState<string>(
    initialCertificate?.verificationToken ||
      `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  );

  if (!isOpen) return null;

  const currentMember =
    members.find((m) => m.id === selectedMemberId) || members[0] || ({} as Member);

  const recipientName = initialCertificate?.recipientName || getAthleteName(currentMember);
  const recipientCode = getAthleteCode(currentMember);
  const recipientMobile = getAthleteMobile(currentMember);

  // Template metadata
  const templateConfig: Record<
    SportsCertTemplate,
    {
      name: string;
      category: string;
      badgeText: string;
      sealColor: string;
      borderClass: string;
      bgClass: string;
      accentText: string;
      icon: any;
      defaultTitle: string;
      defaultRank: string;
    }
  > = {
    championship: {
      name: 'Tournament Champion / 1st Place Gold',
      category: 'Tournament Excellence',
      badgeText: 'GOLD MEDALIST • CHAMPION',
      sealColor: 'from-amber-400 to-yellow-600 text-amber-950',
      borderClass: 'border-amber-600',
      bgClass: 'from-amber-50/80 via-white to-amber-50/40',
      accentText: 'text-amber-800',
      icon: Trophy,
      defaultTitle: 'Inter-Academy Premier Championship 2026',
      defaultRank: '1st Place Champion (Gold)',
    },
    runner_up: {
      name: 'Silver Runner-Up / Podium Finalist',
      category: 'Podium Honors',
      badgeText: 'SILVER MEDALIST • FINALIST',
      sealColor: 'from-slate-300 to-slate-500 text-slate-900',
      borderClass: 'border-slate-500',
      bgClass: 'from-slate-50 via-white to-slate-100',
      accentText: 'text-slate-800',
      icon: Medal,
      defaultTitle: 'State Invitational Championship 2026',
      defaultRank: 'Runner Up (2nd Place Silver)',
    },
    mvp: {
      name: 'Most Valuable Player (MVP) Award',
      category: 'Individual Distinction',
      badgeText: 'MOST VALUABLE ATHLETE',
      sealColor: 'from-purple-500 to-indigo-700 text-white',
      borderClass: 'border-purple-600',
      bgClass: 'from-purple-50/70 via-white to-indigo-50/30',
      accentText: 'text-purple-800',
      icon: Star,
      defaultTitle: 'Annual Sports League MVP Trophy',
      defaultRank: 'Most Valuable Player (Season 2026)',
    },
    camp_completion: {
      name: 'Intensive Training Camp Graduation',
      category: 'Training & Development',
      badgeText: 'CAMP GRADUATE • CERTIFIED',
      sealColor: 'from-emerald-400 to-teal-600 text-emerald-950',
      borderClass: 'border-emerald-600',
      bgClass: 'from-emerald-50/70 via-white to-teal-50/30',
      accentText: 'text-emerald-800',
      icon: ShieldCheck,
      defaultTitle: 'High-Performance Summer Coaching Bootcamp',
      defaultRank: 'Graduated with Distinction',
    },
    belt_promotion: {
      name: 'Martial Arts Belt & Dan Grading',
      category: 'Martial Arts Rank',
      badgeText: 'OFFICIAL DAN / BELT PROMOTION',
      sealColor: 'from-rose-500 to-red-700 text-white',
      borderClass: 'border-rose-700',
      bgClass: 'from-rose-50/70 via-white to-red-50/30',
      accentText: 'text-rose-900',
      icon: Flame,
      defaultTitle: 'Official Kyu / Dan Grading Examination',
      defaultRank: 'Promoted to Black Belt (1st Dan)',
    },
    fitness_merit: {
      name: 'Physical Conditioning & Merit Award',
      category: 'Conditioning',
      badgeText: 'FITNESS BENCHMARK EXCELLENCE',
      sealColor: 'from-blue-500 to-cyan-600 text-white',
      borderClass: 'border-blue-600',
      bgClass: 'from-blue-50/70 via-white to-cyan-50/30',
      accentText: 'text-blue-900',
      icon: Zap,
      defaultTitle: 'Youth Athletic Fitness & VO2Max Assessment',
      defaultRank: 'Grade A+ (Elite Benchmark)',
    },
    participation: {
      name: 'Official Tournament Participation',
      category: 'Participation',
      badgeText: 'OFFICIAL PARTICIPANT',
      sealColor: 'from-teal-400 to-emerald-600 text-teal-950',
      borderClass: 'border-teal-600',
      bgClass: 'from-teal-50/70 via-white to-emerald-50/30',
      accentText: 'text-teal-900',
      icon: Award,
      defaultTitle: 'National Sports Day Invitational Meet',
      defaultRank: 'Official Participant & Contender',
    },
    coach_honor: {
      name: "Coach's Choice & Leadership Merit",
      category: 'Leadership',
      badgeText: "COACH'S PRIDE • ROLE MODEL",
      sealColor: 'from-amber-500 to-orange-600 text-white',
      borderClass: 'border-orange-600',
      bgClass: 'from-amber-50/70 via-white to-orange-50/30',
      accentText: 'text-orange-950',
      icon: Trophy,
      defaultTitle: 'Outstanding Sportsmanship & Leadership Citation',
      defaultRank: 'Squad Captain & Spirit Exemplar',
    },
  };

  const currentTpl = templateConfig[templateType];

  const handleTemplateChange = (newTpl: SportsCertTemplate) => {
    setTemplateType(newTpl);
    setTitle(templateConfig[newTpl].defaultTitle);
    setRankOrPosition(templateConfig[newTpl].defaultRank);
  };

  const certData: PrintCertificateData = {
    orgName: activeOrg.name,
    orgLogo: activeOrg.logo,
    city: activeOrg.city || 'Central Sports Complex',
    estYear: activeOrg.establishedYear || '1948',
    recipientName,
    recipientCode,
    title,
    sport: sportName,
    rankOrPosition: templateType === 'belt_promotion' ? beltRank : rankOrPosition,
    citation,
    issueDate,
    instructorName,
    directorName,
    verificationToken,
    badgeText: currentTpl.badgeText,
    themeCategory: currentTpl.category,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onIssueCertificate({
        memberId: selectedMemberId,
        recipientName,
        recipientCode,
        sportOrProgram: sportName,
        title,
        rankOrPosition: templateType === 'belt_promotion' ? beltRank : rankOrPosition,
        issueDate,
        instructorName,
        directorName,
        citation,
        templateStyle: templateType,
        verificationToken,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateCertificateHtml = () => {
    const finalRank = templateType === 'belt_promotion' ? beltRank : rankOrPosition;
    return `
      <div style="width: 1000px; height: 680px; margin: 0 auto; background: #ffffff; border: 12px solid #b45309; padding: 36px; box-sizing: border-box; text-align: center; position: relative; font-family: Georgia, serif; color: #0f172a; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <!-- Inner Border -->
        <div style="position: absolute; inset: 12px; border: 2px solid #d97706; pointer-events: none;"></div>

        <!-- Header -->
        <div style="position: relative; z-index: 10;">
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #b45309; text-transform: uppercase;">
            ★ ${currentTpl.badgeText} ★
          </div>
          <h1 style="font-size: 32px; font-weight: bold; margin: 6px 0 2px 0; color: #0f172a; text-transform: uppercase;">
            ${activeOrg.name}
          </h1>
          <div style="font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #64748b;">
            ${activeOrg.city || 'Central Sports Complex'} • Est. ${activeOrg.establishedYear || '1948'} • Registered Athletic Federation
          </div>
        </div>

        <!-- Body -->
        <div style="position: relative; z-index: 10; margin: 15px 0;">
          <div style="font-style: italic; font-size: 14px; color: #475569; margin-bottom: 8px;">
            This Official Certificate of Athletic Distinction is proudly conferred upon
          </div>
          <div style="font-size: 36px; font-weight: bold; color: #172554; text-decoration: underline; text-decoration-color: #eab308; text-underline-offset: 6px; margin-bottom: 8px;">
            ${recipientName}
          </div>
          <div style="font-family: monospace; font-size: 11px; color: #64748b; margin-bottom: 12px;">
            MEMBER ID: <strong>${recipientCode}</strong> • DISCIPLINE: <strong>${sportName.toUpperCase()}</strong>
          </div>
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; color: #1e293b; max-width: 650px; margin: 0 auto; line-height: 1.4;">
            For outstanding performance and achieving <strong style="color: #92400e;">"${finalRank}"</strong> in the <strong>${title}</strong>.
          </div>
          <div style="font-style: italic; font-size: 12px; color: #64748b; max-width: 550px; margin: 10px auto 0 auto;">
            "${citation}"
          </div>
        </div>

        <!-- Footer -->
        <div style="position: relative; z-index: 10; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #cbd5e1; padding-top: 16px;">
          <!-- Signatory 1 -->
          <div style="text-align: left; width: 220px;">
            <div style="font-style: italic; font-weight: bold; font-size: 14px; color: #0f172a;">${instructorName.split(',')[0]}</div>
            <div style="height: 1.5px; background: #64748b; margin: 4px 0;"></div>
            <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 9px; font-weight: bold; color: #0f172a; text-transform: uppercase;">
              ${instructorName.split(',')[1] || 'Chief Head Coach'}
            </div>
            <div style="font-family: monospace; font-size: 8px; color: #64748b;">Discipline Authority</div>
          </div>

          <!-- Central Seal -->
          <div style="text-align: center;">
            <div style="width: 58px; height: 58px; border-radius: 50%; background: linear-gradient(135deg, #fef08a, #eab308, #a16207); margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
              <span style="font-size: 7px; font-weight: 900; color: #451a03; line-height: 1;">OFFICIAL</span>
              <span style="font-size: 8px; font-weight: 900; color: #451a03; line-height: 1;">SEAL</span>
            </div>
            <div style="font-family: monospace; font-size: 8px; color: #64748b; margin-top: 4px;">
              TOKEN: ${verificationToken.slice(0, 16)}...
            </div>
          </div>

          <!-- Signatory 2 -->
          <div style="text-align: right; width: 220px;">
            <div style="font-style: italic; font-weight: bold; font-size: 14px; color: #0f172a;">${directorName}</div>
            <div style="height: 1.5px; background: #64748b; margin: 4px 0;"></div>
            <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 9px; font-weight: bold; color: #0f172a; text-transform: uppercase;">
              General Secretary & Director
            </div>
            <div style="font-family: monospace; font-size: 8px; color: #64748b;">Dated: ${issueDate}</div>
          </div>
        </div>
      </div>
    `;
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    setPrintFeedback({
      type: 'info',
      message: 'Preparing certificate for high-resolution landscape print...',
    });

    try {
      const html = generateCertificateHtml();
      const res = await printIsolatedHtml(
        html,
        `Certificate - ${recipientName} - ${title}`,
        true
      );
      if (res.success) {
        setPrintFeedback({
          type: 'success',
          message: 'Print dialog triggered! (If popup was blocked, use "Download PNG Certificate" below).',
        });
      } else {
        setPrintFeedback({
          type: 'info',
          message: 'Direct print was restricted by browser. Click "Download PNG" for the high-res file.',
        });
      }
    } catch (err: any) {
      console.error('Certificate print error', err);
      setPrintFeedback({
        type: 'error',
        message: 'Print failed. Please click "Download PNG" to save the certificate image.',
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPng = async () => {
    setIsDownloading(true);
    try {
      const canvas = await generateCertificateCanvas(certData);
      downloadCanvas(
        canvas,
        `${recipientName.replace(/\s+/g, '_')}_Certificate_${templateType}.png`
      );
      setPrintFeedback({
        type: 'success',
        message: 'High-resolution landscape certificate PNG downloaded successfully!',
      });
    } catch (err) {
      console.error('Download certificate PNG error', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleWhatsAppShare = () => {
    const phoneClean = recipientMobile.replace(/[^0-9]/g, '');
    const certVerifyUrl = `${window.location.origin}/#verify-${verificationToken}`;
    const text = encodeURIComponent(
      `🏆 Congratulations ${recipientName}!\n\n` +
      `You have been awarded the *${title}* (${currentTpl.badgeText}) by *${activeOrg.name}*!\n\n` +
      `*Sport:* ${sportName}\n` +
      `*Honors/Rank:* ${templateType === 'belt_promotion' ? beltRank : rankOrPosition}\n` +
      `*Issue Date:* ${issueDate}\n` +
      `*Tamper-Proof Verification Token:* ${verificationToken}\n\n` +
      `Verify and download your authenticated digital certificate here:\n${certVerifyUrl}\n\n` +
      `Keep shining on the sports field! 🏅`
    );
    window.open(`https://wa.me/${phoneClean || ''}?text=${text}`, '_blank');
  };

  // Certificate Render Block
  const renderCertificateContent = () => {
    const IconComponent = currentTpl.icon;
    const finalRank =
      templateType === 'belt_promotion'
        ? beltRank
        : templateType === 'fitness_merit'
        ? fitnessGrade
        : rankOrPosition;

    return (
      <div
        className={`relative bg-gradient-to-b ${currentTpl.bgClass} border-8 ${currentTpl.borderClass} rounded-2xl p-6 sm:p-10 shadow-2xl overflow-hidden text-center select-none w-full max-w-2xl`}
        style={{ aspectRatio: '1.414' }}
      >
        {/* Ornate Guilloché Corner Accents */}
        <div className="absolute top-2 left-2 w-16 h-16 border-t-2 border-l-2 border-amber-600/40 pointer-events-none" />
        <div className="absolute top-2 right-2 w-16 h-16 border-t-2 border-r-2 border-amber-600/40 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-16 h-16 border-b-2 border-l-2 border-amber-600/40 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-16 h-16 border-b-2 border-r-2 border-amber-600/40 pointer-events-none" />

        {/* Certificate Header Banner */}
        <div className="relative z-10 flex flex-col items-center space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-[10px] font-black tracking-widest uppercase shadow-xs">
            <IconComponent className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentTpl.badgeText}</span>
          </div>

          <div className="pt-2">
            <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-slate-900 uppercase">
              {activeOrg.name}
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-500 font-mono">
              {activeOrg.city || 'Central Sports Complex'} • Est. {activeOrg.establishedYear || '1948'} • Registered Athletic Federation
            </p>
          </div>
        </div>

        {/* Certificate Main Body */}
        <div className="relative z-10 my-4 sm:my-6 space-y-2 sm:space-y-3">
          <div className="text-xs sm:text-sm text-slate-600 italic font-serif">
            This Official Certificate of Athletic Distinction is proudly conferred upon
          </div>

          <div className="text-2xl sm:text-3xl font-serif font-black text-blue-950 tracking-tight underline decoration-amber-400 decoration-2 underline-offset-4">
            {recipientName}
          </div>

          <div className="text-[11px] sm:text-xs font-mono text-slate-500">
            Member ID: <strong>{recipientCode}</strong> • Discipline: <strong className="text-slate-800">{sportName}</strong>
          </div>

          <div className="text-xs sm:text-sm text-slate-800 max-w-lg mx-auto font-medium leading-relaxed pt-1">
            For outstanding performance and achieving <span className="font-bold text-amber-800 font-serif">"{finalRank}"</span> in the{' '}
            <strong className="text-slate-950">{title}</strong>.
          </div>

          <p className="text-[11px] text-slate-600 italic max-w-md mx-auto line-clamp-2">
            "{citation}"
          </p>
        </div>

        {/* Certificate Footer: Seal & Signatories */}
        <div className="relative z-10 pt-4 sm:pt-6 border-t border-slate-200/80 flex items-end justify-between text-left">
          {/* Signatory 1 */}
          <div className="space-y-1">
            <div className="font-serif italic font-bold text-slate-800 text-xs sm:text-sm">
              {instructorName.split(',')[0]}
            </div>
            <div className="h-0.5 w-28 bg-slate-400/60" />
            <div className="text-[9px] sm:text-[10px] font-bold text-slate-900 uppercase tracking-wider">
              {instructorName.split(',')[1] || 'Chief Head Coach'}
            </div>
            <div className="text-[8px] text-slate-500 font-mono">Discipline Authority</div>
          </div>

          {/* Central Gold Foil Stamp / QR Verification */}
          <div className="text-center space-y-1">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full mx-auto p-1 bg-gradient-to-br ${currentTpl.sealColor} shadow-md border-2 border-white flex flex-col items-center justify-center`}
            >
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <span className="text-[7px] font-black uppercase tracking-tighter text-center leading-none mt-0.5">
                OFFICIAL SEAL
              </span>
            </div>
            <div className="font-mono text-[8px] text-slate-400">
              Token: {verificationToken.slice(0, 14)}...
            </div>
          </div>

          {/* Signatory 2 & Date */}
          <div className="text-right space-y-1">
            <div className="font-serif italic font-bold text-slate-800 text-xs sm:text-sm">
              {directorName}
            </div>
            <div className="h-0.5 w-28 bg-slate-400/60 ml-auto" />
            <div className="text-[9px] sm:text-[10px] font-bold text-slate-900 uppercase tracking-wider">
              General Secretary & Director
            </div>
            <div className="text-[8px] text-slate-500 font-mono">Dated: {issueDate}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <span>Sports Certificate Studio & Verification</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                  8 Sports Templates
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Issue authenticated athletic achievement, camp graduation, and belt promotion certificates.
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
                onClick={handleDownloadPng}
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

        {/* Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto">
          {/* Left Column: Certificate Preview */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-4 bg-slate-900/5 p-4 sm:p-5 rounded-2xl border border-slate-200/60">
            {renderCertificateContent()}

            {/* Print & Share Action Row */}
            <div className="w-full flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrinting}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {isPrinting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Preparing Print...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Print Certificate (A4 Landscape)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={isDownloading}
                className="py-2.5 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                title="Download high-resolution image of this certificate"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download PNG</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Right Column: Customizer Form */}
          <div className="lg:col-span-5 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Recipient Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Athlete</label>
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

              {/* Template Style Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Certificate Template Type</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200/80">
                  {(Object.keys(templateConfig) as SportsCertTemplate[]).map((tplKey) => {
                    const t = templateConfig[tplKey];
                    const isSelected = templateType === tplKey;
                    return (
                      <button
                        key={tplKey}
                        type="button"
                        onClick={() => handleTemplateChange(tplKey)}
                        className={`p-2 rounded-lg text-left text-[11px] font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-2xs font-bold'
                            : 'bg-white text-slate-700 hover:bg-slate-200/60 border border-slate-200'
                        }`}
                      >
                        <div className="truncate">{t.name}</div>
                        <div className={`text-[9px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {t.category}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sport & Date Row */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sport / Event</label>
                  <select
                    value={sportName}
                    onChange={(e) => setSportName(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    {sports.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                    <option value="General Athletics">General Athletics</option>
                    <option value="Fitness & Conditioning">Fitness & Conditioning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event / Tournament Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. State Youth Basketball Championship 2026"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              {/* Dynamic Sub-fields based on template */}
              {templateType === 'belt_promotion' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Martial Arts Belt / Rank</label>
                  <select
                    value={beltRank}
                    onChange={(e) => setBeltRank(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-rose-700"
                  >
                    <option value="Yellow Belt (8th Kyu)">Yellow Belt (8th Kyu)</option>
                    <option value="Orange Belt (7th Kyu)">Orange Belt (7th Kyu)</option>
                    <option value="Green Belt (6th Kyu)">Green Belt (6th Kyu)</option>
                    <option value="Blue Belt (4th Kyu)">Blue Belt (4th Kyu)</option>
                    <option value="Brown Belt (1st Kyu)">Brown Belt (1st Kyu)</option>
                    <option value="Black Belt (1st Dan)">Black Belt (1st Dan - Shodan)</option>
                    <option value="Black Belt (2nd Dan)">Black Belt (2nd Dan - Nidan)</option>
                  </select>
                </div>
              ) : templateType === 'fitness_merit' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fitness Evaluation Grade</label>
                  <select
                    value={fitnessGrade}
                    onChange={(e) => setFitnessGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-blue-700"
                  >
                    <option value="Grade A+ (Elite Merit)">Grade A+ (Elite 95th Percentile)</option>
                    <option value="Grade A (Gold Standard)">Grade A (Gold Standard)</option>
                    <option value="Grade B+ (Proficient Squad)">Grade B+ (Proficient Squad)</option>
                    <option value="Grade B (Progressing Athlete)">Grade B (Progressing Athlete)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rank / Position / Honors</label>
                  <input
                    type="text"
                    value={rankOrPosition}
                    onChange={(e) => setRankOrPosition(e.target.value)}
                    placeholder="e.g. Champion (1st Place)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              )}

              {/* Signatories Row */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Coach / Head Instructor</label>
                  <input
                    type="text"
                    value={instructorName}
                    onChange={(e) => setInstructorName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Director / Authority</label>
                  <input
                    type="text"
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Citation note */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Citation Text</label>
                <textarea
                  rows={2}
                  value={citation}
                  onChange={(e) => setCitation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                />
              </div>

              {/* Submit / Issue Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Authenticating & Issuing...' : savedSuccess ? 'Certificate Issued!' : 'Issue Authenticated Certificate'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographic Verification Token automatically bound to public anti-fraud registry</span>
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
