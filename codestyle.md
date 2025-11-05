# 前端代码规范

## 来源说明
本规范基于以下主流标准制定：
- Google HTML/CSS Style Guide
- Airbnb JavaScript Style Guide
- W3C HTML5 规范

## HTML 规范
### 基本结构
html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>页面标题</title>
</head>
<body>
</body>
</html>

### 代码风格
- 使用2个空格缩进
- 标签名小写
- 属性值使用双引号
- 自闭合标签不加斜杠

## CSS 规范
### 命名约定
- 使用连字符命名法（kebab-case）
- 类名语义化描述
- 避免使用ID选择器

### 组织顺序
1. 布局属性（display, position, float）
2. 盒模型属性（width, height, margin, padding）
3. 视觉属性（color, background, border）
4. 其他属性

## JavaScript 规范
### 变量声明

javascript
// 使用 const/let 替代 var
const immutableValue = '常量';
let mutableValue = '变量';

### 函数定义
javascript
// 使用函数表达式
const functionName = (param1, param2) => {
// 函数体
};
// 或函数声明
function functionName(param1, param2) {
// 函数体
}

### 代码格式
- 使用分号结尾
- 大括号与语句同行
- 操作符前后加空格
