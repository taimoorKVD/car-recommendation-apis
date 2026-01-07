import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
    throw new Error('❌ OPENAI_API_KEY is missing in environment variables');
}