const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

const resolvePromise = (promise2, x, resolve, reject) => {
    if (promise2 === x) {
        return reject(new TypeError('Chaining cycle detected for promise #<MyPromise>'))
    }
    // 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
    // p.then(res => new Promise(resolve, reject => reject(1)), reason => new Promise(resolve, reject => reject(1)))
    let called
    if ((typeof x === 'object' && x != null) || typeof x === 'function') {
        try {
            let then = x.then
            if (typeof then === 'function') {
                then.call(x, y => {
                    if (called) return
                    called = true
                    resolvePromise(promise2, y, resolve, reject)
                }, r => {
                    if (called) return
                    called = true
                    reject(r)
                })
            } else {
                resolve(x)
            }
        } catch (e) {
            if (called) return
            called = true
            reject(e)
        }
    } else {
        resolve(x)
    }
}

class MyPromise {
    constructor(executor) {
        this.status = PENDING
        this.value = undefined
        this.reason = undefined
        this.onResolvedCallbacks = []
        this.onRejectedCallbacks = []

        let resolve = (value) => {
            if (value instanceof MyPromise) {
                return value.then(resolve, reject)
            }

            if (this.status === PENDING) {
                this.status = FULFILLED
                this.value = value
                this.onResolvedCallbacks.forEach(fn => fn())
            }
        }

        let reject = (reason) => {
            if (this.status === PENDING) {
                this.status = REJECTED
                this.reason = reason
                this.onRejectedCallbacks.forEach(fn => fn())
            }
        }

        try {
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
        onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }
        let promise2 = new MyPromise((resolve, reject) => {
            if (this.status === FULFILLED) {
                setTimeout(() => {
                    try {
                        let x = onFulfilled(this.value)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                }, 0)
            }

            if (this.status === REJECTED) {
                setTimeout(() => {
                    try {
                        let x = onRejected(this.reason)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (e) {
                        reject(e)
                    }
                }, 0)
            }

            if (this.status === PENDING) {
                this.onResolvedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onFulfilled(this.value)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    }, 0)
                })

                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            let x = onRejected(this.reason)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (e) {
                            reject(e)
                        }
                    }, 0)
                })
            }
        })

        return promise2
    }

    catch(errCallback) {
        return this.then(null, errCallback)
    }

    finally(callback) {
        return this.then((value) => {
            return MyPromise.resolve(callback()).then(() => value)
        }, (reason) => {
            return MyPromise.resolve(callback()).then(() => { throw reason })
        })
    }

    static resolve(data) {
        return new MyPromise((resolve, reject) => {
            resolve(data)
        })
    }

    static reject(reason) {
        return new MyPromise((resolve, reject) => {
            reject(reason)
        })
    }

    static all(values) {
        if (!Array.isArray(values)) {
            const type = typeof values
            return new TypeError(`TypeError: ${type} ${values} is not iterable`)
        }

        return new MyPromise((resolve, reject) => {
            let resultArr = []
            let orderIndex = 0
            const processResultByKey = (value, index) => {
                resultArr[index] = value
                if (++orderIndex === values.length) {
                    resolve(resultArr)
                }
            }
            for (let i = 0; i < values.length; i++) {
                let value = values[i]
                if (value && typeof value.then === 'function') {
                    value.then((value) => {
                        processResultByKey(value, i)
                    }, reject)
                } else {
                    processResultByKey(value, i)
                }
            }
        })
    }

    static race(promises) {
        return new MyPromise((resolve, reject) => {
            for (let i = 0; i < promises.length; i++) {
                let val = promises[i]
                if (val && typeof val.then === 'function') {
                    val.then(resolve, reject)
                } else {
                    resolve(val)
                }
            }
        })
    }
}



MyPromise.defer = MyPromise.deferred = function () {
    let dtd = {
        promise: new MyPromise(),
        resolve: () => {},
        reject: () => {},
    }
    dtd.promise = new MyPromise((resolve, reject) => {
        dtd.resolve = resolve
        dtd.reject = reject
    })
    return dtd
}

const p = new MyPromise(resolve => {
            setTimeout(() => {
                resolve('value')
            }, 1000);
        })
        .then(res => {
            console.log({ res })
            throw 123
        })
console.log(p)

// features：
// then 的链式调用 & 值传透特性 & error 传透
// 异常吞并哪两点
// 为什么不用 x.then  举例子：副作用 var b= 0;var a = {}; Object.defineProperty(a, 'then', { get() { b++ } })
// called的用处 防止一起调用。flag variable。
// Promise 意义是什么
// 解决了cb与定义cb时机，但是一般用不到。status changed  => push cb; push cb => status changed
// async await 才是终极方案
// generator next => await
// p.then(res => res).then(res => 234)只是 >>> => ｜本质没变。
// 宏队列与微队列
// 手写Promise不是源码。JS内核做的事儿。

// Promise/A+规范
// then 的参数 onFulfilled 和 onRejected 可以缺省，如果 onFulfilled 或者 onRejected不是函数，将其忽略，且依旧可以在下面的 then 中获取到之前返回的值；「规范 Promise / A + 2.2.1、2.2.1.1、2.2.1.2」
// promise 可以 then 多次，每次执行完 promise.then 方法后返回的都是一个“新的promise"；「规范 Promise/A+ 2.2.7」
// 如果 then 的返回值 x 是一个普通值，那么就会把这个结果作为参数，传递给下一个 then 的成功的回调中；
// 如果 then 中抛出了异常，那么就会把这个异常作为参数，传递给下一个 then 的失败的回调中；「规范 Promise / A + 2.2.7.2」
// 如果 then 的返回值 x 是一个 promise，那么会等这个 promise 执行完，promise 如果成功，就走下一个 then 的成功；如果失败，就走下一个 then 的失败；如果抛出异常，就走下一个 then 的失败；「规范 Promise / A + 2.2.7.3、2.2.7.4」
// 如果 then 的返回值 x 和 promise 是同一个引用对象，造成循环引用，则抛出异常，把异常传递给下一个 then 的失败的回调中；「规范 Promise / A + 2.3.1」
// 如果 then 的返回值 x 是一个 promise，且 x 同时调用 resolve 函数和 reject 函数，则第一次调用优先，其他所有调用被忽略；「规范 Promise / A + 2.3.3.3.3」