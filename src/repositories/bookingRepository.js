const { Op } = require('sequelize');

const CrudRepository = require("./crudRepository");
const { Booking } = require('../models');
const AppError = require("../utils/errors/appError");
const { Enums } = require('../utils/common');
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

class BookingRepository extends CrudRepository {
    constructor() {
        super(Booking);
    }

    async create(data, transaction) {
        const response = await Booking.create(data, { transaction: transaction });
        return response;
    }

    async get(data, transaction) {
        const response = await Booking.findByPk(data, { transaction: transaction });
        if (!response) {
            throw new AppError([`Could not find the booking with id: ${data}`], StatusCodes.NOT_FOUND);
        }
        return response;
    }

    async update(id, data, transaction) {
        const response = await this.model.update(data, {
            where: {
                id: id
            }
        }, { transaction: transaction });

        if(response[0] == 0) {
            throw new AppError([`Could not find the resource with id: ${data}`], StatusCodes.NOT_FOUND);
        }

        return response;
    }

    async cancelOldBookings(timestamp) {
        const response = await Booking.update({ status: CANCELLED }, {
            where: {
                [Op.and]: [
                    {
                        createdAt: {
                            [Op.lt]: timestamp
                        }
                    },
                    {
                        status: {
                            [Op.ne]: BOOKED
                        }
                    },
                    {
                        status: {
                            [Op.ne]: CANCELLED
                        }
                    }
                ]
            }
        })

        return response;
    }
}

module.exports = BookingRepository