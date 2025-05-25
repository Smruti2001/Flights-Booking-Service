'use strict';
const { Enums } = require('../utils/common');
const { RESERVED, BOOKED, CANCELLED } = Enums.SEAT_STATUS;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FlightSeatReservations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bookingId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Bookings',
          key: 'id'
        },
        onDelete: 'CASCADE',
        allowNull: false
      },
      flightId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      seatId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM,
        values: [RESERVED, BOOKED, CANCELLED],
        defaultValue: RESERVED,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique composite index
    await queryInterface.addIndex('FlightSeatReservations', ['flightId', 'seatId'], {
      unique: true,
      name: 'unique_flight_seat'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('FlightSeatReservations', 'unique_flight_seat');
    await queryInterface.dropTable('FlightSeatReservations');
  }
};