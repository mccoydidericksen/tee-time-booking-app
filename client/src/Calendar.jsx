import React from 'react';
import { InlineWidget } from 'react-calendly';

function Calendar() {
  // Select the node that will be observed for mutations
  const targetNode = document.getElementById("root");

  // Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        console.log("A child node has been added or removed.");
      } else if (mutation.type === "attributes") {
        console.log(`The ${mutation.attributeName} attribute was modified.`);
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);

  // Later, you can stop observing
  observer.disconnect();
  // buttons.forEach((button) => {
  //   button.addEventListener('click', (event) => {
  //     console.log('button clicked');
  //     calendlyDiv.addEventListener('change', (event) => {
  //       //get phone number input element with name="phone_number"
  //       const phoneInputEl = document.querySelector(
  //         'input[name="phone_number"]'
  //       );
  //       console.log(phoneInputEl);
  //       if (phoneInputEl) {
  //         // set phone number input element to value of phoneNumber
  //         phoneInputEl.value = phoneNumber;
  //         // disable phone number input element
  //         phoneInputEl.disabled = true;
  //       }
  //     });
  //   });
  // });
  return (
    <div>
      <InlineWidget url="https://calendly.com/overlakegolfbooking/tee-time" />
    </div>
  );
}

export default Calendar;
