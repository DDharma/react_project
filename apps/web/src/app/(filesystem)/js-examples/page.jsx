import React from "react";
import { Opt } from "@/_components/opt/Opt";

const Page = () => {
  // 1.Classess
  // class Rectangle {
  //   constructor(height, width) {
  //     this.height = height;
  //     this.width = width;
  //   }
  //   sun() {
  //     return this.height * this.width;
  //   }
  // }
  // const square = new Rectangle(10, 10);
  // console.log("hello",square.sun());

  // 2. Enhanced Object Literals
  // const fn = (name) => {
  //     if(name === 'Dharm'){
  //         return name;
  //     }else{
  //         return 'hello';
  //     }
  // }
  // const obj = {
  //     name: fn('Dharm'),
  // }
  // console.log("obj",obj);

  // 3. Destructuring
  // const getASTNode = () => {
  //     return {
  //         op: "a",
  //         lhs: { op: "b" },
  //         rhs: "c"
  //     }
  // }
  // var { op, lhs, rhs }
  //    = getASTNode()

  // console.log(op,lhs,rhs);

  // 4. Default + Rest + Spread

  // Proxying a normal object
  //   var target = {
  //     message1: "hello",
  //     message2: "everyone",
  //   };
  //   var handler = {
  //     get: function (receiver, name) {
  //       return `${receiver?.message2}, ${name}!`;
  //     },
  //   };

  //   var p = new Proxy(target, handler);

  //   console.log("p",  p.world);

  // 5. call stacks
  const log1 = (name) => {
    console.log("hello", name);
  };
  const log2 = () => {
    return log1("raju");
  };
  log1("Dhmar");
  log2();

  return (
    <>
      <Opt />
    </>
  );
};

export default Page;
