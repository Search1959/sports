import React, { useState } from 'react';
import { Facility, FacilityBooking } from '../types.ts';
import {
  Building2,
  Calendar,
  Clock,
  Plus,
  AlertCircle,
  CheckCircle2,
  X,
  Users,
} from 'lucide-react';

interface FacilitiesViewProps {
  facilities: Facility[];
  onAddFacility: (facilityData: any) => Promise<void>;
  onBookFacility: (facilityId: number, bookingData: any) => Promise<void>;
}

export const FacilitiesView: React.FC<FacilitiesViewProps> = ({
  facilities,
  onAddFacility,
  onBookFacility,
}) => {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(facilities[0] || null);
  const [isAddFacilityOpen, setIsAddFacilityOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookingConflictError, setBookingConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New facility form
  const [facilityForm, setFacilityForm] = useState({
    name: '',
    type: 'Court',
    capacity: 30,
    description: '',
  });

  // Booking form
  const [bookingForm, setBookingForm] = useState({
    title: 'Senior Squad Match',
    bookedBy: 'Coach Vikram',
    bookingDate: new Date().toISOString().split('T')[0],
    startTime: '17:00',
    endTime: '19:00',
    notes: 'Official practice session',
  });

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityForm.name) return;
    setIsSubmitting(true);
    try {
      await onAddFacility(facilityForm);
      setIsAddFacilityOpen(false);
      setFacilityForm({ name: '', type: 'Court', capacity: 30, description: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;
    setIsSubmitting(true);
    setBookingConflictError(null);
    try {
      await onBookFacility(selectedFacility.id, bookingForm);
      setIsBookModalOpen(false);
    } catch (err: any) {
      setBookingConflictError(err.message || 'Booking conflict encountered.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Facilities & Court Booking Scheduler</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage grounds, indoor arenas, and training facilities with automated conflict prevention against double bookings.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddFacilityOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Facility</span>
          </button>

          {selectedFacility && (
            <button
              onClick={() => {
                setBookingConflictError(null);
                setIsBookModalOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
            >
              <Calendar className="w-4 h-4" />
              <span>Book This Facility</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Facilities List */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Available Venues ({facilities.length})
          </div>
          {facilities.map((fac) => {
            const isSelected = selectedFacility?.id === fac.id;
            return (
              <div
                key={fac.id}
                onClick={() => setSelectedFacility(fac)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{fac.name}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">{fac.type}</div>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Cap: {fac.capacity}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600 line-clamp-2">{fac.description}</div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{fac.bookings?.length || 0} Bookings</span>
                  <span className="text-emerald-600 font-semibold">Active</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Cols: Schedule for selected facility */}
        <div className="lg:col-span-2 space-y-4">
          {selectedFacility ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedFacility.type}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedFacility.name}</h3>
                  <p className="text-xs text-slate-500">{selectedFacility.description}</p>
                </div>

                <button
                  onClick={() => {
                    setBookingConflictError(null);
                    setIsBookModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                >
                  Book Slot
                </button>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Upcoming Bookings & Schedule
                </div>

                {selectedFacility.bookings && selectedFacility.bookings.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                    {selectedFacility.bookings.map((b) => (
                      <div key={b.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900">{b.title}</div>
                          <div className="text-slate-500 flex items-center space-x-2">
                            <span>Booked by: {b.bookedBy}</span>
                            {b.notes && <span>• {b.notes}</span>}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-semibold text-slate-800 flex items-center space-x-1 justify-end">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            <span>{b.startTime} - {b.endTime}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{b.bookingDate}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-400">
                    No bookings scheduled for this facility. Click "Book Slot" to reserve a time.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
              Select a facility on the left to inspect its schedule.
            </div>
          )}
        </div>
      </div>

      {/* Book Facility Modal */}
      {isBookModalOpen && selectedFacility && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Book {selectedFacility.name}</h3>
                <p className="text-xs text-slate-500">System checks for conflicting overlapping slots</p>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-5 space-y-3.5">
              {bookingConflictError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{bookingConflictError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Booking Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. U16 State Tournament Match"
                  value={bookingForm.title}
                  onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Booked By *</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.bookedBy}
                    onChange={(e) => setBookingForm({ ...bookingForm, bookedBy: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.bookingDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, bookingDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Equipment Needed</label>
                <input
                  type="text"
                  placeholder="e.g. Official referee, scoreboard required"
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Checking Conflicts...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Facility Modal */}
      {isAddFacilityOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Register Facility</h3>
                <p className="text-xs text-slate-500">Add ground, court, or arena to inventory</p>
              </div>
              <button
                onClick={() => setIsAddFacilityOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFacility} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indoor Badminton Hall A"
                  value={facilityForm.name}
                  onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Type</label>
                  <select
                    value={facilityForm.type}
                    onChange={(e) => setFacilityForm({ ...facilityForm, type: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Court">Court (Basketball, TT, Tennis)</option>
                    <option value="Ground">Field / Ground (Football, Cricket)</option>
                    <option value="Pool">Swimming Pool</option>
                    <option value="Gym">Fitness & Weight Room</option>
                    <option value="Studio">Yoga / Aerobics Studio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity (Persons)</label>
                  <input
                    type="number"
                    value={facilityForm.capacity}
                    onChange={(e) => setFacilityForm({ ...facilityForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Features</label>
                <textarea
                  rows={2}
                  value={facilityForm.description}
                  onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddFacilityOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
