const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

class Database {
  constructor() {
    this.data = {
      products: [],
      orders: [],
      users: [],
      chats: []
    };
    this.init();
  }

  init() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DB_PATH)) {
      try {
        const fileContent = fs.readFileSync(DB_PATH, 'utf8');
        this.data = JSON.parse(fileContent);
        // Ensure all collections exist
        this.data.products = this.data.products || [];
        this.data.orders = this.data.orders || [];
        this.data.users = this.data.users || [];
        this.data.chats = this.data.chats || [];
      } catch (err) {
        console.error('Error reading database file, resetting database:', err);
        this.saveToFile();
      }
    } else {
      this.saveToFile();
    }
  }

  saveToFile() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error writing to database file:', err);
    }
  }

  // Generic Operations
  getCollection(collectionName) {
    if (!this.data[collectionName]) {
      this.data[collectionName] = [];
    }
    return this.data[collectionName];
  }

  find(collectionName, query = {}) {
    const collection = this.getCollection(collectionName);
    return collection.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(collectionName, query = {}) {
    const collection = this.getCollection(collectionName);
    return collection.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  findById(collectionName, id) {
    const collection = this.getCollection(collectionName);
    return collection.find(item => String(item._id) === String(id));
  }

  save(collectionName, document) {
    const collection = this.getCollection(collectionName);
    const now = new Date().toISOString();

    if (document._id) {
      // Update
      const index = collection.findIndex(item => String(item._id) === String(document._id));
      if (index !== -1) {
        document.updatedAt = now;
        collection[index] = { ...collection[index], ...document, updatedAt: now };
        this.saveToFile();
        return collection[index];
      }
    }

    // Insert
    const newDoc = {
      _id: Math.random().toString(36).substr(2, 9),
      ...document,
      createdAt: now,
      updatedAt: now
    };
    collection.push(newDoc);
    this.saveToFile();
    return newDoc;
  }

  findByIdAndUpdate(collectionName, id, updates) {
    const collection = this.getCollection(collectionName);
    const index = collection.findIndex(item => String(item._id) === String(id));
    if (index !== -1) {
      const now = new Date().toISOString();
      collection[index] = { ...collection[index], ...updates, updatedAt: now };
      this.saveToFile();
      return collection[index];
    }
    return null;
  }

  findByIdAndDelete(collectionName, id) {
    const collection = this.getCollection(collectionName);
    const index = collection.findIndex(item => String(item._id) === String(id));
    if (index !== -1) {
      const deleted = collection.splice(index, 1)[0];
      this.saveToFile();
      return deleted;
    }
    return null;
  }
}

const db = new Database();
module.exports = db;
