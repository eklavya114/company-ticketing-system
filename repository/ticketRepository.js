const Ticket = require('../model/ticketmodel');

class TicketRepository {
  async create(ticketData) {
    return Ticket.create(ticketData);
  }

  async findById(ticketId) {
    return Ticket.findById(ticketId);
  }

  async findByReferenceId(referenceId) {
    return Ticket.find({ referenceID: referenceId }).sort({ createdAt: 1 });
  }

  async countByReferenceId(referenceId) {
    return Ticket.countDocuments({ referenceID: referenceId });
  }

  async updateById(ticketId, updateData) {
    return Ticket.findByIdAndUpdate(ticketId, updateData, { new: true });
  }
}

module.exports = new TicketRepository();