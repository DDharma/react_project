//js is synchronous single threaded language (its runs one cmd at a time)
//when any type js file run its create global object called window or this (which is equal to this for global execution context
// global space ->

// when js run, its allocate memory to all the function and variable

var n = 2;
function fn(num) {
  var ans = num * num;
  return ans;
}

var x = fn(n);
var x1 = fn(4);

// this code is running like
//1. allocate the memory to n then function with undefined (line n:undefined and for fn set whole function code in memory space)
//2. in seconde phase js code run one by one (its place undefined replace by 2 for variable n)
//3. for function a brand new execution context is created and and follow same rule one by one.(line first memory allocation and code execution ) then after return that execution context is deleted



// HOISTING
console.log("========== HOISTING ==========")


console.log("variable",y) // -> its give undefined
console.log("functionName",getName) // -> its give function 
getName() // its give hello js 
console.log("functionNameArrow",getArrow) // -> give whole function
var y = 7;
function getName() {
    console.log("hello js")
}

var getArrow = () => {
    console.log("hello arrow js")
}
// getArrow behave like variable and allocate memory with undefined 

// Now is case of traditional function  whole function is created inside the memory space before execution but in case of variable and arrow function only variable name and arrow function name take space in memory with undefined value not not defined


//function invocation and variable allocation 
console.log("========== function invocation and variable allocation ==========")

var x3 = 1;
a();
b();
console.log(x3)

function a() {
    var x3 = 10;
    console.log(x3)

}
function b() {
    var x3 = 100;
    console.log(x3)
    
}
//explanation of above code
// in memory first
// x3 -> undefined then in code x3 -> 1
//  a -> {...} -> its goes to call stack and for x3 -> undefined for new execution context in local memory and allocation x3 -> 10 in code and console the x3 then code goes to global execution context bellow function after this execution delete
//  b -> {...} -> now same same repet as above.


//DIFFERENCE BETWEEN UNDEFINED AND NOT DEFINED
console.log("========== DIFFERENCE BETWEEN UNDEFINED AND NOT DEFINED ==========")

console.log(x4); //-> print undefined
var x4 = 10; // -> set variable
console.log(x4) // print 10


// SCOPE CHAIN and CLOSER
function a1() {
    var b1 = 10;
    c();
    function c () {
        console.log("iside c",b1) // code try to find b1 in local environment then search in lexical environment of c

    }
}

a1()
// console.log(b1) // -> give not defined 


//LET and CONST
console.log("========== LET and CONST ==========")

// its hoisted in temporal dead zone
// console.log("===",l,c1,v) // -> its give ReferenceError error 
let l = 10; // -> its can only access when we give the value and in memory its has septate space no in window object 
const c1 = 100;
var v = 1000;

// const b; -> we cant do this 
// c1 = 2000 -> give type error
 


//BLOCK SCOPE
console.log("========== BLOCK SCOPE ==========")

{
    var as = 10;
    let al = 100;
    const ac  = 1000;
    console.log(as)
    console.log(al)
    console.log(ac)
}
console.log(as) 
// console.log(al) -> give error
// console.log(ac) -> give error

//SHADOW
console.log("========== SHADOW ==========")


var as1 = 11;
let al1 = 101;
const ac1  = 1001;
{
    var as1 = 10; // -> its override the as1 value because of global execution context
    let al1 = 100; // its only shadow the value if al1
    const ac1  = 1000; // its only shadow the value if al1
    console.log(as1)
    console.log(al1)
    console.log(ac1)
}
console.log("====",as1)
console.log("===",al1) 
console.log("===",ac1) 



// CLOSURE
console.log("========== CLOSURE ==========")


function closure () {
    var s = 10;
    return function closure1 () {
        console.log("closure",s)
    }
}

var z = closure();
z(); // -> its preserve the lexical context or closure 
