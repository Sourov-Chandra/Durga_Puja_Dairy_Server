import mongoose from "mongoose";
import { User } from "./models/User.js";
import { Mandap } from "./models/Mandap.js";
import { Schedule } from "./models/Schedule.js";
import { Event } from "./models/Event.js";
import { Announcement } from "./models/Announcement.js";
import { MandapStaff } from "./models/MandapStaff.js";
import { ActivityLog } from "./models/ActivityLog.js";
import { ENV } from "./config/env.js";

const sampleData = async () => {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(ENV.MONGODB_URI);
    console.log("Connected to MongoDB.");

    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany(),
      Mandap.deleteMany(),
      Schedule.deleteMany(),
      Event.deleteMany(),
      Announcement.deleteMany(),
      MandapStaff.deleteMany(),
      ActivityLog.deleteMany(),
    ]);

    console.log("Creating default users...");
    const admin = await User.create({
      name: "Global Platform Admin",
      email: "admin@durgapujadairy.com",
      password: "password123",
      role: "ADMIN",
      country: "Global",
    });

    const manager = await User.create({
      name: "Subhashis Roy (Manager)",
      email: "manager@durgapujadairy.com",
      password: "password123",
      role: "MANAGER",
      country: "India",
    });

    const staff = await User.create({
      name: "Ananya Sen (Staff)",
      email: "staff@durgapujadairy.com",
      password: "password123",
      role: "STAFF",
      country: "India",
    });

    const devotee = await User.create({
      name: "Amitabha Banerjee",
      email: "user@durgapujadairy.com",
      password: "password123",
      role: "USER",
      country: "United States",
    });

    console.log("Creating worldwide mandaps...");

    const mandap1 = await Mandap.create({
      name: "Bagbazar Sarbojanin Durgotsav",
      slug: "bagbazar-sarbojanin-durgotsav-kolkata",
      description:
        "One of the oldest and most prestigious heritage community Durga Pujas in Kolkata, celebrating traditional Ekchala Pratima and authentic rituals since 1919.",
      year: 2026,
      location: {
        type: "Point",
        coordinates: [88.3688, 22.6022], // [lng, lat]
      },
      address: {
        addressLine1: "Bagbazar Ghat Road",
        areaOrLocality: "Bagbazar",
        cityOrDistrict: "Kolkata",
        stateOrDivision: "West Bengal",
        country: "India",
        countryCode: "IN",
        postalCode: "700003",
        timezone: "Asia/Kolkata",
      },
      coverImage: {
        url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80",
        publicId: "sample_bagbazar_1",
      },
      contact: {
        phone: "+91 98300 12345",
        email: "info@bagbazarsarbojanin.org",
        website: "https://bagbazarsarbojanin.org",
      },
      managerId: manager._id,
      status: "APPROVED",
      verificationStatus: "OFFICIAL",
      viewCount: 1240,
      favoriteCount: 382,
      createdBy: admin._id,
    });

    const mandap2 = await Mandap.create({
      name: "Dhakeshwari National Temple Durga Puja",
      slug: "dhakeshwari-national-temple-durga-puja-dhaka",
      description:
        "The national temple of Bangladesh, hosting one of the grandest and most sacred historical Durga Puja celebrations in the Bengal delta.",
      year: 2026,
      location: {
        type: "Point",
        coordinates: [90.3904, 23.7225],
      },
      address: {
        addressLine1: "Dhakeshwari Road, Lalbagh",
        areaOrLocality: "Bakshi Bazar",
        cityOrDistrict: "Dhaka",
        stateOrDivision: "Dhaka Division",
        country: "Bangladesh",
        countryCode: "BD",
        postalCode: "1211",
        timezone: "Asia/Dhaka",
      },
      coverImage: {
        url: "https://images.unsplash.com/photo-1599818817947-68b209772c67?auto=format&fit=crop&w=1200&q=80",
        publicId: "sample_dhakeshwari_1",
      },
      contact: {
        phone: "+880 1711 987654",
        email: "contact@dhakeshwaritemple.bd",
      },
      managerId: admin._id,
      status: "APPROVED",
      verificationStatus: "OFFICIAL",
      viewCount: 940,
      favoriteCount: 295,
      createdBy: admin._id,
    });

    const mandap3 = await Mandap.create({
      name: "Thakurgaon Govinda Jeu Central Mandap",
      slug: "thakurgaon-govinda-jeu-central-mandap",
      description:
        "The historic central Durga Puja gathering in Thakurgaon district, known for serene classical rituals, radiant illumination, and grand Maha Ashtami Kumari Puja.",
      year: 2026,
      location: {
        type: "Point",
        coordinates: [88.4665, 26.0336],
      },
      address: {
        addressLine1: "Govinda Jeu Temple Road",
        areaOrLocality: "Central Town",
        cityOrDistrict: "Thakurgaon",
        stateOrDivision: "Rangpur",
        country: "Bangladesh",
        countryCode: "BD",
        postalCode: "5100",
        timezone: "Asia/Dhaka",
      },
      coverImage: {
        url: "https://images.unsplash.com/photo-1570784332176-fdd73da66f03?auto=format&fit=crop&w=1200&q=80",
        publicId: "sample_thakurgaon_1",
      },
      contact: {
        phone: "+880 1712 345678",
      },
      managerId: admin._id,
      status: "APPROVED",
      verificationStatus: "VERIFIED",
      viewCount: 410,
      favoriteCount: 120,
      createdBy: admin._id,
    });

    const mandap4 = await Mandap.create({
      name: "London Camden Durga Puja Committee",
      slug: "london-camden-durga-puja-committee",
      description:
        "One of the oldest community Durga Pujas in the United Kingdom, founded in 1963. Celebrates authentic traditional Bengali rituals, bhog distribution, and cultural evenings in central London.",
      year: 2026,
      location: {
        type: "Point",
        coordinates: [-0.1425, 51.539],
      },
      address: {
        addressLine1: "Crowndale Centre, 218 Eversholt Street",
        areaOrLocality: "Camden",
        cityOrDistrict: "London",
        stateOrDivision: "Greater London",
        country: "United Kingdom",
        countryCode: "GB",
        postalCode: "NW1 1BD",
        timezone: "Europe/London",
      },
      coverImage: {
        url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80",
        publicId: "sample_london_1",
      },
      contact: {
        phone: "+44 20 7946 0991",
        email: "secretary@londonpujas.org.uk",
      },
      managerId: admin._id,
      status: "APPROVED",
      verificationStatus: "VERIFIED",
      viewCount: 650,
      favoriteCount: 180,
      createdBy: admin._id,
    });

    const mandap5 = await Mandap.create({
      name: "The Bengali Club of USA Durga Puja",
      slug: "bengali-club-of-usa-durga-puja-new-york",
      description:
        "Queens, New York's signature autumn festival bringing together the South Asian diaspora with traditional dhak beats, youth cultural performances, and sacred pushpanjali rituals.",
      year: 2026,
      location: {
        type: "Point",
        coordinates: [-73.8864, 40.7517],
      },
      address: {
        addressLine1: "37th Avenue & 74th Street",
        areaOrLocality: "Jackson Heights",
        cityOrDistrict: "New York",
        stateOrDivision: "New York",
        country: "United States",
        countryCode: "US",
        postalCode: "11372",
        timezone: "America/New_York",
      },
      coverImage: {
        url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        publicId: "sample_ny_1",
      },
      contact: {
        phone: "+1 718 555 0199",
        email: "events@bengaliclubusa.org",
      },
      managerId: admin._id,
      status: "APPROVED",
      verificationStatus: "OFFICIAL",
      viewCount: 810,
      favoriteCount: 240,
      createdBy: admin._id,
    });

    // Assign staff to Bagbazar Mandap
    await MandapStaff.create({
      mandapId: mandap1._id,
      userId: staff._id,
      role: "STAFF",
      permissions: [
        "MANAGE_SCHEDULE",
        "MANAGE_EVENTS",
        "MANAGE_GALLERY",
        "POST_ANNOUNCEMENTS",
      ],
      assignedBy: manager._id,
      status: "ACTIVE",
    });

    // Schedules for Bagbazar
    await Schedule.create([
      {
        mandapId: mandap1._id,
        day: "Maha Saptami",
        title: "Nabapatrika Snan & Pravesh",
        description: "Bathing of Nabapatrika at Hooghly River ghat and ceremonial installation at mandap.",
        date: new Date("2026-10-18T06:30:00Z"),
        startTime: "06:30 AM",
        endTime: "08:30 AM",
        priestName: "Pandit Ramkrishna Bhattacharya",
        order: 1,
        createdBy: manager._id,
      },
      {
        mandapId: mandap1._id,
        day: "Maha Ashtami",
        title: "Maha Ashtami Pushpanjali (Batch 1)",
        description: "First session of community pushpanjali offering sacred lotus flowers.",
        date: new Date("2026-10-19T09:30:00Z"),
        startTime: "09:30 AM",
        endTime: "10:30 AM",
        priestName: "Pandit Ramkrishna Bhattacharya",
        order: 2,
        createdBy: manager._id,
      },
      {
        mandapId: mandap1._id,
        day: "Maha Ashtami",
        title: "Sandhi Puja & 108 Deepam Aarti",
        description: "The sacred conjunction of Ashtami and Navami tithi with lighting of 108 earthen lamps.",
        date: new Date("2026-10-19T17:45:00Z"),
        startTime: "05:45 PM",
        endTime: "06:33 PM",
        priestName: "Pandit Ramkrishna Bhattacharya",
        order: 3,
        createdBy: manager._id,
      },
      {
        mandapId: mandap1._id,
        day: "Bijoya Dashami",
        title: "Sindoor Khela & Bisorjon Yatra",
        description: "Traditional vermilion celebration by married women followed by royal immersion procession.",
        date: new Date("2026-10-21T16:00:00Z"),
        startTime: "04:00 PM",
        endTime: "08:00 PM",
        order: 4,
        createdBy: manager._id,
      },
    ]);

    // Cultural Events for Bagbazar
    await Event.create([
      {
        mandapId: mandap1._id,
        title: "Grand Dhak Competition (ঢাক উৎসব)",
        description: "Inter-district traditional dhaki drumming competition with over 50 master drummers.",
        category: "DHAK_COMPETITION",
        date: new Date("2026-10-18T18:30:00Z"),
        startTime: "06:30 PM",
        endTime: "09:30 PM",
        venueOrStage: "Main Pandal Courtyard",
        performers: "Traditional Dhakis of Bengal",
        status: "SCHEDULED",
        createdBy: manager._id,
      },
      {
        mandapId: mandap1._id,
        title: "Classical Dhunuchi Dance Recital",
        description: "Spectacular devotional incense-burning dance with rhythmic brass bells.",
        category: "AARTI_DHUNUCHI",
        date: new Date("2026-10-19T20:00:00Z"),
        startTime: "08:00 PM",
        endTime: "09:30 PM",
        venueOrStage: "Open Stage",
        status: "SCHEDULED",
        createdBy: manager._id,
      },
    ]);

    // Announcements
    await Announcement.create([
      {
        mandapId: mandap1._id,
        title: "Senior Citizen Special Entry Gate",
        content: "Dedicated queue and seating arrangement available at Gate #2 for senior citizens and differently-abled devotees.",
        priority: "IMPORTANT",
        status: "PUBLISHED",
        createdBy: manager._id,
      },
      {
        mandapId: mandap1._id,
        title: "Bhog Distribution Coupons Available",
        content: "Maha Ashtami Khichuri Bhog tokens can be collected starting 8:00 AM at the committee office.",
        priority: "NORMAL",
        status: "PUBLISHED",
        createdBy: manager._id,
      },
    ]);

    console.log("✅ Seed completed successfully!");
    console.log("-----------------------------------------");
    console.log("Demo Accounts (password: password123):");
    console.log("- Admin:    admin@durgapujadairy.com");
    console.log("- Manager:  manager@durgapujadairy.com");
    console.log("- Staff:    staff@durgapujadairy.com");
    console.log("- Devotee:  user@durgapujadairy.com");
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

sampleData();
