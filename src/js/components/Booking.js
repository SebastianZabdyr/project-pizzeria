import {templates, select} from '../settings.js';
import AmountWidget from '../components/AmountWidget.js';
import DatePicker from '../components/DatePicker.js';
//import HourPicker from '../components/HourPicker.js';

class Booking {

  constructor(element){
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget(element);

    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;
    //console.log(element);
    element.innerHTML = generatedHTML;

    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    console.log(thisBooking.dom.peopleAmount , thisBooking.dom.hoursAmount ,thisBooking.dom.datePicker, thisBooking.dom.hourPicker);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    //thisBooking.dom.peopleAmount.amountWidget.addEventListener('click', function(){});

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    //thisBooking.dom.hoursAmount.addEventListener('click', function(){});

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    //thisBooking.hourPicker = new HourPicker (thisBooking.dom.hourPicker);
  }
}

export default Booking;
