import { db } from './index.ts';
import {
  organizations,
  branches,
  sports,
  programs,
  membershipTypes,
  members,
  memberSports,
  memberPrograms,
  coaches,
  coachSports,
  teams,
  teamPlayers,
  facilities,
  facilityBookings,
  trainingSessions,
  attendance,
  tournaments,
  matches,
  events,
  invoices,
  payments,
  expenses,
  donations,
  equipment,
  sponsors,
  leads,
  cmsContent,
  certificates,
  whatsappTemplates,
  whatsappMessages,
  platformSubscriptions,
} from './schema.ts';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  try {
    const existingOrgs = await db.select().from(organizations);
    if (existingOrgs.length > 0) {
      console.log('Database already contains organizations, skipping seed.');
      return;
    }

    console.log('Seeding initial multi-tenant platform organizations...');

    // ----------------------------------------------------
    // GLOBAL SPORTS
    // ----------------------------------------------------
    const [basketball] = await db.insert(sports).values({
      name: 'Basketball',
      slug: 'basketball',
      description: 'Fast-paced 5v5 team court sport focusing on shooting, agility, and teamwork.',
      icon: 'Dribble',
      isGlobal: true,
      scoringType: 'points',
      categories: ['U14', 'U16', 'U19', 'Seniors'],
      customFields: [
        { key: 'jersey_number', label: 'Jersey Number', type: 'number', required: false },
        { key: 'preferred_position', label: 'Court Position (PG/SG/SF/PF/C)', type: 'text', required: false },
        { key: 'height_cm', label: 'Height (cm)', type: 'number', required: false },
      ],
    }).returning();

    const [tableTennis] = await db.insert(sports).values({
      name: 'Table Tennis',
      slug: 'table-tennis',
      description: 'High-speed racket sport requiring lightning reflexes and tactical spin.',
      icon: 'Activity',
      isGlobal: true,
      scoringType: 'sets',
      categories: ['Singles', 'Doubles', 'Youth Singles', 'Veterans'],
      customFields: [
        { key: 'playing_hand', label: 'Playing Hand (Right/Left)', type: 'dropdown', required: false },
        { key: 'playing_style', label: 'Grip Style (Shakehand/Penhold)', type: 'dropdown', required: false },
        { key: 'state_ranking', label: 'State Ranking', type: 'number', required: false },
      ],
    }).returning();

    const [badminton] = await db.insert(sports).values({
      name: 'Badminton',
      slug: 'badminton',
      description: 'Dynamic racket sport played with shuttlecocks across high nets.',
      icon: 'Zap',
      isGlobal: true,
      scoringType: 'sets',
      categories: ['Men Singles', 'Women Singles', 'Men Doubles', 'Mixed Doubles'],
      customFields: [
        { key: 'racket_model', label: 'Preferred Racket', type: 'text', required: false },
        { key: 'string_tension', label: 'String Tension (lbs)', type: 'number', required: false },
      ],
    }).returning();

    const [swimming] = await db.insert(sports).values({
      name: 'Swimming',
      slug: 'swimming',
      description: 'Aquatic racing across freestyle, breaststroke, backstroke, and butterfly.',
      icon: 'Waves',
      isGlobal: true,
      scoringType: 'time',
      categories: ['50m Freestyle', '100m Breaststroke', '200m Medley'],
    }).returning();

    const [football] = await db.insert(sports).values({
      name: 'Football',
      slug: 'football',
      description: 'Association football on grass turf with 11-a-side competitive teams.',
      icon: 'Shield',
      isGlobal: true,
      scoringType: 'points',
      categories: ['Juniors', 'Sub-Juniors', 'Seniors'],
    }).returning();

    const [cricket] = await db.insert(sports).values({
      name: 'Cricket',
      slug: 'cricket',
      description: 'Bat-and-ball sport played on 22-yard pitches with T20, ODI, and multi-day formats.',
      icon: 'Target',
      isGlobal: true,
      scoringType: 'points',
      categories: ['U15', 'U19', 'Senior Division'],
    }).returning();

    // ----------------------------------------------------
    // TENANT 1: Burrabazar Yuwak Sabha
    // ----------------------------------------------------
    const [bys] = await db.insert(organizations).values({
      name: 'Burrabazar Yuwak Sabha',
      shortName: 'BYS',
      slug: 'burrabazar-yuwak-sabha',
      type: 'Youth Organization',
      logo: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=120&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80',
      description: 'Fostering sportsmanship, youth empowerment, basketball excellence, and community fellowship since 1948 in Kolkata.',
      establishedYear: 1948,
      email: 'info@burrabazaryuwaksabha.org',
      phone: '+91 33 2274 8899',
      whatsapp: '+91 98300 12345',
      website: 'https://burrabazaryuwaksabha.org',
      address: '12 Kalakar Street, Burrabazar',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      theme: 'sports_club',
      primaryColor: '#1d4ed8',
      modules: ['members', 'players', 'sports', 'programs', 'teams', 'training', 'attendance', 'events', 'tournaments', 'facilities', 'finance', 'inventory', 'sponsors', 'cms', 'whatsapp', 'reports'],
    }).returning();

    // BYS Subscription
    await db.insert(platformSubscriptions).values({
      organizationId: bys.id,
      planName: 'Enterprise',
      status: 'active',
      monthlyFee: '7999',
      memberLimit: 2500,
      sportLimit: 20,
      branchLimit: 10,
      renewalDate: '2027-01-01',
    });

    // BYS Branches
    const [bysMainBranch] = await db.insert(branches).values({
      organizationId: bys.id,
      name: 'Main Complex (Burrabazar)',
      code: 'BYS-MAIN',
      address: '12 Kalakar Street',
      city: 'Kolkata',
      phone: '+91 33 2274 8899',
      isMain: true,
    }).returning();

    const [bysAnnex] = await db.insert(branches).values({
      organizationId: bys.id,
      name: 'Howrah Sports Annex',
      code: 'BYS-HWH',
      address: '45 G.T. Road',
      city: 'Howrah',
      phone: '+91 33 2660 1122',
      isMain: false,
    }).returning();

    // BYS Programs
    const [bysYogaProg] = await db.insert(programs).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      name: 'Morning Wellness & Hatha Yoga',
      slug: 'morning-yoga-wellness',
      type: 'Fitness',
      description: 'Daily morning pranayama, Surya Namaskar, flexibility conditioning, and mindfulness session.',
      fee: '800',
      scheduleNotes: 'Mon - Fri: 6:00 AM - 7:15 AM',
    }).returning();

    const [bysYouthLeadership] = await db.insert(programs).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      name: 'Youth Community Leadership Camp',
      slug: 'youth-leadership-camp',
      type: 'Camp',
      description: 'Weekend leadership seminars, social service projects, and youth athletic challenges.',
      fee: '500',
      scheduleNotes: 'Saturdays: 4:00 PM - 6:30 PM',
    }).returning();

    // BYS Membership Types
    const [bysAnnualGeneral] = await db.insert(membershipTypes).values({
      organizationId: bys.id,
      name: 'Youth Sports Annual Pass',
      fee: '3600',
      durationMonths: 12,
      description: 'Full access to coaching, courts, gym facilities, and tournament participation.',
    }).returning();

    const [bysStudentPass] = await db.insert(membershipTypes).values({
      organizationId: bys.id,
      name: 'Student Academy Membership',
      fee: '2400',
      durationMonths: 12,
      description: 'Subsidized sports training tier for enrolled school and college students.',
    }).returning();

    // BYS Facilities
    const [bysBballCourt] = await db.insert(facilities).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      name: 'Central Maplewood Basketball Court',
      type: 'Court',
      capacity: 40,
      description: 'FIBA-regulation hardwood indoor basketball court with electronic scoreboard and LED lighting.',
    }).returning();

    const [bysTTArena] = await db.insert(facilities).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      name: 'Stag Table Tennis Arena',
      type: 'Hall',
      capacity: 30,
      description: '6 Olympic-standard Stag competition tables with Taraflex shock-absorbent sports flooring.',
    }).returning();

    // BYS Coaches
    const [coachRajesh] = await db.insert(coaches).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      fullName: 'Rajesh Sharma',
      type: 'Coach',
      phone: '+91 98311 55667',
      email: 'coach.rajesh@burrabazaryuwaksabha.org',
      qualification: 'NIS Diploma Basketball, Former State Captain',
      experienceYears: 14,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    }).returning();

    await db.insert(coachSports).values({
      organizationId: bys.id,
      coachId: coachRajesh.id,
      sportId: basketball.id,
    });

    const [coachAmit] = await db.insert(coaches).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      fullName: 'Amitava Mukherjee',
      type: 'Coach',
      phone: '+91 98302 99881',
      email: 'amit.tt@burrabazaryuwaksabha.org',
      qualification: 'ITTF Level 2 Certified Table Tennis Coach',
      experienceYears: 11,
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    }).returning();

    await db.insert(coachSports).values({
      organizationId: bys.id,
      coachId: coachAmit.id,
      sportId: tableTennis.id,
    });

    const [instructorSunita] = await db.insert(coaches).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      fullName: 'Sunita Agarwala',
      type: 'Instructor',
      phone: '+91 98310 44332',
      email: 'sunita.yoga@burrabazaryuwaksabha.org',
      qualification: 'M.Sc Yoga Sciences, S-VYASA Certified',
      experienceYears: 8,
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    }).returning();

    // BYS Teams
    const [bysU16BballTeam] = await db.insert(teams).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      sportId: basketball.id,
      coachId: coachRajesh.id,
      name: 'BYS Thunder U-16 Boys',
      category: 'Juniors',
      ageGroup: 'U16',
    }).returning();

    const [bysSeniorBballTeam] = await db.insert(teams).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      sportId: basketball.id,
      coachId: coachRajesh.id,
      name: 'BYS Warriors Senior Men',
      category: 'Seniors',
      ageGroup: 'Open',
    }).returning();

    const [bysTTTeam] = await db.insert(teams).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      sportId: tableTennis.id,
      coachId: coachAmit.id,
      name: 'BYS Spin Masters Team',
      category: 'State Cadet & Juniors',
      ageGroup: 'U15',
    }).returning();

    // BYS Members (Demonstrating single person participating in multiple sports!)
    const [memberAarav] = await db.insert(members).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      memberCode: 'BYS-M-000001',
      fullName: 'Aarav Gupta',
      dob: '2009-08-14',
      gender: 'Male',
      bloodGroup: 'B+',
      mobile: '+91 98319 88123',
      whatsapp: '+91 98319 88123',
      whatsappOptIn: true,
      email: 'aarav.gupta2009@gmail.com',
      address: '24 Cotton Street, Burrabazar',
      city: 'Kolkata',
      guardianName: 'Manoj Gupta',
      guardianRelation: 'Father',
      guardianPhone: '+91 98310 11223',
      membershipTypeId: bysStudentPass.id,
      joiningDate: '2025-04-10',
      expiryDate: '2027-04-10',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    }).returning();

    // Aarav plays BOTH Basketball AND Table Tennis
    await db.insert(memberSports).values([
      {
        organizationId: bys.id,
        memberId: memberAarav.id,
        sportId: basketball.id,
        skillLevel: 'Advanced',
        position: 'Point Guard',
        notes: 'Captains the U-16 basketball team. High game IQ and court vision.',
      },
      {
        organizationId: bys.id,
        memberId: memberAarav.id,
        sportId: tableTennis.id,
        skillLevel: 'Intermediate',
        position: 'Singles Player',
        notes: 'Plays state-ranking qualifying rounds.',
      },
    ]);

    await db.insert(teamPlayers).values({
      organizationId: bys.id,
      teamId: bysU16BballTeam.id,
      memberId: memberAarav.id,
      jerseyNumber: 7,
      position: 'Point Guard',
    });

    const [memberRohan] = await db.insert(members).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      memberCode: 'BYS-M-000002',
      fullName: 'Rohan Sharma',
      dob: '2008-11-20',
      gender: 'Male',
      bloodGroup: 'O+',
      mobile: '+91 98305 44221',
      whatsapp: '+91 98305 44221',
      whatsappOptIn: true,
      email: 'rohan.sharma.kol@gmail.com',
      address: '77 Burtolla Street',
      city: 'Kolkata',
      guardianName: 'Sanjay Sharma',
      guardianRelation: 'Father',
      guardianPhone: '+91 98300 77665',
      membershipTypeId: bysAnnualGeneral.id,
      joiningDate: '2025-01-15',
      expiryDate: '2027-01-15',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    }).returning();

    await db.insert(memberSports).values({
      organizationId: bys.id,
      memberId: memberRohan.id,
      sportId: basketball.id,
      skillLevel: 'Advanced',
      position: 'Center',
      notes: 'Height 192 cm. Dominant rim protector.',
    });

    await db.insert(teamPlayers).values({
      organizationId: bys.id,
      teamId: bysU16BballTeam.id,
      memberId: memberRohan.id,
      jerseyNumber: 15,
      position: 'Center',
    });

    const [memberPooja] = await db.insert(members).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      memberCode: 'BYS-M-000003',
      fullName: 'Pooja Agarwal',
      dob: '2001-03-25',
      gender: 'Female',
      bloodGroup: 'A+',
      mobile: '+91 98312 99001',
      whatsapp: '+91 98312 99001',
      whatsappOptIn: true,
      email: 'pooja.agarwal@outlook.com',
      address: '15 Vivekananda Road',
      city: 'Kolkata',
      membershipTypeId: bysAnnualGeneral.id,
      joiningDate: '2025-06-01',
      expiryDate: '2027-06-01',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    }).returning();

    // Pooja does Badminton AND Morning Yoga Program
    await db.insert(memberSports).values({
      organizationId: bys.id,
      memberId: memberPooja.id,
      sportId: badminton.id,
      skillLevel: 'Advanced',
      position: 'Women Singles',
    });

    await db.insert(memberPrograms).values({
      organizationId: bys.id,
      memberId: memberPooja.id,
      programId: bysYogaProg.id,
      status: 'active',
    });

    // BYS Training Sessions
    const [todayBballSession] = await db.insert(trainingSessions).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      sportId: basketball.id,
      teamId: bysU16BballTeam.id,
      coachId: coachRajesh.id,
      title: 'U16 Fast Break & Perimeter Defense Drill',
      sessionType: 'Practice',
      sessionDate: new Date().toISOString().split('T')[0],
      startTime: '16:30',
      endTime: '18:30',
      venue: 'Central Maplewood Basketball Court',
      notes: 'Focus on transition defense and pick-and-roll execution.',
      status: 'scheduled',
    }).returning();

    // Seed Attendance
    await db.insert(attendance).values([
      {
        organizationId: bys.id,
        sessionId: todayBballSession.id,
        memberId: memberAarav.id,
        status: 'present',
        notes: 'Arrived on time. High work rate.',
      },
      {
        organizationId: bys.id,
        sessionId: todayBballSession.id,
        memberId: memberRohan.id,
        status: 'present',
        notes: 'Good rebounding performance.',
      },
    ]);

    // BYS Tournaments & Matches
    const [bysTourney] = await db.insert(tournaments).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      sportId: basketball.id,
      name: 'Burrabazar State Youth Basketball Championship 2026',
      format: 'Knockout',
      startDate: '2026-10-15',
      endDate: '2026-10-22',
      venue: 'BYS Indoor Basketball Arena',
      entryFee: '1500',
      rules: 'FIBA 4x10 min quarters rules apply. Medical certificates mandatory.',
      status: 'Upcoming',
    }).returning();

    await db.insert(matches).values([
      {
        organizationId: bys.id,
        tournamentId: bysTourney.id,
        sportId: basketball.id,
        round: 'Quarter Final 1',
        matchDate: '2026-10-15',
        matchTime: '17:00',
        venue: 'Court 1',
        participantA: 'BYS Thunder U-16',
        participantB: 'Howrah YMCA Hoopers',
        scoreA: '68',
        scoreB: '54',
        winner: 'BYS Thunder U-16',
        status: 'Completed',
        notes: 'Aarav Gupta led with 24 points and 8 assists.',
      },
      {
        organizationId: bys.id,
        tournamentId: bysTourney.id,
        sportId: basketball.id,
        round: 'Semi Final 1',
        matchDate: '2026-10-18',
        matchTime: '18:30',
        venue: 'Court 1',
        participantA: 'BYS Thunder U-16',
        participantB: 'Kolkata St. Xavier cagers',
        scoreA: '0',
        scoreB: '0',
        status: 'Scheduled',
      },
    ]);

    // BYS Events
    await db.insert(events).values({
      organizationId: bys.id,
      branchId: bysMainBranch.id,
      sportId: basketball.id,
      title: 'Grand Alumni Basketball Exhibition & Award Ceremony',
      description: 'Annual gathering of former state champions and current youth squads, followed by merit felicitation.',
      eventDate: '2026-11-08',
      eventTime: '18:00',
      venue: 'BYS Auditorium & Court',
      fee: '0',
      maxCapacity: 250,
      isPublic: true,
      status: 'Upcoming',
    });

    // BYS Invoices & Payments
    const [inv1] = await db.insert(invoices).values({
      organizationId: bys.id,
      memberId: memberAarav.id,
      invoiceNumber: 'BYS-INV-2026-001',
      title: 'Annual Student Sports Pass 2026-2027',
      category: 'Membership Fee',
      amount: '2400',
      dueDate: '2026-05-01',
      status: 'paid',
    }).returning();

    await db.insert(payments).values({
      organizationId: bys.id,
      invoiceId: inv1.id,
      memberId: memberAarav.id,
      receiptNumber: 'BYS-REC-00892',
      amount: '2400',
      paymentMethod: 'UPI',
      paymentDate: '2026-04-12',
      notes: 'Paid via GPay (Txn: UPI/9029192831/BYS).',
    });

    await db.insert(expenses).values([
      {
        organizationId: bys.id,
        title: 'Nivia Pro Leather Basketballs (Pack of 12)',
        category: 'Equipment',
        amount: '18500',
        expenseDate: '2026-08-10',
        paidTo: 'Eastern Sports Emporium',
        description: 'New official game balls for season tournament.',
      },
      {
        organizationId: bys.id,
        title: 'Hardwood Court Varnishing & Buffing',
        category: 'Maintenance',
        amount: '32000',
        expenseDate: '2026-07-28',
        paidTo: 'Apex Flooring Solutions',
        description: 'Annual non-slip anti-glare lacquer polishing.',
      },
    ]);

    // BYS Equipment
    await db.insert(equipment).values([
      {
        organizationId: bys.id,
        branchId: bysMainBranch.id,
        sportId: basketball.id,
        name: 'Spalding Official TF-1000 Basketballs',
        category: 'Balls & Gear',
        quantity: 18,
        availableQuantity: 15,
        condition: 'Good',
        location: 'Storage Locker B1',
      },
      {
        organizationId: bys.id,
        branchId: bysMainBranch.id,
        sportId: tableTennis.id,
        name: 'Stag International 3-Star 40+ Plastic TT Balls (Gross)',
        category: 'Balls & Gear',
        quantity: 144,
        availableQuantity: 110,
        condition: 'New',
        location: 'TT Equipment Room',
      },
    ]);

    // BYS Sponsors
    await db.insert(sponsors).values({
      organizationId: bys.id,
      name: 'Rupayan Jewellers Kolkata',
      company: 'Rupayan Group',
      email: 'sponsorship@rupayan.co.in',
      phone: '+91 33 2244 5500',
      contributionAmount: '150000',
      logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=120&auto=format&fit=crop&q=80',
      website: 'https://rupayanjewellers.example',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      isPublic: true,
      notes: 'Title jersey sponsor for State Youth Basketball Championship.',
    });

    // BYS Leads / CRM
    await db.insert(leads).values([
      {
        organizationId: bys.id,
        branchId: bysMainBranch.id,
        fullName: 'Devansh Kedia',
        phone: '+91 98315 22119',
        email: 'devansh.kedia@gmail.com',
        interestedSport: 'Basketball',
        age: 13,
        source: 'Website Form',
        status: 'new',
        notes: 'Parent requested trial session for U14 basketball squad.',
      },
      {
        organizationId: bys.id,
        branchId: bysMainBranch.id,
        fullName: 'Meera Singhania',
        phone: '+91 98308 77665',
        email: 'meera.s@singhania.org',
        interestedProgram: 'Morning Wellness & Hatha Yoga',
        age: 34,
        source: 'Walk-in',
        status: 'under_review',
        notes: 'Inquired about beginner yoga batches and flexible monthly schedule.',
      },
    ]);

    // BYS Certificates
    await db.insert(certificates).values({
      organizationId: bys.id,
      recipientName: 'Aarav Gupta',
      certificateType: 'Achievement',
      title: 'Most Valuable Player - Inter-District Youth Basketball',
      sportOrProgram: 'Basketball',
      issueDate: '2026-05-20',
      verificationToken: 'BYS-CERT-2026-MVP-77182',
      verifiedCount: 14,
    });

    // BYS WhatsApp Templates & Messages
    const [tmplTrainingReminder] = await db.insert(whatsappTemplates).values({
      organizationId: bys.id,
      name: 'training_reminder_v1',
      category: 'Training',
      content: 'Hello {{member_name}}, this is a reminder for your upcoming {{sport}} training session on {{date}} at {{time}} (Venue: {{venue}}). Please report 15 mins prior in uniform.',
      variables: ['member_name', 'sport', 'date', 'time', 'venue'],
      status: 'approved',
    }).returning();

    await db.insert(whatsappMessages).values([
      {
        organizationId: bys.id,
        recipientPhone: '+919831988123',
        recipientName: 'Aarav Gupta',
        messageType: 'training_reminder',
        templateId: tmplTrainingReminder.id,
        content: 'Hello Aarav Gupta, this is a reminder for your upcoming Basketball training session today at 16:30 (Venue: Central Maplewood Basketball Court). Please report 15 mins prior in uniform.',
        status: 'delivered',
        optInVerified: true,
      },
    ]);

    // BYS CMS Content
    await db.insert(cmsContent).values([
      {
        organizationId: bys.id,
        type: 'news',
        title: 'BYS Under-16 Basketball Squad Qualifies for State Championship Finals',
        slug: 'bys-u16-qualifies-state-championship',
        content: 'Our U-16 boys delivered a commanding performance this weekend, securing victory in both quarter and semi-final legs. Coach Rajesh commended the high intensity perimeter defense.',
        imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80',
        isPublished: true,
        publishedAt: '2026-08-30',
      },
      {
        organizationId: bys.id,
        type: 'notice',
        title: 'Trial Dates Announced for 2026-27 Table Tennis State Academy',
        slug: 'tt-trials-2026',
        content: 'Open selection trials for junior and sub-junior table tennis enthusiasts will be conducted on Saturday, September 20 at Stag TT Arena. Open to ages 9-17.',
        isPublished: true,
        publishedAt: '2026-09-02',
      },
    ]);

    // ----------------------------------------------------
    // TENANT 2: Demo YMCA (YMCA Kolkata)
    // ----------------------------------------------------
    const [ymca] = await db.insert(organizations).values({
      name: 'YMCA Kolkata',
      shortName: 'YMCA',
      slug: 'ymca-kolkata',
      type: 'YMCA/YWCA-type',
      logo: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=120&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&auto=format&fit=crop&q=80',
      description: 'Empowering communities and youth through swimming, fitness, athletic disciplines, and holistic character building since 1857.',
      establishedYear: 1857,
      email: 'contact@ymcakolkata.org',
      phone: '+91 33 2229 4433',
      whatsapp: '+91 98301 77665',
      website: 'https://ymcakolkata.org',
      address: '25 Jawaharlal Nehru Road, Chowringhee',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      theme: 'community',
      primaryColor: '#dc2626',
      modules: ['members', 'players', 'sports', 'programs', 'teams', 'training', 'attendance', 'facilities', 'finance', 'inventory', 'cms'],
    }).returning();

    await db.insert(platformSubscriptions).values({
      organizationId: ymca.id,
      planName: 'Professional',
      status: 'active',
      monthlyFee: '4999',
      memberLimit: 1200,
      sportLimit: 12,
      branchLimit: 4,
      renewalDate: '2027-03-01',
    });

    const [ymcaMainBranch] = await db.insert(branches).values({
      organizationId: ymca.id,
      name: 'Central Heritage Complex',
      code: 'YMCA-CENTRAL',
      address: '25 Jawaharlal Nehru Road',
      city: 'Kolkata',
      phone: '+91 33 2229 4433',
      isMain: true,
    }).returning();

    // YMCA Facilities
    await db.insert(facilities).values([
      {
        organizationId: ymca.id,
        branchId: ymcaMainBranch.id,
        name: 'Olympic Sized 50m Swimming Pool',
        type: 'Swimming Pool',
        capacity: 60,
        description: 'Temperature-controlled 8-lane competition swimming facility with certified lifeguards.',
      },
      {
        organizationId: ymca.id,
        branchId: ymcaMainBranch.id,
        name: 'YMCA Multipurpose Gymnasium',
        type: 'Gym',
        capacity: 50,
        description: 'State-of-the-art strength training machines, free weights, and cardio zone.',
      },
    ]);

    // YMCA Members
    const [ymcaMember1] = await db.insert(members).values({
      organizationId: ymca.id,
      branchId: ymcaMainBranch.id,
      memberCode: 'YMCA-M-000101',
      fullName: 'Vikram Sengupta',
      dob: '2004-06-19',
      gender: 'Male',
      bloodGroup: 'B+',
      mobile: '+91 98303 66778',
      whatsapp: '+91 98303 66778',
      whatsappOptIn: true,
      email: 'vikram.sengupta@gmail.com',
      address: '14 Park Street',
      city: 'Kolkata',
      joiningDate: '2025-02-01',
      expiryDate: '2027-02-01',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    }).returning();

    await db.insert(memberSports).values({
      organizationId: ymca.id,
      memberId: ymcaMember1.id,
      sportId: swimming.id,
      skillLevel: 'Advanced',
      position: 'Freestyle Specialist',
      notes: 'State level medallist in 100m freestyle.',
    });

    // ----------------------------------------------------
    // TENANT 3: Demo Sports Academy (Apex Sports Academy)
    // ----------------------------------------------------
    const [apexAcademy] = await db.insert(organizations).values({
      name: 'Apex Sports Academy',
      shortName: 'Apex',
      slug: 'apex-sports-academy',
      type: 'Sports Academy',
      logo: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=120&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&auto=format&fit=crop&q=80',
      description: 'Professional high-performance training hub for cricket, badminton, athletic conditioning, and pro talent scouting.',
      establishedYear: 2014,
      email: 'admissions@apexsportsacademy.in',
      phone: '+91 33 2486 9911',
      whatsapp: '+91 98314 55443',
      website: 'https://apexsportsacademy.in',
      address: 'Sector V, Salt Lake City',
      city: 'Kolkata',
      state: 'West Bengal',
      country: 'India',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      theme: 'association',
      primaryColor: '#059669',
      modules: ['members', 'players', 'sports', 'programs', 'teams', 'training', 'attendance', 'facilities', 'finance', 'reports'],
    }).returning();

    await db.insert(platformSubscriptions).values({
      organizationId: apexAcademy.id,
      planName: 'Basic',
      status: 'active',
      monthlyFee: '2999',
      memberLimit: 500,
      sportLimit: 5,
      branchLimit: 2,
      renewalDate: '2026-12-01',
    });

    console.log('Successfully seeded multi-tenant platform with 3 organizations, global sports, coaches, teams, members, and activities!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
