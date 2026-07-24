export const doctors = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    email: "priya.sharma@med.com",
    phone: "+91-98765-01001",
    specialization: "General Medicine",
    experience: 12,
    hospital: "Apollo Hospital",
    fee: 500,
    rating: 4.8,
    patients: 2500,
    available: true,
    schedule: {
      "2026-03-24": ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30"],
      "2026-03-25": ["09:00", "09:30", "10:00", "11:00", "14:00", "14:30"],
      "2026-03-26": ["10:00", "10:30", "11:00", "15:00", "15:30"]
    }
  },
  {
    id: 2,
    name: "Dr. Amit Patel",
    email: "amit.patel@med.com",
    phone: "+91-98765-01002",
    specialization: "Cardiology",
    experience: 15,
    hospital: "Fortis Heart Centre",
    fee: 800,
    rating: 4.9,
    patients: 1800,
    available: true,
    schedule: {
      "2026-03-24": ["10:00", "10:30", "11:00", "14:00", "14:30"],
      "2026-03-25": ["09:00", "09:30", "10:00", "10:30", "15:00", "15:30"],
      "2026-03-26": ["09:00", "09:30", "14:00", "14:30", "15:00"]
    }
  },
  {
    id: 3,
    name: "Dr. Sneha Gupta",
    email: "sneha.gupta@med.com",
    phone: "+91-98765-01003",
    specialization: "Dental",
    experience: 8,
    hospital: "Smile Dental Clinic",
    fee: 400,
    rating: 4.7,
    patients: 1200,
    available: true,
    schedule: {
      "2026-03-24": ["09:00", "09:30", "10:00", "11:00", "14:00", "15:00"],
      "2026-03-25": ["10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30"],
      "2026-03-26": ["09:00", "09:30", "10:00", "14:00", "14:30"]
    }
  },
  {
    id: 4,
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@med.com",
    phone: "+91-98765-01004",
    specialization: "Emergency Medicine",
    experience: 20,
    hospital: "AIIMS Emergency",
    fee: 600,
    rating: 4.9,
    patients: 5000,
    available: true,
    schedule: {
      "2026-03-24": ["00:00", "00:30", "01:00", "12:00", "12:30"],
      "2026-03-25": ["00:00", "00:30", "12:00", "12:30", "13:00"],
      "2026-03-26": ["00:00", "12:00", "12:30", "13:00", "13:30"]
    }
  },
  {
    id: 5,
    name: "Dr. Anjali Reddy",
    email: "anjali.reddy@med.com",
    phone: "+91-98765-01005",
    specialization: "Pediatrics",
    experience: 10,
    hospital: "Manipal Hospital",
    fee: 450,
    rating: 4.8,
    patients: 1500,
    available: false,
    schedule: {
      "2026-03-24": ["10:00", "10:30", "11:00"],
      "2026-03-25": ["09:00", "09:30", "10:00", "14:00", "14:30"],
      "2026-03-26": ["10:00", "10:30", "15:00", "15:30"]
    }
  },
  {
    id: 6,
    name: "Dr. Vikram Singh",
    email: "vikram.singh@med.com",
    phone: "+91-98765-01006",
    specialization: "Neurology",
    experience: 18,
    hospital: "Max Super Speciality",
    fee: 1000,
    rating: 4.9,
    patients: 900,
    available: true,
    schedule: {
      "2026-03-24": ["11:00", "11:30", "14:00", "14:30", "15:00"],
      "2026-03-25": ["10:00", "10:30", "11:00", "15:00", "15:30"],
      "2026-03-26": ["09:00", "09:30", "10:00", "14:00", "14:30"]
    }
  },
  {
    id: 7,
    name: "Dr. Meera Joshi",
    email: "meera.joshi@med.com",
    phone: "+91-98765-01007",
    specialization: "Dermatology",
    experience: 7,
    hospital: "Skin Health Clinic",
    fee: 550,
    rating: 4.6,
    patients: 800,
    available: true,
    schedule: {
      "2026-03-24": ["09:00", "09:30", "10:00", "14:00", "14:30", "15:00"],
      "2026-03-25": ["10:00", "10:30", "11:00", "14:00", "15:00"],
      "2026-03-26": ["09:00", "09:30", "10:00", "10:30", "14:00"]
    }
  },
  {
    id: 8,
    name: "Dr. Suresh Nair",
    email: "suresh.nair@med.com",
    phone: "+91-98765-01008",
    specialization: "Orthopedics",
    experience: 14,
    hospital: "Artemis Hospital",
    fee: 750,
    rating: 4.7,
    patients: 1100,
    available: true,
    schedule: {
      "2026-03-24": ["10:00", "10:30", "11:00", "11:30", "15:00", "15:30"],
      "2026-03-25": ["09:00", "09:30", "14:00", "14:30", "15:00"],
      "2026-03-26": ["10:00", "10:30", "14:00", "14:30", "15:00", "15:30"]
    }
  }
];

