/*
 * @Author: Evan Zuo v_wangxiangbo01@baidu.com
 * @Date: 2022-07-26 11:16:43
 * @LastEditors: Evan Zuo v_wangxiangbo01@baidu.com
 * @LastEditTime: 2022-07-26 17:36:44
 * @FilePath: /initerviews/js/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// var hi = {}
// !function (data) {
//     data.a = 1
// }(hi)

function Query(array) {
    this.arr = array || []
    this.operationList = []
}

Query.prototype.where = function (cb) {
    this.operationList.push({
        type: 'filter',
        cb
    })
    return this
}

Query.prototype.order = function (key, desc) {
    this.operationList.push({
        type: 'sort',
        cb: (before, after) => {
            return desc
                ? before[key] > after[key] ? 1 : -1
                : before[key] < after[key] ? 1 : -1
        }
    })
    return this
}

Query.prototype.groupBy = function (cb) {
    this.operationList.push({
        type: 'groupBy',
        cb,
    })
    return this
}

Query.prototype.exe = function () {
    for (let i = 0; i < this.operationList.length; i++) {
        const type = this.operationList[i].type
        const cb = this.operationList[i].cb
        this.arr = this.arr[type](cb)
    }
    return this.arr
}

Array.prototype.groupBy = function (cb) {
    const obj = {}

    for (let i = 0; i < this.length; i++) {
        const item = this[i]
        const key = cb(item, i, this)
        if (obj[key] && obj[key].length) {
            obj[key].push(item)
        } else {
            obj[key] = [item]
        }
    }
    return obj
}


const data = [
    {
        name: '12',
        age: 2,
        type: 'type1',
    },
    {
        name: '12',
        age: 9,
        type: 'type2'
    },
    {
        name: '12',
        age: 6,
        type: 'type1'
    },
]
const res = new Query(data)
const newRes = res
    .where(item => item.age > 1)
    .order('age', true)
    .groupBy(item => item.type)
    .exe()
console.log(newRes)


// {
//     "type1": [{
//         "name": "12",
//         "age": 2,
//         "type": "type1"
//     }, {
//         "name": "12",
//         "age": 6,
//         "type": "type1"
//     }],
//         "type2": [{
//             "name": "12",
//             "age": 9,
//             "type": "type2"
//         }]
// }