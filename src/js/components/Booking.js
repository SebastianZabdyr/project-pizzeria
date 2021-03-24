import {templates, select, settings, classNames} from '../settings.js';
import AmountWidget from '../components/AmountWidget.js';
import DatePicker from '../components/DatePicker.js';
import HourPicker from '../components/HourPicker.js';
import utils from '../utils.js';

class Booking {

  constructor(element){
    const thisBooking = this;

    thisBooking.tablesInfo = '';
    thisBooking.starters = [];

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking:         settings.db.url + '/' + settings.db.booking
                                       + '?' + params.booking.join('&'),
      eventsCurrent:   settings.db.url + '/' + settings.db.event
                                       + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:    settings.db.url + '/' + settings.db.event
                                       + '?' + params.eventsRepeat.join('&'),
    };

    // console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log('bookings', bookings);
        //console.log('eventsCurrent', eventsCurrent);
        //console.log('eventsRepeat', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);

      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    //console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour ; hourBlock < startHour + duration; hourBlock += 0.5){
      //console.log('loop', hourBlock);
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    // picker value choose by user
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
    // all tables is Available = false
    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
     ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }
    // for all tables.dom in page .dom jpg MAP
    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
        table.classList.remove(classNames.booking.clickBooked);
        table.classList.remove(classNames.booking.tableSelected);
      }
    }
  }

  render(wrapper){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = wrapper;
    //console.log(element);
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.containerOfTables = thisBooking.dom.wrapper.querySelector(select.containerOf.tables);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.checkboxes = thisBooking.dom.wrapper.querySelector(select.booking.options);
    //console.log(thisBooking.dom.peopleAmount , thisBooking.dom.hoursAmount ,thisBooking.dom.datePicker, thisBooking.dom.hourPicker);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    //thisBooking.dom.peopleAmount.amountWidget.addEventListener('click', function(){});

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    //thisBooking.dom.hoursAmount.addEventListener('click', function(){});

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    thisBooking.hourPicker = new HourPicker (thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.containerOfTables.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.initTables(event);
    });

    thisBooking.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      thisBooking.sendBooking();
    });

    thisBooking.dom.checkboxes.addEventListener('click', function(event){
      thisBooking.startersForm(event);
    });
  }

  initTables(event){
    const thisBooking = this;

    let clickedElem = event.target;

    if (clickedElem.classList.contains(classNames.booking.table)){

      if (clickedElem.classList.contains(classNames.booking.tableBooked)){

        clickedElem.classList.add(classNames.booking.clickBooked);

      } else if (!clickedElem.classList.contains(classNames.booking.tableBooked) && !clickedElem.classList.contains(classNames.booking.tableSelected) ) {

        let tableId = clickedElem.getAttribute(settings.booking.tableIdAttribute);
        // let dataTable = clickedElement.getAttribute(settings.booking.tableIdAttribute);
        thisBooking.tablesInfo = tableId;
        clickedElem.classList.add(classNames.booking.tableSelected);

        for(let table of thisBooking.dom.tables){

          let floorTableId = table.getAttribute(settings.booking.tableIdAttribute);

          if (floorTableId !== thisBooking.tablesInfo && table.classList.contains(classNames.booking.tableSelected)){

            table.classList.remove(classNames.booking.tableSelected);
            clickedElem.classList.add(classNames.booking.tableSelected);
          }
        }
      } else if (clickedElem.classList.contains(classNames.booking.tableSelected)){
        clickedElem.classList.remove(classNames.booking.tableSelected);
      }
    }
  }

  startersForm(event){
    const thisBooking = this;

    if (event.target.tagName == 'INPUT' && event.target.type == 'checkbox'){

      if (event.target.checked == true){

        thisBooking.starters.push(event.target.value);

      } else if (event.target.checked == false){

        const indexOfFilters = thisBooking.starters.indexOf(event.target.value);

        thisBooking.starters.splice(indexOfFilters, 1);
      }
    }
  }

  sendBooking(){

    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.tablesInfo,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };
    /*
    console.log('date',payload.date,
      'hour',payload.hour,
      'table',payload.table,
      'duration',payload.duration,
      'ppl',payload.ppl,
      'starters',payload.starters,
      'phone',payload.phone,
      'address',payload.address
    );
*/
    for(let starters of thisBooking.starters){
      payload.starters.push(starters);
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }
}

export default Booking;
