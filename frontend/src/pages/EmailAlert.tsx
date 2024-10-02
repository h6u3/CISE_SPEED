import React, { useState } from 'react';

const EmailAlert: React.FC = () => {
  const [email, setEmail] = useState<string>(''); 
  const [message, setMessage] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/save-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage(`Email saved successfully: ${email}`);
      } else {
        setMessage('Failed to save email.');  // Updated failure message
      }
    } catch (error) {
      console.error('Error saving email:', error);
      setMessage('Error occurred while saving email.');  // Updated error handling
    }
  };

  return (
    <div>
      <h2>Subscribe to Email Notifications</h2>  
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={handleInputChange}
      />
      <button onClick={handleSubmit}>Submit</button>  
      {message && <p>{message}</p>}  
    </div>
  );
};

export default EmailAlert;
