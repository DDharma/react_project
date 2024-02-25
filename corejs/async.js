/* 
* what is async ?
* what is await ?
* how they work behind the scenes ?
* example
* error handling
* Interview question?
* Async, await vs promise(then,catch)
*/


// what is async ?
console.log("==========  what is async ?  ==========");
// its always return promise, if return value the its rap into promise and return
// async function getData() {
//     const pr  = new Promise((resolve,reject) => {
//         resolve("Return Promise as promise")
//     })
//    // return "Return Promise rap the value"
//     return pr
// }
// console.log(getData())  //return promises
// getData().then((res) => 
// console.log("result >",res))


// what is await ?
console.log("==========  what is await ?  ==========");
// this is use to resolve the promise and value converted into value

async function getDataAwait() {
    const pr  = new Promise((resolve,reject) => {
        resolve("Return Promise as promise using await")
    })
    // return "Return Promise rap the value"
    const prValue = await pr
    console.log("await >", pr,prValue)
    return prValue
}

// console.log("promise with await >",getDataAwait())


// working behind ?
console.log("==========  working behind ?  ==========");
const p1 = new Promise((resolve,reject) => {
    setTimeout(() => {
       resolve("p1 resolve") 
    },5000)
})


const p2 = new Promise((resolve,reject) => {
    setTimeout(() => {
       resolve("p2 resolve") 
    },10000)
})

async function handlePromise() {
    // const x = y  // for error handing 
    console.log("Promise execute");
    const ap1 = await p1;
    console.log("Promise 1 >" ,ap1);
    const ap2 = await p2;
    console.log("Promise 2 >" ,ap2);

}

handlePromise()  //here we can see the promise p1 is resolve 1st in 5s then p2 in 10s but its we reverse the setTimeout timer then p1 is resolve 10s after that immediately p2 is resolve.

/* now in terms of call stack 
1. handlePromise() goes in call stack and print Promise execute then when its find await keyword its goes out from call stack
2. now when p1 resolve in 5s then handlePromise() again comes in call stack and execute program where its left and then its goes out form call stack for next await 
3. then after resolving p2 handlePromise function again come in call stack and start execution program where its left
*/

// handling error
// handlePromise().catch((err) => {
//     console.log("error >",err);
// })


// interview question 
