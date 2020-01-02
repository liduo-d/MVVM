/**
 * Compile 构造函数
 * @param el
 * @param vm
 * @constructor
 */
function Compile(el, vm) {
    this.$vm = vm;
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    if (this.$el) {
        // 创建文档碎片，将el中的内容插入到documentFragment中
        this.$fragment = this.node2fragment(this.$el);
        // 进行模板编译
        this.init();
        // 将编译完成的文档碎片内容，重新插入到this.$el对应的DOM元素中
        // appendChild方法类似于剪切操作
        this.$el.appendChild(this.$fragment);
    }
}

Compile.prototype = {
    constructor: Compile,
    node2fragment(el) {
        let fragment = document.createDocumentFragment();
        let child;
        // 将原生节点拷贝到文档碎片中批量处理
        while (child = el.firstChild) {
            fragment.appendChild(child)
        }
        return fragment;
    },
    init() {
        this.compileElement(this.$fragment)
    },
    // 编译文档碎片，遍历fragment中的节点
    compileElement(el) {
        // 获取文档碎片的一级子节点；childNodes是一个伪数组（对象）
        let childNodes = el.childNodes;
        /*1.①判断node子节点是否为元素节点，yes=>
            编译元素节点，即判断指令类型
            ②判断node子节点是否为文本节点且能匹配插值表达式的正则，yes=>
            解析node中正则表达式中的子表达式（也就是()中）的内容，对应节点中{{内容}}
          2.判断node子节点是否有二级子节点，且二级子节点有内容，yes=>
            递归执行该方法，进行二级子节点的编译
        */
        Array.from(childNodes).forEach(node => {
            let text = node.textContent;
            let reg = /\{\{(.*)\}\}/;
            if (this.isElementNode(node)) {
                this.compileElementNode(node)
            } else if (this.isTextNode(node) && reg.test(text)) {
                this.compileTextNode(node, RegExp.$1.trim())
            }
            if (node.childNodes && node.childNodes.length !== 0) {
                this.compileElement(node)
            }
        })
    },
    compileElementNode(node) {
        // 获取node的所有属性；nodeAttributes是伪数组（对象）
        // 注：只有元素节点才有属性
        let nodeAttributes = node.attributes;
        /*
        判断属性名是否是'v-'指令，yes=>
            判断为事件指令（v-on）还是其他指令
        */
        Array.from(nodeAttributes).forEach(attr => {
            let attrName = attr.name.charAt(0) === '@' ? attr.name.replace('@', 'v-on:') : attr.name;
            if (this.isDirective(attrName)) {
                // v-on:方法名；v-model:{{}}，对应data中的属性
                let exp = attr.value;
                let dir = attrName.substring(2);
                if (this.isEventDirective(dir)) {
                    compileUtil.eventHandler(node, this.$vm, exp, dir)
                } else {
                    compileUtil[dir] && compileUtil[dir](node, this.$vm, exp)
                }
                node.removeAttribute(attrName)
            }
        })

    },
    compileTextNode(node, exp) {
        compileUtil.text(node, this.$vm, exp)
    },
    isElementNode(node) {
        return node.nodeType === 1;
    },
    isTextNode(node) {
        return node.nodeType === 3;
    },
    isDirective(attr) {
        return attr.indexOf('v-') === 0;
    },
    isEventDirective(dir) {
        return dir.indexOf('on:') === 0;
    },
};

// 指令处理集合
let compileUtil = {
    html(node, vm, exp) {
        this.handle(node, vm, exp, 'html')
    },
    model(node, vm, exp) {
        this.handle(node, vm, exp, 'model');
        // 获取到插值表达式中对应的内容，即{{内容}}
        let val = this._getVMVal(vm, exp);
        node.addEventListener('input', e => {
            let newVal = e.target.value;
            if (newVal !== val) {
                this._setVMVal(vm, exp, newVal)
            }
            val = newVal;
        }, false)
    },
    text(node, vm, exp) {
        this.handle(node, vm, exp, 'text');
    },
    handle(node, vm, exp, dir) {
        let updaterFn = updater[dir + 'Updater'];
        // 初始化时
        updaterFn && updaterFn(node, this._getVMVal(vm, exp));
        // 更新视图时
        new Watcher(vm, exp, function (value, oldValue) {
            updaterFn && updaterFn(node, value, oldValue)
        })
    },
    eventHandler(node, vm, exp, dir) {
        let keyWord = dir.split(':')[1];
        let cb = vm.$options.methods && vm.$options.methods[exp];
        // bind()函数改变this指向，在methods某个方法中用this.**访问到vm.**，即vm._data.**，即vm.$options.data.**
        keyWord && cb && node.addEventListener(keyWord, cb.bind(vm), false)
    },
    _getVMVal(vm, exp) {
        let val = vm._data;
        let exps = exp.split('.');
        exps.forEach(key => {
            val = val[key]
        });
        return val;
    },
    _setVMVal(vm, exp, newVal) {
        let val = vm._data;
        let exps = exp.split('.');
        exps.forEach((key, index) => {
            if (index < exps.length - 1) {
                val = val[key]
            } else {
                val[key] = newVal
            }
        })
    }
};

// 更新节点
let updater = {
    htmlUpdater(node, value) {
        node.innerHTML = typeof value === 'undefined' ? '' : value
    },
    modelUpdater(node, value, oldValue) {
        node.value = typeof value === 'undefined' ? '' : value
    },
    textUpdater(node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value
    }
};
