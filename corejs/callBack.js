// callback hell
console.log("==========  callback hell  ==========");

// promises
console.log("==========  promises  ==========");
// its uses to handle async operation in js

const cart = ["shose", "cap", "shirt", "kurta"];

function validateCart(cart) {
  return false;
}

function proceedToPayment(orderId) {
  const pr = new Promise((resolve, reject) => {
    resolve("Payment Success");
  });

  return pr;
}

// creating a promise for cart
function createOrder(cart) {
  const pr = new Promise(function (resolve, reject) {
    //create order
    // validate a cart
    //order id -> success to return order id and on failure return error
    if (!validateCart(cart)) {
      const err = new Error("Cart in not valid");
      reject(err);
    }
    const orderID = "22222";
    if (orderID) {
      resolve(orderID);
    }
  });

  return pr;
}

const cartDataPromise = createOrder(cart);
console.log("cartPromise >", cartDataPromise);

// cartDataPromise
//   .then((data) => {
//     console.log("cartPromiseData >", data);
//     return data
//   })
//   .then((orderID) => {
//     proceedToPayment(orderID).then((paymentInfo) => {
//         console.log("paymentInfo >",paymentInfo)

//       })
//   })
//   .catch((err) => {
//     console.log("error >", err.message);
//   });

cartDataPromise
  .then((data) => {
    console.log("cartPromiseData >", data);
    return data;
  })
  .then((orderID) => {
    return proceedToPayment(orderID);
  })
  .then((paymentInfo) => {
    console.log("paymentInfo >", paymentInfo);
  })
  .catch((err) => {
    console.log("error >", err.message);
  })
  .then(() => {
    console.log("no matter  i am always call");
  });


// promises interview question
console.log("==========  promises interview question  ==========");
// Promise.all -> its give array when all the promise fullfil and when any rejected then its give error 
// Promise.allSettled -> its give always give result in array irrespective of fail or pss
// Promise.race -> its give result in value of the promise who execute first, if promise fails the its give fail result
// Promise.any -> its very much similar to race but its wait for fist promise to pass always, if all the promise rejected then its wait for 1st success, if all the promise got fail the give array  of error 


const p1 = new Promise((resolve,reject) => {
  // setTimeout(() => resolve("P1 success"),[3000])
  setTimeout(() => reject("P1 fail"),[3000])
})

const p2 = new Promise((resolve,reject) => {
  // setTimeout(() => resolve("P2 success"),[1000])
  setTimeout(() => reject("P2 fail"),[1000])
})

const p3 = new Promise((resolve,reject) => {
  // setTimeout(() => resolve("P3 success"),[5000])
  setTimeout(() => reject("P3 fail"),[5000])
})

Promise.all([p1,p2,p3]).then((result) => {
  console.log("promise all >",result);
}).catch((err) => {
  console.error("promise all >",err)
})

Promise.allSettled([p1,p2,p3]).then((result) => {
  console.log("promise allSettled >",result);
}).catch((err) => {
  console.error("promise allSettled >",err)
})

Promise.race([p1,p2,p3]).then((result) => {
  console.log("promise race >",result);
}).catch((err) => {
  console.error("promise race >",err)
})

Promise.any([p1,p2,p3]).then((result) => {
  console.log("promise any >",result);
}).catch((err) => {
  console.error("promise any >",err)
})
