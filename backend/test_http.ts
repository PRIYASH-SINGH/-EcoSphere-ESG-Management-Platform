async function testHttp() {
  try {
    const res = await fetch('http://localhost:5173/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ecosphere.com',
        password: 'wrongpassword'
      })
    });
    console.log('HTTP Status:', res.status);
    const data = await res.json();
    console.log('HTTP Data:', data);
  } catch (err: any) {
    console.error('HTTP Error:', err.message);
  }
}

testHttp();
