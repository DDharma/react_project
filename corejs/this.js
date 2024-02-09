// 'use strict'

//1.in global space 
console.log("==========  global space  ==========")
console.log("global",this) // -> refers to windows object in js or in node its refers to global 


//2.this inside the normal function
console.log("==========  this inside the normal function ==========")
function this_inside (){
    // for strict mode value of this is undefined but in non strict mode its refers to window object (because if this substation )
    console.log("inside function",this)
}

this_inside()

// and also value of this keyword is depends how the function is called 

this_inside() // -> gives undefined 
window.this_inside() // -> gives global object or window object 


//3.this inside in object method
console.log("==========  this inside in object method ==========")

const this_inside_object = {
    name:"Dharma",
    printName: function print (){ 
        console.log("inside object",this) // -> this refers to object its self
        console.log("inside object",this.name)
    }
    
}
this_inside_object.printName();

//call, apply or bind method 
const this_inside_object1 = {
    name:"Ayush",
}

this_inside_object.printName.call(this_inside_object1) // -> what ever i am passing inside call this inside -> this_inside_object become the value of this


//4.this inside the arrow function
console.log("==========  this inside the arrow function ==========")

const this_inside_arrow = () => {
    console.log("inside arrow",this) // ->  in any mode its give the window object because this refers to enclosing lexical context (here enclosing lexical context is window object )
}
this_inside_arrow()


const this_inside_arrow1 =  {
    name:"Dharma",
    printName:function () {
        console.log("inside function",this)
        const y = () => {
            console.log("inside arrow function",this)
        }
        y();
    }
}

this_inside_arrow1.printName()

//5.inside the dom element ->  its refers to pertucullar  dom element 
