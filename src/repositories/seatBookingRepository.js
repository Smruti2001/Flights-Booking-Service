const { Op } = require('sequelize');

const CrudRepository = require("./crudRepository");
const { FlightSeatReservation } = require('../models');
const AppError = require("../utils/errors/appError");
const { Enums } = require('../utils/common');
const { RESERVED, CANCELLED } = Enums.SEAT_STATUS;

class SeatBookingRepository extends CrudRepository {
    constructor() {
        super(FlightSeatReservation);
    }

    async create(data, transaction) {
        const response = await FlightSeatReservation.create(data, { transaction: transaction });
        return response;
    }

    async get(data, transaction) {
        const response = await FlightSeatReservation.findByPk(data, { transaction: transaction });
        if (!response) {
            throw new AppError([`Could not find the seat booking with id: ${data}`], StatusCodes.NOT_FOUND);
        }
        return response;
    }

    async update(id, data, transaction) {
        const response = await FlightSeatReservation.update(data, {
            where: {
                bookingId: id
            }
        }, { transaction: transaction });

        if (response[0] == 0) {
            throw new AppError([`Could not find the resource with id: ${data}`], StatusCodes.NOT_FOUND);
        }

        return response;
    }

    async cancelOldSeatBookings(bookingIds, transaction) {
        const seatBookings = await FlightSeatReservation.findAll({
            where: {
                bookingId: { [Op.in]: bookingIds }
            },
            transaction: transaction
        });

        await FlightSeatReservation.update(
            { status: CANCELLED },
            {
                where: {
                    bookingId: { [Op.in]: bookingIds }
                },
                transaction: transaction
            }
        );

        return seatBookings; // optional: return if you need to use it
    }

}

module.exports = SeatBookingRepository