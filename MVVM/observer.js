function observe(value) {
    if (!value || typeof (value) !== "object") {
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
    this.walk(value)
}

Observer.prototype = {
    constructor: Observer,
    // 遍历value
    walk(value) {
        Object.keys(value).forEach(key => {
            this.observeProperty(value, key, value[key])
        })
    },
    // 实现数据劫持
    observeProperty(value, key, val) {
        // 定义一个消息订阅器dep
        let dep = new Dep();
        // 二级对象（子属性）的监视
        observe(val);
        Object.defineProperty(value, key, {
            enumerable: true,
            configurable: false,
            get() {
                if(Dep.target){
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

let id = 0;

/**
 * Dep构造函数
 * @constructor
 */
function Dep() {
    this.id = id++;
    // 定义一个数组存放订阅者
    this.subs = []
}

// Dep定义一个全局target属性，暂存订阅者watcher
Dep.target = null;
Dep.prototype = {
    constructor: Dep,
    // 向订阅器添加Dep.target,也就是订阅者watcher
    depend() {
        /*TODO*/
    },
    notify() {
        this.subs.forEach(sub => {
            sub.update();
        });
    }
};
