import React from 'react';

function Calendar() {
  return (
    <div>
      <iframe className='hero min-h-screen bg-base-200'
        src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ0UorRHpnLx-5IPZ8BOnthdxoGQLi25V_oSsdWwOzmolrTrIL4RCf0EkX6x4Q5OasOo-_0k4H8X?gv=true&ctz=America%2FDenver"
      ></iframe>
    </div>
  );
}

export default Calendar;
