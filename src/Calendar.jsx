import React from 'react';
import { InlineWidget } from 'react-calendly';

function Calendar(props) {
  return (
    <>
      <div className="navbar bg-base-100">
        <a className="btn btn-ghost normal-case text-xl">The Links at Overlake Tee Times</a>
      </div>
      <div>
        <InlineWidget
          url={props.person.calendlyLink}
          pageSettings={{
            backgroundColor: 'ffffff',
            hideEventTypeDetails: true,
            hideLandingPageDetails: true,
            primaryColor: '00a2ff',
            textColor: '4d5055',
          }}
          prefill={{
            email: props.person.email,
            name: props.person.name,
            customAnswers: {
              a1: `+1${props.person.phoneNumber}`,
              a2: '1',
            },
          }}
        />
      </div>
    </>
  );
}

export default Calendar;
