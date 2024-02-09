// // setTimeout and closure
// function x() {
//     var i = 1;
//     setTimeout(function () {
//         console.log(i)
//     },3000)
//     console.log("hello")
// }
// x() // -> print hello then 1 

// function y() {
//     for(var j= 1; j<=5;j++) {
//         setTimeout(function () {
//             console.log(j) // -> its print always 6 
//         },j * 1000)
//     }
//     console.log("hello")
// }
// y() 

// function z() {
//     for(let k= 1; k<=5;k++) {
//         setTimeout(function () {
//             console.log(k) // -> its print every time 6 because of let its has block scope
//         },k * 1000)
//     }
//     console.log("hello")
// }
// z() 


