import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import './config/supabase.js'; // Ensure Supabase checks run

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
