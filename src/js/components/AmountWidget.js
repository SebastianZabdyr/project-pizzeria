import {settings, select} from '../settings.js';

class AmountWidget{
  constructor(element){
    const thisWidget = this;

    //    console.log('amount widget',thisWidget,'cons arg',element);
    thisWidget.getElements(element);
    thisWidget.setValue(settings.amountWidget.defaultValue);
    thisWidget.initActions();
  }

  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value){

    const thisWidget = this;
    const newValue = parseInt(value);

    /* VALIDATION */

    thisWidget.value = newValue;
    thisWidget.input.value = thisWidget.value;

    if(thisWidget.value !== newValue && !isNaN(newValue)){
      thisWidget.value = newValue;
    }
    else if(newValue <= settings.amountWidget.defaultMin){
      thisWidget.value = settings.amountWidget.defaultMin;
    }
    else if(newValue >= settings.amountWidget.defaultMax){
      thisWidget.value = settings.amountWidget.defaultMax;
    }
    thisWidget.announce();
  }

  initActions(){

    const thisWidget = this;

    thisWidget.input.addEventListener('change',function(){

      thisWidget.setValue(thisWidget.input.value);
    });
    //  console.log(thisWidget.input);

    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated',{
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;
