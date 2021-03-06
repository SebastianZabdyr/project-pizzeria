/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
/*eslint no-unused-vars: "error"*/
{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
  // CODE ADDED END
  };

  const settings = {
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
  // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  // CODE ADDED END
  };

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

        console.log('trigger',thisProduct.accordionTrigger);

        /* find active product (product that has active class) */

        const activeProduct = document.querySelectorAll(select.all.menuProductsActive);

        console.log(activeProduct);

        /* if there is active product and it's not thisProduct.element, remove class active from it */

        for(let product of activeProduct){
          /////////if VER 1 ///////
          if(activeProduct != null && activeProduct != thisProduct.element){
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

          if(activeOption && !option.default){

            // add option price to price variable

            price  =  option.price  + price;
          }

          // check if the option is default

          else if(!activeOption && option.default){

            // reduce price variable

            price = price - option.price;
          }

          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);

          if(optionImage){

            if(activeOption){

              optionImage.classList.add(classNames.menuProduct.imageVisible);

            }else if(!activeOption){

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

      app.cart.add(thisProduct.prepareCartProduct());
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

          if(optionActive){

            params[paramId].options[optionId] = option.label;

          }
        }
      }

      return params;
    }

  }

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

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      console.log(thisCart.dom.toogleTrigger);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(){
        thisCart.remove(event.detail.cartProduct);
      });
      thisCart.dom.form.addEventListener('submit', function(){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    sendOrder(){

      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.order;

      const payload = {
        address: thisCart.dom.address,
        phone: thisCart.dom.phone,
        totalPrice: thisCart.totalPrice,
        subTotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [] ,
      };
      console.log('total', thisCart.totalPrice, 'subt', thisCart.subtotalPrice, 'num', thisCart.totalNumber, 'del', thisCart.deliveryFee );

      for(let prod of thisCart.products){
     payload.products.push(prod.getData());
   }

   console.log(payload);

   const options = {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify(payload),
   };

   fetch(url, options);
 }

    add(menuProduct){

      console.log('adding prod.', menuProduct);

      const thisCart = this;

      /* generate html based on tempates */

      const generatedHTML = templates.cartProduct(menuProduct);

      /*create element using utilis.createElementFromHTML*/

      thisCart.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */

      ///  const productList = document.querySelector(select.cart.productList);

      /* add element to menu */

      thisCart.dom.productList.appendChild(thisCart.element);
      thisCart.products.push(new CartProduct(menuProduct, thisCart.element));

      console.log('thisCart.products=', thisCart.products);

      thisCart.update();

    }


    update(){

      const thisCart = this;

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for(let product of thisCart.products){
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }

      if(thisCart.totalnumber != 0){
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

        console.log('total', thisCart.totalPrice, 'subt', thisCart.subtotalPrice, 'num', thisCart.totalNumber, 'del', thisCart.deliveryFee );
      }

      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;

    }

    remove(thisCartProduct){

      const thisCart = this ;
      const indexOfCartProduct = thisCart.products.indexOf(thisCartProduct);
      const removedCartProduct = thisCart.products.splice(indexOfCartProduct, 1);
      const thisRemovedCartProduct = thisCart.dom.wrapper.querySelector(select.cart.productList);
      console.log(removedCartProduct);
      thisRemovedCartProduct.remove();
      thisCart.update();
    }
  }

  class CartProduct{

    constructor(menuProduct , element){

      const thisCartProduct = this;

      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
      console.log(thisCartProduct);
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove(){
      const thisCartProduct = this;
      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(){
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function(){
      });
      thisCartProduct.dom.remove.addEventListener('click', function(){
        thisCartProduct.remove();
      });
    }

    getData(){
      const thisCartProduct = this;

      const productSummary = {
        id: thisCartProduct.id,
        name: thisCartProduct.name,
        amount: thisCartProduct.amount,
        priceSingle: thisCartProduct.priceSingle,
        price: thisCartProduct.price,
        params: thisCartProduct.params,
      };

      return productSummary;

    }
  }

  const app = {
    initData: function(){
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.product;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){

          /* save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;

          /* execute initMenu method*/
          thisApp.initMenu();

        });

      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },


    initMenu: function(){
      const thisApp = this;

      console.log('thisApp.data', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();

}
