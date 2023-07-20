import { useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function Home() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const sessionToken = Cookies.get('sessionToken'); 
      const response = await axios.get('http://localhost:3004/logout', {
        withCredentials:true,
      });
      if (response.status === 200 && response.data.redirect) {
        console.log(response.data.message);
        Cookies.remove('sessionToken');
        router.push(response.data.redirect);
      } else {
        console.error(response.data.error);
        router.push('/login');
      }
    } catch (error) {
      console.error(error);
      router.push('/login');
    }
  };

  useEffect(() => {
    const sessionToken = Cookies.get('sessionToken');
    if (!sessionToken) {
      router.push('/login');
    }
  }, []);

  return (
    <div>
      <h1>Welcome to Home Page!</h1>
      <p>A part of Home page</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
