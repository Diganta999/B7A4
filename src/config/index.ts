import dotenv from 'dotenv';
import path from 'path';
dotenv.config({path:path.join(process.cwd(),'.env')});


export default {
    PORT: process.env.PORT || 5000,
    database_url: process.env.DATABASE_URL ,
    bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS ,
    app_url: process.env.APP_URL ,
    jwt_secret: process.env.JWT_SECRET ,
    jwt_expiration: process.env.JWT_EXPIRATION ,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET ,
    jwt_refresh_expiration: process.env.JWT_REFRESH_EXPIRATION ,
    stripe_secret_key: process.env.STRIPE_SECRET_KEY,
}