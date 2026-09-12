// Mock Seed Data for SHERO-NourishNet Standalone & Fallback Mode

export const INITIAL_USERS = [
  {
    user_id: 1,
    name: "Green Leaf Bistro & Catering",
    email: "donor@greenleaf.com",
    role: "DONOR",
    phone: "+91 98765 43210",
    address: "88 MG Road, Indiranagar, Bengaluru",
    latitude: 12.9784,
    longitude: 77.6408,
    avatar: "🥗"
  },
  {
    user_id: 2,
    name: "Grand Orchid Banquet Hall",
    email: "events@grandorchid.com",
    role: "DONOR",
    phone: "+91 98765 11223",
    address: "42 Residency Road, Richmond Town, Bengaluru",
    latitude: 12.9698,
    longitude: 77.6012,
    avatar: "🏨"
  },
  {
    user_id: 3,
    name: "Hope Food Bank & Community Shelter",
    email: "contact@hopefoodbank.org",
    role: "NGO",
    phone: "+91 98800 12345",
    address: "12 Koramangala 4th Block, Bengaluru",
    latitude: 12.9345,
    longitude: 77.6267,
    avatar: "🤝"
  },
  {
    user_id: 4,
    name: "City Care & Orphanage Aid",
    email: "support@citycarenongov.org",
    role: "NGO",
    phone: "+91 98800 54321",
    address: "55 Ulsoor Lake Road, Bengaluru",
    latitude: 12.9812,
    longitude: 77.6189,
    avatar: "❤️"
  },
  {
    user_id: 5,
    name: "Priya Sharma (Green Rider)",
    email: "priya.rider@nourishnet.org",
    role: "VOLUNTEER",
    phone: "+91 99000 88776",
    address: "Domlur Flyover Junction, Bengaluru",
    latitude: 12.9609,
    longitude: 77.6387,
    avatar: "🛵"
  },
  {
    user_id: 6,
    name: "System Administrator",
    email: "admin@nourishnet.org",
    role: "ADMIN",
    phone: "+91 90000 00000",
    address: "HQ Cyber City, Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946,
    avatar: "🛡️"
  }
];

