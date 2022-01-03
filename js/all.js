
const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
const cartList = document.querySelector('.shoppingCart-tableList');

let productData = [];
let cartData = [];


// 初始化
function init(){
  getProductList();
  getCartList()
}
init();

// axiox
function getProductList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
  .then(function (response) {
    productData = response.data.products;
    renderProduct();
    
  })
  .catch(function (error) {
    console.log(error.response.data);
  });
}

// 商品字串(重構HTML)
function mixHTMLItem(item){
  return `<li class="productCard">
          <h4 class="productType">新品</h4>
          <img src="${item.images}" alt="">
          <a href="#" id="addCardBtn" class="js-addCart" data-id="${item.id}">加入購物車</a>
          <h3>${item.title}</h3>
          <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
          <p class="nowPrice">NT$${toThousands(item.price)}</p>
          </li>`
}

// 商品渲染到畫面  
function renderProduct(){
  let str = '';
  productData.forEach(item => {
    str +=  mixHTMLItem(item);
  });

  productList.innerHTML = str;
}

// 監聽 Select
productSelect.addEventListener('change',function(e){
  // console.log(e.target.value);
  const category = e.target.value;
  if (category == '全部') {
    renderProduct();
    return;
  }

  let str = '';
  productData.forEach(item => {
    if(item.category == category){
      str += mixHTMLItem(item);
    }
  });
  productList.innerHTML = str;
})

// 監聽 加入購物車
productList.addEventListener('click',function(e){
  //取消預設默認行為（#）
  e.preventDefault();
  // console.log(e.target.getAttribute('data-id'));

  let addCartClass = e.target.getAttribute('class');
  if(addCartClass !== 'js-addCart'){
    return;
  }
  let productId = e.target.getAttribute('data-id');
  // console.log(productId);

  // 發動post事件 加入購物車流程
  let numCheck = 1;
  cartData.forEach(item => {
    if (item.product.id === productId) {
      numCheck = item.quantity+=1;
    }
  });

  // console.log(numCheck);
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
    "data": {
      "productId": productId,
      "quantity": numCheck
    }
  }).then(function (response) {
    alert('加入購物車成功');
    getCartList();
  })
  .catch(function (error) {
    console.log(error.response.data);
  });
})

//取得購物車列表 axios
function getCartList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
  .then(function (response) {
    console.log(response.data.finalTotal);
    document.querySelector('.js-total').textContent = toThousands(response.data.finalTotal);

    cartData = response.data.carts;
    //組字串
    let str = '';
    cartData.forEach(item => {
      str += `<tr>
                <td>
                    <div class="cardItem-title">
                        <img src="${item.product.images}" alt="">
                        <p>${item.product.title}</p>
                    </div>
                </td>
                <td>NT$${toThousands(item.product.price)}</td>
                <td>
                <a href="#"><span class="material-icons cartAmount-icon" data-num="${item.quantity - 1}" data-id="${item.id}">remove</span></a>
            <span>${item.quantity}</span>
            <a href="#"><span class="material-icons cartAmount-icon" data-num="${item.quantity + 1}" data-id="${item.id}">add</span></a>
                </td>
                <td>NT$${toThousands(item.product.price * item.quantity)}</td>
                <td class="discardBtn">
                    <a href="#" class="material-icons delSingleBtn" data-id="${item.id}">
                        clear
                    </a>
                </td>
              </tr>`
    });
    
    cartList.innerHTML = str;
  
    let alldelSingleBtn = document.querySelectorAll('.delSingleBtn');
    alldelSingleBtn.forEach(function(item) {
       item.addEventListener('click', function(e){
         e.preventDefault();
         delSingleCart(e.target.dataset.id);
       })
     })
    
    let allAountBtn = document.querySelectorAll('.cartAmount-icon');
    allAountBtn.forEach(function(item) {
     item.addEventListener('click', function(e){
       e.preventDefault();
       let aountId = e.target.dataset.id;
       let aountNum = parseInt(e.target.dataset.num);
       
       if(aountNum ==0){
         delSingleCart(aountId)
       }else{
         editNum(aountId,aountNum)
       }
       
     })
   })
    

  })
  .catch(function (error) {
    console.log(error.response.data);
  });
}

function editNum(aountId,aountNum){
  
  let url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
  let data ={
  "data": {
    "id": aountId,
    "quantity": aountNum
  }
}

  axios.patch(url,data)
    .then(function (res) {
     getCartList()
    })
    .catch(function (error) {
      console.log(error);
    })
}

