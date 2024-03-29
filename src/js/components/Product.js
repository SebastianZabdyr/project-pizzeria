import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data= data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

  //  console.log('new Product:', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;

    /* generate html based on tempates */

    const generatedHTML = templates.menuProduct(thisProduct.data);
    //console.log(thisProduct.data);
    /*create element using utilis.createElementFromHTML*/

    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */

    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */

    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  initAccordion(){
    const thisProduct = this;

    /* START: add event listener to clickable trigger on event click */

    thisProduct.accordionTrigger.addEventListener('click', function(event) {

      /* prevent default action for event */

      event.preventDefault();

      //  console.log('trigger',thisProduct.accordionTrigger);

      /* find active product (product that has active class) */

      const activeProduct = document.querySelectorAll(select.all.menuProductsActive);

      //console.log(activeProduct);

      /* if there is active product and it's not thisProduct.element, remove class active from it */

      for(let product of activeProduct){
        /////////if VER 1 ///////
        if (activeProduct != null && activeProduct != thisProduct.element){
          product.classList.remove('active');
        }
        ////////if VER 2 ///////////
        /*           if(activeProduct != null && activeProduct != thisProduct.element){
         product.classList.add('active');}
         else if (activeProduct = thisProduct.element){
         product.classList.remove('active');}
*/
      }
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');
    });
  }

  initOrderForm(){
    const thisProduct = this;

    //  console.log('initOrderForm',thisProduct);
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}

    const formData = utils.serializeFormToObject(thisProduct.form);

    //  console.log('formData', formData);

    // set price to default price

    let price = thisProduct.data.price;

    // for every category (param)...

    for(let paramId in thisProduct.data.params) {

      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }

      const param = thisProduct.data.params[paramId];

      //console.log(paramId, param);

      // for every option in this category

      for(let optionId in param.options) {

        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }

        const option = param.options[optionId];
        //console.log(optionId, option);

        // check if there is param with a name of paramId in formData and if it includes optionId

        const activeOption = formData[paramId] && formData[paramId].includes(optionId);

        // check if the option is not default

        if (activeOption && !option.default){

          // add option price to price variable

          price  =  option.price  + price;
        }

        // check if the option is default

        else if (!activeOption && option.default){

          // reduce price variable

          price = price - option.price;
        }

        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);

        if (optionImage){

          if (activeOption){

            optionImage.classList.add(classNames.menuProduct.imageVisible);

          } else if (!activeOption){

            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }

    // update calculated price in the HTML

    thisProduct.priceSingle = price;

    price *= thisProduct.amountWidget.value;

    thisProduct.priceElem.innerHTML = price;

  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    // app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart',{
      bubbles: true,
      detail: {
        product: thisProduct,
      }
    });

    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams(),
    };

    return productSummary;

  }

  prepareCartProductParams(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);

    const params = {};

    // for every category (param)...
    for(let paramId in thisProduct.data.params) {

      const param = thisProduct.data.params[paramId];

      params[paramId] = {
        name: param.label,
        options: {}
      };

      // for every option in this category
      for(let optionId in param.options){

        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }

        const option = param.options[optionId];

        // check if there is param with a name of paramId in formData and if it includes optionId

        const optionActive = formData[paramId] && formData[paramId].includes(optionId);

        if (optionActive){

          params[paramId].options[optionId] = option.label;

        }
      }
    }

    return params;
  }

}

export default Product;
