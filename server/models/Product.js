const db = require('../db');

const SEED_PRODUCTS = [
  {
    name: "AeroSound Pro ANC Headphones",
    description: "Experience absolute acoustic purity with industry-leading Active Noise Cancellation, custom-tuned high-excursion drivers, and 45 hours of immersive battery life. Designed with memory-foam leather cushions for maximum dynamic comfort.",
    price: 249.99,
    category: "Tech & Gadgets",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60",
    rating: 4.8,
    stock: 25,
    specs: {
      "Driver Size": "40mm Custom Dynamic",
      "Battery Life": "Up to 45 Hours",
      "Bluetooth": "v5.3 Low Energy",
      "Weight": "260g"
    },
    reviews: [
      { user: "Sarah K.", rating: 5, comment: "Absolutely incredible sound! The noise cancellation is a game changer for flights.", date: "2026-05-18T10:30:00.000Z" },
      { user: "David M.", rating: 4.5, comment: "Super comfortable. Battery seems to last forever.", date: "2026-05-20T14:15:00.000Z" }
    ]
  },
  {
    name: "ChronoLux Kinetic Sapphire Watch",
    description: "A testament to master horology. Featuring an open-heart kinetic movement, hand-assembled mechanical gears, scratch-resistant sapphire crystal casing, and a genuine calfskin leather strap. Water-resistant up to 50 meters.",
    price: 389.00,
    category: "Fashion & Apparel",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60",
    rating: 4.9,
    stock: 12,
    specs: {
      "Movement": "Automatic Kinetic",
      "Case Diameter": "42mm",
      "Strap Material": "Genuine Calfskin Leather",
      "Water Resistance": "5 ATM / 50m"
    },
    reviews: [
      { user: "Marcus V.", rating: 5, comment: "The craftsmanship is astonishing. You can feel the quality on your wrist.", date: "2026-05-12T08:22:00.000Z" }
    ]
  },
  {
    name: "Nebula Glow Smart Ambient Light Bar",
    description: "Transform your living space with adaptive ambient lighting. Syncs seamlessly with movies, music, and games using smart reactive sensors. Exposes 16.8 million colors with smooth, dynamic gradient flows via our custom smart-home controller app.",
    price: 89.99,
    category: "Smart Home",
    image: "https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=800&auto=format&fit=crop&q=60",
    rating: 4.6,
    stock: 50,
    specs: {
      "Colors": "16.8 Million RGBIC",
      "Connectivity": "Wi-Fi 2.4GHz & Bluetooth",
      "Smart Sync": "Alexa, Google Assistant, Custom App",
      "Length": "45cm per bar"
    },
    reviews: [
      { user: "Emily R.", rating: 4, comment: "Easy to set up and the colors are brilliant. The app is highly responsive.", date: "2026-05-21T18:40:00.000Z" }
    ]
  },
  {
    name: "ApexFit Carbon GPS Smartwatch",
    description: "Designed for extreme performance. Incorporates multi-band GPS routing, blood-oxygen monitoring, real-time aerobic strain indicators, and dynamic pacing metrics. Enclosed in a heavy-duty aerospace-grade titanium-carbon hybrid chassis.",
    price: 299.50,
    category: "Active Lifestyle",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=60",
    rating: 4.7,
    stock: 30,
    specs: {
      "Chassis": "Aerospace Titanium & Carbon Fiber",
      "GPS": "Multi-Band Dual-Frequency GNSS",
      "Sensors": "Heart Rate, SpO2, Barometer, Gyro",
      "Battery Life": "14 Days Smartwatch / 36 Hours GPS"
    },
    reviews: [
      { user: "Chris T.", rating: 5, comment: "The GPS tracking is insanely accurate. Perfect for trail running.", date: "2026-05-19T06:12:00.000Z" }
    ]
  },
  {
    name: "Nomad Leather Tech Organizer",
    description: "Crafted for modern digital nomads. Constructed using water-resistant ballistic nylon and rich Horween leather accents. Features elastic tension loops, mesh cable pods, a dedicated stylus sleeve, and an RFID-blocking passport slot.",
    price: 75.00,
    category: "Fashion & Apparel",
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=60",
    rating: 4.5,
    stock: 45,
    specs: {
      "Exterior": "1680D Ballistic Nylon",
      "Trim": "Horween Leather",
      "Dimensions": "24cm x 15cm x 7cm",
      "RFID Shield": "Yes, Active Protection"
    },
    reviews: []
  },
  {
    name: "Lumina 4K Ultra Short Throw Projector",
    description: "Bring the cinema to your living room. Capable of projecting a massive 120-inch 4K HDR10+ screen from just inches away. Equipped with 2500 ANSI Lumens, a high-fidelity Harman Kardon sound system, and integrated Android TV.",
    price: 1899.00,
    category: "Tech & Gadgets",
    image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&auto=format&fit=crop&q=60",
    rating: 4.9,
    stock: 5,
    specs: {
      "Resolution": "4K UHD (3840 x 2160)",
      "Brightness": "2500 ANSI Lumens",
      "Throw Ratio": "0.21:1 Ultra Short Throw",
      "Sound": "Harman Kardon 30W Speakers"
    },
    reviews: [
      { user: "Steven L.", rating: 5, comment: "Absolute masterpiece. Colors are stunning even during daylight. Worth every single penny.", date: "2026-05-15T22:11:00.000Z" }
    ]
  }
];

class ProductModel {
  constructor() {
    this.collection = 'products';
    this.seedIfNeeded();
  }

  seedIfNeeded() {
    const existing = db.find(this.collection);
    if (existing.length === 0) {
      console.log('Seeding initial product catalog in local database...');
      SEED_PRODUCTS.forEach(p => db.save(this.collection, p));
    }
  }

  find(query) {
    return db.find(this.collection, query);
  }

  findOne(query) {
    return db.findOne(this.collection, query);
  }

  findById(id) {
    return db.findById(this.collection, id);
  }

  create(data) {
    return db.save(this.collection, {
      ...data,
      rating: data.rating || 5.0,
      reviews: data.reviews || [],
      specs: data.specs || {}
    });
  }

  findByIdAndUpdate(id, updates) {
    return db.findByIdAndUpdate(this.collection, id, updates);
  }

  findByIdAndDelete(id) {
    return db.findByIdAndDelete(this.collection, id);
  }
}

module.exports = new ProductModel();
