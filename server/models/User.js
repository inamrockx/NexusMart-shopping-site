const db = require('../db');

const SEED_USERS = [
  {
    email: "admin@nexusmart.com",
    password: "admin", // Simple for evaluation purposes
    name: "Alex Mercer",
    role: "admin",
    address: {
      street: "100 Shopify Way",
      city: "San Francisco",
      state: "CA",
      zip: "94103",
      country: "United States"
    }
  },
  {
    email: "user@nexusmart.com",
    password: "user",
    name: "John Doe",
    role: "customer",
    address: {
      street: "742 Evergreen Terrace",
      city: "Springfield",
      state: "IL",
      zip: "62704",
      country: "United States"
    }
  }
];

class UserModel {
  constructor() {
    this.collection = 'users';
    this.seedIfNeeded();
  }

  seedIfNeeded() {
    const existing = db.find(this.collection);
    if (existing.length === 0) {
      console.log('Seeding initial system users...');
      SEED_USERS.forEach(u => db.save(this.collection, u));
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
      role: 'customer',
      address: data.address || { street: "", city: "", state: "", zip: "", country: "" },
      ...data
    });
  }

  findByIdAndUpdate(id, updates) {
    return db.findByIdAndUpdate(this.collection, id, updates);
  }

  findByIdAndDelete(id) {
    return db.findByIdAndDelete(this.collection, id);
  }
}

module.exports = new UserModel();
