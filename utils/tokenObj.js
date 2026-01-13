const isProduction = process.env.NODE_ENV === 'production';

const accessTokenobj = {
    httpOnly: true,
    secure: true, // Always use secure in this setup as both Vercel and Render are HTTPS
    sameSite: 'none', // Required for cross-site cookie usage
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const refreshTokenobj = {
    httpOnly: true,
    secure: true, // Always use secure in this setup
    sameSite: 'none', // Required for cross-site cookie usage
    maxAge: 7 * 24 * 60 * 60 * 1000
};

module.exports = {
    accessTokenobj,
    refreshTokenobj
};