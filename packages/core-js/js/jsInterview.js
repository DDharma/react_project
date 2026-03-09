const arr = [1, 14, 2, 16, 10, 20];

// function secondLargest(arr) {
//     arr.sort((a, b) => b - a)
//     console.log(arr)
//     let ele = arr[0]
//     for (let i = 1; i < arr.length; i++) {
//         if (arr[i] !== ele) {
//             return arr[i]
//         }else {
//             continue
//         }
//     }
//     return -1
// }
// console.log(secondLargest(arr))

function reverseArr(arr) {
  newArr = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    newArr.push(arr[i]);
    
  }
  return newArr;
}
console.log(reverseArr(arr));
