'use strict';
const {
  Model
} = require('sequelize');

const { Enums } = require('../utils/common');
const { RESERVED, BOOKED, CANCELLED } = Enums.SEAT_STATUS;

module.exports = (sequelize, DataTypes) => {
  class FlightSeatReservation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Booking, {
        foreignKey: 'bookingId',
        onDelete: 'CASCADE'
      });
    }
  }
  FlightSeatReservation.init({
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    flightId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    seatId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM,
      values: [RESERVED, BOOKED, CANCELLED],
      defaultValue: RESERVED,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'FlightSeatReservation',
    indexes: [
      {
        unique: true,
        fields: ['flightId', 'seatId'],
        name: 'unique_flight_seat'
      }
    ]
  });
  return FlightSeatReservation;
};