export const hospitals = [
  {
    id: 1,
    name: "Apollo Hospital",
    address: "Nehru Place, New Delhi",
    phone: "+91-11-29871001",
    emergency: true,
    beds: { total: 200, available: 45 },
    bloodBank: { "A+": 5, "A-": 2, "B+": 8, "B-": 1, "O+": 10, "O-": 3, "AB+": 4, "AB-": 1 },
    latitude: 28.5692,
    longitude: 77.2588
  },
  {
    id: 2,
    name: "Fortis Escorts",
    address: "Okhla Road, New Delhi",
    phone: "+91-11-29871002",
    emergency: true,
    beds: { total: 150, available: 20 },
    bloodBank: { "A+": 3, "A-": 1, "B+": 6, "B-": 2, "O+": 8, "O-": 2, "AB+": 2, "AB-": 0 },
    latitude: 28.5662,
    longitude: 77.2751
  },
  {
    id: 3,
    name: "AIIMS Emergency",
    address: "Ansari Nagar, New Delhi",
    phone: "+91-11-26594401",
    emergency: true,
    beds: { total: 100, available: 15 },
    bloodBank: { "A+": 12, "A-": 4, "B+": 15, "B-": 3, "O+": 20, "O-": 5, "AB+": 8, "AB-": 2 },
    latitude: 28.5921,
    longitude: 77.2105
  },
  {
    id: 4,
    name: "Manipal Hospital",
    address: "Dwarka Sector 6, New Delhi",
    phone: "+91-11-45671004",
    emergency: true,
    beds: { total: 80, available: 30 },
    bloodBank: { "A+": 4, "A-": 1, "B+": 5, "B-": 0, "O+": 6, "O-": 2, "AB+": 3, "AB-": 1 },
    latitude: 28.5921,
    longitude: 77.0386
  },
  {
    id: 5,
    name: "Dental Care Centre",
    address: "Connaught Place, New Delhi",
    phone: "+91-11-23451005",
    emergency: false,
    beds: { total: 10, available: 8 },
    bloodBank: null,
    latitude: 28.6314,
    longitude: 77.2197
  }
];

export const bloodBanks = [
  {
    id: 1,
    name: "Red Cross Blood Bank",
    address: "Sansad Marg, New Delhi",
    phone: "+91-11-23441001",
    latitude: 28.6315,
    longitude: 77.2198,
    bloodStock: { "A+": 25, "A-": 10, "B+": 30, "B-": 8, "O+": 40, "O-": 15, "AB+": 20, "AB-": 5 }
  },
  {
    id: 2,
    name: "Lok Nayak Blood Bank",
    address: "Jawaharlal Nehru Marg, New Delhi",
    phone: "+91-11-23441002",
    latitude: 28.6412,
    longitude: 77.2356,
    bloodStock: { "A+": 15, "A-": 5, "B+": 20, "B-": 4, "O+": 25, "O-": 8, "AB+": 12, "AB-": 3 }
  },
  {
    id: 3,
    name: "Sanjay Gandhi Blood Centre",
    address: "Ring Road, New Delhi",
    phone: "+91-11-23441003",
    latitude: 28.6512,
    longitude: 77.2456,
    bloodStock: { "A+": 18, "A-": 6, "B+": 22, "B-": 5, "O+": 30, "O-": 10, "AB+": 15, "AB-": 4 }
  }
];

export const ambulanceDrivers = [
  {
    id: 1,
    name: "Ramesh Kumar",
    phone: "+91-98765-02001",
    vehicle: "Ambulance DL-01-AB-1234",
    licenseNumber: "DL-123456",
    status: "available",
    currentLocation: { lat: 28.5692, lng: 77.2588 },
    rating: 4.8
  },
  {
    id: 2,
    name: "Mohammad Irfan",
    phone: "+91-98765-02002",
    vehicle: "Ambulance DL-01-CD-5678",
    licenseNumber: "DL-234567",
    status: "available",
    currentLocation: { lat: 28.5662, lng: 77.2751 },
    rating: 4.9
  },
  {
    id: 3,
    name: "Suresh Reddy",
    phone: "+91-98765-02003",
    vehicle: "Medical Van DL-01-EF-9012",
    licenseNumber: "DL-345678",
    status: "busy",
    currentLocation: { lat: 28.5921, lng: 77.2105 },
    rating: 4.7
  }
];