export const INITIAL_FOOD = [
  {
    food_id: 1,
    donor_id: 1,
    donor_name: "Green Leaf Bistro & Catering",
    donor_phone: "+91 98765 43210",
    donor_address: "88 MG Road, Indiranagar, Bengaluru",
    food_name: "Executive Vegetable Biryani & Dal Makhani Buffet",
    food_type: "Cooked Meals",
    quantity: 45.0,
    prepared_time: new Date(Date.now() - 2 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    expiry_time: new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    storage_condition: "HOT_INSULATED",
    image_path: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",
    latitude: 12.9784,
    longitude: 77.6408,
    status: "AVAILABLE",
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    food_id: 2,
    donor_id: 2,
    donor_name: "Grand Orchid Banquet Hall",
    donor_phone: "+91 98765 11223",
    donor_address: "42 Residency Road, Richmond Town, Bengaluru",
    food_name: "Assorted Artisan Rolls, Croissants & Breads",
    food_type: "Bakery",
    quantity: 28.0,
    prepared_time: new Date(Date.now() - 4 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    expiry_time: new Date(Date.now() + 18 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    storage_condition: "ROOM_TEMP",
    image_path: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    latitude: 12.9698,
    longitude: 77.6012,
    status: "RESERVED",
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    food_id: 3,
    donor_id: 1,
    donor_name: "Green Leaf Bistro & Catering",
    donor_phone: "+91 98765 43210",
    donor_address: "88 MG Road, Indiranagar, Bengaluru",
    food_name: "Fresh Paneer Gravy, Steamed Basmati Rice & Naan",
    food_type: "Cooked Meals",
    quantity: 60.0,
    prepared_time: new Date(Date.now() - 1 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    expiry_time: new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    storage_condition: "HOT_INSULATED",
    image_path: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    latitude: 12.9784,
    longitude: 77.6408,
    status: "AVAILABLE",
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    food_id: 4,
    donor_id: 2,
    donor_name: "Grand Orchid Banquet Hall",
    donor_phone: "+91 98765 11223",
    donor_address: "42 Residency Road, Richmond Town, Bengaluru",
    food_name: "Organic Farm Fresh Salad Bowls & Cut Fruits",
    food_type: "Raw Produce",
    quantity: 20.0,
    prepared_time: new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    expiry_time: new Date(Date.now() + 10 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
    storage_condition: "REFRIGERATED",
    image_path: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    latitude: 12.9698,
    longitude: 77.6012,
    status: "DELIVERED",
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_REQUESTS = [
  {
    request_id: 1,
    food_id: 2,
    food_name: "Assorted Artisan Rolls, Croissants & Breads",
    food_type: "Bakery",
    donor_id: 2,
    donor_name: "Grand Orchid Banquet Hall",
    ngo_id: 3,
    ngo_name: "Hope Food Bank & Community Shelter",
    ngo_phone: "+91 98800 12345",
    requested_quantity: 28.0,
    status: "ACCEPTED",
    requested_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    request_id: 2,
    food_id: 4,
    food_name: "Organic Farm Fresh Salad Bowls & Cut Fruits",
    food_type: "Raw Produce",
    donor_id: 2,
    donor_name: "Grand Orchid Banquet Hall",
    ngo_id: 4,
    ngo_name: "City Care & Orphanage Aid",
    ngo_phone: "+91 98800 54321",
    requested_quantity: 20.0,
    status: "COMPLETED",
    requested_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    request_id: 3,
    food_id: 1,
    food_name: "Executive Vegetable Biryani & Dal Makhani Buffet",
    food_type: "Cooked Meals",
    donor_id: 1,
    donor_name: "Green Leaf Bistro & Catering",
    ngo_id: 3,
    ngo_name: "Hope Food Bank & Community Shelter",
    ngo_phone: "+91 98800 12345",
    requested_quantity: 30.0,
    status: "PENDING",
    requested_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
];

export const INITIAL_DELIVERIES = [
  {
    delivery_id: 1,
    request_id: 1,
    volunteer_id: 5,
    volunteer_name: "Priya Sharma (Green Rider)",
    volunteer_phone: "+91 99000 88776",
    food_id: 2,
    food_name: "Assorted Artisan Rolls, Croissants & Breads",
    quantity: 28.0,
    donor_name: "Grand Orchid Banquet Hall",
    donor_address: "42 Residency Road, Richmond Town, Bengaluru",
    ngo_name: "Hope Food Bank & Community Shelter",
    ngo_address: "12 Koramangala 4th Block, Bengaluru",
    status: "IN_TRANSIT",
    current_lat: 12.9520,
    current_lng: 77.6140,
    started_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    completed_at: null
  },
  {
    delivery_id: 2,
    request_id: 2,
    volunteer_id: 5,
    volunteer_name: "Priya Sharma (Green Rider)",
    volunteer_phone: "+91 99000 88776",
    food_id: 4,
    food_name: "Organic Farm Fresh Salad Bowls & Cut Fruits",
    quantity: 20.0,
    donor_name: "Grand Orchid Banquet Hall",
    donor_address: "42 Residency Road, Richmond Town, Bengaluru",
    ngo_name: "City Care & Orphanage Aid",
    ngo_address: "55 Ulsoor Lake Road, Bengaluru",
    status: "DELIVERED",
    current_lat: 12.9812,
    current_lng: 77.6189,
    started_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_TRACKING = [
  { tracking_id: 1, delivery_id: 1, latitude: 12.9698, longitude: 77.6012, recorded_at: "10 mins ago" },
  { tracking_id: 2, delivery_id: 1, latitude: 12.9610, longitude: 77.6080, recorded_at: "6 mins ago" },
  { tracking_id: 3, delivery_id: 1, latitude: 12.9520, longitude: 77.6140, recorded_at: "Just now" }
];

export const INITIAL_FEEDBACK = [
  {
    feedback_id: 1,
    delivery_id: 2,
    from_user_id: 4,
    from_user_name: "City Care & Orphanage Aid",
    rating: 5,
    comment: "Food arrived perfectly fresh, chilled, and neatly packed. Fed 50 kids in our shelter tonight! Bless you all.",
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    feedback_id: 2,
    delivery_id: 2,
    from_user_id: 2,
    from_user_name: "Grand Orchid Banquet Hall",
    rating: 5,
    comment: "Priya arrived on time with thermal delivery bags. Fast and seamless dispatch.",
    created_at: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString()
  }
];
