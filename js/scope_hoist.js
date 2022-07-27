/*
 * @Author: Evan Zuo v_wangxiangbo01@baidu.com
 * @Date: 2022-07-27 16:06:03
 * @LastEditors: Evan Zuo v_wangxiangbo01@baidu.com
 * @LastEditTime: 2022-07-27 18:30:52
 * @FilePath: /js-interviews-questions/js/scope.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

// js变量提升与scope是密切相关的 this 闭包 密不可分
// var如果不是全局作用域，在function内就是局部作用域，全局作用域存在hoist
// var与function都有hoist var只声明，而function声明和赋值都会完成

console.log(a)
console.log(fn1)
var a = 1
function fn1(x) {
    var a = 0
    let b = 0
    {
        var c = 1 // 未用let或const，不形成c的块作用域，依然是bar的函数作用域
        let d = 1 // d形成块作用域，只可在当前代码块中访问
    }
    function fn() {
        var e = 2
        let g = 2
        console.log('a:', a)
        console.log('b:', b)
        console.log('c:', c) // 访问外部作用域中的a/b/c，形成闭包
        // console.log('d:', d) // d is undefined
    }
    fn()
}
fn1(5)

// 块级作用域
function f1() {
    let n = 5
    if (true) {
        let n = 10
    }
    console.log(n) // 5
}

// 1. 什么是变量提升？

// 2. 变量提升只发生在当前作用域
    var a = 12,
        b = 13,
        c = 14
    function fn(a) {
        console.log(a, b, c) // 12 , undefined , 14
        var b = c = a = 20
        console.log(a, b, c) // 20 ,20 ,20
    }
    fn(a)
    console.log(a, b, c) //12,13,20
// 3. 私有变量和全局变量
    // 只有在私有作用域中用var和function声明的变量和形参两种才是私有变量，其他都是全局变量。剩下的都不是私有的变量，都需要基于作用域链的机制向上查找。
// 4. 条件判断下的变量提升
    console.log(fn) //undefined
    if (true) {
        console.log(fn) // function fn() { console.log(1) }
        function fn() {
            console.log(1)
        }
    }
    console.log(fn) // function fn() { console.log(1) }

// 5. 变量提升中重名的处理
    fn() // 2
    function fn() { console.log(1) };
    fn() // 2
    var fn = 100
    fn() //Uncaught TypeError: fn is not a function
    function fn() { console.log(2) };

// 6. ES6中的let不存在变量提升
    console.log(a) // Uncaught ReferenceError: a is not defined
    let a = 1
    console.log(a) // 1

// 7. 如果用let声明的全局变量和window属性的映射机制会被切断
    console.log(window.a) //undefined
    let a = 1
    console.log(window.a) //undefined
    var a = 1
    console.log(window.a) // 1


// 8. 在相同的作用域中，let、var不能声明相同名字的变量
    let a = 10
    console.log(a)
    let a = 20 // Uncaught SyntaxError: Identifier 'a' has already been declared
    console.log(a);

    var a = 10
    let a = 20 //Uncaught SyntaxError: Identifier 'a' has already been declared
    b = 10 //Uncaught ReferenceError: Cannot access 'b' before initialization
    let b = 20;

// 9. 暂时性死区
    var a = 10
    if (true) {
        console.log(a) // Uncaught ReferenceError: Cannot access 'a' before initialization
        let a = 20
    }

        // 上面代码中，在let命令声明变量tmp之前，都属于变量tmp的死区，暂时性死区也意味着typeof不再是一个百分之百安全的操作。
        typeof b // undefined
        typeof a // Uncaught ReferenceError: Cannot access 'a' before initialization
        let a;
// 10. for循环中的作用域
    for (let i = 0; i < 3; i++) {
        let i = 'abc'
        console.log(i)
    }
    // abc
    // abc
    // abc

// 11. function参数的重名问题（var / const / let）=> 相当于var arg
    function func(arg) {
        let arg
    }
    func() // 报错
    function func(arg) {
        var arg
    }
    func() // 报错
    function func(arg) {
        var arg = 1
    }
    func() // 报错

// 12. 块级作用域与函数声明
    // 函数能不能在块级作用域之中声明？这是一个相当令人混淆的问题。
    // ES6 引入了块级作用域，明确允许在块级作用域之中声明函数。ES6 规定，块级作用域之中，函数声明语句的行为类似于let，在块级作用域之外不可引用。
    // 浏览器自己的行为与ES6规范相违背。
    function f() { console.log('I am outside!') }

    (function () {
        if (false) { // true
            // 重复声明一次函数f
            function f() { console.log('I am inside!') }
        }

        f()
    }())

    // 块级作用域内部的函数声明语句，建议不要使用
    {
        let a = 'secret'
        function f() {
            return a
        }
    }

    // 块级作用域内部，优先使用函数表达式
    {
        let a = 'secret'
        let f = function () {
            return a
        }
    }
// 13. 写法：大括号内就是块级作用域
    // 第一种写法，报错
    if (true) let x = 1

    // 第二种写法，不报错
    if (true) {
        let x = 1
    }

// 14. const
// 本质：地址锁死