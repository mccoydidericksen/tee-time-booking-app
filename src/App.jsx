import React, { useState } from 'react';
import Calendar from './Calendar.jsx';

const App = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [validated, setValidated] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [calendlyLink, setCalendlyLink] = useState('');
  const getBookingLink = async () => {
    const bookingLink = await fetch('https://overlake-sms-backend-36d6c761a65b.herokuapp.com/calendly/getLink', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(async (response) => {
      const resp = await response.json();
      return resp['data']['resource']['booking_url']
    })
    return bookingLink
  }
  const validateCode = async (event) => {
    event.preventDefault();
    // get security code from input element
    const inputCode = event.target[0].value;
    // validate otp
    const codeMatch = await fetch('https://overlake-sms-backend-36d6c761a65b.herokuapp.com/sms/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 'phoneNumber': phoneNumber, 'code': inputCode }),
    }).then(async (response) => {
      const resp = await response.json();
      return resp['data']['valid'];
    });
    if (codeMatch) {
      // close modal
      document.getElementById('security_modal').checked = false;
      // set validated to true
      setValidated(true);
      const link = await getBookingLink();
      setCalendlyLink(link);
    } else {
      // close modal
      document.getElementById('security_modal').checked = false;
      // display error message by checking hidden checkbox
      document.getElementById('invalid_code').checked = true;
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    fetch('https://overlake-sms-backend-36d6c761a65b.herokuapp.com/validate-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    }).then(async (response) => {
      const { isValid, phoneNumber, name, email } =
        await response.json();
      if (isValid) {
        setName(name);
        setEmail(email);
        const resp = await fetch('https://overlake-sms-backend-36d6c761a65b.herokuapp.com/sms/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber }),
        });
        document.getElementById('security_modal').checked = true;
      } else {
        // display error message by checking hidden checkbox
        document.getElementById('access_denied').checked = true;
      }
    });
  };
  if (validated) {
    return <Calendar  person={{ name: name, email: email, phoneNumber: phoneNumber, calendlyLink: calendlyLink }}/>;
  } else {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <input type="checkbox" id="access_denied" className="modal-toggle" />
          <div className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Access Denied</h3>
              <p className="py-4">
                The phone number submitted does not match any member records.
              </p>
              <div className="modal-action">
                <label htmlFor="access_denied" className="btn">
                  Close!
                </label>
              </div>
            </div>
          </div>
          <input type="checkbox" id="invalid_code" className="modal-toggle" />
          <div className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Access Denied</h3>
              <p className="py-4">
                The security code entered does not match the code sent to the
                phone number provided.
              </p>
              <div className="modal-action">
                <label htmlFor="invalid_code" className="btn">
                  Close!
                </label>
              </div>
            </div>
          </div>
          <input type="checkbox" id="security_modal" className="modal-toggle" />
          <div className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg">SMS Verification</h3>
              <p className="py-4">
                A text message has been sent to the phone number provided. Please
                enter the code below to continue.
              </p>
              <form onSubmit={validateCode}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Security Code</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter the code from the text message"
                    className="input input-bordered"
                    ></input>
                </div>
                <div className="form-control mt-6">
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </div>
              </form>
            
              <div className="modal-action">
                <label htmlFor="security_modal" className="btn">
                  Close!
                </label>
              </div>
            </div>
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold">⛳️ The Links at Overlake</h1>
            <p className="py-6">
              Enter the phone number associated with your membership to book a
              tee time.
            </p>
          </div>
          <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="input input-bordered"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                  />
                </div>
                <div className="form-control mt-6">
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default App;
