const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const babel = require('@babel/core');

const getModuleInfo = (file)=>{
    const body = fs.readFileSync(file,'utf-8');
    // 解析成抽象语法树
    const ast = parser.parse(body,{
        sourceType:'module'
    });
    const deps = {}
    // 根据import类型的节点收集模块中所有的依赖
    traverse(ast,{
        ImportDeclaration({node}){
            const dirname = path.dirname(file)
            const abspath = "./" + path.join(dirname,node.source.value) + '.js';
            deps[node.source.value] = abspath;
        }
    })
    //babel转换代码 编译兼容
    const {code} = babel.transformFromAst(ast,null,{
        presets:["@babel/preset-env"]
    })
    const moduleInfo = {file,deps,code}
    return moduleInfo
}

// 递归的收集依赖
const parseModules = (file) =>{
    const entry =  getModuleInfo(file)
    const temp = [entry]
    const depsGraph = {}
    for (let i = 0;i<temp.length;i++){
        const deps = temp[i].deps
        if (deps){
            for (const key in deps){
                if (deps.hasOwnProperty(key)){
                    temp.push(getModuleInfo(deps[key]))
                }
            }
        }
    }
    temp.forEach(moduleInfo=>{
        depsGraph[moduleInfo.file] = {
            deps:moduleInfo.deps,
            code:moduleInfo.code
        }
    })
    return depsGraph
}

const bundle = (file) =>{
    const depsGraph = JSON.stringify(parseModules(file))
    return `(function (graph) {
        function require(file) {
            function absRequire(relPath) {
                return require(graph[file].deps[relPath])
            }
            var exports = {};
            //自执行函数之前最后加个分号; NND
            (function (require,exports,code) {
                eval(code)
            })(absRequire,exports,graph[file].code)
            return exports
        }
        require('${file}')
    })(${depsGraph})`

}
const content = bundle('./src/index.js')

// console.log(content);

fs.access('./dist/', fs.constants.F_OK, (err) => {
    if(err) {
        fs.mkdirSync('./dist');
    }
    fs.writeFileSync('./dist/main.js',content);
});
