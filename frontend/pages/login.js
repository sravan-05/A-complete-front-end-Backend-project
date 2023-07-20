import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3004/login', {
        email,
        password,
      });
      if (response.status === 200 && response.data.redirect) {
        console.log(response.data.message);
        Cookies.set('sessionToken', response.data.sessionToken);
        router.push(response.data.redirect);
      } else {
        console.error(response.data.error);
      }
    } catch (error) {
     setError('Enter exact User name / Password.');
    }
  };

  useEffect(() => {

    const sessionToken = Cookies.get('sessionToken');
    console.log('Session Token:', sessionToken);
    if (sessionToken) {
      router.push('/home');
    }
  }, [router]);  

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        backgroundColor: 'lavender',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1>Login</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label htmlFor="email" style={{ marginRight: '0.5rem' }}>
              Email:
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label htmlFor="password" style={{ marginRight: '0.5rem' }}>
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
