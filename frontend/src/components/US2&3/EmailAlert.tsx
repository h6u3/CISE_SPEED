import React, { useState } from 'react';

const EmailAlert: React.FC = () => {
  const [email, setEmail] = useState<string>("");

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // Handle button click to show the alert
  const showAlert = () => {
    if (email) {
      alert(`The email you entered is: ${email}`);
    } else {
      alert('Please enter a valid email.');
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={handleInputChange}
      />
      <button onClick={showAlert}>Submit</button>
    </div>
  );
};

export default EmailAlert;
