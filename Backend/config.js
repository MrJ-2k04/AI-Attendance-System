
const APP_PORT = process.env.NODE_ENV === 'production' ? 80 : 8080;
const DB_CONNECTION_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/AI_Attendance_System';
const FRONTEND_URL = process.env.NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || `https://ai-attendance-system.pages.dev`)
    : `http://localhost:3000`
// const MAIL_TRANSPORTER_AUTH = {
//     user: "savaridekho@gmail.com",
//     pass: "vfhw ytof dojc gokm",
// }
const LINKS = {
    // RIDE_DETAILS: `${FRONTEND_URL}/rides/:rideId`,
    // WALLET: `${FRONTEND_URL}/wallet`,
    // SEARCH_RIDES: `${FRONTEND_URL}/search-rides`,
    // PUBLISH_RIDE: `${FRONTEND_URL}/rides/publish`,
    // RAISE_TICKET: `${FRONTEND_URL}/ticket`,
    // USER_PROFILE: `${FRONTEND_URL}/profile`,
    // VEHICLE_DETAILS: `${FRONTEND_URL}/vehicle/:vehicleId`,
}


module.exports = {
    APP_PORT,
    DB_CONNECTION_URL,
    LINKS,
}