import {settings, select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from '../components/CartProduct.js';

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

    //const productList = document.querySelector(select.cart.productList);

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

    if(thisCart.totalnumber !== 0){
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

      console.log('total', thisCart.totalPrice, 'subtotal', thisCart.subtotalPrice, 'number', thisCart.totalNumber, 'delivery', thisCart.deliveryFee );
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

export default Cart;
