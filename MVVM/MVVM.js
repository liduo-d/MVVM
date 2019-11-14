/**
 * MVVM构造函数
 * @param options
 * @constructor
 */
function MVVM(options) {
    this.$options = options || {};
    // 将vm.$data存储在data中
    let data = this.$options.data;
    // vm新建私有属性_data映射，实现this._data访问到data数据
    data = this._data = typeof data === 'function' ? this.getData(data, this) : data || {};
    // 遍历data中所有属性（数据代理）
    Object.keys(data).forEach(key => {
        this._proxy(key)
    });
    // 对data进行监听（数据绑定）
    observe(data);
    // 创建一个用来编译模板的compile对象（模板解析）
    this.$compile = new Compile(options.el || document.body, this);
}

MVVM.prototype = {
    constructor: MVVM,
    // 数据代理
    _proxy(key) {
        let self = this;
        Object.defineProperty(this, key, {
            enumerable: true,
            configurable: false,
            get() {
                return self._data[key];
            },
            set(newVal) {
                self._data[key] = newVal
            }

        })
    },
    // 实现this.**代替this._data.**
    getData(data, vm) {
        return data.call(vm);
    }
};
