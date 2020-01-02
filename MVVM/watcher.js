/**
 * Watcher构造函数
 * @param vm
 * @param expOrFn data中的属性值或者插值表达式
 * @param cb 回调函数
 * @constructor
 */
function Watcher(vm, expOrFn, cb) {
    this.vm = vm;
    // 用于更新视图的回调函数
    this.cb = cb;
    // 对应data中的属性值或者插值表达式
    this.expOrFn = expOrFn;
    this.depIds = {};
    // getter用于计算订阅者的值，实现订阅者的订阅操作
    if (typeof this.expOrFn === 'function') {
        this.getter = this.expOrFn
    } else {
        this.getter = this.parseGetter(this.expOrFn.trim())
    }
    // 返回data中的属性对应的value
    this.value = this.get()
}

Watcher.prototype = {
    constructor: Watcher,
    update() {
        this.run()
    },
    run() {
        let value = this.get();
        let oldValue = this.value;
        if (value !== oldValue) {
            // 更新data中属性对应的value
            this.value = value;
            // cb.call执行Watcher中的cb形参，调用回调函数
            this.cb.call(this.vm, value, oldValue)
        }
    },
    get() {
        // 将当前订阅者指向自己，把watcher添加到自己的属性中
        Dep.target = this;
        // 触发getter，添加自己到属性订阅器中
        let val = this.getter.call(this.vm, this.vm);
        // 添加完毕，重置
        Dep.target = null;
        return val;
    },
    addDep(dep){
        if (!this.depIds.hasOwnProperty(dep.id)) {
            // this => Watcher
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    },
    parseGetter(exp) {
        let reg = /[^\w.$]/;
        if(reg.test(exp)){
            return;
        }
        let exps = exp.split('.');
        return function(obj) {
            for (let i = 0, len = exps.length; i < len; i++) {
                if (!obj) return;
                obj = obj[exps[i]];
            }
            return obj;
        }
    },
};
