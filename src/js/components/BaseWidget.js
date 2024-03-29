
class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;

    //thisWidget.setValue(settings.amountWidget.defaultValue);
  }

  get value(){
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value){

    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);

    /* VALIDATION */

    //thisWidget.correctValue = newValue;

    if (newValue != thisWidget.correctValue && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;

      thisWidget.announce();
    }
    /*
    else if(newValue <= settings.amountWidget.defaultMin){
      thisWidget.correctValue = settings.amountWidget.defaultMin;
    }
    else if(newValue >= settings.amountWidget.defaultMax){
      thisWidget.correctValue = settings.amountWidget.defaultMax;
    }
    */

    thisWidget.renderValue();
  }

  setValue(value){
    const thisWidget = this;

    thisWidget.value = value;
  }

  parseValue(value){
    return parseInt(value);
  }

  isValid(value){
    return !isNaN(value);
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated',{
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }

}

export default BaseWidget;
