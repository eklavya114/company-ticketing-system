const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Connect to in-memory MongoDB before tests
 */
module.exports.connect = async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
};

/**
 * Drop database, close connection, and stop mongod
 */
module.exports.closeDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
};

/**
 * Clear all data in collections
 */
module.exports.clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
};

/**
 * Create a test user
 */
module.exports.createTestUser = async (overrides = {}) => {
    const User = require('../model/usermodel');
    const defaultUser = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        phone: '+1234567890',
        password: 'password123',
        role: 'CLIENT',
        department: null,
        branch: null,
        verified: true,
        status: 'active'
    };

    const user = new User({ ...defaultUser, ...overrides });
    await user.save();
    return user;
};

/**
 * Create a test ticket
 */
module.exports.createTestTicket = async (clientId, overrides = {}) => {
    const Ticket = require('../model/ticketmodel');
    const { v4: uuidv4 } = require('uuid');

    const defaultTicket = {
        referenceID: uuidv4(),
        clientID: clientId,
        title: 'Test Ticket',
        description: 'Test description',
        priority: 'Medium',
        contact_email: 'test@example.com',
        contact_phone: '+1234567890',
        status: 'In Compliance Review'
    };

    const ticket = new Ticket({ ...defaultTicket, ...overrides });
    await ticket.save();
    return ticket;
};
