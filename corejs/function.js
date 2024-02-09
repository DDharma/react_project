console.log("==========  function  ==========")
console.log(a) // -> give whole function 
console.log(b) // ->  give undefined because b treated as variable

// function statement
function a() {
    console.log("function statement")
}

// function expression -> this is anonymous because its has no name 
var b = function () {
    console.log("function expression")
}

// anonymous function -> does not have own identity -> its use where function use as value
var c = function () {

}

//named function 
var d = function xyz() {
    console.log("named function")

}
d()

//different between Parameter and Argument
function xy(Parameter) {
    console.log(Parameter);
}
xy("Argument")

//first class function -> tha ability to use function as value is called first class function or pass as argument 
var e = function (x) {
    x();
    return function () {

    }
}

var f = function () {
    console.log("argument pass first class function");
}

var g = e(f)
console.log("first class function",g);
g()


//arrow function
var h = () => {

}


// callback function 
console.log("==========  callback function  ==========")
// function i() {}
// i(function j(){}) //-> this callback of function

setTimeout(function() {
    console.log("timer");
},5000)

function i(x) {
    console.log("x")
    x();
}
i(function j(){
    console.log("j");
})

// event loop
console.log("==========  event loop  ==========")
console.log("start")
document.getElementById("clickme").addEventListener("click",function() {
    console.log("buttom click")
})
console.log("stop")

// here we have callback queue and event loop take care of execution but in case of promises amd mutation observer  there is micro callback queue and all the promises callback are in store in micro callback queue and given more priority 


// higher order function
console.log("==========  higher order function  ==========")


// higher order function -> this is the function which take function as input and return function -> this is very useful for functional programming
// Q. lets take a array of radius  of circles  and calculate area, circumstance, and diameter? now solve this problem using higher order function


const radius = [3,2,4,1,]

function areaLogin(r) {
    return Math.PI * r * r

}
function cirLogin(r) {
    return Math.PI * 2 * r

}
function diaLogin(r) {
    return 2 * r

}

function calculate(radius,logic) {
    const output = []
    for(let i = 0;i< radius.length; i++){
        output.push(logic(i))

    }
    return output
}

console.log(calculate(radius,areaLogin))
console.log(calculate(radius,cirLogin))
console.log(calculate(radius,diaLogin))

// map, reduce, filter
console.log("==========  map, reduce, filter  ==========")

function testMap(x,i,j){
    console.log("map",x,i,j)
}

[3,4,2,4,5].map(testMap)

console.log("sum using reduce",[3,4,2,4,5].reduce((acc,curr) => {
    acc = acc+curr
    return acc
}))


// call, apply, bind
console.log("==========  call, apply, bind  ==========")



