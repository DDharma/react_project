// foreach

const array1 = [3,4,5,6,6]
array1.forEach((item,idx,arr) => {
    // console.log(idx,item,arr);
    
});
//this has three argument item: every element in the array idx: index of the array, arr: the array and its return undefined


// B .filter
const filteredArray  = array1.filter((item,idx,arr) => {
    // console.log(idx,item,arr)
    return item > 5
})

// console.log(filteredArray)
//this has three argument item: every element in the array idx: index of the array, arr: the array and its return array not modified original array

// C. map
const mapedArray = array1.map((item,idx,arr) => {
    console.log(idx,item,arr)
    return item > 5
})
console.log(mapedArray)
//this has three argument item: every element in the array idx: index of the array, arr: the array and its return array and for above case its return true false array not modified original array

// D. reduce
