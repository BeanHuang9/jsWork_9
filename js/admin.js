let orderData = [];
const orderList = document.querySelector('.js-orderList');

function init(){
  getOrderList();
}
init();



function getOrderList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
    headers:{
      'Authorization':token,
    }
  })
  .then(function (response) {
    orderData = response.data.orders;
    
    let str = '';
    orderData.forEach(item => {
      //組時間字串
      const timeStamp = new Date(item.createdAt*1000);
      const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;

      //組產品字串
      let productStr = '';
      item.products.forEach(productItem => {
        productStr += `<p>${productItem.title}x${productItem.quantity}</p>`
      })

      //判斷訂單處理狀態
      let orderStatus = '';
      if(item.paid == true) {
        orderStatus = '已處理';
      }else{
        orderStatus = '未處理';
      }

      //組訂單字串
      str += `<tr>
              <td>${item.id}</td>
              <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
              </td>
              <td>${item.user.address}</td>
              <td>${item.user.email}</td>
              <td>
                ${productStr}
              </td>
              <td>${orderTime}</td>
              <td class="js-orderStatus">
                <a href="#" data-status="${item.paid}" class="orderStatus" data-id="${item.id}">${orderStatus}</a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
              </td>
          </tr>`
    });
    orderList.innerHTML = str;
    renderC3();
  })
}

orderList.addEventListener('click',function(e){
  e.preventDefault();
  //刪除
  const targetClass = e.target.getAttribute('class');
  console.log(targetClass);

  let id = e.target.getAttribute('data-id'); 
  if (targetClass == "delSingleOrder-Btn js-orderDelete") {
    deletOrderItem(id);
    return;
  }
  
  if (targetClass == "orderStatus") {
    let status = e.target.getAttribute('data-status');
    changeOrderStatus(status,id)
    return;
  }

})


function changeOrderStatus(status,id) {
  console.log(status,id);
  let newStatus;
  if(status==true){
    newStatus=false;
  }else{
    newStatus=true
  }
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
    "data": {
      "id": id,
      "paid": newStatus
    }
  } ,{
    headers: {
      'Authorization': token,
    }
  })
  .then(function(reponse){
    alert("修改訂單成功");
    getOrderList();
  })
}

function deletOrderItem(id){
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`, {
    headers: {
      'Authorization': token,
    }
  })
    .then(function(response){
      alert("刪除該筆訂單成功");
      getOrderList();
    })
  
}


const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
    headers: {
      'Authorization': token,
    }
  })
    .then(function (response) {
      alert("刪除全部訂單成功");
      getOrderList();
    })
})

// c3
function renderC3() {
  //資料蒐集
  let total = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (total[productItem.title] === undefined) {
        total[productItem.title] = productItem.quantity * productItem.price;
      } else {
        total[productItem.title] += productItem.quantity * productItem.price;

      }
    })
  });
  console.log(total);
  
  // 資料關聯
  let originAry = Object.keys(total);
  // console.log(originAry);
  let rankSortAry = [];
  
  originAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    rankSortAry.push(ary);
  });
  // console.log(rankSortAry);
  rankSortAry.sort(function (a, b) {
    return b[1] - a[1];
  })
  
  // 超過 4 筆以上 統整為其它
  if (rankSortAry.length > 3) {
    let otherTotal = 0;
    rankSortAry.forEach(function (item, index) {
      if (index > 2) {
        otherTotal += rankSortAry[index][1];
      }
    })
    rankSortAry.splice(3, rankSortAry.length - 1);
    rankSortAry.push(['其他', otherTotal]);
  }

  c3.generate({
    bindto: '#chart',
    data: {
      columns: rankSortAry,
      type: 'pie',
    },
    color: {
      pattern: ['#409bd8', '#8762af', '#f1ca32', '#bfbfbf']
    }
  });
}