import React, { useState } from 'react';
import { Sport, Program } from '../types.ts';
import {
  Trophy,
  Plus,
  Activity,
  Layers,
  Sparkles,
  Check,
  X,
  Clock,
  Tag,
} from 'lucide-react';

interface SportsProgramsViewProps {
  sports: Sport[];
  programs: Program[];
  onAddSport: (sportData: any) => Promise<void>;
  onAddProgram: (programData: any) => Promise<void>;
  currency?: string;
}

export const SportsProgramsView: React.FC<SportsProgramsViewProps> = ({
  sports,
  programs,
  onAddSport,
  onAddProgram,
  currency = 'INR',
}) => {
  const [activeTab, setActiveTab] = useState<'sports' | 'programs'>('sports');
  const [isAddSportModalOpen, setIsAddSportModalOpen] = useState(false);
  const [isAddProgramModalOpen, setIsAddProgramModalOpen] = useState(false);

  // New Sport State
  const [sportForm, setSportForm] = useState({
    name: '',
    description: '',
    icon: 'Trophy',
    scoringType: 'points',
    categories: 'Juniors, Seniors, Elite',
    customFieldName: 'Skill Level',
    customFieldType: 'text',
  });

  // New Program State
  const [progForm, setProgForm] = useState({
    name: '',
    type: 'Fitness',
    description: '',
    fee: '1500',
    scheduleNotes: 'Mon, Wed, Fri (6:30 AM - 7:30 AM)',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sportForm.name) return;
    setIsSubmitting(true);
    try {
      const categoriesArray = sportForm.categories.split(',').map((c) => c.trim()).filter(Boolean);
      await onAddSport({
        name: sportForm.name,
        description: sportForm.description,
        icon: sportForm.icon,
        scoringType: sportForm.scoringType,
        categories: categoriesArray,
        customFields: [
          {
            key: sportForm.customFieldName.toLowerCase().replace(/\s+/g, '_'),
            label: sportForm.customFieldName,
            type: sportForm.customFieldType,
            required: false,
          },
        ],
      });
      setIsAddSportModalOpen(false);
      setSportForm({
        name: '',
        description: '',
        icon: 'Trophy',
        scoringType: 'points',
        categories: 'Juniors, Seniors, Elite',
        customFieldName: 'Skill Level',
        customFieldType: 'text',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progForm.name) return;
    setIsSubmitting(true);
    try {
      await onAddProgram({
        name: progForm.name,
        type: progForm.type,
        description: progForm.description,
        fee: progForm.fee,
        scheduleNotes: progForm.scheduleNotes,
      });
      setIsAddProgramModalOpen(false);
      setProgForm({
        name: '',
        type: 'Fitness',
        description: '',
        fee: '1500',
        scheduleNotes: 'Mon, Wed, Fri (6:30 AM - 7:30 AM)',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sports & Community Programs Engine</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create new sports dynamically with custom fields and configure community activities (Yoga, Fitness, Camps).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'sports' ? (
            <button
              onClick={() => setIsAddSportModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Dynamic Sport</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddProgramModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Community Program</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Subtabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('sports')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'sports'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Configured Sports ({sports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('programs')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'programs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Programs & Wellness ({programs.length})</span>
        </button>
      </div>

      {/* Sports Grid */}
      {activeTab === 'sports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sports.map((sport) => (
            <div
              key={sport.id}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{sport.name}</h3>
                      <span className="text-[10px] font-medium text-slate-400 font-mono">
                        Scoring: {sport.scoringType || 'points'}
                      </span>
                    </div>
                  </div>
                  {sport.isGlobal ? (
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded">
                      Standard
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-50 text-amber-700 font-medium px-2 py-0.5 rounded border border-amber-200">
                      Tenant Custom
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {sport.description || 'Full team coaching, competitive training, and tournament leagues.'}
                </p>

                {sport.categories && (
                  <div className="mt-3">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Age & Skill Categories
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {sport.categories.map((cat, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Custom Fields: {sport.customFields?.length || 0}</span>
                <span className="text-emerald-600 font-medium">Active in Roster</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Programs Grid */}
      {activeTab === 'programs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{prog.name}</h3>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.2 rounded">
                        {prog.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    ₹{prog.fee} <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {prog.description || 'Community health, physical conditioning, and structured batches.'}
                </p>

                {prog.scheduleNotes && (
                  <div className="mt-3 p-2 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{prog.scheduleNotes}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Public Registration Open</span>
                <span className="text-emerald-600 font-semibold">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Sport Creation Modal */}
      {isAddSportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add Dynamic Sport</h3>
                <p className="text-xs text-slate-500">Configure new sport with custom metadata without code changes.</p>
              </div>
              <button
                onClick={() => setIsAddSportModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSport} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sport Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Badminton, Karate, Boxing, Chess"
                  value={sportForm.name}
                  onChange={(e) => setSportForm({ ...sportForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Training syllabus, court dimensions, etc."
                  value={sportForm.description}
                  onChange={(e) => setSportForm({ ...sportForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scoring Type</label>
                  <select
                    value={sportForm.scoringType}
                    onChange={(e) => setSportForm({ ...sportForm, scoringType: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="points">Points (Basketball, TT, Badminton)</option>
                    <option value="goals">Goals (Football, Hockey)</option>
                    <option value="runs_wickets">Runs & Wickets (Cricket)</option>
                    <option value="time">Time / Lap (Swimming, Athletics)</option>
                    <option value="rounds">Rounds / Decision (Boxing, Martial Arts)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categories (comma-sep)</label>
                  <input
                    type="text"
                    value={sportForm.categories}
                    onChange={(e) => setSportForm({ ...sportForm, categories: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              {/* Dynamic custom field definition */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800">Dynamic Sport Custom Field</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Field Label (e.g. Weight Class)"
                    value={sportForm.customFieldName}
                    onChange={(e) => setSportForm({ ...sportForm, customFieldName: e.target.value })}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <select
                    value={sportForm.customFieldType}
                    onChange={(e) => setSportForm({ ...sportForm, customFieldType: e.target.value })}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="text">Text (e.g. Flyweight)</option>
                    <option value="number">Number (e.g. Handicap)</option>
                    <option value="dropdown">Dropdown Selection</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddSportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Save & Publish Sport'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Program Creation Modal */}
      {isAddProgramModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add Community Program</h3>
                <p className="text-xs text-slate-500">Configure wellness, yoga, or seasonal coaching camp.</p>
              </div>
              <button
                onClick={() => setIsAddProgramModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Program Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Yoga & Pranayam"
                  value={progForm.name}
                  onChange={(e) => setProgForm({ ...progForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category Type</label>
                  <select
                    value={progForm.type}
                    onChange={(e) => setProgForm({ ...progForm, type: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Fitness">Fitness & Conditioning</option>
                    <option value="Yoga">Yoga & Mindfulness</option>
                    <option value="Camp">Seasonal Summer/Winter Camp</option>
                    <option value="Youth Development">Youth Development</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Fee (₹)</label>
                  <input
                    type="number"
                    value={progForm.fee}
                    onChange={(e) => setProgForm({ ...progForm, fee: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Schedule Details</label>
                <input
                  type="text"
                  placeholder="e.g. Mon, Wed, Fri (6:30 AM - 7:30 AM)"
                  value={progForm.scheduleNotes}
                  onChange={(e) => setProgForm({ ...progForm, scheduleNotes: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={progForm.description}
                  onChange={(e) => setProgForm({ ...progForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddProgramModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
