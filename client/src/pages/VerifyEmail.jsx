import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5002/api/auth';

export default function VerifyEmail() {
const [status, setStatus] = useState('loading');
const [message, setMessage] = useState(
'Verifying your email address...'
);

useEffect(() => {
const params = new URLSearchParams(window.location.search);
const token = params.get('token');


if (!token) {
  setStatus('error');
  setMessage('The verification link is missing its token.');
  return;
}

async function verifyEmail() {
  try {
    const response = await fetch(
      `${API_URL}/verify-email?token=${encodeURIComponent(token)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Email verification failed.'
      );
    }

    setStatus('success');
    setMessage(
      data.message || 'Your email has been verified successfully.'
    );
  } catch (error) {
    setStatus('error');
    setMessage(
      error.message || 'Unable to verify your email. Please try again.'
    );
  }
}

verifyEmail();


}, []);

return ( <div className="container" style={styles.page}> <div style={styles.card}> <h1 style={styles.heading}>School Lost and Found</h1> <h2>Email Verification</h2>

```
    <p>{message}</p>

    {status === 'loading' && (
      <p>Please wait while we verify your email.</p>
    )}

    {status === 'success' && (
      <Link to="/login" style={styles.button}>
        Go to Login
      </Link>
    )}

    {status === 'error' && (
      <Link to="/register" style={styles.button}>
        Return to Registration
      </Link>
    )}
  </div>
</div>


);
}

const styles = {
page: {
minHeight: '80vh',
display: 'flex',
justifyContent: 'center',
alignItems: 'center',
padding: '20px',
},
card: {
width: '100%',
maxWidth: '480px',
background: '#ffffff',
padding: '32px',
borderRadius: '12px',
textAlign: 'center',
boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
color: '#1f2937',
},
heading: {
color: '#0f766e',
},
button: {
display: 'inline-block',
marginTop: '16px',
padding: '12px 20px',
background: '#0f766e',
color: '#ffffff',
borderRadius: '6px',
textDecoration: 'none',
},
};
