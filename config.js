require('dotenv').load();
const PORT= process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
const FX_DATABASE_URL = process.env.FX_DATABASE_URL;
const TIMER = process.env.TIMER
const ORIGIN = process.env.ORIGIN

module.exports = {
    PORT,
    JWT_SECRET,
    FX_DATABASE_URL,
    TIMER,
    ORIGIN
}