function delSingleCart (id) {
  let url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${id}`;
  axios.delete(url)
    .then(function (res) {
      getCartList();
      setTimeout(function(){ alert("成功刪除此筆訂單"); }, 500);  
    })
    .catch(function (error) {
      console.log(error);
    })
}


//刪除單筆購物車成功
// cartList.addEventListener('click',function (e) {
//   e.preventDefault();
//   // console.log(e.target);
  
//   // const cartId = e.target.getAttribute('class');
//   // if (cartId == '.delSingleBtn')
//   const cartId = e.target.getAttribute('data-id');
//   if (cartId == null){
//     // alert('請點正確');
//     return;
//   }
//   // console.log(cartId);
//   axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
//   .then(function (response) {
//     e.preventDefault();
//     alert('刪除單筆購物車成功');
//     getCartList();
    
//   }).catch(err=>consle.log(err))
// })

//刪除所有品項
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',function(e) {
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
  .then(function (response) {
    alert('刪除全部購物車成功!!');
    getCartList();
  })
  .catch(function (error) {
    alert('購物車已清空，請勿重複點擊!!');
  });
})


//送出訂單
const orderInfoBtn = document.querySelector('.orderInfo-btn');
orderInfoBtn.addEventListener('click',function(e) {
  e.preventDefault();
  if (cartData.length == 0) {
    alert('您的購物車是空的，請選購商品～');
    return;
  }

  //資料有沒有值
  const customerName = document.querySelector('#customerName').value;
  const customerPhone = document.querySelector('#customerPhone').value;
  const customerEmail = document.querySelector('#customerEmail').value;
  const customerAddress = document.querySelector('#customerAddress').value;
  const customerTradeWay = document.querySelector('#tradeWay').value;

  // console.log(customerName, customerPhone, customerEmail, customerAddress, customerTradeWay);
  if (customerName =='' || customerPhone =='' || customerEmail =='' || customerAddress =='' || customerTradeWay =='' ) {
    alert('請輸入訂單資訊');
    return;
  }
  if (validateEmail(customerEmail)==false){
    alert("請填寫正確的Email");
    return;
  }

  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": customerTradeWay
      }
    }
  }).then(function(params) {
    alert('訂單建立成功!!');
    document.querySelector('#customerName').value = "";
    document.querySelector('#customerPhone').value = "";
    document.querySelector('#customerEmail').value = "";
    document.querySelector('#customerAddress').value = "";
    document.querySelector('#tradeWay').value = "ATM";
    getCartList();
  })



})


const customerPhone = document.querySelector("#customerPhone");
customerPhone.addEventListener("blur",function(e){
  if (validateEmail(customerPhone.value) == false) {
    document.querySelector(`[data-message="電話"]`).textContent = "請填寫正確 電話 格式";
    return;
  }
})

const customerEmail = document.querySelector("#customerEmail");
customerEmail.addEventListener("blur",function(e){
  if (validateEmail(customerEmail.value) == false) {
    document.querySelector(`[data-message=Email]`).textContent = "請填寫正確 Email 格式";
    return;
  }
})

const customerAddress = document.querySelector("#customerAddress");
customerAddress.addEventListener("blur",function(e){
  if (validateEmail(customerAddress.value) == false) {
    document.querySelector(`[data-message=寄送地址]`).textContent = "請填寫正確 地址 格式";
    return;
  }
})



//千分位
function toThousands(x) { 
  let parts = x.toString().split("."); parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); 
  return parts.join("."); 
}

//驗證email
function validateEmail(mail) {
  if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
    return true
  }
  return false;
}

//驗證phone
function validatePhone(phone) {
  if (/^[09]{2}\d{8}$/.test(phone)) {
    return true
  }
  return false;
}

//驗證地址 成功(?!)
// 參考 https://dotblogs.com.tw/hatelove/2012/06/05/parse-taiwan-address-with-regex
// https://devgitlab.cqiserv.com/serv/drawplaystation/-/blob/76ed138e079ed02a31779146b5c9dbccde72665f/Client/Pages/Home/Controller.cs
function validateAddress(address) {
  if (/(?<zipcode>(^\d{5}|^\d{3})?)(?<city>\D+[縣市])(?<district>\D+?(市區|鎮區|鎮市|[鄉鎮市區]))(?<others>.+)/.test(address)) {
    return true
  }
  return false;
}

