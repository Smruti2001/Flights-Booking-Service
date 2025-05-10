function compareDateTime(dateTime1, dateTime2) {
    const dt1 = new Date(dateTime1);
    const dt2 = new Date(dateTime2);
    return dt1.getTime() > dt2.getTime();
}

module.exports = compareDateTime