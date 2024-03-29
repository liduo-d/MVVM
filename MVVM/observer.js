﻿function observe(value) {
    if (!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value);
}

/**
 * Observer构造函数
 * @param value
 */
function Observer(value) {
    this.value = value;
    // 遍历value
    this.walk(value)
}

Observer.prototype = {
    constructor: Observer,
    walk(value) {
        Object.keys(value).forEach(key => {
            // 监听属性
            this.defineReactive(value, key, value[key]);
        })
    },
    defineReactive(value, key, val) {
        // 定义一个消息订阅器dep，每一个属性（包括子属性）对应一个dep
        let dep = new Dep();
        // 二级对象（子属性）的监听
        observe(val);
        Object.defineProperty(value, key, {
            enumerable: true,
            configurable: false,
            get() {
                if (Dep.target) {
                    dep.depend()
                }
                return val;
            },
            set(newVal) {
                if (newVal !== val) {
                    val = newVal
                }
                dep.notify();
                observe(newVal)
            }
        })
    }
};

let uid = 0;
/**
 * Dep构造函数
 * @constructors
 */
function Dep() {
    this.id = uid++;
    // 定义一个数组存放订阅者
    this.subs = []
}

// Dep定义一个全局target属性，暂存订阅者watcher
Dep.target = null;
Dep.prototype = {
    constructor: Dep,
    // 向订阅器添加Dep.target,也就是订阅者watcher
    addSub(sub) {
        this.subs.push(sub)
    },
    depend() {
       // this => Dep
        Dep.target.addDep(this)
    },
    removeSub: function (sub) {
        let index = this.subs.indexOf(sub);
        if (index !== -1) {
            this.subs.splice(index, 1);
        }
    },
    notify() {
        this.subs.forEach(sub => {
            sub.update();
        });
    }
};
