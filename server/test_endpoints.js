const endpoints = [
  { method: 'GET', path: '/' },
  { method: 'GET', path: '/video/getall' },
  { method: 'GET', path: '/like/1' },
  { method: 'GET', path: '/watch/1' },
  { method: 'GET', path: '/history/1' },
  { method: 'GET', path: '/comment/1' },
  { method: 'POST', path: '/user/login', body: { email: 'test@example.com', password: 'pass' } },
];

(async () => {
  for (const e of endpoints) {
    try {
      const res = await fetch('http://localhost:5000' + e.path, {
        method: e.method,
        headers: { 'Content-Type': 'application/json' },
        body: e.body ? JSON.stringify(e.body) : undefined,
      });
      const text = await res.text();
      console.log('---', e.method, e.path, 'STATUS', res.status);
      console.log(text.slice(0, 1000));
    } catch (err) {
      console.log('---', e.method, e.path, 'ERROR', err.message);
    }
  }
})();