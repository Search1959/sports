import React, { useState, useEffect } from 'react';
import { Tournament, Match, Sport, Team } from '../types.ts';
import {
  Trophy,
  Plus,
  Calendar,
  Clock,
  Swords,
  CheckCircle2,
  X,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Medal,
  Users,
  MapPin,
  Flame,
  Activity,
  Edit3,
  Check,
  AlertCircle,
  BarChart3,
  Award,
  Search,
  Filter,
} from 'lucide-react';

interface TournamentsViewProps {
  tournaments: Tournament[];
  sports: Sport[];
  teams?: Team[];
  onCreateTournament: (data: any) => Promise<void>;
  onAddMatch: (tournamentId: number, matchData: any) => Promise<void>;
  onBatchAddMatches?: (tournamentId: number, matchesList: any[]) => Promise<void>;
  onUpdateMatchScore: (matchId: number, scoreData: any) => Promise<void>;
}

export const TournamentsView: React.FC<TournamentsViewProps> = ({
  tournaments,
  sports,
  teams = [],
  onCreateTournament,
  onAddMatch,
  onBatchAddMatches,
  onUpdateMatchScore,
}) => {
  // Selected tournament state - auto select first tournament
  const [selectedTourney, setSelectedTourney] = useState<Tournament | null>(
    tournaments[0] || null
  );

  // Top-Level TAB option to give 100% full screen space to all views
  const [mainTab, setMainTab] = useState<'tournaments' | 'fixtures' | 'bracket' | 'engine' | 'rules'>('fixtures');

  // Modals
  const [isAddTourneyOpen, setIsAddTourneyOpen] = useState(false);
  const [isAddMatchOpen, setIsAddMatchOpen] = useState(false);
  const [isAutoGenerateOpen, setIsAutoGenerateOpen] = useState(false);
  const [scoringMatch, setScoringMatch] = useState<Match | null>(null);

  // Filter in fixtures list
  const [roundFilter, setRoundFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Keep selected tournament in sync when tournaments prop updates
  useEffect(() => {
    if (!selectedTourney && tournaments.length > 0) {
      setSelectedTourney(tournaments[0]);
    } else if (selectedTourney) {
      const found = tournaments.find((t) => t.id === selectedTourney.id);
      if (found) {
        setSelectedTourney(found);
      } else if (tournaments.length > 0) {
        setSelectedTourney(tournaments[0]);
      }
    }
  }, [tournaments]);

  // Tournament Creation Form
  const [tourneyForm, setTourneyForm] = useState({
    name: '',
    sportId: sports[0]?.id || 1,
    format: 'Knockout',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    venue: 'Main Indoor Stadium & Arena',
    entryFee: '2000',
    rules: 'Standard FIBA / FIFA tournament regulations. 15-minute halves / 4 quarters with 5-minute halftime break.',
  });

  // Single Match Form
  const [matchForm, setMatchForm] = useState({
    round: 'Quarter Final 1',
    matchDate: new Date().toISOString().split('T')[0],
    matchTime: '16:00',
    venue: 'Court 1',
    participantA: teams[0]?.name || 'Apex Warriors',
    participantB: teams[1]?.name || 'City Strikers',
  });

  // Score modal form
  const [scoreForm, setScoreForm] = useState({
    scoreA: '',
    scoreB: '',
    winner: '',
    status: 'Completed',
    notes: 'Match completed',
  });

  // Auto-Generate Bracket Form
  const [bracketConfig, setBracketConfig] = useState({
    bracketType: '8-team-knockout',
    venue: 'Court 1',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    contenders: [
      teams[0]?.name || 'Apex Warriors',
      teams[1]?.name || 'City Strikers',
      teams[2]?.name || 'Metro Titans',
      teams[3]?.name || 'Thunderbolts SC',
      'Burrabazar Royals',
      'East Bengal Youth',
      'Olympian Knights',
      'Vanguard Stars',
    ],
  });

  // Match Engine Interactive Console State
  const [engineMatchId, setEngineMatchId] = useState<number | null>(null);
  const [engineScoreA, setEngineScoreA] = useState<number>(0);
  const [engineScoreB, setEngineScoreB] = useState<number>(0);
  const [enginePeriod, setEnginePeriod] = useState<string>('Q1');
  const [engineTimerSeconds, setEngineTimerSeconds] = useState<number>(600); // 10:00
  const [engineTimerRunning, setEngineTimerRunning] = useState<boolean>(false);
  const [engineStatus, setEngineStatus] = useState<string>('Scheduled');
  const [engineWinner, setEngineWinner] = useState<string>('');
  const [engineNotes, setEngineNotes] = useState<string>('');
  const [engineFoulsA, setEngineFoulsA] = useState<number>(0);
  const [engineFoulsB, setEngineFoulsB] = useState<number>(0);
  const [engineSaveSuccess, setEngineSaveSuccess] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync engine state when selected tourney or engineMatchId changes
  useEffect(() => {
    if (!selectedTourney?.matches || selectedTourney.matches.length === 0) {
      setEngineMatchId(null);
      return;
    }
    const current = selectedTourney.matches.find((m) => m.id === engineMatchId) || selectedTourney.matches[0];
    if (current) {
      setEngineMatchId(current.id);
      setEngineScoreA(Number(current.scoreA) || 0);
      setEngineScoreB(Number(current.scoreB) || 0);
      setEngineStatus(current.status || 'Scheduled');
      setEngineWinner(current.winner || '');
      setEngineNotes(current.notes || '');
    }
  }, [selectedTourney, engineMatchId]);

  // Match Engine Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (engineTimerRunning && engineTimerSeconds > 0) {
      interval = setInterval(() => {
        setEngineTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (engineTimerSeconds === 0 && engineTimerRunning) {
      setEngineTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [engineTimerRunning, engineTimerSeconds]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateTourney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourneyForm.name) return;
    setIsSubmitting(true);
    try {
      await onCreateTournament(tourneyForm);
      setIsAddTourneyOpen(false);
      setTourneyForm({
        name: '',
        sportId: sports[0]?.id || 1,
        format: 'Knockout',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        venue: 'Main Indoor Stadium & Arena',
        entryFee: '2000',
        rules: 'Standard FIBA / FIFA regulations.',
      });
      setMainTab('tournaments');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSingleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourney) return;
    setIsSubmitting(true);
    try {
      await onAddMatch(selectedTourney.id, matchForm);
      setIsAddMatchOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoGenerateFixtures = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourney) return;
    setIsSubmitting(true);
    try {
      const generatedMatches: any[] = [];
      const contenders = bracketConfig.contenders.filter((c) => c.trim().length > 0);
      const baseDate = bracketConfig.startDate || new Date().toISOString().split('T')[0];

      if (bracketConfig.bracketType === '4-team-knockout') {
        const t1 = contenders[0] || 'Team Alpha';
        const t2 = contenders[1] || 'Team Beta';
        const t3 = contenders[2] || 'Team Gamma';
        const t4 = contenders[3] || 'Team Delta';

        generatedMatches.push({
          round: 'Semi Final 1',
          matchDate: baseDate,
          matchTime: '10:00',
          venue: bracketConfig.venue || 'Court 1',
          participantA: t1,
          participantB: t2,
          status: 'Scheduled',
        });
        generatedMatches.push({
          round: 'Semi Final 2',
          matchDate: baseDate,
          matchTime: '14:00',
          venue: bracketConfig.venue || 'Court 1',
          participantA: t3,
          participantB: t4,
          status: 'Scheduled',
        });
        generatedMatches.push({
          round: 'Grand Final',
          matchDate: new Date(new Date(baseDate).getTime() + 86400000).toISOString().split('T')[0],
          matchTime: '17:00',
          venue: bracketConfig.venue || 'Championship Arena',
          participantA: 'Winner SF1',
          participantB: 'Winner SF2',
          status: 'Scheduled',
        });
      } else if (bracketConfig.bracketType === 'round-robin') {
        // 4 Team round robin (6 matches)
        const c = [
          contenders[0] || 'Team A',
          contenders[1] || 'Team B',
          contenders[2] || 'Team C',
          contenders[3] || 'Team D',
        ];
        let dayOffset = 0;
        let matchIdx = 1;
        for (let i = 0; i < c.length; i++) {
          for (let j = i + 1; j < c.length; j++) {
            const mDate = new Date(new Date(baseDate).getTime() + dayOffset * 86400000).toISOString().split('T')[0];
            generatedMatches.push({
              round: `League Match ${matchIdx}`,
              matchDate: mDate,
              matchTime: matchIdx % 2 === 1 ? '11:00' : '16:00',
              venue: bracketConfig.venue || 'Court 1',
              participantA: c[i],
              participantB: c[j],
              status: 'Scheduled',
            });
            matchIdx++;
            if (matchIdx % 2 === 1) dayOffset++;
          }
        }
      } else {
        // 8 Team Knockout (Default)
        const c = [
          contenders[0] || 'Seed 1 (Apex Warriors)',
          contenders[1] || 'Seed 8 (Vanguard Stars)',
          contenders[2] || 'Seed 4 (Metro Titans)',
          contenders[3] || 'Seed 5 (Thunderbolts SC)',
          contenders[4] || 'Seed 2 (City Strikers)',
          contenders[5] || 'Seed 7 (Olympian Knights)',
          contenders[6] || 'Seed 3 (East Bengal Youth)',
          contenders[7] || 'Seed 6 (Burrabazar Royals)',
        ];

        // 4 Quarter Finals
        generatedMatches.push({
          round: 'Quarter Final 1',
          matchDate: baseDate,
          matchTime: '09:00',
          venue: bracketConfig.venue || 'Court 1',
          participantA: c[0],
          participantB: c[1],
          status: 'Scheduled',
        });
        generatedMatches.push({
          round: 'Quarter Final 2',
          matchDate: baseDate,
          matchTime: '11:30',
          venue: bracketConfig.venue || 'Court 1',
          participantA: c[2],
          participantB: c[3],
          status: 'Scheduled',
        });
        generatedMatches.push({
          round: 'Quarter Final 3',
          matchDate: baseDate,
          matchTime: '14:00',
          venue: bracketConfig.venue || 'Court 2',
          participantA: c[4],
          participantB: c[5],
          status: 'Scheduled',
        });
        generatedMatches.push({
          round: 'Quarter Final 4',
          matchDate: baseDate,
          matchTime: '16:30',
          venue: bracketConfig.venue || 'Court 2',
          participantA: c[6],
          participantB: c[7],
          status: 'Scheduled',
        });

        // 2 Semi Finals (Next Day)
        const semiDate = new Date(new Date(baseDate).getTime() + 86400000).toISOString().split('T')[0];
        generatedMatches.push({
          round: 'Semi Final 1',
          matchDate: semiDate,
          matchTime: '11:00',
          venue: bracketConfig.venue || 'Championship Arena',
          participantA: 'Winner QF1',
          participantB: 'Winner QF2',
          status: 'Scheduled',
        });
        generatedMatches.push({
          round: 'Semi Final 2',
          matchDate: semiDate,
          matchTime: '15:00',
          venue: bracketConfig.venue || 'Championship Arena',
          participantA: 'Winner QF3',
          participantB: 'Winner QF4',
          status: 'Scheduled',
        });

        // Grand Final (Day 3)
        const finalDate = new Date(new Date(baseDate).getTime() + 2 * 86400000).toISOString().split('T')[0];
        generatedMatches.push({
          round: 'Grand Final',
          matchDate: finalDate,
          matchTime: '18:00',
          venue: bracketConfig.venue || 'Championship Arena',
          participantA: 'Winner SF1',
          participantB: 'Winner SF2',
          status: 'Scheduled',
        });
      }

      if (onBatchAddMatches) {
        await onBatchAddMatches(selectedTourney.id, generatedMatches);
      } else {
        for (const m of generatedMatches) {
          await onAddMatch(selectedTourney.id, m);
        }
      }

      setIsAutoGenerateOpen(false);
      setMainTab('fixtures');
    } catch (err) {
      console.error('Failed to auto generate fixtures:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringMatch) return;
    setIsSubmitting(true);
    try {
      await onUpdateMatchScore(scoringMatch.id, scoreForm);
      setScoringMatch(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEngineMatch = async () => {
    if (!engineMatchId || !selectedTourney) return;
    setIsSubmitting(true);
    try {
      const activeMatch = selectedTourney.matches?.find((m) => m.id === engineMatchId);
      const computedWinner =
        engineWinner ||
        (engineScoreA > engineScoreB
          ? activeMatch?.participantA
          : engineScoreB > engineScoreA
          ? activeMatch?.participantB
          : 'Draw');

      await onUpdateMatchScore(engineMatchId, {
        scoreA: String(engineScoreA),
        scoreB: String(engineScoreB),
        winner: computedWinner,
        status: engineStatus,
        notes: engineNotes || `Period: ${enginePeriod} • Finalized via Match Engine`,
      });

      setEngineSaveSuccess('Match score and bracket progression synchronized!');
      setTimeout(() => setEngineSaveSuccess(null), 4000);
    } catch (err) {
      console.error('Failed to save engine score:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openScoreModal = (match: Match) => {
    setScoringMatch(match);
    setScoreForm({
      scoreA: match.scoreA || '',
      scoreB: match.scoreB || '',
      winner: match.winner || match.participantA,
      status: match.status || 'Completed',
      notes: match.notes || '',
    });
  };

  const openMatchEngineFor = (match: Match) => {
    setEngineMatchId(match.id);
    setEngineScoreA(Number(match.scoreA) || 0);
    setEngineScoreB(Number(match.scoreB) || 0);
    setEngineStatus(match.status || 'Live');
    setEngineWinner(match.winner || '');
    setEngineNotes(match.notes || '');
    setMainTab('engine');
  };

  // Compute standings if league
  const computeStandings = () => {
    if (!selectedTourney?.matches) return [];
    const map: Record<string, { team: string; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; points: number }> = {};

    const getOrInit = (t: string) => {
      if (!map[t]) {
        map[t] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 };
      }
      return map[t];
    };

    selectedTourney.matches.forEach((m) => {
      if (m.status === 'Completed' && m.scoreA !== '' && m.scoreB !== '') {
        const a = getOrInit(m.participantA);
        const b = getOrInit(m.participantB);
        const sA = Number(m.scoreA) || 0;
        const sB = Number(m.scoreB) || 0;

        a.played++;
        b.played++;
        a.gf += sA;
        a.ga += sB;
        b.gf += sB;
        b.ga += sA;

        if (sA > sB) {
          a.won++;
          a.points += 3;
          b.lost++;
        } else if (sB > sA) {
          b.won++;
          b.points += 3;
          a.lost++;
        } else {
          a.drawn++;
          b.drawn++;
          a.points += 1;
          b.points += 1;
        }
      }
    });

    return Object.values(map).sort((x, y) => y.points - x.points || (y.gf - y.ga) - (x.gf - x.ga));
  };

  const currentEngineMatch = selectedTourney?.matches?.find((m) => m.id === engineMatchId);

  // Filtered fixtures
  const filteredMatches = (selectedTourney?.matches || []).filter((m) => {
    if (roundFilter !== 'all' && !m.round?.toLowerCase().includes(roundFilter.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && m.status?.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchA = m.participantA?.toLowerCase().includes(q);
      const matchB = m.participantB?.toLowerCase().includes(q);
      const matchRound = m.round?.toLowerCase().includes(q);
      if (!matchA && !matchB && !matchRound) return false;
    }
    return true;
  });

  // Calculate high-level metrics for tournaments tab
  const totalTourneys = tournaments.length;
  const totalFixtures = tournaments.reduce((acc, t) => acc + (t.matches?.length || 0), 0);
  const completedFixtures = tournaments.reduce(
    (acc, t) => acc + (t.matches?.filter((m) => m.status === 'Completed').length || 0),
    0
  );
  const liveFixtures = tournaments.reduce(
    (acc, t) => acc + (t.matches?.filter((m) => m.status === 'Live').length || 0),
    0
  );

  return (
    <div className="space-y-5 w-full">
      {/* Page Title & Main Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700 shadow-2xs">
              <Trophy className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tournaments, Fixtures & Match Engine
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated knockout & league brackets, full-width fixture schedule, and courtside live score engine.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap">
          <button
            onClick={() => setIsAddTourneyOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tournament</span>
          </button>
        </div>
      </div>

      {/* TOP-LEVEL FULL-WIDTH NAVIGATION TABS */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {/* TAB 1: ALL TOURNAMENTS */}
          <button
            onClick={() => setMainTab('tournaments')}
            className={`flex-1 min-w-[140px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 whitespace-nowrap ${
              mainTab === 'tournaments'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4 shrink-0" />
            <span>All Tournaments</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                mainTab === 'tournaments' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {totalTourneys}
            </span>
          </button>

          {/* TAB 2: FIXTURES & SCHEDULE */}
          <button
            onClick={() => setMainTab('fixtures')}
            className={`flex-1 min-w-[160px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 whitespace-nowrap ${
              mainTab === 'fixtures'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Swords className="w-4 h-4 shrink-0" />
            <span>Fixtures & Schedule</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                mainTab === 'fixtures' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {selectedTourney?.matches?.length || 0}
            </span>
          </button>

          {/* TAB 3: INTERACTIVE BRACKET TREE / LEAGUE STANDINGS */}
          <button
            onClick={() => setMainTab('bracket')}
            className={`flex-1 min-w-[170px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 whitespace-nowrap ${
              mainTab === 'bracket'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>
              {selectedTourney?.format === 'League' ? 'League Standings' : 'Interactive Bracket Tree'}
            </span>
          </button>

          {/* TAB 4: LIVE MATCH ENGINE */}
          <button
            onClick={() => setMainTab('engine')}
            className={`flex-1 min-w-[160px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 whitespace-nowrap ${
              mainTab === 'engine'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Flame className={`w-4 h-4 shrink-0 ${mainTab === 'engine' ? 'text-amber-300' : 'text-amber-500'}`} />
            <span>Live Match Engine</span>
            {liveFixtures > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            )}
          </button>

          {/* TAB 5: RULES & REGULATIONS */}
          <button
            onClick={() => setMainTab('rules')}
            className={`flex-1 min-w-[130px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 whitespace-nowrap ${
              mainTab === 'rules'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <span>Rules & Format</span>
          </button>
        </div>
      </div>

      {/* TOURNAMENT CONTEXT SELECTOR BAR (Shown on Fixtures, Bracket, Engine & Rules tabs) */}
      {mainTab !== 'tournaments' && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Tournament Selector Dropdown & Badges */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-600 text-white px-2.5 py-0.5 rounded font-mono">
                  {selectedTourney?.sportName || 'SPORT'}
                </span>
                <span className="text-[11px] text-blue-200 font-semibold bg-white/10 px-2.5 py-0.5 rounded-full">
                  {selectedTourney?.format || 'Knockout'} Format
                </span>
                <span className="text-[11px] text-amber-300 font-medium">
                  Entry: ₹{selectedTourney?.entryFee || '0'}
                </span>
                <span className="text-[11px] text-slate-300">
                  • {selectedTourney?.matches?.length || 0} Fixtures (
                  {selectedTourney?.matches?.filter((m) => m.status === 'Completed').length || 0} Completed)
                </span>
              </div>

              <div className="flex items-center space-x-3 flex-wrap">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tournament:</span>
                  <select
                    value={selectedTourney?.id || ''}
                    onChange={(e) => {
                      const t = tournaments.find((x) => x.id === Number(e.target.value));
                      if (t) setSelectedTourney(t);
                    }}
                    className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3 py-1.5 text-sm sm:text-base font-black text-white focus:outline-hidden cursor-pointer"
                  >
                    {tournaments.map((t) => (
                      <option key={t.id} value={t.id} className="bg-slate-900 text-white font-bold">
                        {t.name} ({t.format})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-slate-300 flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{selectedTourney?.venue || 'Stadium Arena'}</span>
                  <span>•</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {selectedTourney?.startDate} to {selectedTourney?.endDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-2 flex-wrap self-start lg:self-center shrink-0">
              <button
                onClick={() => setIsAutoGenerateOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Auto-Generate Bracket</span>
              </button>

              <button
                onClick={() => setIsAddMatchOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Fixture</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1 CONTENT: ALL TOURNAMENTS (Full-Width Responsive Cards Grid)        */}
      {/* ========================================================================= */}
      {mainTab === 'tournaments' && (
        <div className="space-y-6">
          {/* Summary Stat Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Tournaments</span>
                <Trophy className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalTourneys}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Scheduled Fixtures</span>
                <Swords className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalFixtures}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Completed Matches</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{completedFixtures}</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Live In-Play</span>
                <Flame className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{liveFixtures}</div>
            </div>
          </div>

          {/* Tournaments Grid */}
          {tournaments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-black text-slate-800">No Tournaments Registered</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Create your first championship or league to generate brackets, fixtures, and courtside scorekeeping.
              </p>
              <button
                onClick={() => setIsAddTourneyOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs"
              >
                + Create Tournament
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tournaments.map((t) => {
                const matchesCount = t.matches?.length || 0;
                const completedCount = t.matches?.filter((m) => m.status === 'Completed').length || 0;
                const isSelected = selectedTourney?.id === t.id;
                const progressPct = matchesCount > 0 ? Math.round((completedCount / matchesCount) * 100) : 0;

                return (
                  <div
                    key={t.id}
                    className={`p-5 rounded-2xl border transition-all bg-white flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Badge Row */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md uppercase font-mono tracking-wider">
                          {t.sportName || 'SPORT'}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            {t.format || 'Knockout'}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            ₹{t.entryFee}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-black text-slate-900 mt-3 leading-snug">{t.name}</h3>

                      {/* Meta */}
                      <div className="space-y-1.5 mt-3 text-xs text-slate-500">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {t.startDate} to {t.endDate}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{t.venue || 'Indoor Stadium'}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-600">
                            {matchesCount} Matches ({completedCount} Completed)
                          </span>
                          <span className="text-slate-900 font-mono font-bold">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Tab Jump Buttons on Card */}
                    <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setSelectedTourney(t);
                          setMainTab('fixtures');
                        }}
                        className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-all text-center flex flex-col items-center justify-center space-y-1"
                        title="View Fixtures & Schedule"
                      >
                        <Swords className="w-3.5 h-3.5 text-blue-600" />
                        <span>Fixtures</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTourney(t);
                          setMainTab('bracket');
                        }}
                        className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-all text-center flex flex-col items-center justify-center space-y-1"
                        title="View Interactive Bracket / Standings"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>{t.format === 'League' ? 'Standings' : 'Bracket'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedTourney(t);
                          setMainTab('engine');
                        }}
                        className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-bold transition-all text-center flex flex-col items-center justify-center space-y-1"
                        title="Open Courtside Live Match Engine"
                      >
                        <Flame className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Engine</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2 CONTENT: FIXTURES & SCHEDULE (100% Full-Width)                      */}
      {/* ========================================================================= */}
      {mainTab === 'fixtures' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-5">
          {/* Filters & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search fixtures by team name or stage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center space-x-3 flex-wrap">
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="font-bold text-slate-600">Round:</span>
                <select
                  value={roundFilter}
                  onChange={(e) => setRoundFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
                >
                  <option value="all">All Stages & Rounds</option>
                  <option value="Quarter Final">Quarter Finals</option>
                  <option value="Semi Final">Semi Finals</option>
                  <option value="Final">Finals</option>
                  <option value="League">League Matches</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5 text-xs">
                <span className="font-bold text-slate-600">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
                >
                  <option value="all">All Match Statuses</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Live">Live / In-Play</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fixtures List (Full width cards) */}
          {filteredMatches.length > 0 ? (
            <div className="space-y-3.5">
              {filteredMatches.map((m) => {
                const isCompleted = m.status === 'Completed';
                const isLive = m.status === 'Live';

                return (
                  <div
                    key={m.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isLive
                        ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300 shadow-sm'
                        : isCompleted
                        ? 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left & Middle Info */}
                      <div className="space-y-3 flex-1">
                        {/* Header line */}
                        <div className="flex items-center space-x-2.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded">
                            {m.round}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center space-x-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {m.matchDate} {m.matchTime ? `• ${m.matchTime}` : ''}
                            </span>
                          </span>
                          <span className="text-xs text-slate-300">|</span>
                          <span className="text-xs text-slate-500 flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{m.venue || 'Arena Court'}</span>
                          </span>
                          {isLive && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                              ● LIVE IN-PLAY
                            </span>
                          )}
                        </div>

                        {/* Team Contenders Clash Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                          {/* Contender A */}
                          <div
                            className={`p-3 rounded-xl border flex items-center justify-between ${
                              m.winner === m.participantA
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-black ring-1 ring-emerald-300/50'
                                : 'bg-white border-slate-200 text-slate-800 font-bold'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 truncate">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">
                                A
                              </div>
                              <span className="truncate text-xs sm:text-sm">{m.participantA}</span>
                              {m.winner === m.participantA && (
                                <Medal className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </div>
                            <span className="text-base sm:text-lg font-black font-mono ml-3 px-2 py-0.5 rounded bg-slate-100 text-slate-900">
                              {m.scoreA !== '' && m.scoreA !== null ? m.scoreA : '-'}
                            </span>
                          </div>

                          {/* Contender B */}
                          <div
                            className={`p-3 rounded-xl border flex items-center justify-between ${
                              m.winner === m.participantB
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-black ring-1 ring-emerald-300/50'
                                : 'bg-white border-slate-200 text-slate-800 font-bold'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 truncate">
                              <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-xs font-bold shrink-0">
                                B
                              </div>
                              <span className="truncate text-xs sm:text-sm">{m.participantB}</span>
                              {m.winner === m.participantB && (
                                <Medal className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </div>
                            <span className="text-base sm:text-lg font-black font-mono ml-3 px-2 py-0.5 rounded bg-slate-100 text-slate-900">
                              {m.scoreB !== '' && m.scoreB !== null ? m.scoreB : '-'}
                            </span>
                          </div>
                        </div>

                        {m.notes && (
                          <div className="text-[11px] text-slate-500 italic pl-1">
                            Notes / Commentary: {m.notes}
                          </div>
                        )}
                      </div>

                      {/* Right Action Controls */}
                      <div className="flex sm:flex-row lg:flex-col items-center gap-2.5 self-end lg:self-center shrink-0">
                        <button
                          onClick={() => openMatchEngineFor(m)}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer"
                        >
                          <Flame className="w-4 h-4 text-amber-400" />
                          <span>Live Match Engine</span>
                        </button>

                        <button
                          onClick={() => openScoreModal(m)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isCompleted ? 'Edit Score' : 'Log Score'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 px-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
                <Swords className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No Fixtures Match Filter</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Generate full championship knockout brackets or league schedule with 1-click, or add individual matches manually.
              </p>

              <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={() => setIsAutoGenerateOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>1-Click Auto-Generate Bracket</span>
                </button>
                <button
                  onClick={() => setIsAddMatchOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Single Fixture</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3 CONTENT: INTERACTIVE BRACKET TREE / LEAGUE STANDINGS (100% Width)   */}
      {/* ========================================================================= */}
      {mainTab === 'bracket' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
          {selectedTourney?.format === 'League' ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-black text-slate-900">League Standings Table</h4>
                  <p className="text-xs text-slate-500">
                    Live points and goal difference computed automatically from completed match scores
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Pos</th>
                      <th className="py-3 px-4">Team / Contender</th>
                      <th className="py-3 px-4 text-center">P</th>
                      <th className="py-3 px-4 text-center">W</th>
                      <th className="py-3 px-4 text-center">D</th>
                      <th className="py-3 px-4 text-center">L</th>
                      <th className="py-3 px-4 text-center">GF</th>
                      <th className="py-3 px-4 text-center">GA</th>
                      <th className="py-3 px-4 text-center">GD</th>
                      <th className="py-3 px-4 text-center font-bold text-slate-900">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {computeStandings().map((row, idx) => (
                      <tr key={row.team} className={idx === 0 ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}>
                        <td className="py-3 px-4 font-bold text-slate-700">
                          {idx === 0 ? '🏆 1' : idx + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                          <span>{row.team}</span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600">{row.played}</td>
                        <td className="py-3 px-4 text-center text-emerald-600 font-bold">{row.won}</td>
                        <td className="py-3 px-4 text-center text-slate-500">{row.drawn}</td>
                        <td className="py-3 px-4 text-center text-rose-600">{row.lost}</td>
                        <td className="py-3 px-4 text-center text-slate-600">{row.gf}</td>
                        <td className="py-3 px-4 text-center text-slate-600">{row.ga}</td>
                        <td className="py-3 px-4 text-center font-mono">
                          {row.gf - row.ga > 0 ? `+${row.gf - row.ga}` : row.gf - row.ga}
                        </td>
                        <td className="py-3 px-4 text-center font-black text-slate-900 text-sm bg-slate-50">
                          {row.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Knockout Visual Bracket Tree with Generous Full-Width Space */
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h4 className="text-base font-black text-slate-900">Championship Elimination Bracket</h4>
                  <p className="text-xs text-slate-500">
                    Full-width progression tree: Quarter-Finals → Semi-Finals → Championship Final → Winner Podium
                  </p>
                </div>
                <button
                  onClick={() => setIsAutoGenerateOpen(true)}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Re-Generate Bracket</span>
                </button>
              </div>

              {/* Full Width Bracket Columns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 relative">
                {/* Column 1: Quarter Finals */}
                <div className="space-y-3">
                  <div className="text-xs font-black text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-200 flex items-center justify-between">
                    <span>Quarter Finals</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      Round of 8
                    </span>
                  </div>

                  {(selectedTourney?.matches || [])
                    .filter(
                      (m) =>
                        m.round?.toLowerCase().includes('quarter') ||
                        m.round?.toLowerCase().includes('round 1')
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        onClick={() => openMatchEngineFor(m)}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs cursor-pointer transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold">{m.round}</span>
                          <span className={m.status === 'Completed' ? 'text-emerald-600 font-bold' : ''}>
                            {m.status}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div
                            className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg ${
                              m.winner === m.participantA
                                ? 'bg-emerald-50 font-black text-emerald-950 ring-1 ring-emerald-300'
                                : 'bg-slate-50 font-semibold text-slate-800'
                            }`}
                          >
                            <span className="truncate">{m.participantA}</span>
                            <span className="font-mono font-bold">
                              {m.scoreA !== '' && m.scoreA !== null ? m.scoreA : '-'}
                            </span>
                          </div>
                          <div
                            className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg ${
                              m.winner === m.participantB
                                ? 'bg-emerald-50 font-black text-emerald-950 ring-1 ring-emerald-300'
                                : 'bg-slate-50 font-semibold text-slate-800'
                            }`}
                          >
                            <span className="truncate">{m.participantB}</span>
                            <span className="font-mono font-bold">
                              {m.scoreB !== '' && m.scoreB !== null ? m.scoreB : '-'}
                            </span>
                          </div>
                        </div>
                        <div className="text-[10px] text-blue-600 font-semibold flex items-center space-x-1 pt-1">
                          <Flame className="w-3 h-3" />
                          <span>Click to launch match engine</span>
                        </div>
                      </div>
                    ))}

                  {(selectedTourney?.matches || []).filter((m) =>
                    m.round?.toLowerCase().includes('quarter')
                  ).length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No Quarter Final fixtures
                    </div>
                  )}
                </div>

                {/* Column 2: Semi Finals */}
                <div className="space-y-3">
                  <div className="text-xs font-black text-blue-700 uppercase tracking-wider pb-2 border-b border-blue-200 flex items-center justify-between">
                    <span>Semi Finals</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">
                      Final 4
                    </span>
                  </div>

                  {(selectedTourney?.matches || [])
                    .filter((m) => m.round?.toLowerCase().includes('semi'))
                    .map((m) => (
                      <div
                        key={m.id}
                        onClick={() => openMatchEngineFor(m)}
                        className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 hover:border-blue-400 hover:shadow-xs cursor-pointer transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px] text-blue-800 font-bold">
                          <span>{m.round}</span>
                          <span>{m.status}</span>
                        </div>
                        <div className="space-y-1.5">
                          <div
                            className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg ${
                              m.winner === m.participantA
                                ? 'bg-emerald-50 font-black text-emerald-950 ring-1 ring-emerald-300'
                                : 'bg-white font-semibold text-slate-800'
                            }`}
                          >
                            <span className="truncate">{m.participantA}</span>
                            <span className="font-mono font-bold">
                              {m.scoreA !== '' && m.scoreA !== null ? m.scoreA : '-'}
                            </span>
                          </div>
                          <div
                            className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg ${
                              m.winner === m.participantB
                                ? 'bg-emerald-50 font-black text-emerald-950 ring-1 ring-emerald-300'
                                : 'bg-white font-semibold text-slate-800'
                            }`}
                          >
                            <span className="truncate">{m.participantB}</span>
                            <span className="font-mono font-bold">
                              {m.scoreB !== '' && m.scoreB !== null ? m.scoreB : '-'}
                            </span>
                          </div>
                        </div>
                        <div className="text-[10px] text-blue-600 font-semibold flex items-center space-x-1 pt-1">
                          <Flame className="w-3 h-3" />
                          <span>Click to launch match engine</span>
                        </div>
                      </div>
                    ))}

                  {(selectedTourney?.matches || []).filter((m) =>
                    m.round?.toLowerCase().includes('semi')
                  ).length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No Semi Final fixtures
                    </div>
                  )}
                </div>

                {/* Column 3: Grand Final */}
                <div className="space-y-3">
                  <div className="text-xs font-black text-amber-600 uppercase tracking-wider pb-2 border-b border-amber-200 flex items-center justify-between">
                    <span>Championship Final</span>
                    <Trophy className="w-4 h-4 text-amber-500" />
                  </div>

                  {(selectedTourney?.matches || [])
                    .filter(
                      (m) =>
                        m.round?.toLowerCase().includes('final') &&
                        !m.round?.toLowerCase().includes('semi') &&
                        !m.round?.toLowerCase().includes('quarter')
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        onClick={() => openMatchEngineFor(m)}
                        className="p-4 rounded-2xl border-2 border-amber-400 bg-amber-50/70 hover:shadow-md cursor-pointer transition-all space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                          <span>🏆 GRAND FINAL</span>
                          <span className="bg-amber-200/80 px-2 py-0.5 rounded text-[10px] font-mono">
                            {m.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div
                            className={`flex items-center justify-between text-xs px-3 py-2 rounded-xl ${
                              m.winner === m.participantA
                                ? 'bg-emerald-100 font-black text-emerald-950 ring-1 ring-emerald-400'
                                : 'bg-white font-bold text-slate-900'
                            }`}
                          >
                            <span className="truncate">{m.participantA}</span>
                            <span className="font-mono font-bold text-sm">
                              {m.scoreA !== '' && m.scoreA !== null ? m.scoreA : '-'}
                            </span>
                          </div>
                          <div
                            className={`flex items-center justify-between text-xs px-3 py-2 rounded-xl ${
                              m.winner === m.participantB
                                ? 'bg-emerald-100 font-black text-emerald-950 ring-1 ring-emerald-400'
                                : 'bg-white font-bold text-slate-900'
                            }`}
                          >
                            <span className="truncate">{m.participantB}</span>
                            <span className="font-mono font-bold text-sm">
                              {m.scoreB !== '' && m.scoreB !== null ? m.scoreB : '-'}
                            </span>
                          </div>
                        </div>

                        {m.winner && (
                          <div className="mt-3 pt-2.5 border-t border-amber-200 text-center">
                            <div className="text-[10px] uppercase font-black text-amber-700">
                              Tournament Champion
                            </div>
                            <div className="text-base font-black text-emerald-700 flex items-center justify-center space-x-1.5 mt-1">
                              <Medal className="w-5 h-5 text-amber-500" />
                              <span>{m.winner}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Column 4: Podium / Winner Showcase */}
                <div className="space-y-3">
                  <div className="text-xs font-black text-emerald-700 uppercase tracking-wider pb-2 border-b border-emerald-200 flex items-center justify-between">
                    <span>Podium Honors</span>
                    <Medal className="w-4 h-4 text-emerald-600" />
                  </div>

                  {(() => {
                    const finalMatch = (selectedTourney?.matches || []).find(
                      (m) =>
                        m.round?.toLowerCase().includes('final') &&
                        !m.round?.toLowerCase().includes('semi') &&
                        !m.round?.toLowerCase().includes('quarter')
                    );

                    if (finalMatch?.winner) {
                      const runnerUp =
                        finalMatch.winner === finalMatch.participantA
                          ? finalMatch.participantB
                          : finalMatch.participantA;

                      return (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-white shadow-md space-y-3">
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2 text-2xl">
                              🥇
                            </div>
                            <div className="text-[11px] uppercase tracking-wider font-bold text-amber-100">
                              Grand Champion
                            </div>
                            <div className="text-lg font-black text-white">{finalMatch.winner}</div>
                          </div>

                          <div className="pt-2 border-t border-white/20 text-center">
                            <div className="text-[10px] uppercase tracking-wider font-bold text-amber-200">
                              🥈 Runner Up
                            </div>
                            <div className="text-xs font-bold text-white mt-0.5">{runnerUp}</div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                        <Trophy className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-600">Champion Awaiting</p>
                        <p className="text-[11px] text-slate-400">
                          Complete semi-finals and final via Match Engine to crown the champion.
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4 CONTENT: LIVE MATCH ENGINE CONSOLE (100% Full-Width Courtside UI)   */}
      {/* ========================================================================= */}
      {mainTab === 'engine' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
          {/* Match Selector Dropdown Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <Flame className="w-5 h-5" />
              </span>
              <div>
                <span className="text-sm font-black text-slate-900">Courtside Live Scoreboard & Timer</span>
                <p className="text-xs text-slate-500">Live scorekeeper, period selector, and bracket synchronizer</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-600">Select Fixture:</span>
              <select
                value={engineMatchId || ''}
                onChange={(e) => {
                  const mId = Number(e.target.value);
                  setEngineMatchId(mId);
                  const m = selectedTourney?.matches?.find((x) => x.id === mId);
                  if (m) {
                    setEngineScoreA(Number(m.scoreA) || 0);
                    setEngineScoreB(Number(m.scoreB) || 0);
                    setEngineStatus(m.status || 'Live');
                    setEngineWinner(m.winner || '');
                  }
                }}
                className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-bold focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                {selectedTourney?.matches?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.round}: {m.participantA} vs {m.participantB} ({m.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {currentEngineMatch ? (
            <div className="space-y-6">
              {/* Stadium LED Scoreboard Display */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-xl border border-slate-800">
                {/* Top Bar: Round & Timer */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-mono font-bold bg-blue-600 text-white px-2.5 py-1 rounded-md uppercase">
                      {currentEngineMatch.round}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      Venue: {currentEngineMatch.venue || 'Main Court'}
                    </span>
                  </div>

                  {/* Period & Timer Controls */}
                  <div className="flex items-center space-x-2.5">
                    <div className="flex items-center space-x-1.5 bg-black/60 px-3.5 py-1.5 rounded-xl border border-white/10">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="text-base sm:text-lg font-mono font-black text-amber-300 tracking-wider">
                        {formatTimer(engineTimerSeconds)}
                      </span>
                    </div>

                    <button
                      onClick={() => setEngineTimerRunning(!engineTimerRunning)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                        engineTimerRunning
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                      title={engineTimerRunning ? 'Pause Timer' : 'Start Timer'}
                    >
                      {engineTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{engineTimerRunning ? 'Pause' : 'Start'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setEngineTimerRunning(false);
                        setEngineTimerSeconds(600);
                      }}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
                      title="Reset Timer to 10:00"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Middle: Contenders Score Clash */}
                <div className="grid grid-cols-2 gap-6 sm:gap-10 py-8 items-center">
                  {/* Contender A */}
                  <div className="text-center space-y-3">
                    <div className="text-xs font-bold uppercase tracking-widest text-blue-300">
                      TEAM ALPHA
                    </div>
                    <div className="text-xl sm:text-3xl font-black truncate text-white">
                      {currentEngineMatch.participantA}
                    </div>
                    <div className="text-6xl sm:text-8xl font-black font-mono tracking-tight text-white my-3">
                      {engineScoreA}
                    </div>

                    {/* Point Increment Buttons */}
                    <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
                      <button
                        onClick={() => setEngineScoreA((prev) => prev + 1)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => setEngineScoreA((prev) => prev + 2)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                      >
                        +2
                      </button>
                      <button
                        onClick={() => setEngineScoreA((prev) => prev + 3)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                      >
                        +3
                      </button>
                      <button
                        onClick={() => setEngineScoreA((prev) => Math.max(0, prev - 1))}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs sm:text-sm cursor-pointer"
                      >
                        -1
                      </button>
                    </div>
                  </div>

                  {/* Contender B */}
                  <div className="text-center space-y-3 border-l border-white/10">
                    <div className="text-xs font-bold uppercase tracking-widest text-orange-300">
                      TEAM BETA
                    </div>
                    <div className="text-xl sm:text-3xl font-black truncate text-white">
                      {currentEngineMatch.participantB}
                    </div>
                    <div className="text-6xl sm:text-8xl font-black font-mono tracking-tight text-white my-3">
                      {engineScoreB}
                    </div>

                    {/* Point Increment Buttons */}
                    <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
                      <button
                        onClick={() => setEngineScoreB((prev) => prev + 1)}
                        className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => setEngineScoreB((prev) => prev + 2)}
                        className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                      >
                        +2
                      </button>
                      <button
                        onClick={() => setEngineScoreB((prev) => prev + 3)}
                        className="px-3.5 py-1.5 rounded-xl bg-orange-700 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                      >
                        +3
                      </button>
                      <button
                        onClick={() => setEngineScoreB((prev) => Math.max(0, prev - 1))}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs sm:text-sm cursor-pointer"
                      >
                        -1
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Status & Period Bar */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 font-semibold">Quarter / Period:</span>
                    {['Q1', 'Q2', 'Q3', 'Q4', 'OT'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setEnginePeriod(p)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          enginePeriod === p
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 font-semibold">Match Status:</span>
                    <select
                      value={engineStatus}
                      onChange={(e) => setEngineStatus(e.target.value)}
                      className="bg-black/60 text-white text-xs font-bold rounded-lg px-3 py-1.5 border border-white/20"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Live">Live / In-Play</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Engine Actions & Winner Declaration */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Declare Match Winner
                    </label>
                    <select
                      value={engineWinner}
                      onChange={(e) => setEngineWinner(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="">Auto (By Higher Score)</option>
                      <option value={currentEngineMatch.participantA}>
                        {currentEngineMatch.participantA}
                      </option>
                      <option value={currentEngineMatch.participantB}>
                        {currentEngineMatch.participantB}
                      </option>
                      <option value="Draw / Tie">Draw / Tie</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Commentary / Match Notes
                    </label>
                    <input
                      type="text"
                      value={engineNotes}
                      onChange={(e) => setEngineNotes(e.target.value)}
                      placeholder="e.g. 3-point buzzer beater by #7"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                    </input>
                  </div>
                </div>

                {engineSaveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{engineSaveSuccess}</span>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                  <button
                    onClick={handleSaveEngineMatch}
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSubmitting ? 'Syncing...' : 'Save & Sync Match Score'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No fixtures available to operate. Generate fixtures first in the Fixtures tab.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5 CONTENT: RULES & FORMAT DETAILS (100% Full-Width)                   */}
      {/* ========================================================================= */}
      {mainTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-5 text-xs">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="font-black text-slate-900 text-sm sm:text-base">Official Competition Regulations</h4>
            <p className="text-slate-600 leading-relaxed">
              {selectedTourney?.rules ||
                'Standard sports federation tournament guidelines apply. All participating teams must check-in 30 minutes prior to tip-off / kick-off. Overtime rules apply in knockout stages with 5-minute extension periods.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Bracket Structure</span>
              <div className="text-base font-black text-blue-950 mt-1">{selectedTourney?.format}</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Entry Registration Fee</span>
              <div className="text-base font-black text-emerald-950 mt-1">₹{selectedTourney?.entryFee}</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Scheduled Window</span>
              <div className="text-sm font-black text-amber-950 mt-1">
                {selectedTourney?.startDate} to {selectedTourney?.endDate}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
              <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Venue / Stadium</span>
              <div className="text-sm font-black text-purple-950 mt-1 truncate">{selectedTourney?.venue}</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS                                                                    */}
      {/* ========================================================================= */}

      {/* MODAL 1: CREATE TOURNAMENT */}
      {isAddTourneyOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base">Create Tournament</h3>
                <p className="text-xs text-slate-500">Add a new championship or league tournament</p>
              </div>
              <button
                onClick={() => setIsAddTourneyOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTourney} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tournament Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Youth Basketball Championship 2026"
                  value={tourneyForm.name}
                  onChange={(e) => setTourneyForm({ ...tourneyForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sport Discipline</label>
                  <select
                    value={tourneyForm.sportId}
                    onChange={(e) => setTourneyForm({ ...tourneyForm, sportId: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    {sports.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bracket Format</label>
                  <select
                    value={tourneyForm.format}
                    onChange={(e) => setTourneyForm({ ...tourneyForm, format: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Knockout">Single Elimination (Knockout)</option>
                    <option value="League">Round-Robin (League)</option>
                    <option value="Double Elimination">Double Elimination</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={tourneyForm.startDate}
                    onChange={(e) => setTourneyForm({ ...tourneyForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={tourneyForm.endDate}
                    onChange={(e) => setTourneyForm({ ...tourneyForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Venue / Ground</label>
                  <input
                    type="text"
                    value={tourneyForm.venue}
                    onChange={(e) => setTourneyForm({ ...tourneyForm, venue: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Entry Fee (₹)</label>
                  <input
                    type="number"
                    value={tourneyForm.entryFee}
                    onChange={(e) => setTourneyForm({ ...tourneyForm, entryFee: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tournament Rules</label>
                <textarea
                  rows={2}
                  value={tourneyForm.rules}
                  onChange={(e) => setTourneyForm({ ...tourneyForm, rules: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddTourneyOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Creating...' : 'Create Tournament'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AUTO-GENERATE BRACKET & FIXTURES */}
      {isAutoGenerateOpen && selectedTourney && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Auto-Generate Bracket Engine</h3>
                  <p className="text-xs text-slate-500">{selectedTourney.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAutoGenerateOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAutoGenerateFixtures} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bracket Structure</label>
                <select
                  value={bracketConfig.bracketType}
                  onChange={(e) => setBracketConfig({ ...bracketConfig, bracketType: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold"
                >
                  <option value="8-team-knockout">
                    8-Team Championship Bracket (4 Quarter-Finals, 2 Semi-Finals, Grand Final)
                  </option>
                  <option value="4-team-knockout">
                    4-Team Knockout (2 Semi-Finals, Grand Final)
                  </option>
                  <option value="round-robin">
                    4-Team Round-Robin League (6 Matches)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={bracketConfig.startDate}
                    onChange={(e) => setBracketConfig({ ...bracketConfig, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Venue</label>
                  <input
                    type="text"
                    value={bracketConfig.venue}
                    onChange={(e) => setBracketConfig({ ...bracketConfig, venue: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Participating Teams / Contenders</label>
                  <span className="text-[11px] text-slate-400">Pre-seeded</span>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {bracketConfig.contenders.map((c, i) => (
                    <input
                      key={i}
                      type="text"
                      value={c}
                      onChange={(e) => {
                        const copy = [...bracketConfig.contenders];
                        copy[i] = e.target.value;
                        setBracketConfig({ ...bracketConfig, contenders: copy });
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white font-medium"
                      placeholder={`Team ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAutoGenerateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Generating...' : '⚡ Generate Fixtures'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD SINGLE FIXTURE */}
      {isAddMatchOpen && selectedTourney && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base">Add Match Fixture</h3>
                <p className="text-xs text-slate-500">{selectedTourney.name}</p>
              </div>
              <button
                onClick={() => setIsAddMatchOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSingleMatch} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stage / Round</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quarter Final 1, League Match 3"
                  value={matchForm.round}
                  onChange={(e) => setMatchForm({ ...matchForm, round: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Participant / Team A *</label>
                  <input
                    type="text"
                    required
                    placeholder="Team Alpha"
                    value={matchForm.participantA}
                    onChange={(e) => setMatchForm({ ...matchForm, participantA: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Participant / Team B *</label>
                  <input
                    type="text"
                    required
                    placeholder="Team Beta"
                    value={matchForm.participantB}
                    onChange={(e) => setMatchForm({ ...matchForm, participantB: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Match Date</label>
                  <input
                    type="date"
                    value={matchForm.matchDate}
                    onChange={(e) => setMatchForm({ ...matchForm, matchDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Match Time</label>
                  <input
                    type="time"
                    value={matchForm.matchTime}
                    onChange={(e) => setMatchForm({ ...matchForm, matchTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Court / Venue</label>
                <input
                  type="text"
                  value={matchForm.venue}
                  onChange={(e) => setMatchForm({ ...matchForm, venue: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddMatchOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Add Fixture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: QUICK SCORE LOG */}
      {scoringMatch && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base">Record Match Score</h3>
                <p className="text-xs text-slate-500">
                  {scoringMatch.round} • {scoringMatch.venue || 'Arena'}
                </p>
              </div>
              <button
                onClick={() => setScoringMatch(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateScore} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 truncate mb-1">
                    {scoringMatch.participantA}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Score"
                    value={scoreForm.scoreA}
                    onChange={(e) => setScoreForm({ ...scoreForm, scoreA: e.target.value })}
                    className="w-full text-center text-xl font-bold font-mono py-1 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-800 truncate mb-1">
                    {scoringMatch.participantB}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Score"
                    value={scoreForm.scoreB}
                    onChange={(e) => setScoreForm({ ...scoreForm, scoreB: e.target.value })}
                    className="w-full text-center text-xl font-bold font-mono py-1 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Declare Winner</label>
                <select
                  value={scoreForm.winner}
                  onChange={(e) => setScoreForm({ ...scoreForm, winner: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold"
                >
                  <option value={scoringMatch.participantA}>{scoringMatch.participantA}</option>
                  <option value={scoringMatch.participantB}>{scoringMatch.participantB}</option>
                  <option value="Draw / Tie">Draw / Tie</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Match Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Overtime thriller, MVP: Aarav"
                  value={scoreForm.notes}
                  onChange={(e) => setScoreForm({ ...scoreForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setScoringMatch(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
