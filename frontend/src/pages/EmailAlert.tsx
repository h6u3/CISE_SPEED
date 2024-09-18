import React, { useState } from 'react';

const EmailAlert: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, message: 'Your custom message here!' }),
      });

      if (response.ok) {
        alert(`Email sent to: ${email}`);
      } else {
        alert('Failed to send email.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error occurred while sending email.');
    }
  };

  return (
    <div>
      <h2>Email Alert Page</h2>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={handleInputChange}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default EmailAlert;
