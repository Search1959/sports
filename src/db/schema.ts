import { relations } from 'drizzle-orm';
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
} from 'drizzle-orm/pg-core';

// ==========================================
// 1. PLATFORM & ORGANIZATIONS
// ==========================================

export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  slug: text('slug').notNull().unique(),
  type: text('type').notNull().default('Sports Club'), // 'Sports Club', 'Youth Organization', 'Community Organization', 'YMCA/YWCA-type', 'Sports Academy'
  logo: text('logo'),
  coverImage: text('cover_image'),
  description: text('description'),
  establishedYear: integer('established_year'),
  email: text('email'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  website: text('website'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  country: text('country').default('India'),
  currency: text('currency').default('INR'),
  timezone: text('timezone').default('Asia/Kolkata'),
  theme: text('theme').default('sports_club'),
  primaryColor: text('primary_color').default('#2563eb'),
  status: text('status').default('active'), // 'active', 'suspended', 'trial'
  modules: jsonb('modules').$type<string[]>(), // enabled modules
  createdAt: timestamp('created_at').defaultNow(),
});

export const organizationDomains = pgTable('organization_domains', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  domain: text('domain').notNull().unique(),
  isPrimary: boolean('is_primary').default(false),
  verified: boolean('verified').default(true),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const branches = pgTable('branches', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  address: text('address'),
  city: text('city'),
  phone: text('phone'),
  email: text('email'),
  isMain: boolean('is_main').default(false),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 2. USERS & RBAC
// ==========================================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  role: text('role').notNull().default('Organization Admin'), 
  // 'Platform Super Admin', 'Platform Support', 'Organization Admin', 'Branch Manager', 'Sports Manager', 'Coach', 'Reception', 'Accounts', 'Viewer'
  organizationId: integer('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  branchId: integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 3. SPORTS & PROGRAMS ENGINE
// ==========================================

export const sports = pgTable('sports', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id, { onDelete: 'cascade' }), // null = global sport
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  icon: text('icon').default('Trophy'),
  isGlobal: boolean('is_global').default(false),
  scoringType: text('scoring_type').default('points'), // 'points', 'sets', 'time', 'rounds'
  categories: jsonb('categories').$type<string[]>(), // e.g. ['Singles', 'Doubles', 'Under-16']
  customFields: jsonb('custom_fields').$type<{ key: string; label: string; type: string; required?: boolean }[]>(),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const programs = pgTable('programs', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  branchId: integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  sportId: integer('sport_id').references(() => sports.id, { onDelete: 'set null' }), // optional: program can be non-sport (Yoga, Gym, Dance)
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  type: text('type').default('Activity'), // 'Activity', 'Fitness', 'Camp', 'Workshop', 'Cultural'
  description: text('description'),
  fee: numeric('fee', { precision: 10, scale: 2 }).default('0'),
  scheduleNotes: text('schedule_notes'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 4. MEMBERS, PLAYERS & GUARDIANS
// ==========================================

export const membershipTypes = pgTable('membership_types', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(), // 'General', 'Youth', 'Student', 'Sports', 'Life', 'Family'
  fee: numeric('fee', { precision: 10, scale: 2 }).notNull().default('0'),
  durationMonths: integer('duration_months').default(12),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const members = pgTable('members', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  branchId: integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  memberCode: text('member_code').notNull(), // e.g. BYS-M-000001
  fullName: text('full_name').notNull(),
  dob: text('dob'),
  gender: text('gender'),
  bloodGroup: text('blood_group'),
  mobile: text('mobile').notNull(),
  whatsapp: text('whatsapp'),
  whatsappOptIn: boolean('whatsapp_opt_in').default(true),
  email: text('email'),
  address: text('address'),
  city: text('city'),
  guardianName: text('guardian_name'),
  guardianRelation: text('guardian_relation'),
  guardianPhone: text('guardian_phone'),
  membershipTypeId: integer('membership_type_id').references(() => membershipTypes.id, { onDelete: 'set null' }),
  joiningDate: text('joining_date').notNull(),
  expiryDate: text('expiry_date'),
  photoUrl: text('photo_url'),
  status: text('status').default('active'), // 'active', 'expired', 'suspended'
  customData: jsonb('custom_data'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const memberSports = pgTable('member_sports', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  memberId: integer('member_id')
    .references(() => members.id, { onDelete: 'cascade' })
    .notNull(),
  sportId: integer('sport_id')
    .references(() => sports.id, { onDelete: 'cascade' })
    .notNull(),
  skillLevel: text('skill_level').default('Intermediate'), // 'Beginner', 'Intermediate', 'Advanced', 'State Level'
  position: text('position'),
  notes: text('notes'),
  joinedAt: timestamp('joined_at').defaultNow(),
});

export const memberPrograms = pgTable('member_programs', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  memberId: integer('member_id')
    .references(() => members.id, { onDelete: 'cascade' })
    .notNull(),
  programId: integer('program_id')
    .references(() => programs.id, { onDelete: 'cascade' })
    .notNull(),
  status: text('status').default('active'),
  joinedAt: timestamp('joined_at').defaultNow(),
});

// ==========================================
// 5. COACHES, TEAMS & SESSIONS
// ==========================================

export const coaches = pgTable('coaches', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  branchId: integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  fullName: text('full_name').notNull(),
  type: text('type').default('Coach'), // 'Coach', 'Instructor', 'Trainer', 'Referee'
  phone: text('phone').notNull(),
  email: text('email'),
  qualification: text('qualification'),
  experienceYears: integer('experience_years').default(0),
  photoUrl: text('photo_url'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const coachSports = pgTable('coach_sports', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  coachId: integer('coach_id')
    .references(() => coaches.id, { onDelete: 'cascade' })
    .notNull(),
  sportId: integer('sport_id')
    .references(() => sports.id, { onDelete: 'cascade' })
    .notNull(),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  branchId: integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  sportId: integer('sport_id')
    .references(() => sports.id, { onDelete: 'cascade' })
    .notNull(),
  coachId: integer('coach_id').references(() => coaches.id, { onDelete: 'set null' }),
  name: text('name').notNull(), // e.g. "Basketball Under-16 Boys"
  category: text('category').default('Juniors'),
  ageGroup: text('age_group').default('U16'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const teamPlayers = pgTable('team_players', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  teamId: integer('team_id')
    .references(() => teams.id, { onDelete: 'cascade' })
    .notNull(),
  memberId: integer('member_id')
    .references(() => members.id, { onDelete: 'cascade' })
    .notNull(),
  jerseyNumber: integer('jersey_number'),
  position: text('position'),
  joinedAt: timestamp('joined_at').defaultNow(),
});

export const facilities = pgTable('facilities', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  branchId: integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'Court', 'Ground', 'Swimming Pool', 'Gym', 'Hall'
  capacity: integer('capacity').default(30),
  description: text('description'),
  status: text('status').default('available'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const facilityBookings = pgTable('facility_bookings', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  branchId: integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  facilityId: integer('facility_id')
    .references(() => facilities.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  bookedBy: text('booked_by').notNull(),
  bookingDate: text('booking_date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  status: text('status').default('confirmed'), // 'confirmed', 'cancelled', 'pending'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const trainingSessions = pgTable('training_sessions', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  branchId: integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  sportId: integer('sport_id').references(() => sports.id, { onDelete: 'set null' }),
  programId: integer('program_id').references(() => programs.id, { onDelete: 'set null' }),
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'set null' }),
  coachId: integer('coach_id').references(() => coaches.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  sessionType: text('session_type').default('Training'), // 'Training', 'Practice', 'Fitness', 'Camp'
  sessionDate: text('session_date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  venue: text('venue'),
  notes: text('notes'),
  status: text('status').default('scheduled'), // 'scheduled', 'completed', 'cancelled'
  createdAt: timestamp('created_at').defaultNow(),
});

export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  sessionId: integer('session_id')
    .references(() => trainingSessions.id, { onDelete: 'cascade' })
    .notNull(),
  memberId: integer('member_id')
    .references(() => members.id, { onDelete: 'cascade' })
    .notNull(),
  status: text('status').notNull().default('present'), // 'present', 'absent', 'late', 'excused'
  markedAt: timestamp('marked_at').defaultNow(),
  notes: text('notes'),
});

// ==========================================
// 6. TOURNAMENTS, MATCHES & EVENTS
// ==========================================

export const tournaments = pgTable('tournaments', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  branchId: integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  sportId: integer('sport_id')
    .references(() => sports.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  format: text('format').default('Knockout'), // 'Knockout', 'League', 'Round Robin'
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  venue: text('venue'),
  entryFee: numeric('entry_fee', { precision: 10, scale: 2 }).default('0'),
  rules: text('rules'),
  status: text('status').default('Upcoming'), // 'Upcoming', 'Ongoing', 'Completed'
  createdAt: timestamp('created_at').defaultNow(),
});

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  tournamentId: integer('tournament_id')
    .references(() => tournaments.id, { onDelete: 'cascade' })
    .notNull(),
  sportId: integer('sport_id').references(() => sports.id, { onDelete: 'set null' }),
  round: text('round').default('Round 1'), // 'Quarter Final', 'Semi Final', 'Final', etc.
  matchDate: text('match_date').notNull(),
  matchTime: text('match_time'),
  venue: text('venue'),
  participantA: text('participant_a').notNull(),
  participantB: text('participant_b').notNull(),
  scoreA: text('score_a').default('0'),
  scoreB: text('score_b').default('0'),
  winner: text('winner'),
  status: text('status').default('Scheduled'), // 'Scheduled', 'Live', 'Completed'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  branchId: integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  sportId: integer('sport_id').references(() => sports.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  eventDate: text('event_date').notNull(),
  eventTime: text('event_time'),
  venue: text('venue'),
  fee: numeric('fee', { precision: 10, scale: 2 }).default('0'),
  maxCapacity: integer('max_capacity').default(100),
  isPublic: boolean('is_public').default(true),
  status: text('status').default('Upcoming'), // 'Upcoming', 'Ongoing', 'Completed'
  createdAt: timestamp('created_at').defaultNow(),
});

export const eventRegistrations = pgTable('event_registrations', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  eventId: integer('event_id')
    .references(() => events.id, { onDelete: 'cascade' })
    .notNull(),
  memberId: integer('member_id').references(() => members.id, { onDelete: 'set null' }),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  feePaid: boolean('fee_paid').default(false),
  status: text('status').default('confirmed'),
  registeredAt: timestamp('registered_at').defaultNow(),
});

// ==========================================
// 7. FINANCE: INVOICES, PAYMENTS & EXPENSES
// ==========================================

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  memberId: integer('member_id').references(() => members.id, { onDelete: 'set null' }),
  invoiceNumber: text('invoice_number').notNull(),
  title: text('title').notNull(),
  category: text('category').default('Membership Fee'), // 'Membership Fee', 'Training Fee', 'Tournament Entry', 'Facility Booking'
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: text('due_date').notNull(),
  status: text('status').default('due'), // 'paid', 'due', 'overdue', 'partially_paid'
  createdAt: timestamp('created_at').defaultNow(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  invoiceId: integer('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
  memberId: integer('member_id').references(() => members.id, { onDelete: 'set null' }),
  receiptNumber: text('receipt_number').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').default('UPI'), // 'Cash', 'UPI', 'Card', 'Bank Transfer', 'Online Gateway'
  paymentDate: text('payment_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  category: text('category').default('Equipment'), // 'Equipment', 'Maintenance', 'Events', 'Coach Payment', 'Utilities', 'Rent'
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  expenseDate: text('expense_date').notNull(),
  paidTo: text('paid_to'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 8. INVENTORY & SPONSORS
// ==========================================

export const equipment = pgTable('equipment', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  branchId: integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  sportId: integer('sport_id').references(() => sports.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  category: text('category').default('Balls & Gear'),
  quantity: integer('quantity').default(1),
  availableQuantity: integer('available_quantity').default(1),
  condition: text('condition').default('Good'), // 'New', 'Good', 'Needs Repair', 'Damaged'
  location: text('location'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const equipmentTransactions = pgTable('equipment_transactions', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  equipmentId: integer('equipment_id')
    .references(() => equipment.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type').notNull(), // 'issue', 'return', 'repair', 'purchase', 'dispose'
  quantity: integer('quantity').notNull().default(1),
  recipientName: text('recipient_name'),
  transactionDate: text('transaction_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sponsors = pgTable('sponsors', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  company: text('company').notNull(),
  email: text('email'),
  phone: text('phone'),
  contributionAmount: numeric('contribution_amount', { precision: 10, scale: 2 }).default('0'),
  logoUrl: text('logo_url'),
  website: text('website'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  isPublic: boolean('is_public').default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const donations = pgTable('donations', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  branchId: integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  donorName: text('donor_name').notNull(),
  donorPhone: text('donor_phone'),
  donorEmail: text('donor_email'),
  donorPan: text('donor_pan'),
  donorAddress: text('donor_address'),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').default('UPI'),
  donationDate: text('donation_date').notNull(),
  cause: text('cause').default('General Youth Sports Fund'),
  receiptNumber: text('receipt_number').notNull(),
  taxExemption80G: boolean('tax_exemption_80g').default(true),
  certificate80GNumber: text('certificate_80g_number'),
  isAnonymous: boolean('is_anonymous').default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const volunteers = pgTable('volunteers', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  skills: text('skills'),
  availability: text('availability').default('Weekends'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 9. LEADS & CRM
// ==========================================

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  branchId: integer('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  interestedSport: text('interested_sport'),
  interestedProgram: text('interested_program'),
  age: integer('age'),
  source: text('source').default('Website Form'), // 'Website Form', 'WhatsApp', 'Walk-in', 'Referral'
  status: text('status').default('new'), // 'new', 'under_review', 'approved', 'rejected', 'converted'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 10. CMS & PUBLIC CONTENT
// ==========================================

export const cmsContent = pgTable('cms_content', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  type: text('type').notNull(), // 'page', 'news', 'notice', 'achievement', 'gallery'
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  content: text('content'),
  imageUrl: text('image_url'),
  isPublished: boolean('is_published').default(true),
  publishedAt: text('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 11. CERTIFICATES & ID CARDS
// ==========================================

export const certificates = pgTable('certificates', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  recipientName: text('recipient_name').notNull(),
  certificateType: text('certificate_type').default('Achievement'), // 'Participation', 'Winner', 'Runner-up', 'Achievement', 'Membership'
  title: text('title').notNull(),
  sportOrProgram: text('sport_or_program'),
  issueDate: text('issue_date').notNull(),
  verificationToken: text('verification_token').notNull().unique(),
  verifiedCount: integer('verified_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// 12. WHATSAPP & COMMUNICATION
// ==========================================

export const whatsappTemplates = pgTable('whatsapp_templates', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  category: text('category').default('Reminders'), // 'Membership', 'Training', 'Fee Reminder', 'Tournament', 'Event'
  content: text('content').notNull(),
  variables: jsonb('variables').$type<string[]>(),
  status: text('status').default('approved'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const whatsappMessages = pgTable('whatsapp_messages', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  recipientPhone: text('recipient_phone').notNull(),
  recipientName: text('recipient_name').notNull(),
  messageType: text('message_type').notNull(),
  templateId: integer('template_id').references(() => whatsappTemplates.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  status: text('status').default('sent'), // 'sent', 'delivered', 'read', 'failed'
  optInVerified: boolean('opt_in_verified').default(true),
  sentAt: timestamp('sent_at').defaultNow(),
});

// ==========================================
// 13. SAAS SUBSCRIPTIONS & AUDIT LOGS
// ==========================================

export const platformSubscriptions = pgTable('platform_subscriptions', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  planName: text('plan_name').notNull().default('Professional'), // 'Free', 'Basic', 'Professional', 'Enterprise'
  status: text('status').default('active'),
  monthlyFee: numeric('monthly_fee', { precision: 10, scale: 2 }).default('4999'),
  memberLimit: integer('member_limit').default(1000),
  sportLimit: integer('sport_limit').default(15),
  branchLimit: integer('branch_limit').default(5),
  renewalDate: text('renewal_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // 'LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'ATTENDANCE_MARKED', 'PAYMENT_RECEIVED'
  module: text('module').notNull(), // 'AUTH', 'MEMBERS', 'ATTENDANCE', 'FINANCE', 'SETTINGS'
  recordType: text('record_type'),
  recordId: text('record_id'),
  details: text('details'),
  ip: text('ip'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ==========================================
// DRIZZLE RELATIONS
// ==========================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  branches: many(branches),
  domains: many(organizationDomains),
  users: many(users),
  members: many(members),
  coaches: many(coaches),
  teams: many(teams),
  sports: many(sports),
  programs: many(programs),
  tournaments: many(tournaments),
  events: many(events),
  invoices: many(invoices),
  payments: many(payments),
  expenses: many(expenses),
  facilities: many(facilities),
  equipment: many(equipment),
  leads: many(leads),
  cmsContent: many(cmsContent),
  whatsappMessages: many(whatsappMessages),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [branches.organizationId],
    references: [organizations.id],
  }),
  members: many(members),
  teams: many(teams),
  facilities: many(facilities),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [members.organizationId],
    references: [organizations.id],
  }),
  branch: one(branches, {
    fields: [members.branchId],
    references: [branches.id],
  }),
  membershipType: one(membershipTypes, {
    fields: [members.membershipTypeId],
    references: [membershipTypes.id],
  }),
  memberSports: many(memberSports),
  memberPrograms: many(memberPrograms),
  teamPlayers: many(teamPlayers),
  attendance: many(attendance),
  invoices: many(invoices),
  payments: many(payments),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [teams.organizationId],
    references: [organizations.id],
  }),
  sport: one(sports, {
    fields: [teams.sportId],
    references: [sports.id],
  }),
  coach: one(coaches, {
    fields: [teams.coachId],
    references: [coaches.id],
  }),
  players: many(teamPlayers),
}));

export const trainingSessionsRelations = relations(trainingSessions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [trainingSessions.organizationId],
    references: [organizations.id],
  }),
  sport: one(sports, {
    fields: [trainingSessions.sportId],
    references: [sports.id],
  }),
  coach: one(coaches, {
    fields: [trainingSessions.coachId],
    references: [coaches.id],
  }),
  attendanceRecords: many(attendance),
}));
