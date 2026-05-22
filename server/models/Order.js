const db = require('../db');

class OrderModel {
  constructor() {
    this.collection = 'orders';
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
    // Generate order ID like #NM-1001
    const count = db.find(this.collection).length;
    const orderNumber = `NM-${1001 + count}`;
    
    return db.save(this.collection, {
      orderNumber,
      status: 'Pending', // Pending, Processing, Shipped, Delivered
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

module.exports = new OrderModel();
