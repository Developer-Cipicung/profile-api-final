import dotenv from 'dotenv';
dotenv.config();

const url = `${process.env.SUPABASE_URL}/rest/v1/news?select=*`;

async function test() {
  console.log(`Fetching from: ${url}`);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const text = await response.text();
    console.log('Response Body:', text);
  } catch (err) {
    console.error('Fetch Failed:', err);
  }
}

test();
