const CrudRepository = require("./crudRepository");
const  { Booking } = require('../models')

class BookingRepository extends CrudRepository {
    constructor() {
        super(Booking);
    }

    async create(data, transaction) {
        const response = await Booking.create(data, {transaction: transaction});
        return response;
    }
}

module.exports = BookingRepository